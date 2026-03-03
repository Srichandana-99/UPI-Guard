/**
 * Firebase Configuration for Secure UPI
 * Supports: Authentication, Firestore, Cloud Functions
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app = null;
let auth = null;
let db = null;
let functions = null;

// Initialize immediately
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app);

  // Connect to emulators if in development
  if (import.meta.env.VITE_USE_EMULATORS === 'true') {
    console.log('🔧 Connecting to Firebase Emulators...');
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('✅ Connected to Firebase Emulators');
  }

  console.log('✅ Firebase initialized');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

export function initializeFirebase() {
  return { app, auth, db, functions };
}

// Export initialized instances
export { app, auth, db, functions };

// Firestore real-time subscription functions
import { collection, query, where, onSnapshot, orderBy, limit, doc } from 'firebase/firestore';

/**
 * Subscribe to user transactions in real-time
 */
export function subscribeToUserTransactions(userId, callback) {
  if (!db) {
    console.warn('Firestore not initialized');
    return null;
  }

  console.log('🔍 Setting up transaction subscription for user:', userId);

  try {
    const transactionsRef = collection(db, 'transactions');

    const makeQuery = (field, ordered) => {
      // Prefer ordered queries for stable "recent" results, but fall back
      // if an index is missing.
      if (ordered) {
        return query(
          transactionsRef,
          where(field, '==', userId),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
      }
      return query(
        transactionsRef,
        where(field, '==', userId),
        limit(50)
      );
    };

    const byId = new Map();
    let didFallbackSent = false;
    let didFallbackReceived = false;
    let unsubscribeSent = null;
    let unsubscribeReceived = null;

    const toMillis = (ts) => {
      if (!ts) return 0;
      if (typeof ts.toMillis === 'function') return ts.toMillis();
      if (ts instanceof Date) return ts.getTime();
      if (typeof ts === 'number') return ts;
      return 0;
    };

    const emit = () => {
      const arr = Array.from(byId.values());
      arr.sort((a, b) => toMillis(b.timestamp) - toMillis(a.timestamp));
      callback(arr);
    };

    const subscribeSent = (ordered = true) => {
      const qSent = makeQuery('sender_uid', ordered);
      unsubscribeSent = onSnapshot(qSent, (snapshot) => {
        console.log('📤 Sent transactions snapshot received:', snapshot.docs.length);
        snapshot.docs.forEach((d) => {
          byId.set(d.id, { id: d.id, ...d.data() });
        });
        emit();
      }, (error) => {
        console.error('Error subscribing to sent transactions:', error);
        const needsIndex = error?.code === 'failed-precondition' || String(error?.message || '').toLowerCase().includes('index');
        if (ordered && needsIndex && !didFallbackSent) {
          didFallbackSent = true;
          if (typeof unsubscribeSent === 'function') unsubscribeSent();
          console.warn('⚠️ Missing index for sent query; falling back without orderBy.');
          subscribeSent(false);
        }
      });
    };

    const subscribeReceived = (ordered = true) => {
      const qReceived = makeQuery('recipient_uid', ordered);
      unsubscribeReceived = onSnapshot(qReceived, (snapshot) => {
        console.log('📥 Received transactions snapshot received:', snapshot.docs.length);
        snapshot.docs.forEach((d) => {
          byId.set(d.id, { id: d.id, ...d.data() });
        });
        emit();
      }, (error) => {
        console.error('Error subscribing to received transactions:', error);
        const needsIndex = error?.code === 'failed-precondition' || String(error?.message || '').toLowerCase().includes('index');
        if (ordered && needsIndex && !didFallbackReceived) {
          didFallbackReceived = true;
          if (typeof unsubscribeReceived === 'function') unsubscribeReceived();
          console.warn('⚠️ Missing index for received query; falling back without orderBy.');
          subscribeReceived(false);
        }
      });
    };

    subscribeSent(true);
    subscribeReceived(true);

    return () => {
      if (typeof unsubscribeSent === 'function') unsubscribeSent();
      if (typeof unsubscribeReceived === 'function') unsubscribeReceived();
    };
  } catch (error) {
    console.error('Failed to subscribe to transactions:', error);
    return null;
  }
}

/**
 * Subscribe to fraud alerts in real-time
 */
export function subscribeToFraudAlerts(callback) {
  if (!db) {
    console.warn('Firestore not initialized');
    return null;
  }

  try {
    const alertsRef = collection(db, 'fraudAlerts');
    const q = query(
      alertsRef,
      where('resolved', '==', false),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(alerts);
    }, (error) => {
      console.error('Error subscribing to fraud alerts:', error);
    });
  } catch (error) {
    console.error('Failed to subscribe to fraud alerts:', error);
    return null;
  }
}

/**
 * Subscribe to user balance updates in real-time
 */
export function subscribeToUserBalance(userId, callback) {
  if (!db) {
    console.warn('Firestore not initialized');
    return null;
  }

  try {
    const userRef = doc(db, 'users', userId);

    return onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        callback(userData.balance || 0);
      }
    }, (error) => {
      console.error('Error subscribing to balance:', error);
    });
  } catch (error) {
    console.error('Failed to subscribe to balance:', error);
    return null;
  }
}
