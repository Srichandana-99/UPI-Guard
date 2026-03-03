/**
 * Transaction Routes
 */

const express = require('express');
const router = express.Router();
const {
  initiateTransaction,
  getTransactionHistory,
  getTransaction
} = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');

// All transaction routes require authentication
router.use(authenticateToken);

router.post('/initiate', initiateTransaction);
router.get('/history', getTransactionHistory);
router.get('/:id', getTransaction);

module.exports = router;
