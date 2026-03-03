/**
 * Secure UPI - Cloud Functions
 * Firebase backend for UPI fraud detection system
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { detectFraud } = require('./utils/fraudEngine');
const { updateUsualLocation } = require('./utils/location');
const { hasSufficientBalance, generateInitialBalance, deductAmount } = require('./utils/balanceHelper');
const { generateQRCode, generateUniqueUPIId } = require('./utils/qrGenerator');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

/**
 * CLOUD FUNCTION 1: onUserCreated
 * Triggered when a new user is created via Firebase Authentication
 * Creates user document in Firestore with initial balance and settings
 */
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    functions.logger.info(`Creating user document for: ${user.uid}`);
    
    // Generate random initial balance between 70,000 and 150,000
    const initialBalance = generateInitialBalance();
    
    // Generate unique UPI ID
    const upiId = generateUniqueUPIId(user.email || '', user.uid);
    
    // Get user name
    const userName = user.displayName || user.email?.split('@')[0] || 'User';
    
    // Generate UPI QR code
    let qrCodeDataURL = '';
    try {
      qrCodeDataURL = await generateQRCode(upiId, userName);
      functions.logger.info(`QR code generated for ${user.uid}`);
    } catch (qrError) {
      functions.logger.error('Error generating QR code:', qrError);
      // Continue without QR code - can be regenerated later
    }
    
    // Extract user information
    const userData = {
      uid: user.uid,
      name: userName,
      mobile: user.phoneNumber || '',
      email: user.email || '',
      upi_id: upiId,
      qr_code: qrCodeDataURL, // Base64 data URL of QR code
      balance: initialBalance,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      usual_location: {
        lat: 0,
        lon: 0
      },
      transaction_count: 0
    };
    
    // Create user document in Firestore
    await db.collection('users').doc(user.uid).set(userData);
    
    functions.logger.info(`User document created successfully for ${user.uid} with UPI ID: ${upiId}, balance: ₹${initialBalance}`);
    
    return { success: true };
  } catch (error) {
    functions.logger.error('Error creating user document:', error);
    throw error;
  }
});

/**
 * CLOUD FUNCTION 2: initiateTransaction
 * HTTPS Callable function to process UPI transactions with fraud detection
 * 
 * Input: { recipient_upi, amount, latitude, longitude }
 * Output: { success, is_fraud, reasons, fraud_probability, new_balance, transaction_id }
 * 
 * FRONTEND REALTIME LISTENERS:
 * 
 * // Listen to user's transactions in realtime:
 * const unsubscribe = db.collection("transactions")
 *   .where("sender_uid", "==", currentUser.uid)
 *   .orderBy("timestamp", "desc")
 *   .limit(50)
 *   .onSnapshot((snapshot) => {
 *     snapshot.docChanges().forEach((change) => {
 *       if (change.type === "added") {
 *         // Add new transaction to top of list
 *       }
 *       if (change.type === "modified") {
 *         // Update transaction in list (status change)
 *       }
 *     });
 *   });
 * 
 * // Listen to user balance in realtime:
 * const unsubBalance = db.collection("users")
 *   .doc(currentUser.uid)
 *   .onSnapshot((doc) => {
 *     setBalance(doc.data().balance);
 *   });
 */
exports.initiateTransaction = functions.https.onCall(async (data, context) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to initiate transaction'
      );
    }
    
    const uid = context.auth.uid;
    const { recipient_upi, amount, latitude, longitude } = data;
    
    // Validate input parameters
    if (!recipient_upi || !amount || latitude === undefined || longitude === undefined) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: recipient_upi, amount, latitude, longitude'
      );
    }
    
    if (amount <= 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Transaction amount must be greater than 0'
      );
    }
    
    functions.logger.info(`Transaction initiated by ${uid} for amount: ₹${amount}`);
    
    // Fetch sender user document
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User document not found'
      );
    }
    
    const userData = userDoc.data();
    const currentBalance = userData.balance;
    
    // Check if sender has sufficient balance
    if (!hasSufficientBalance(currentBalance, amount)) {
      functions.logger.warn(`Insufficient balance for user ${uid}: ₹${currentBalance} < ₹${amount}`);
      return {
        success: false,
        error: 'Insufficient balance',
        current_balance: currentBalance
      };
    }
    
    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const timestamp = Date.now();
    
    // Run fraud detection
    const fraudResult = await detectFraud(
      db,
      uid,
      amount,
      latitude,
      longitude,
      timestamp,
      userData
    );
    
    functions.logger.info(`Fraud detection result for ${transactionId}:`, fraudResult);
    
    // If transaction is flagged as fraud
    if (fraudResult.is_fraud) {
      // Save blocked transaction (DO NOT deduct balance)
      const blockedTransaction = {
        transaction_id: transactionId,
        sender_uid: uid,
        sender_upi: userData.upi_id,
        recipient_upi: recipient_upi,
        amount: amount,
        timestamp: admin.firestore.Timestamp.fromMillis(timestamp),
        latitude: latitude,
        longitude: longitude,
        is_fraud: true,
        fraud_probability: fraudResult.fraud_probability,
        fraud_reasons: fraudResult.reasons,
        status: 'blocked',
        balance_before: currentBalance,
        balance_after: currentBalance // Balance unchanged
      };
      
      await db.collection('transactions').doc(transactionId).set(blockedTransaction);
      
      functions.logger.warn(`Transaction ${transactionId} BLOCKED due to fraud detection`);
      
      return {
        success: false,
        is_fraud: true,
        reasons: fraudResult.reasons,
        fraud_probability: fraudResult.fraud_probability,
        transaction_id: transactionId
      };
    }
    
    // Transaction is legitimate - process it atomically
    try {
      const newBalance = await db.runTransaction(async (transaction) => {
        // Re-read user document within transaction
        const freshUserDoc = await transaction.get(userRef);
        const freshBalance = freshUserDoc.data().balance;
        
        // Double-check balance within transaction
        if (!hasSufficientBalance(freshBalance, amount)) {
          throw new functions.https.HttpsError(
            'failed-precondition',
            'Insufficient balance (concurrent transaction detected)'
          );
        }
        
        // Calculate new balance
        const updatedBalance = deductAmount(freshBalance, amount);
        
        // Update user balance and transaction count
        transaction.update(userRef, {
          balance: updatedBalance,
          transaction_count: admin.firestore.FieldValue.increment(1)
        });
        
        // Create approved transaction document
        const approvedTransaction = {
          transaction_id: transactionId,
          sender_uid: uid,
          sender_upi: userData.upi_id,
          recipient_upi: recipient_upi,
          amount: amount,
          timestamp: admin.firestore.Timestamp.fromMillis(timestamp),
          latitude: latitude,
          longitude: longitude,
          is_fraud: false,
          fraud_probability: fraudResult.fraud_probability,
          fraud_reasons: [],
          status: 'approved',
          balance_before: freshBalance,
          balance_after: updatedBalance
        };
        
        transaction.set(db.collection('transactions').doc(transactionId), approvedTransaction);
        
        return updatedBalance;
      });
      
      // Update usual location (outside transaction for performance)
      await updateUsualLocation(db, uid, latitude, longitude);
      
      functions.logger.info(`Transaction ${transactionId} APPROVED. New balance: ₹${newBalance}`);
      
      return {
        success: true,
        is_fraud: false,
        new_balance: newBalance,
        transaction_id: transactionId,
        fraud_probability: fraudResult.fraud_probability
      };
      
    } catch (transactionError) {
      functions.logger.error('Transaction failed:', transactionError);
      throw new functions.https.HttpsError(
        'internal',
        'Transaction processing failed',
        transactionError.message
      );
    }
    
  } catch (error) {
    functions.logger.error('Error in initiateTransaction:', error);
    
    // Re-throw HttpsError as-is
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    // Wrap other errors
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while processing the transaction',
      error.message
    );
  }
});

/**
 * CLOUD FUNCTION 3: getTransactionHistory
 * HTTPS Callable function to fetch user's transaction history
 * Returns last 50 transactions ordered by timestamp
 * 
 * Note: This is for initial load. Use Firestore realtime listeners
 * on frontend for live updates (see initiateTransaction comments)
 */
exports.getTransactionHistory = functions.https.onCall(async (data, context) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to view transaction history'
      );
    }
    
    const uid = context.auth.uid;
    
    functions.logger.info(`Fetching transaction history for user: ${uid}`);
    
    // Query transactions for this user
    const transactionsSnapshot = await db.collection('transactions')
      .where('sender_uid', '==', uid)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    // Convert to array
    const transactions = [];
    transactionsSnapshot.forEach(doc => {
      const txData = doc.data();
      transactions.push({
        id: doc.id,
        ...txData,
        timestamp: txData.timestamp.toMillis() // Convert Firestore timestamp to milliseconds
      });
    });
    
    functions.logger.info(`Retrieved ${transactions.length} transactions for user ${uid}`);
    
    return {
      success: true,
      transactions: transactions
    };
    
  } catch (error) {
    functions.logger.error('Error fetching transaction history:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to fetch transaction history',
      error.message
    );
  }
});

/**
 * CLOUD FUNCTION 4: regenerateQRCode
 * HTTPS Callable function to regenerate QR code for user
 * Useful if QR code generation failed during signup or needs to be updated
 */
exports.regenerateQRCode = functions.https.onCall(async (data, context) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to regenerate QR code'
      );
    }
    
    const uid = context.auth.uid;
    
    functions.logger.info(`Regenerating QR code for user: ${uid}`);
    
    // Fetch user document
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User profile not found'
      );
    }
    
    const userData = userDoc.data();
    
    // Generate new QR code
    const qrCodeDataURL = await generateQRCode(userData.upi_id, userData.name);
    
    // Update user document with new QR code
    await db.collection('users').doc(uid).update({
      qr_code: qrCodeDataURL
    });
    
    functions.logger.info(`QR code regenerated successfully for user ${uid}`);
    
    return {
      success: true,
      qr_code: qrCodeDataURL,
      upi_id: userData.upi_id
    };
    
  } catch (error) {
    functions.logger.error('Error regenerating QR code:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to regenerate QR code',
      error.message
    );
  }
});

/**
 * CLOUD FUNCTION 5: getUserProfile
 * HTTPS Callable function to fetch user profile with statistics
 * 
 * Returns:
 * - User data (name, email, upi_id, qr_code, balance, etc.)
 * - Statistics (total_transactions, fraud_blocked, total_sent)
 */
exports.getUserProfile = functions.https.onCall(async (data, context) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to view profile'
      );
    }
    
    const uid = context.auth.uid;
    
    functions.logger.info(`Fetching profile for user: ${uid}`);
    
    // Fetch user document
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User profile not found'
      );
    }
    
    const userData = userDoc.data();
    
    // Calculate statistics
    const transactionsSnapshot = await db.collection('transactions')
      .where('sender_uid', '==', uid)
      .get();
    
    let fraud_blocked = 0;
    let total_sent = 0;
    
    transactionsSnapshot.forEach(doc => {
      const txData = doc.data();
      
      if (txData.status === 'blocked') {
        fraud_blocked++;
      }
      
      if (txData.status === 'approved') {
        total_sent += txData.amount;
      }
    });
    
    const stats = {
      total_transactions: userData.transaction_count || 0,
      fraud_blocked: fraud_blocked,
      total_sent: total_sent
    };
    
    functions.logger.info(`Profile retrieved for user ${uid}:`, stats);
    
    return {
      success: true,
      user: {
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        upi_id: userData.upi_id,
        qr_code: userData.qr_code || '', // Base64 QR code data URL
        balance: userData.balance,
        created_at: userData.created_at?.toMillis() || null,
        transaction_count: userData.transaction_count
      },
      stats: stats
    };
    
  } catch (error) {
    functions.logger.error('Error fetching user profile:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to fetch user profile',
      error.message
    );
  }
});
