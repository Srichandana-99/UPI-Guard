/**
 * Fraud Detection Engine
 * Implements multi-layered fraud detection using rule-based and ML approaches
 */

const fetch = require('node-fetch');
const { haversine } = require('./location');

/**
 * Calculate mean of an array of numbers
 */
function calculateMean(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

/**
 * Calculate standard deviation of an array of numbers
 */
function calculateStdDev(numbers, mean) {
  if (numbers.length === 0) return 0;
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / numbers.length;
  return Math.sqrt(variance);
}

/**
 * Main fraud detection function
 * Analyzes transaction using multiple fraud indicators
 * 
 * @param {FirebaseFirestore.Firestore} db - Firestore instance
 * @param {string} uid - User ID
 * @param {number} amount - Transaction amount
 * @param {number} lat - Transaction latitude
 * @param {number} lon - Transaction longitude
 * @param {number} timestamp - Transaction timestamp
 * @param {Object} userDoc - User document data
 * @returns {Object} { is_fraud, fraud_probability, reasons }
 */
async function detectFraud(db, uid, amount, lat, lon, timestamp, userDoc) {
  const reasons = [];
  let flag_amount = false;
  let flag_time = false;
  let flag_location = false;
  let flag_velocity = false;
  let flag_high_amount = false;
  
  // Feature values for ML model
  let z_score = 0;
  let is_odd_hour = 0;
  let distance_km = 0;
  let tx_frequency = 0;
  
  // FEATURE 1: AMOUNT ANOMALY
  // Check if transaction amount is significantly different from user's history
  try {
    const recentTransactions = await db.collection('transactions')
      .where('sender_uid', '==', uid)
      .where('status', '==', 'approved')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();
    
    if (!recentTransactions.empty) {
      const amounts = recentTransactions.docs.map(doc => doc.data().amount);
      const mean = calculateMean(amounts);
      const stdDev = calculateStdDev(amounts, mean);
      
      if (stdDev > 0) {
        z_score = (amount - mean) / stdDev;
        if (z_score > 3) {
          flag_amount = true;
          reasons.push(`Amount anomaly: ${z_score.toFixed(2)} standard deviations above normal`);
        }
      }
    }
  } catch (error) {
    console.error('Error calculating amount anomaly:', error);
  }
  
  // FEATURE 2: TIME ANOMALY
  // Check if transaction is happening at odd hours (before 5 AM or after 11 PM)
  const transactionDate = new Date(timestamp);
  const hour = transactionDate.getHours();
  is_odd_hour = (hour < 5 || hour > 23) ? 1 : 0;
  
  if (is_odd_hour === 1) {
    flag_time = true;
    reasons.push(`Odd hour transaction: ${hour}:00`);
  }
  
  // FEATURE 3: LOCATION ANOMALY
  // Check if transaction location is far from user's usual location
  const usual = userDoc.usual_location || { lat: 0, lon: 0 };
  
  if (usual.lat !== 0 && usual.lon !== 0) {
    distance_km = haversine(lat, lon, usual.lat, usual.lon);
    
    if (distance_km > 100) {
      flag_location = true;
      reasons.push(`Location anomaly: ${distance_km.toFixed(2)} km from usual location`);
    }
  }
  // If first transaction, location check is skipped
  
  // FEATURE 4: TRANSACTION VELOCITY
  // Check if user is making too many transactions in short time
  try {
    const sixtyMinutesAgo = timestamp - (60 * 60 * 1000);
    
    const recentTxQuery = await db.collection('transactions')
      .where('sender_uid', '==', uid)
      .where('timestamp', '>', sixtyMinutesAgo)
      .get();
    
    tx_frequency = recentTxQuery.size;
    
    if (tx_frequency > 5) {
      flag_velocity = true;
      reasons.push(`High velocity: ${tx_frequency} transactions in last 60 minutes`);
    }
  } catch (error) {
    console.error('Error calculating transaction velocity:', error);
  }
  
  // FEATURE 5: HIGH AMOUNT HARD RULE
  // Automatically flag transactions above 50,000
  if (amount > 50000) {
    flag_high_amount = true;
    reasons.push(`High amount: ₹${amount.toLocaleString()}`);
  }
  
  // Call ML model for fraud probability prediction
  let fraud_probability = 0;
  
  try {
    const HF_API_URL = process.env.HF_API_URL || 'https://your-hf-space.hf.space/predict';
    
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        features: [amount, z_score, is_odd_hour, distance_km, tx_frequency]
      }),
      timeout: 5000 // 5 second timeout
    });
    
    if (response.ok) {
      const result = await response.json();
      fraud_probability = result.fraud_probability || 0;
    } else {
      console.error('ML API returned error:', response.status);
      // Fallback to rule-based only if ML fails
      fraud_probability = 0.5;
    }
  } catch (error) {
    console.error('Error calling ML fraud detection API:', error);
    // Fallback to rule-based detection if ML API fails
    fraud_probability = 0.5;
  }
  
  // FINAL DECISION
  // Transaction is fraud if:
  // 1. ML model predicts high probability (>0.7), OR
  // 2. High amount flag is triggered, OR
  // 3. High velocity flag is triggered
  const is_fraud = fraud_probability > 0.7 || flag_high_amount || flag_velocity;
  
  if (is_fraud && reasons.length === 0) {
    reasons.push(`ML model fraud probability: ${(fraud_probability * 100).toFixed(1)}%`);
  }
  
  return {
    is_fraud,
    fraud_probability,
    reasons
  };
}

module.exports = {
  detectFraud
};
