/**
 * Add is_fraud_account flag to users table
 * Mark all fraud test accounts
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

async function addFraudFlag() {
  console.log('🔧 Adding is_fraud_account column to users table...\n');

  try {
    // Add column if it doesn't exist
    await dbRun(`
      ALTER TABLE users ADD COLUMN is_fraud_account INTEGER DEFAULT 0
    `);
    console.log('✅ Column added successfully\n');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️  Column already exists\n');
    } else {
      throw error;
    }
  }

  // Mark all test accounts as fraud accounts
  console.log('🚨 Marking fraud test accounts...\n');

  const fraudEmails = [
    'rajesh.kumar@test.com',
    'priya.sharma@test.com',
    'amit.patel@test.com',
    'sneha.reddy@test.com',
    'vikram.singh@test.com',
    'anjali.gupta@test.com',
    'rahul.verma@test.com',
    'deepika.iyer@test.com',
    'arjun.mehta@test.com',
    'kavya.nair@test.com'
  ];

  let markedCount = 0;

  for (const email of fraudEmails) {
    const result = await dbRun(
      'UPDATE users SET is_fraud_account = 1 WHERE email = ?',
      [email]
    );
    
    if (result.changes > 0) {
      markedCount++;
      console.log(`   ✅ Marked: ${email}`);
    }
  }

  console.log(`\n✅ Marked ${markedCount} accounts as fraud accounts\n`);

  // Show summary
  const fraudAccounts = await dbAll('SELECT name, email, upi_id FROM users WHERE is_fraud_account = 1');
  
  console.log('='.repeat(60));
  console.log('FRAUD ACCOUNTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total fraud accounts: ${fraudAccounts.length}\n`);
  
  fraudAccounts.forEach((account, index) => {
    console.log(`${index + 1}. ${account.name}`);
    console.log(`   Email: ${account.email}`);
    console.log(`   UPI ID: ${account.upi_id}\n`);
  });

  console.log('='.repeat(60));
  console.log('✅ Fraud flag migration completed successfully!');
  console.log('='.repeat(60));
}

async function main() {
  try {
    await addFraudFlag();
    db.close();
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
    process.exit(1);
  }
}

main();
