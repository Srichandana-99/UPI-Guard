/**
 * Balance management utilities
 * Handles balance checks and updates
 */

/**
 * Check if user has sufficient balance for transaction
 * @param {number} currentBalance - User's current balance
 * @param {number} amount - Transaction amount
 * @returns {boolean} True if sufficient balance
 */
function hasSufficientBalance(currentBalance, amount) {
  return currentBalance >= amount;
}

/**
 * Generate random initial balance for new user
 * Range: 70,000 to 150,000
 * @returns {number} Random balance
 */
function generateInitialBalance() {
  return Math.floor(Math.random() * (150000 - 70000 + 1)) + 70000;
}

/**
 * Calculate new balance after transaction
 * @param {number} currentBalance - Current balance
 * @param {number} amount - Transaction amount
 * @returns {number} New balance
 */
function deductAmount(currentBalance, amount) {
  return currentBalance - amount;
}

/**
 * Calculate new balance after receiving payment
 * @param {number} currentBalance - Current balance
 * @param {number} amount - Received amount
 * @returns {number} New balance
 */
function addAmount(currentBalance, amount) {
  return currentBalance + amount;
}

module.exports = {
  hasSufficientBalance,
  generateInitialBalance,
  deductAmount,
  addAmount
};
