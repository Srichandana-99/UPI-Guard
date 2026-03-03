/**
 * API Service Layer for Secure UPI
 * Handles all backend API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

// Set auth token in localStorage
function setAuthToken(token) {
  localStorage.setItem('auth_token', token);
}

// Remove auth token from localStorage
function removeAuthToken() {
  localStorage.removeItem('auth_token');
}

// Make authenticated API request
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Register new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User display name
 * @param {string} mobile - User mobile number (optional)
 * @param {string} dob - Date of birth (optional)
 * @param {number} age - Age (optional)
 * @returns {Promise<Object>} { user }
 */
export async function registerUser(email, password, name, mobile = '', dob = '', age = null, transaction_pin = '') {
  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, mobile, dob, age, transaction_pin })
    });

    // Save token
    setAuthToken(data.token);

    console.log('✅ User registered:', data.user.uid);
    return data;
  } catch (error) {
    console.error('❌ Registration failed:', error);
    throw error;
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} { user }
 */
export async function loginUser(email, password) {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    // Save token
    setAuthToken(data.token);

    console.log('✅ User logged in:', data.user.uid);
    return data;
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
}

/**
 * Logout user
 */
export async function logoutUser() {
  try {
    removeAuthToken();
    console.log('✅ User logged out');
  } catch (error) {
    console.error('❌ Logout failed:', error);
    throw error;
  }
}

/**
 * Get current user
 * @returns {Promise<Object>} User object
 */
export async function getCurrentUser() {
  try {
    const data = await apiRequest('/auth/me');
    console.log('✅ Current user fetched');
    return data.user;
  } catch (error) {
    console.error('❌ Failed to get current user:', error);
    throw error;
  }
}

/**
 * Reset password
 * @param {string} email - User email
 * @param {string} newPassword - New password
 */
export async function resetPassword(email, newPassword) {
  try {
    await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword })
    });
    console.log('✅ Password reset successful');
  } catch (error) {
    console.error('❌ Password reset failed:', error);
    throw error;
  }
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

/**
 * Initiate transaction
 * @param {Object} data - Transaction data
 * @param {string} data.recipient_upi - Recipient UPI ID
 * @param {number} data.amount - Transaction amount
 * @param {number} data.latitude - Transaction latitude
 * @param {number} data.longitude - Transaction longitude
 * @returns {Promise<Object>} Transaction result
 */
export async function initiateTransaction(data) {
  try {
    const result = await apiRequest('/transactions/initiate', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    console.log('✅ Transaction result:', result);
    return result;
  } catch (error) {
    console.error('❌ Transaction failed:', error);
    throw error;
  }
}

/**
 * Get transaction history
 * @param {number} limit - Number of transactions to fetch
 * @returns {Promise<Array>} Array of transactions
 */
export async function getTransactionHistory(limit = 50) {
  try {
    const data = await apiRequest(`/transactions/history?limit=${limit}`);
    console.log('✅ Transaction history retrieved:', data.transactions.length);
    return data.transactions;
  } catch (error) {
    console.error('❌ Failed to get transaction history:', error);
    throw error;
  }
}

/**
 * Get single transaction
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} Transaction object
 */
export async function getTransaction(transactionId) {
  try {
    const data = await apiRequest(`/transactions/${transactionId}`);
    return data.transaction;
  } catch (error) {
    console.error('❌ Failed to get transaction:', error);
    throw error;
  }
}

// ============================================================================
// USER
// ============================================================================

/**
 * Get user profile with stats
 * @returns {Promise<Object>} User profile with stats
 */
export async function getUserProfile() {
  try {
    const data = await apiRequest('/user/profile');
    console.log('✅ User profile retrieved');
    return data.user;
  } catch (error) {
    console.error('❌ Failed to get user profile:', error);
    throw error;
  }
}

/**
 * Update user profile
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user
 */
export async function updateUserProfile(updates) {
  try {
    const data = await apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    console.log('✅ User profile updated');
    return data.user;
  } catch (error) {
    console.error('❌ Failed to update user profile:', error);
    throw error;
  }
}

/**
 * Regenerate QR code
 * @returns {Promise<Object>} New QR code data
 */
export async function regenerateQRCode() {
  try {
    const data = await apiRequest('/user/regenerate-qr', {
      method: 'POST'
    });
    console.log('✅ QR code regenerated');
    return data;
  } catch (error) {
    console.error('❌ Failed to regenerate QR code:', error);
    throw error;
  }
}

/**
 * Log user location
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {string} action - Action type
 */
export async function logUserLocation(latitude, longitude, action = 'unknown') {
  try {
    await apiRequest('/user/location', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, action })
    });
  } catch (error) {
    console.error('❌ Failed to log location:', error);
  }
}

/**
 * Check if UPI ID is suspicious (fraud account)
 * @param {string} upiId - UPI ID to check
 * @returns {Promise<Object>} { exists, suspicious, name, fraud_stats }
 */
export async function checkSuspiciousAccount(upiId) {
  try {
    console.log('🌐 API: Checking suspicious account:', upiId);
    const data = await apiRequest(`/user/check-suspicious?upi_id=${encodeURIComponent(upiId)}`);
    console.log('🌐 API: Response:', data);
    return data;
  } catch (error) {
    console.error('🌐 API: Failed to check suspicious account:', error);
    return { exists: false, suspicious: false };
  }
}

/**
 * Get user location from browser
 * @returns {Promise<Object>} { latitude, longitude }
 */
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Return default location if permission denied
        resolve({ latitude: 0, longitude: 0 });
      }
    );
  });
}

// Export token management functions
export { getAuthToken, setAuthToken, removeAuthToken };
