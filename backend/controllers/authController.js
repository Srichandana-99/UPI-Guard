/**
 * Authentication Controller
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { run, get } = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { generateInitialBalance } = require('../utils/balanceHelper');
const { generateUniqueUPIId, generateQRCode } = require('../utils/qrGenerator');

/**
 * Register new user
 */
async function register(req, res, next) {
  try {
    const { email, password, name, mobile, dob, age, transaction_pin } = req.body;

    // Validate input
    if (!email || !password || !name || !transaction_pin) {
      return res.status(400).json({ error: 'Email, password, name, and transaction PIN are required' });
    }

    if (transaction_pin.length !== 4 || !/^\d{4}$/.test(transaction_pin)) {
      return res.status(400).json({ error: 'Transaction PIN must be exactly 4 digits' });
    }

    // Check if user already exists
    const existingUser = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Generate unique UID
    const uid = uuidv4();

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate initial balance
    const initialBalance = generateInitialBalance();

    // Generate unique UPI ID
    const upiId = generateUniqueUPIId(email, uid);

    // Generate QR code
    let qrCode = '';
    try {
      qrCode = await generateQRCode(upiId, name);
    } catch (qrError) {
      console.error('QR code generation failed:', qrError);
    }

    // Insert user into database
    await run(`
      INSERT INTO users (uid, name, email, mobile, password_hash, upi_id, qr_code, balance, dob, age, transaction_pin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [uid, name, email, mobile || '', passwordHash, upiId, qrCode, initialBalance, dob || null, age || null, transaction_pin]);

    // Generate JWT token
    const token = generateToken({ uid, email, name });

    // Return user data
    const user = {
      uid,
      name,
      email,
      mobile: mobile || '',
      upi_id: upiId,
      qr_code: qrCode,
      balance: initialBalance,
      transaction_count: 0,
      dob: dob || null,
      age: age || null,
      has_transaction_pin: true
    };

    console.log(`✅ User registered: ${email} with UPI ID: ${upiId}, balance: ₹${initialBalance}`);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken({ uid: user.uid, email: user.email, name: user.name });

    // Return user data
    const userData = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      upi_id: user.upi_id,
      qr_code: user.qr_code,
      balance: user.balance,
      transaction_count: user.transaction_count,
      dob: user.dob,
      age: user.age,
      usual_location: {
        lat: user.usual_location_lat,
        lon: user.usual_location_lon
      }
    };

    console.log(`✅ User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user profile
 */
async function getMe(req, res, next) {
  try {
    const { uid } = req.user;

    const user = await get('SELECT * FROM users WHERE uid = ?', [uid]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      upi_id: user.upi_id,
      qr_code: user.qr_code,
      balance: user.balance,
      transaction_count: user.transaction_count,
      dob: user.dob,
      age: user.age,
      usual_location: {
        lat: user.usual_location_lat,
        lon: user.usual_location_lon
      }
    };

    res.json({ user: userData });
  } catch (error) {
    next(error);
  }
}

/**
 * Reset password
 */
async function resetPassword(req, res, next) {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    // Find user
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await run('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, email]);

    console.log(`✅ Password reset for: ${email}`);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  resetPassword
};
