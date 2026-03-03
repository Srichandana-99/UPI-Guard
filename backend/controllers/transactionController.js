/**
 * Transaction Controller
 */

const { db, run, get, all } = require('../config/database');
const { hasSufficientBalance, deductAmount, addAmount } = require('../utils/balanceHelper');
const { detectFraud } = require('../utils/fraudEngine');
const { updateUsualLocation } = require('../utils/location');

/**
 * Initiate transaction with fraud detection
 */
async function initiateTransaction(req, res, next) {
  try {
    const { uid } = req.user;
    const { recipient_upi, amount, latitude, longitude, transaction_pin } = req.body;

    // Validate input
    if (!recipient_upi || !amount || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: recipient_upi, amount, latitude, longitude'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Transaction amount must be greater than 0' });
    }

    // Get sender user data
    const user = await get('SELECT * FROM users WHERE uid = ?', [uid]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify transaction PIN
    if (!user.transaction_pin) {
      return res.status(400).json({ error: 'Transaction PIN not set. Please set up your UPI PIN first.' });
    }

    if (user.transaction_pin !== transaction_pin) {
      return res.status(401).json({ error: 'Invalid transaction PIN' });
    }

    const currentBalance = user.balance;

    // Check sufficient balance
    if (!hasSufficientBalance(currentBalance, amount)) {
      console.warn(`Insufficient balance for user ${uid}: ₹${currentBalance} < ₹${amount}`);
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance',
        current_balance: currentBalance
      });
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const timestamp = Date.now();

    // Prepare user data for fraud detection
    const userData = {
      usual_location_lat: user.usual_location_lat,
      usual_location_lon: user.usual_location_lon,
      transaction_count: user.transaction_count
    };

    // Run fraud detection
    const fraudResult = await detectFraud(uid, amount, latitude, longitude, timestamp, userData);

    console.log(`Fraud detection result for ${transactionId}:`, fraudResult);

    // If transaction is flagged as fraud
    if (fraudResult.is_fraud) {
      // Save blocked transaction
      await run(`
        INSERT INTO transactions (
          transaction_id, sender_uid, sender_upi, recipient_upi, amount,
          timestamp, latitude, longitude, is_fraud, fraud_probability,
          fraud_reasons, status, balance_before, balance_after
        ) VALUES (?, ?, ?, ?, ?, datetime(?, 'unixepoch', 'localtime'), ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        transactionId,
        uid,
        user.upi_id,
        recipient_upi,
        amount,
        timestamp / 1000,
        latitude,
        longitude,
        1,
        fraudResult.fraud_probability,
        JSON.stringify(fraudResult.reasons),
        'blocked',
        currentBalance,
        currentBalance
      ]);

      console.warn(`Transaction ${transactionId} BLOCKED due to fraud detection`);

      return res.json({
        success: false,
        is_fraud: true,
        reasons: fraudResult.reasons,
        fraud_probability: fraudResult.fraud_probability,
        transaction_id: transactionId
      });
    }

    // Transaction is legitimate - process it
    const newBalance = deductAmount(currentBalance, amount);

    // Update sender balance
    await run('UPDATE users SET balance = ?, transaction_count = transaction_count + 1 WHERE uid = ?', [newBalance, uid]);

    // Find recipient and update their balance if they exist in the system
    const recipient = await get('SELECT uid, balance FROM users WHERE upi_id = ?', [recipient_upi]);
    const recipientUid = recipient ? recipient.uid : null;

    if (recipient) {
      const recipientNewBalance = addAmount(recipient.balance, amount);
      await run('UPDATE users SET balance = ? WHERE uid = ?', [recipientNewBalance, recipient.uid]);
      console.log(`Recipient ${recipient.uid} credited ₹${amount}. New balance: ₹${recipientNewBalance}`);
    }

    // Create approved transaction
    await run(`
      INSERT INTO transactions (
        transaction_id, sender_uid, sender_upi, recipient_uid, recipient_upi, amount,
        timestamp, latitude, longitude, is_fraud, fraud_probability,
        fraud_reasons, status, balance_before, balance_after
      ) VALUES (?, ?, ?, ?, ?, ?, datetime(?, 'unixepoch', 'localtime'), ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      transactionId,
      uid,
      user.upi_id,
      recipientUid,
      recipient_upi,
      amount,
      timestamp / 1000,
      latitude,
      longitude,
      0,
      fraudResult.fraud_probability,
      JSON.stringify([]),
      'approved',
      currentBalance,
      newBalance
    ]);

    // Update usual location
    await updateUsualLocation(uid, latitude, longitude);

    console.log(`Transaction ${transactionId} APPROVED. New balance: ₹${newBalance}`);

    res.json({
      success: true,
      is_fraud: false,
      new_balance: newBalance,
      transaction_id: transactionId,
      fraud_probability: fraudResult.fraud_probability
    });
  } catch (error) {
    console.error('Transaction error:', error);
    next(error);
  }
}

/**
 * Get transaction history
 */
async function getTransactionHistory(req, res, next) {
  try {
    const { uid } = req.user;
    const limit = parseInt(req.query.limit) || 50;

    // Get transactions where user is sender or recipient
    const transactions = await all(`
      SELECT * FROM transactions
      WHERE sender_uid = ? OR recipient_uid = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `, [uid, uid, limit]);

    // Parse fraud_reasons from JSON
    const parsedTransactions = transactions.map(tx => ({
      ...tx,
      fraud_reasons: tx.fraud_reasons ? JSON.parse(tx.fraud_reasons) : [],
      is_fraud: Boolean(tx.is_fraud)
    }));

    res.json({
      transactions: parsedTransactions,
      count: parsedTransactions.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single transaction by ID
 */
async function getTransaction(req, res, next) {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const transaction = await get(`
      SELECT * FROM transactions
      WHERE transaction_id = ? AND (sender_uid = ? OR recipient_uid = ?)
    `, [id, uid, uid]);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Parse fraud_reasons
    transaction.fraud_reasons = transaction.fraud_reasons ? JSON.parse(transaction.fraud_reasons) : [];
    transaction.is_fraud = Boolean(transaction.is_fraud);

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  initiateTransaction,
  getTransactionHistory,
  getTransaction
};
