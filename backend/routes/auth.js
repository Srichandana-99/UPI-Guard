/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const { register, login, getMe, resetPassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticateToken, getMe);

module.exports = router;
