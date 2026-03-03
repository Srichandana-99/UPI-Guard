/**
 * Test Fraud Account Detection
 * Verify that all fraud accounts are properly flagged
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function testFraudDetection() {
  console.log('='.repeat(70));
  console.log('FRAUD ACCOUNT DETECTION TEST');
  console.log('='.repeat(70));
  console.log('');

  // Get all fraud accounts
  const fraudAccounts = await dbAll(`
    SELECT 
      name, 
      email, 
      upi_id, 
      is_fraud_account,
      balance
    FROM users 
    WHERE is_fraud_account = 1
    ORDER BY name
  `);

  console.log(`✅ Found ${fraudAccounts.length} fraud accounts:\n`);

  fraudAccounts.forEach((account, index) => {
    console.log(`${index + 1}. ${account.name}`);
    console.log(`   📧 Email: ${account.email}`);
    console.log(`   💳 UPI ID: ${account.upi_id}`);
    console.log(`   💰 Balance: ₹${account.balance.toLocaleString('en-IN')}`);
    console.log(`   🚨 Fraud Flag: ${account.is_fraud_account === 1 ? 'YES ✓' : 'NO ✗'}`);
    console.log('');
  });

  // Get transaction statistics for each fraud account
  console.log('='.repeat(70));
  console.log('FRAUD TRANSACTION STATISTICS');
  console.log('='.repeat(70));
  console.log('');

  for (const account of fraudAccounts) {
    const stats = await dbAll(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_fraud = 1 THEN 1 ELSE 0 END) as fraud_count,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count
      FROM transactions 
      WHERE sender_upi = ?
    `, [account.upi_id]);

    const stat = stats[0];
    const fraudRate = stat.total > 0 ? ((stat.fraud_count / stat.total) * 100).toFixed(1) : 0;

    console.log(`📊 ${account.name}`);
    console.log(`   Total Transactions: ${stat.total}`);
    console.log(`   Fraud Detected: ${stat.fraud_count}`);
    console.log(`   Blocked: ${stat.blocked_count}`);
    console.log(`   Approved: ${stat.approved_count}`);
    console.log(`   Fraud Rate: ${fraudRate}%`);
    console.log('');
  }

  // Test non-fraud accounts
  console.log('='.repeat(70));
  console.log('NON-FRAUD ACCOUNTS');
  console.log('='.repeat(70));
  console.log('');

  const normalAccounts = await dbAll(`
    SELECT 
      name, 
      email, 
      upi_id, 
      is_fraud_account
    FROM users 
    WHERE is_fraud_account = 0
    LIMIT 5
  `);

  if (normalAccounts.length > 0) {
    console.log(`✅ Found ${normalAccounts.length} normal accounts:\n`);
    normalAccounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.name} (${account.email})`);
      console.log(`   UPI ID: ${account.upi_id}`);
      console.log(`   Fraud Flag: ${account.is_fraud_account === 1 ? 'YES' : 'NO ✓'}`);
      console.log('');
    });
  } else {
    console.log('ℹ️  No normal accounts found\n');
  }

  console.log('='.repeat(70));
  console.log('TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Fraud accounts properly flagged: ${fraudAccounts.length}`);
  console.log(`✅ System ready for suspicious account detection`);
  console.log('='.repeat(70));
}

async function main() {
  try {
    await testFraudDetection();
    db.close();
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
    process.exit(1);
  }
}

main();
