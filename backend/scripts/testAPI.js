/**
 * Test API endpoint directly
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

async function testAPI() {
  const upiId = 'arjunmehtabb6d@secureupi';
  
  console.log('Testing UPI ID:', upiId);
  console.log('='.repeat(60));
  
  // Test the exact query used in the API
  const user = await dbGet('SELECT uid, name, email, is_fraud_account FROM users WHERE upi_id = ?', [upiId]);
  
  if (!user) {
    console.log('❌ User NOT found');
    
    // Check if UPI ID exists with different case or spacing
    const allUsers = await new Promise((resolve, reject) => {
      db.all('SELECT name, upi_id FROM users WHERE upi_id LIKE ?', [`%arjunmehta%`], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\nSimilar UPI IDs found:');
    allUsers.forEach(u => {
      console.log(`  ${u.name}: ${u.upi_id}`);
    });
  } else {
    console.log('✅ User found!');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('is_fraud_account:', user.is_fraud_account);
  }
  
  db.close();
}

testAPI();
