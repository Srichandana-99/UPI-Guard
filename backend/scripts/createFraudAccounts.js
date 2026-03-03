/**
 * Create Fraud Test Accounts and Transactions
 * This script creates 10 accounts with various fraud patterns
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const QRCode = require('qrcode');

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

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Generate UPI ID
function generateUPIId(email, uid) {
  const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const uidSuffix = uid.substring(0, 4).toLowerCase();
  return `${username}${uidSuffix}@secureupi`;
}

// Generate QR Code
async function generateQRCode(upiId, name) {
  try {
    const encodedName = encodeURIComponent(name);
    const upiString = `upi://pay?pa=${upiId}&pn=${encodedName}&cu=INR`;
    
    const qrCodeDataURL = await QRCode.toDataURL(upiString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

// Fraud account templates with Indian names and details
const fraudAccounts = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@test.com',
    mobile: '9876543210',
    balance: 150000,
    fraudType: 'high_amount',
    dob: '1985-03-15',
    age: 39
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@test.com',
    mobile: '9876543211',
    balance: 120000,
    fraudType: 'odd_hours',
    dob: '1992-07-22',
    age: 32
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@test.com',
    mobile: '9876543212',
    balance: 135000,
    fraudType: 'location_anomaly',
    dob: '1988-11-08',
    age: 36
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@test.com',
    mobile: '9876543213',
    balance: 145000,
    fraudType: 'velocity',
    dob: '1990-05-30',
    age: 34
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@test.com',
    mobile: '9876543214',
    balance: 125000,
    fraudType: 'high_frequency',
    dob: '1987-09-12',
    age: 37
  },
  {
    name: 'Anjali Gupta',
    email: 'anjali.gupta@test.com',
    mobile: '9876543215',
    balance: 140000,
    fraudType: 'mixed',
    dob: '1993-02-18',
    age: 31
  },
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@test.com',
    mobile: '9876543216',
    balance: 130000,
    fraudType: 'amount_spike',
    dob: '1989-12-25',
    age: 35
  },
  {
    name: 'Deepika Iyer',
    email: 'deepika.iyer@test.com',
    mobile: '9876543217',
    balance: 155000,
    fraudType: 'global_location',
    dob: '1991-06-14',
    age: 33
  },
  {
    name: 'Arjun Mehta',
    email: 'arjun.mehta@test.com',
    mobile: '9876543218',
    balance: 115000,
    fraudType: 'midnight',
    dob: '1994-04-07',
    age: 30
  },
  {
    name: 'Kavya Nair',
    email: 'kavya.nair@test.com',
    mobile: '9876543219',
    balance: 148000,
    fraudType: 'combo',
    dob: '1986-10-20',
    age: 38
  }
];

// Create users
async function createUsers() {
  console.log('Creating fraud test accounts...\n');
  
  const password = 'Fraud@123';
  const passwordHash = await bcrypt.hash(password, 10);
  
  const users = [];
  
  for (const account of fraudAccounts) {
    const uid = uuidv4();
    const upiId = generateUPIId(account.email, uid);
    
    // Generate QR code
    console.log(`🔄 Generating QR code for ${account.name}...`);
    const qrCode = await generateQRCode(upiId, account.name);
    
    await dbRun(`
      INSERT INTO users (uid, name, email, mobile, password_hash, upi_id, qr_code, balance, dob, age, usual_location_lat, usual_location_lon, is_fraud_account)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      uid,
      account.name,
      account.email,
      account.mobile,
      passwordHash,
      upiId,
      qrCode,
      account.balance,
      account.dob,
      account.age,
      28.6139, // Delhi coordinates as usual location
      77.2090
    ]);
    
    users.push({
      uid,
      upiId,
      email: account.email,
      name: account.name,
      balance: account.balance,
      fraudType: account.fraudType
    });
    
    console.log(`✅ Created: ${account.name} (${account.email})`);
    console.log(`   UPI ID: ${upiId}`);
    console.log(`   QR Code: ${qrCode ? 'Generated ✓' : 'Failed ✗'}`);
    console.log(`   Balance: ₹${account.balance.toLocaleString()}`);
    console.log(`   Fraud Type: ${account.fraudType}\n`);
  }
  
  return users;
}

// Create fraudulent transactions
async function createFraudTransactions(users) {
  console.log('\nCreating fraudulent transactions...\n');
  
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  let transactionCount = 0;
  
  for (const user of users) {
    const transactions = [];
    
    switch (user.fraudType) {
      case 'high_amount':
        // Single high amount transaction (>50,000)
        transactions.push({
          amount: 75000,
          timestamp: now - 300000, // 5 minutes ago
          latitude: 28.6139,
          longitude: 77.2090,
          reason: 'High amount: ₹75,000'
        });
        break;
        
      case 'odd_hours':
        // Transactions at 2 AM and 3 AM
        const twoAM = new Date();
        twoAM.setHours(2, 0, 0, 0);
        const threeAM = new Date();
        threeAM.setHours(3, 0, 0, 0);
        
        transactions.push(
          {
            amount: 15000,
            timestamp: twoAM.getTime(),
            latitude: 28.6139,
            longitude: 77.2090,
            reason: 'Odd hour transaction: 2:00'
          },
          {
            amount: 20000,
            timestamp: threeAM.getTime(),
            latitude: 28.6139,
            longitude: 77.2090,
            reason: 'Odd hour transaction: 3:00'
          }
        );
        break;
        
      case 'location_anomaly':
        // Transaction from Mumbai (1400km from Delhi)
        transactions.push({
          amount: 25000,
          timestamp: now - 600000, // 10 minutes ago
          latitude: 19.0760, // Mumbai
          longitude: 72.8777,
          reason: 'Location anomaly: 1,150 km from usual location'
        });
        break;
        
      case 'velocity':
        // Two transactions 1 hour apart from distant locations
        transactions.push(
          {
            amount: 10000,
            timestamp: oneHourAgo,
            latitude: 28.6139, // Delhi
            longitude: 77.2090,
            reason: 'Normal transaction'
          },
          {
            amount: 15000,
            timestamp: oneHourAgo + 3600000, // 1 hour later
            latitude: 13.0827, // Bangalore (2100km away)
            longitude: 80.2707,
            reason: 'Impossible velocity: 2,100 km/h'
          }
        );
        break;
        
      case 'high_frequency':
        // 7 transactions in last hour
        for (let i = 0; i < 7; i++) {
          transactions.push({
            amount: 5000 + (i * 1000),
            timestamp: oneHourAgo + (i * 8 * 60 * 1000), // Every 8 minutes
            latitude: 28.6139,
            longitude: 77.2090,
            reason: i === 6 ? 'High frequency: 7 transactions in last hour' : 'Normal'
          });
        }
        break;
        
      case 'mixed':
        // Combination of high amount + odd hours
        const midnight = new Date();
        midnight.setHours(0, 30, 0, 0);
        
        transactions.push({
          amount: 65000,
          timestamp: midnight.getTime(),
          latitude: 28.6139,
          longitude: 77.2090,
          reason: 'High amount + Odd hour'
        });
        break;
        
      case 'amount_spike':
        // Normal transactions followed by huge spike
        transactions.push(
          { amount: 2000, timestamp: oneDayAgo, latitude: 28.6139, longitude: 77.2090, reason: 'Normal' },
          { amount: 2500, timestamp: oneDayAgo + 3600000, latitude: 28.6139, longitude: 77.2090, reason: 'Normal' },
          { amount: 3000, timestamp: oneDayAgo + 7200000, latitude: 28.6139, longitude: 77.2090, reason: 'Normal' },
          { amount: 85000, timestamp: now - 300000, latitude: 28.6139, longitude: 77.2090, reason: 'Amount anomaly: 28.33 standard deviations above normal' }
        );
        break;
        
      case 'global_location':
        // Transaction from international location
        transactions.push({
          amount: 30000,
          timestamp: now - 900000, // 15 minutes ago
          latitude: 40.7128, // New York
          longitude: -74.0060,
          reason: 'Location anomaly: 11,750 km from usual location'
        });
        break;
        
      case 'midnight':
        // Multiple midnight transactions
        const mid1 = new Date();
        mid1.setHours(0, 15, 0, 0);
        const mid2 = new Date();
        mid2.setHours(1, 45, 0, 0);
        
        transactions.push(
          {
            amount: 18000,
            timestamp: mid1.getTime(),
            latitude: 28.6139,
            longitude: 77.2090,
            reason: 'Odd hour transaction: 0:15'
          },
          {
            amount: 22000,
            timestamp: mid2.getTime(),
            latitude: 28.6139,
            longitude: 77.2090,
            reason: 'Odd hour transaction: 1:45'
          }
        );
        break;
        
      case 'combo':
        // High amount + location + odd hours
        const lateNight = new Date();
        lateNight.setHours(23, 30, 0, 0);
        
        transactions.push({
          amount: 95000,
          timestamp: lateNight.getTime(),
          latitude: 22.5726, // Kolkata
          longitude: 88.3639,
          reason: 'High amount + Location anomaly + Odd hour'
        });
        break;
    }
    
    // Insert transactions
    for (const txn of transactions) {
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const isFraud = txn.reason !== 'Normal';
      const fraudProbability = isFraud ? 0.85 : 0.15;
      const status = isFraud ? 'blocked' : 'approved';
      const balanceAfter = status === 'approved' ? user.balance - txn.amount : user.balance;
      
      await dbRun(`
        INSERT INTO transactions (
          transaction_id, sender_uid, sender_upi, recipient_upi, amount,
          timestamp, latitude, longitude, is_fraud, fraud_probability,
          fraud_reasons, status, balance_before, balance_after
        ) VALUES (?, ?, ?, ?, ?, datetime(?, 'unixepoch', 'localtime'), ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        transactionId,
        user.uid,
        user.upiId,
        'merchant@secureupi',
        txn.amount,
        txn.timestamp / 1000,
        txn.latitude,
        txn.longitude,
        isFraud ? 1 : 0,
        fraudProbability,
        JSON.stringify(isFraud ? [txn.reason] : []),
        status,
        user.balance,
        balanceAfter
      ]);
      
      transactionCount++;
      
      const statusIcon = status === 'blocked' ? '🚫' : '✅';
      console.log(`${statusIcon} ${user.name}: ₹${txn.amount.toLocaleString()} - ${status.toUpperCase()}`);
      if (isFraud) {
        console.log(`   Reason: ${txn.reason}`);
      }
    }
    
    console.log('');
  }
  
  console.log(`\n✅ Created ${transactionCount} transactions (mix of fraud and legitimate)\n`);
}

// Main execution
async function main() {
  try {
    console.log('='.repeat(60));
    console.log('FRAUD TEST DATA GENERATOR');
    console.log('='.repeat(60));
    console.log('');
    
    const users = await createUsers();
    await createFraudTransactions(users);
    
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Created ${users.length} fraud test accounts`);
    console.log(`✅ All accounts have password: Fraud@123`);
    console.log(`✅ Transactions include various fraud patterns:`);
    console.log(`   - High amount (>₹50,000)`);
    console.log(`   - Odd hours (11 PM - 6 AM)`);
    console.log(`   - Location anomalies (>100 km)`);
    console.log(`   - Impossible velocity (>800 km/h)`);
    console.log(`   - High frequency (>5 txns/hour)`);
    console.log(`   - Combination patterns`);
    console.log('');
    console.log('📧 Test Account Emails:');
    users.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email} - ${u.name}`);
    });
    console.log('');
    console.log('🔐 Login with any account using:');
    console.log('   Email: rajesh.kumar@test.com (or any other email above)');
    console.log('   Password: Fraud@123');
    console.log('');
    console.log('='.repeat(60));
    
    db.close();
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
    process.exit(1);
  }
}

main();
