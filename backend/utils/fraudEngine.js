/**
 * Fraud Detection Engine
 */

const fetch = require('node-fetch');
const { haversine } = require('./location');
const { all, get } = require('../config/database');

/**
 * Calculate mean of an array of numbers
 */
function calculateMean(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(numbers, mean) {
  if (numbers.length === 0) return 0;
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / numbers.length;
  return Math.sqrt(variance);
}

/**
 * Main fraud detection function
 */
async function detectFraud(uid, amount, lat, lon, timestamp, userDoc) {
  const reasons = [];
  let flag_amount = false;
  let flag_time = false;
  let flag_location = false;
  let flag_velocity = false;
  let flag_high_amount = false;
  
  let z_score = 0;
  let is_odd_hour = 0;
  let distance_km = 0;
  let tx_frequency = 0;
  
  // FEATURE 1: AMOUNT ANOMALY
  try {
    const recentTransactions = await all(`
      SELECT amount FROM transactions
      WHERE sender_uid = ? AND status = 'approved'
      ORDER BY timestamp DESC
      LIMIT 20
    `, [uid]);
    
    if (recentTransactions.length > 0) {
      const amounts = recentTransactions.map(tx => tx.amount);
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
  const hour = new Date(timestamp).getHours();
  if (hour >= 23 || hour < 6) {
    is_odd_hour = 1;
    flag_time = true;
    reasons.push(`Odd hour transaction: ${hour}:00`);
  }
  
  // FEATURE 3: LOCATION ANOMALY
  const usualLat = userDoc.usual_location_lat;
  const usualLon = userDoc.usual_location_lon;
  
  if (usualLat !== 0 && usualLon !== 0) {
    distance_km = haversine(usualLat, usualLon, lat, lon);
    
    if (distance_km > 100) {
      flag_location = true;
      reasons.push(`Location anomaly: ${distance_km.toFixed(0)} km from usual location`);
    }
  }
  
  // FEATURE 4: VELOCITY CHECK
  try {
    const lastTransaction = await get(`
      SELECT latitude, longitude, timestamp FROM transactions
      WHERE sender_uid = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `, [uid]);
    
    if (lastTransaction && lastTransaction.latitude && lastTransaction.longitude) {
      const lastLat = lastTransaction.latitude;
      const lastLon = lastTransaction.longitude;
      const lastTime = new Date(lastTransaction.timestamp).getTime();
      
      const distanceKm = haversine(lastLat, lastLon, lat, lon);
      const timeDiffHours = (timestamp - lastTime) / (1000 * 60 * 60);
      
      if (timeDiffHours > 0) {
        const velocity = distanceKm / timeDiffHours;
        
        if (velocity > 800) {
          flag_velocity = true;
          reasons.push(`Impossible velocity: ${velocity.toFixed(0)} km/h`);
        }
      }
    }
  } catch (error) {
    console.error('Error calculating velocity:', error);
  }
  
  // FEATURE 5: TRANSACTION FREQUENCY
  try {
    const oneHourAgo = timestamp - (60 * 60 * 1000);
    const recentCount = await get(`
      SELECT COUNT(*) as count FROM transactions
      WHERE sender_uid = ? AND timestamp > datetime(?, 'unixepoch', 'localtime')
    `, [uid, oneHourAgo / 1000]);
    
    tx_frequency = recentCount.count;
    
    if (tx_frequency > 5) {
      reasons.push(`High frequency: ${tx_frequency} transactions in last hour`);
    }
  } catch (error) {
    console.error('Error calculating transaction frequency:', error);
  }
  
  // FEATURE 6: HIGH AMOUNT CHECK
  if (amount > 50000) {
    flag_high_amount = true;
    reasons.push(`High amount: ₹${amount.toLocaleString()}`);
  }
  
  // Calculate fraud probability
  let fraud_probability = 0;
  
  if (flag_amount) fraud_probability += 0.25;
  if (flag_time) fraud_probability += 0.15;
  if (flag_location) fraud_probability += 0.30;
  if (flag_velocity) fraud_probability += 0.40;
  if (flag_high_amount) fraud_probability += 0.20;
  
  fraud_probability = Math.min(fraud_probability, 1.0);
  
  // ML MODEL (Optional)
  if (process.env.HF_API_URL) {
    try {
      const mlFeatures = {
        amount,
        z_score,
        is_odd_hour,
        distance_km,
        tx_frequency
      };
      
      const response = await fetch(process.env.HF_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlFeatures),
        timeout: 5000
      });
      
      if (response.ok) {
        const mlResult = await response.json();
        const mlProbability = mlResult.fraud_probability || mlResult.probability || 0;
        fraud_probability = (fraud_probability * 0.4) + (mlProbability * 0.6);
        console.log(`ML model prediction: ${mlProbability.toFixed(2)}`);
      }
    } catch (mlError) {
      console.warn('ML model call failed, using rule-based only:', mlError.message);
    }
  }
  
  // FINAL DECISION
  const is_fraud = fraud_probability > 0.7 || flag_high_amount || flag_velocity;
  
  console.log(`Fraud detection: ${is_fraud ? 'FRAUD' : 'LEGITIMATE'} (probability: ${fraud_probability.toFixed(2)})`);
  
  return {
    is_fraud,
    fraud_probability,
    reasons
  };
}

module.exports = {
  detectFraud
};
