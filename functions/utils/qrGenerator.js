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
 * @param {string} uid - User's Firebase UID (for uniqueness)
 * @returns {string} Unique UPI ID
 */
function generateUniqueUPIId(email, uid) {
  // Extract username from email
  let username = email.split('@')[0];
  
  // Clean username (remove special characters, keep alphanumeric)
  username = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  // If username is too short, use first 8 chars of UID
  if (username.length < 3) {
    username = uid.substring(0, 8).toLowerCase();
  }
  
  // Add last 4 chars of UID for uniqueness
  const uniqueSuffix = uid.substring(uid.length - 4).toLowerCase();
  
  // Format: username_suffix@secureupi
  const upiId = `${username}${uniqueSuffix}@secureupi`;
  
  return upiId;
}

/**
 * Validate UPI ID format
 * 
 * @param {string} upiId - UPI ID to validate
 * @returns {boolean} True if valid
 */
function validateUPIId(upiId) {
  // UPI ID format: username@provider
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return upiRegex.test(upiId);
}

module.exports = {
  generateUPIString,
  generateQRCode,
  generateUniqueUPIId,
  validateUPIId
};
