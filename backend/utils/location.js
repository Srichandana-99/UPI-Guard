/**
 * Location utility functions for fraud detection
 */

const { run, get } = require('../config/database');

/**
 * Convert degrees to radians
 */
function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Update user's usual location using running average
 * @param {string} uid - User ID
 * @param {number} lat - New latitude
 * @param {number} lon - New longitude
 */
async function updateUsualLocation(uid, lat, lon) {
  const user = await get('SELECT usual_location_lat, usual_location_lon FROM users WHERE uid = ?', [uid]);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const oldLat = user.usual_location_lat;
  const oldLon = user.usual_location_lon;
  
  // If this is the first location (0, 0), set it directly
  if (oldLat === 0 && oldLon === 0) {
    await run('UPDATE users SET usual_location_lat = ?, usual_location_lon = ? WHERE uid = ?', [lat, lon, uid]);
    return;
  }
  
  // Weighted average: 90% old, 10% new
  const newLat = oldLat * 0.9 + lat * 0.1;
  const newLon = oldLon * 0.9 + lon * 0.1;
  
  await run('UPDATE users SET usual_location_lat = ?, usual_location_lon = ? WHERE uid = ?', [newLat, newLon, uid]);
}

module.exports = {
  haversine,
  updateUsualLocation
};
