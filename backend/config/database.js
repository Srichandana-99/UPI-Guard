/**
 * SQLite Database Configuration
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Promisify database methods
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize database schema
async function initializeDatabase() {
  console.log('🔧 Initializing database schema...');

  try {
    // Enable foreign keys
    await dbRun('PRAGMA foreign_keys = ON');

    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT,
        password_hash TEXT NOT NULL,
        upi_id TEXT UNIQUE NOT NULL,
        qr_code TEXT,
        balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        usual_location_lat REAL DEFAULT 0,
        usual_location_lon REAL DEFAULT 0,
        transaction_count INTEGER DEFAULT 0,
        dob TEXT,
        age INTEGER,
        is_fraud_account INTEGER DEFAULT 0,
        transaction_pin TEXT
      )
    `);

    // Transactions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE NOT NULL,
        sender_uid TEXT NOT NULL,
        sender_upi TEXT NOT NULL,
        recipient_uid TEXT,
        recipient_upi TEXT NOT NULL,
        amount REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        latitude REAL,
        longitude REAL,
        is_fraud BOOLEAN DEFAULT 0,
        fraud_probability REAL DEFAULT 0,
        fraud_reasons TEXT,
        status TEXT DEFAULT 'approved',
        balance_before REAL,
        balance_after REAL,
        FOREIGN KEY (sender_uid) REFERENCES users(uid)
      )
    `);

    // User locations table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS user_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_uid TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        action TEXT,
        FOREIGN KEY (user_uid) REFERENCES users(uid)
      )
    `);

    // Create indexes for better performance
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_uid, timestamp DESC)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_transactions_recipient ON transactions(recipient_uid, timestamp DESC)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_user_locations_uid ON user_locations(user_uid, timestamp DESC)`);

    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Export both raw db and promisified methods
module.exports = {
  db,
  run: dbRun,
  get: dbGet,
  all: dbAll,
  initialize: initializeDatabase
};
