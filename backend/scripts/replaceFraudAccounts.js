/**
 * Replace Old Fraud Accounts with New Indian Names
 * This script deletes old fraud accounts and creates new ones
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
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

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Old fraud account emails to delete
const oldEmails = [
  'fraud1@test.com',
  'fraud2@test.com',
  'fraud3@test.com',
  'fraud4@test.com',
  'fraud5@test.com',
  'fraud6@test.com',
  'fraud7@test.com',
  'fraud8@test.com',
  'fraud9@test.com',
  'fraud10@test.com'
];

async function deleteOldAccounts() {
  console.log('🗑️  Deleting old fraud accounts...\n');
  
  for (const email of oldEmails) {
    // Get user UID
    const user = await dbAll('SELECT uid, name FROM users WHERE email = ?', [email]);
    
    if (user.length > 0) {
      const uid = user[0].uid;
      const name = user[0].name;
      
      // Delete transactions
      const txnResult = await dbRun('DELETE FROM transactions WHERE sender_uid = ?', [uid]);
      console.log(`   Deleted transactions for ${name} (${email})`);
      
      // Delete user
      await dbRun('DELETE FROM users WHERE uid = ?', [uid]);
      console.log(`   ✅ Deleted user: ${name} (${email})`);
    }
  }
  
  console.log('\n✅ All old fraud accounts deleted\n');
}

async function main() {
  try {
    console.log('='.repeat(60));
    console.log('REPLACE FRAUD ACCOUNTS WITH INDIAN NAMES');
    console.log('='.repeat(60));
    console.log('');
    
    await deleteOldAccounts();
    
    console.log('='.repeat(60));
    console.log('Now run: node backend/scripts/createFraudAccounts.js');
    console.log('='.repeat(60));
    
    db.close();
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
    process.exit(1);
  }
}

main();
