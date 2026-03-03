/**
 * QR Code Generator for UPI
 * Generates unique UPI QR codes for each user
 */

const QRCode = require('qrcode');

/**
 * Generate UPI payment string in standard format
 * Format: upi://pay?pa=UPI_ID&pn=NAME&cu=INR
 * 
 * @param {string} upiId - User's UPI ID
 * @param {string} name - User's name
 * @returns {string} UPI payment string
 */
function generateUPIString(upiId, name) {
  // Encode name for URL
  const encodedName = encodeURIComponent(name);
  
  // Standard UPI payment string format
  const upiString = `upi://pay?pa=${upiId}&pn=${encodedName}&cu=INR`;
  
  return upiString;
}

/**
 * Generate QR code as base64 data URL
 * 
 * @param {string} upiId - User's UPI ID
 * @param {string} name - User's name
 * @returns {Promise<string>} Base64 data URL of QR code
 */
async function generateQRCode(upiId, name) {
  try {
    const upiString = generateUPIString(upiId, name);
    
    // Generate QR code as data URL (base64)
    const qrCodeDataURL = await QRCode.toDataURL(upiString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300 // 300x300 pixels
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate unique UPI ID for user
 * Format: username@secureupi or email_prefix@secureupi
 * Ensures uniqueness by adding random suffix if needed
 * 
 * @param {string} email - User's email
 * @param {string} uid - User's unique ID
 * @returns {string} Unique UPI ID
 */
function generateUniqueUPIId(email, uid) {
  // Extract username from email
  const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Take first 4 characters of UID for uniqueness
  const uidSuffix = uid.substring(0, 4).toLowerCase();
  
  // Format: username{uid}@secureupi
  const upiId = `${username}${uidSuffix}@secureupi`;
  
  return upiId;
}

module.exports = {
  generateQRCode,
  generateUniqueUPIId,
  generateUPIString
};
