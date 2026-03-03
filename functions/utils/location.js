/**
 * Location utility functions for fraud detection
 * Handles distance calculations and usual location updates
 */

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
 * Uses weighted average of last 10 locations (90% old, 10% new)
 * @param {FirebaseFirestore.Firestore} db - Firestore instance
 * @param {string} uid - User ID
 * @param {number} lat - New latitude
 * @param {number} lon - New longitude
 */
async function updateUsualLocation(db, uid, lat, lon) {
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new Error('User not found');
  }
  
  const userData = userDoc.data();
  const currentUsual = userData.usual_location || { lat: 0, lon: 0 };
  
  let newLat, newLon;
  
  // If this is the first transaction (usual location not set)
  if (currentUsual.lat === 0 && currentUsual.lon === 0) {
    newLat = lat;
    newLon = lon;
  } else {
    // Running average: 90% old location + 10% new location
    newLat = (currentUsual.lat * 9 + lat) / 10;
    newLon = (currentUsual.lon * 9 + lon) / 10;
  }
  
  await userRef.update({
    usual_location: {
      lat: newLat,
      lon: newLon
    }
  });
  
  return { lat: newLat, lon: newLon };
}

module.exports = {
  haversine,
  updateUsualLocation
};
