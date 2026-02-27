import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, off } from 'firebase/database'

let firebaseApp = null
let database = null

export function initializeFirebase() {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DB_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    }

    if (!firebaseApp) {
      firebaseApp = initializeApp(firebaseConfig)
      database = getDatabase(firebaseApp)
      console.log('✅ Firebase initialized')
    }
    return true
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error)
    return false
  }
}

export function subscribeToTransactions(callback) {
  try {
    if (!database) initializeFirebase()
    
    const transactionsRef = ref(database, 'transactions')
    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const transactions = Object.values(data)
        callback(transactions)
      }
    })
    
    return unsubscribe
  } catch (error) {
    console.error('❌ Failed to subscribe to transactions:', error)
    return null
  }
}

export function subscribeToUserTransactions(email, callback) {
  try {
    if (!database) initializeFirebase()
    
    const transactionsRef = ref(database, 'transactions')
    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const userTransactions = Object.values(data).filter(
          t => t.sender_email === email
        )
        callback(userTransactions)
      }
    })
    
    return unsubscribe
  } catch (error) {
    console.error('❌ Failed to subscribe to user transactions:', error)
    return null
  }
}

export function subscribeToFraudAlerts(callback) {
  try {
    if (!database) initializeFirebase()
    
    const alertsRef = ref(database, 'fraud_alerts')
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const alerts = Object.values(data)
        callback(alerts)
      }
    })
    
    return unsubscribe
  } catch (error) {
    console.error('❌ Failed to subscribe to fraud alerts:', error)
    return null
  }
}

export function subscribeToUserBalance(email, callback) {
  try {
    if (!database) initializeFirebase()
    
    const balanceRef = ref(database, `user_balance/${email}`)
    const unsubscribe = onValue(balanceRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        callback(data.balance)
      }
    })
    
    return unsubscribe
  } catch (error) {
    console.error('❌ Failed to subscribe to balance:', error)
    return null
  }
}

export function subscribeToUserStatus(email, callback) {
  try {
    if (!database) initializeFirebase()
    
    const statusRef = ref(database, `user_status/${email}`)
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        callback(data.status)
      }
    })
    
    return unsubscribe
  } catch (error) {
    console.error('❌ Failed to subscribe to status:', error)
    return null
  }
}

export function subscribeToAdminNotifications(callback) {
  try {
    if (!database) initializeFirebase()
    
    const notificationsRef = ref(database, 'admin_notifications')
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const notifications = Object.values(data)
        callback(notifications)
      }
    })
    
    return unsubscribe
  } catch (error) {
    console.error('❌ Failed to subscribe to admin notifications:', error)
    return null
  }
}

export function unsubscribeFromUpdates(unsubscribe) {
  try {
    if (unsubscribe && typeof unsubscribe === 'function') {
      unsubscribe()
      console.log('✅ Unsubscribed from updates')
    }
  } catch (error) {
    console.error('❌ Failed to unsubscribe:', error)
  }
}
