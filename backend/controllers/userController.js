/**
 * User Controller
 */

const { run, get } = require('../config/database');
const { generateQRCode } = require('../utils/qrGenerator');

/**
 * Get user profile with statistics
 */
async function getUserProfile(req, res, next) {
  try {
    const { uid } = req.user;

    // Get user data
    const user = await get('SELECT * FROM users WHERE uid = ?', [uid]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get transaction statistics
    const stats = await get(`
      SELECT
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as total_sent,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as fraud_blocked
      FROM transactions
      WHERE sender_uid = ?
    `, [uid]);

    const userData = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      upi_id: user.upi_id,
      qr_code: user.qr_code,
      balance: user.balance,
      transaction_count: user.transaction_count,
      usual_location: {
        lat: user.usual_location_lat,
        lon: user.usual_location_lon
      },
      stats: {
        total_transactions: stats.total_transactions || 0,
        total_sent: stats.total_sent || 0,
        fraud_blocked: stats.fraud_blocked || 0
      }
    };

    res.json({ user: userData });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile
 */
async function updateUserProfile(req, res, next) {
  try {
    const { uid } = req.user;
    const { name, mobile } = req.body;

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (mobile !== undefined) {
      updates.push('mobile = ?');
      values.push(mobile);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(uid);

    await run(`UPDATE users SET ${updates.join(', ')} WHERE uid = ?`, values);

    // Get updated user
    const user = await get('SELECT * FROM users WHERE uid = ?', [uid]);

    const userData = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      upi_id: user.upi_id,
      qr_code: user.qr_code,
      balance: user.balance,
      transaction_count: user.transaction_count
    };

    console.log(`✅ User profile updated: ${uid}`);

    res.json({
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Regenerate QR code
 */
async function regenerateQRCode(req, res, next) {
  try {
    const { uid } = req.user;

    const user = await get('SELECT * FROM users WHERE uid = ?', [uid]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new QR code
    const qrCode = await generateQRCode(user.upi_id, user.name);

    // Update in database
    await run('UPDATE users SET qr_code = ? WHERE uid = ?', [qrCode, uid]);

    console.log(`✅ QR code regenerated for: ${uid}`);

    res.json({
      message: 'QR code regenerated successfully',
      qr_code: qrCode
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Log user location
 */
async function logUserLocation(req, res, next) {
  try {
    const { uid } = req.user;
    const { latitude, longitude, action } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    await run(`
      INSERT INTO user_locations (user_uid, latitude, longitude, action)
      VALUES (?, ?, ?, ?)
    `, [uid, latitude, longitude, action || 'unknown']);

    res.json({ message: 'Location logged successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Check if UPI ID is suspicious (fraud account)
 */
async function checkSuspiciousAccount(req, res, next) {
  try {
    const { upi_id } = req.query;

    if (!upi_id) {
      return res.status(400).json({ error: 'UPI ID is required' });
    }

    // Get user by UPI ID
    const user = await get('SELECT uid, name, email, is_fraud_account FROM users WHERE upi_id = ?', [upi_id]);

    if (!user) {
      return res.json({ 
        exists: false,
        suspicious: false 
      });
    }

    // Check if marked as fraud account
    if (user.is_fraud_account === 1) {
      // Get fraud statistics
      const fraudStats = await get(`
        SELECT 
          COUNT(*) as total_transactions,
          SUM(CASE WHEN is_fraud = 1 THEN 1 ELSE 0 END) as fraud_count,
          SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked_count
        FROM transactions
        WHERE sender_uid = ?
      `, [user.uid]);

      const totalTxns = fraudStats.total_transactions || 0;
      const fraudCount = fraudStats.fraud_count || 0;
      const blockedCount = fraudStats.blocked_count || 0;

      return res.json({
        exists: true,
        suspicious: true,
        name: user.name,
        fraud_stats: {
          total_transactions: totalTxns,
          fraud_count: fraudCount,
          blocked_count: blockedCount,
          fraud_rate: totalTxns > 0 ? ((fraudCount / totalTxns) * 100).toFixed(1) : 100
        }
      });
    }

    // Check fraud history for non-flagged accounts
    const fraudStats = await get(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN is_fraud = 1 THEN 1 ELSE 0 END) as fraud_count,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked_count
      FROM transactions
      WHERE sender_uid = ?
    `, [user.uid]);

    const totalTxns = fraudStats.total_transactions || 0;
    const fraudCount = fraudStats.fraud_count || 0;
    const blockedCount = fraudStats.blocked_count || 0;

    // Mark as suspicious if has high fraud rate
    const isSuspicious = 
      blockedCount > 0 || 
      (totalTxns > 0 && (fraudCount / totalTxns) > 0.5);

    res.json({
      exists: true,
      suspicious: isSuspicious,
      name: user.name,
      fraud_stats: {
        total_transactions: totalTxns,
        fraud_count: fraudCount,
        blocked_count: blockedCount,
        fraud_rate: totalTxns > 0 ? ((fraudCount / totalTxns) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  regenerateQRCode,
  logUserLocation,
  checkSuspiciousAccount
};
