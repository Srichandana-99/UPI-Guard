/**
 * Test Suspicious Account Check
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

async function testCheck(upiId) {
  console.log(`\n🔍 Checking UPI ID: ${upiId}`);
  console.log('='.repeat(60));

  // Get user by UPI ID
  const user = await dbGet('SELECT uid, name, email FROM users WHERE upi_id = ?', [upiId]);

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log(`✅ User found: ${user.name} (${user.email})`);

  // Check fraud stats
  const fraudStats = await dbGet(`
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

  console.log(`\n📊 Fraud Statistics:`);
  console.log(`   Total Transactions: ${totalTxns}`);
  console.log(`   Fraud Count: ${fraudCount}`);
  console.log(`   Blocked Count: ${blockedCount}`);
  console.log(`   Fraud Rate: ${totalTxns > 0 ? ((fraudCount / totalTxns) * 100).toFixed(1) : 0}%`);

  const isSuspicious = 
    blockedCount > 0 || 
    (totalTxns > 0 && (fraudCount / totalTxns) > 0.5) ||
    user.email.endsWith('@test.com');

  console.log(`\n${isSuspicious ? '🚨 SUSPICIOUS ACCOUNT' : '✅ CLEAN ACCOUNT'}`);
  console.log('='.repeat(60));
}

async function main() {
  console.log('SUSPICIOUS ACCOUNT CHECK TEST');
  console.log('='.repeat(60));

  // Test fraud accounts
  await testCheck('rajeshkumar7d68@secureupi');
  await testCheck('priyasharmace78@secureupi');
  await testCheck('vikramsingh8b5f@secureupi');

  db.close();
}

main();
