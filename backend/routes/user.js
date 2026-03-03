/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  regenerateQRCode,
  logUserLocation,
  checkSuspiciousAccount
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticateToken);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.post('/regenerate-qr', regenerateQRCode);
router.post('/location', logUserLocation);
router.get('/check-suspicious', checkSuspiciousAccount);

module.exports = router;
