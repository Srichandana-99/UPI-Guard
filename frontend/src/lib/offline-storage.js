// Offline storage utilities using IndexedDB for PWA

const DB_NAME = 'upi-guard-db';
const DB_VERSION = 1;

const STORES = {
  USER: 'user',
  TRANSACTIONS: 'transactions',
  PENDING_TRANSACTIONS: 'pending-transactions',
  CACHE: 'cache'
};

let db = null;

// Initialize IndexedDB
export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create object stores
      if (!database.objectStoreNames.contains(STORES.USER)) {
        database.createObjectStore(STORES.USER, { keyPath: 'email' });
      }
      if (!database.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        const txnStore = database.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id' });
        txnStore.createIndex('email', 'sender_email', { unique: false });
        txnStore.createIndex('date', 'date', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.PENDING_TRANSACTIONS)) {
        database.createObjectStore(STORES.PENDING_TRANSACTIONS, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.CACHE)) {
        database.createObjectStore(STORES.CACHE, { keyPath: 'key' });
      }
    };
  });
}

// Save user data
export async function saveUser(userData) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.USER], 'readwrite');
    const store = transaction.objectStore(STORES.USER);
    const request = store.put(userData);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(userData);
  });
}

// Get user data
export async function getUser(email) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.USER], 'readonly');
    const store = transaction.objectStore(STORES.USER);
    const request = store.get(email);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Save transaction
export async function saveTransaction(transaction) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.TRANSACTIONS], 'readwrite');
    const store = tx.objectStore(STORES.TRANSACTIONS);
    const request = store.put(transaction);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(transaction);
  });
}

// Get transactions for user
export async function getTransactions(email) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.TRANSACTIONS], 'readonly');
    const store = transaction.objectStore(STORES.TRANSACTIONS);
    const index = store.index('email');
    const request = index.getAll(email);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

// Save pending transaction (for offline sync)
export async function savePendingTransaction(transaction) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.PENDING_TRANSACTIONS], 'readwrite');
    const store = tx.objectStore(STORES.PENDING_TRANSACTIONS);
    const request = store.put(transaction);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(transaction);
  });
}

// Get all pending transactions
export async function getPendingTransactions() {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_TRANSACTIONS], 'readonly');
    const store = transaction.objectStore(STORES.PENDING_TRANSACTIONS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

// Remove pending transaction
export async function removePendingTransaction(id) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_TRANSACTIONS], 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_TRANSACTIONS);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Cache data
export async function cacheData(key, data, ttl = 3600000) {
  if (!db) await initDB();
  const cacheEntry = {
    key,
    data,
    timestamp: Date.now(),
    ttl
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHE], 'readwrite');
    const store = transaction.objectStore(STORES.CACHE);
    const request = store.put(cacheEntry);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(data);
  });
}

// Get cached data
export async function getCachedData(key) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHE], 'readonly');
    const store = transaction.objectStore(STORES.CACHE);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      if (!result) {
        resolve(null);
        return;
      }

      // Check if cache is expired
      if (Date.now() - result.timestamp > result.ttl) {
        // Delete expired cache
        const deleteTransaction = db.transaction([STORES.CACHE], 'readwrite');
        deleteTransaction.objectStore(STORES.CACHE).delete(key);
        resolve(null);
      } else {
        resolve(result.data);
      }
    };
  });
}

// Clear all data
export async function clearAllData() {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [STORES.USER, STORES.TRANSACTIONS, STORES.PENDING_TRANSACTIONS, STORES.CACHE],
      'readwrite'
    );

    Object.values(STORES).forEach((store) => {
      transaction.objectStore(store).clear();
    });

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

// Get database size
export async function getDBSize() {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null;
  }

  const estimate = await navigator.storage.estimate();
  return {
    usage: estimate.usage,
    quota: estimate.quota,
    percentage: (estimate.usage / estimate.quota) * 100
  };
}
