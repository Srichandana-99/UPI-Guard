/**
 * Generate QR Codes for Existing Accounts
 * This script generates QR codes for accounts that don't have them
 */

const sqlite3 = require('sqlite3').verbose();
const QRCode = require('qrcode');
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
    return null;
  }
}

// Main execution
async function main() {
  try {
    console.log('='.repeat(60));
    console.log('QR CODE GENERATOR FOR EXISTING ACCOUNTS');
    console.log('='.repeat(60));
    console.log('');
    
    // Find all users without QR codes
    const usersWithoutQR = await dbAll(`
      SELECT uid, name, email, upi_id 
      FROM users 
      WHERE qr_code IS NULL OR qr_code = ''
    `);
    
    if (usersWithoutQR.length === 0) {
      console.log('✅ All accounts already have QR codes!');
      console.log('');
      db.close();
      return;
    }
    
    console.log(`Found ${usersWithoutQR.length} account(s) without QR codes\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const user of usersWithoutQR) {
      console.log(`🔄 Generating QR code for ${user.name} (${user.email})...`);
      
      const qrCode = await generateQRCode(user.upi_id, user.name);
      
      if (qrCode) {
        await dbRun('UPDATE users SET qr_code = ? WHERE uid = ?', [qrCode, user.uid]);
        console.log(`✅ QR code generated and saved`);
        console.log(`   UPI ID: ${user.upi_id}`);
        console.log(`   QR Code Length: ${qrCode.length} characters\n`);
        successCount++;
      } else {
        console.log(`❌ Failed to generate QR code\n`);
        failCount++;
      }
    }
    
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully generated: ${successCount} QR codes`);
    if (failCount > 0) {
      console.log(`❌ Failed: ${failCount} QR codes`);
    }
    console.log('');
    console.log('All accounts now have QR codes!');
    console.log('Users can view their QR codes in the app under "My QR" page');
    console.log('='.repeat(60));
    
    db.close();
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
    process.exit(1);
  }
}

main();
