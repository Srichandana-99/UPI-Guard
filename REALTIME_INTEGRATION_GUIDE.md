# Real-Time Integration Guide

## 🔄 Real-Time Architecture

Your app now has complete real-time integration with:
- ✅ Real-time transactions
- ✅ Real-time fraud detection
- ✅ Real-time balance updates
- ✅ Real-time fraud alerts

---

## 📋 What Was Added

### Backend (`backend/app/services/firebase_service.py`)
- `init_firebase()` - Initialize Firebase connection
- `send_transaction_update()` - Send transaction to Firebase
- `send_fraud_alert()` - Send fraud alert to Firebase
- `send_balance_update()` - Update balance in real-time
- `send_admin_notification()` - Send admin alerts

### Frontend (`frontend/src/lib/firebase.js`)
- `initializeFirebase()` - Initialize Firebase
- `subscribeToTransactions()` - Listen to all transactions
- `subscribeToUserTransactions()` - Listen to user's transactions
- `subscribeToFraudAlerts()` - Listen to fraud alerts
- `subscribeToUserBalance()` - Listen to balance updates
- `subscribeToUserStatus()` - Listen to user status
- `subscribeToAdminNotifications()` - Listen to admin alerts

### Updated Files
- `backend/app/api/routes/transaction_db.py` - Added Firebase updates
- `backend/app/core/config.py` - Added Firebase config
- `frontend/src/context/AuthContext.jsx` - Added Firebase subscriptions
- `backend/requirements.txt` - Added firebase-admin
- `frontend/package.json` - Added firebase

---

## 🚀 Setup Instructions

### Step 1: Firebase Project Setup

1. Go to https://firebase.google.com
2. Create new project
3. Enable Realtime Database
4. Get your credentials:
   ```
   FIREBASE_DB_URL=https://your-project.firebaseio.com
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   ```

### Step 2: Backend Configuration

Add to `backend/.env`:
```env
FIREBASE_DB_URL=https://your-project.firebaseio.com
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
```

### Step 3: Frontend Configuration

Add to `frontend/.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DB_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Step 4: Install Dependencies

```bash
# Backend
cd backend
pip install firebase-admin

# Frontend
cd frontend
npm install firebase
```

---

## 📊 Real-Time Flow

### Transaction Flow
```
1. User sends money
   ↓
2. Frontend → Backend API
   ↓
3. Backend validates & processes
   ↓
4. Backend updates Supabase (database)
   ↓
5. Backend sends to Firebase (real-time)
   ↓
6. Frontend receives via WebSocket
   ↓
7. UI updates instantly ✅
```

### Fraud Detection Flow
```
1. Transaction received
   ↓
2. Backend loads ML model
   ↓
3. Model predicts fraud risk
   ↓
4. If fraud detected:
   - Block transaction
   - Send alert to Firebase
   - Send push notification
   ↓
5. Frontend receives alert
   ↓
6. UI shows fraud alert ✅
```

---

## 💻 Code Examples

### Backend: Send Transaction Update

```python
from app.services.firebase_service import send_transaction_update

# After transaction is processed
send_transaction_update({
    "transaction_id": req.transaction_id,
    "sender_email": req.sender_email,
    "receiver_upi_id": req.receiver_upi_id,
    "amount": float(req.amount),
    "status": "Completed",
    "timestamp": datetime.datetime.now().isoformat(),
    "fraud_risk": fraud_result.get("risk_level")
})
```

### Backend: Send Fraud Alert

```python
from app.services.firebase_service import send_fraud_alert

# When fraud is detected
send_fraud_alert({
    "transaction_id": req.transaction_id,
    "sender_email": req.sender_email,
    "receiver_upi_id": req.receiver_upi_id,
    "amount": float(req.amount),
    "status": "Blocked",
    "risk_score": fraud_result.get("risk_score"),
    "risk_factors": fraud_result.get("risk_factors"),
    "timestamp": datetime.datetime.now().isoformat()
})
```

### Frontend: Subscribe to Transactions

```javascript
import { subscribeToUserTransactions } from '../lib/firebase'

// In component
useEffect(() => {
  const unsubscribe = subscribeToUserTransactions(user.email, (transactions) => {
    console.log('Real-time transactions:', transactions)
    setTransactions(transactions)
  })
  
  return () => unsubscribe()
}, [user.email])
```

### Frontend: Subscribe to Fraud Alerts

```javascript
import { subscribeToFraudAlerts } from '../lib/firebase'

// In component
useEffect(() => {
  const unsubscribe = subscribeToFraudAlerts((alerts) => {
    console.log('Fraud alerts:', alerts)
    // Show alert to user
    alerts.forEach(alert => {
      showNotification('Fraud Alert', `Transaction blocked: ${alert.transaction_id}`)
    })
  })
  
  return () => unsubscribe()
}, [])
```

---

## 🔐 Firebase Security Rules

Set these rules in Firebase Console:

```json
{
  "rules": {
    "transactions": {
      ".read": "auth != null",
      ".write": false,
      ".indexOn": ["sender_email", "timestamp"]
    },
    "fraud_alerts": {
      ".read": "root.child('admins').child(auth.uid).exists()",
      ".write": false,
      ".indexOn": ["timestamp"]
    },
    "user_balance": {
      ".read": "auth != null",
      ".write": false
    },
    "user_status": {
      ".read": "auth != null",
      ".write": false
    },
    "admin_notifications": {
      ".read": "root.child('admins').child(auth.uid).exists()",
      ".write": false
    }
  }
}
```

---

## 📊 Firebase Data Structure

```
firebase/
├── transactions/
│   ├── -abc123/
│   │   ├── transaction_id: "txn_123"
│   │   ├── sender_email: "user@example.com"
│   │   ├── receiver_upi_id: "receiver@upi"
│   │   ├── amount: 500
│   │   ├── status: "Completed"
│   │   ├── timestamp: "2024-02-27T10:30:00"
│   │   └── fraud_risk: "Low"
│   └── -def456/
│       └── ...
│
├── fraud_alerts/
│   ├── -ghi789/
│   │   ├── transaction_id: "txn_456"
│   │   ├── sender_email: "fraud@example.com"
│   │   ├── amount: 50000
│   │   ├── status: "Blocked"
│   │   ├── risk_score: 0.95
│   │   ├── risk_factors: ["High amount", "New receiver"]
│   │   └── timestamp: "2024-02-27T10:35:00"
│   └── ...
│
├── user_balance/
│   ├── user@example.com/
│   │   ├── balance: 5000
│   │   └── timestamp: "2024-02-27T10:30:00"
│   └── ...
│
├── user_status/
│   ├── user@example.com/
│   │   ├── status: "online"
│   │   └── timestamp: "2024-02-27T10:30:00"
│   └── ...
│
└── admin_notifications/
    ├── -jkl012/
    │   ├── type: "fraud_alert"
    │   ├── message: "High-risk transaction detected"
    │   └── timestamp: "2024-02-27T10:35:00"
    └── ...
```

---

## 🧪 Testing Real-Time

### Test Backend Firebase Integration

```bash
# In backend directory
python3 -c "
from app.services.firebase_service import init_firebase, send_transaction_update
init_firebase()
send_transaction_update({
    'transaction_id': 'test_123',
    'sender_email': 'test@example.com',
    'receiver_upi_id': 'receiver@upi',
    'amount': 100,
    'status': 'Completed',
    'timestamp': '2024-02-27T10:30:00'
})
print('✅ Test transaction sent to Firebase')
"
```

### Test Frontend Firebase Integration

```javascript
// In browser console
import { initializeFirebase, subscribeToTransactions } from './src/lib/firebase'

initializeFirebase()
const unsubscribe = subscribeToTransactions((transactions) => {
  console.log('Real-time transactions:', transactions)
})

// Unsubscribe when done
unsubscribe()
```

---

## 🚀 Deployment

### Railway Backend

Add environment variables:
```
FIREBASE_DB_URL=https://your-project.firebaseio.com
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
```

### Vercel Frontend

Add environment variables:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DB_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

---

## 📊 Performance Metrics

| Metric | Expected |
|--------|----------|
| Real-time Update Latency | <500ms |
| Fraud Detection Time | <1s |
| Balance Update | <200ms |
| Concurrent Connections | 100+ |
| Data Retention | 30 days |

---

## 🆘 Troubleshooting

### Firebase not connecting
```
1. Check Firebase credentials
2. Verify database URL
3. Check security rules
4. Check browser console for errors
```

### Real-time updates not working
```
1. Verify Firebase is initialized
2. Check subscription is active
3. Verify data is being sent
4. Check browser console
```

### Fraud alerts not showing
```
1. Check fraud detection is working
2. Verify Firebase alert is sent
3. Check frontend subscription
4. Check browser notifications
```

---

## 📚 Resources

- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Realtime database enabled
- [ ] Credentials obtained
- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] Dependencies installed
- [ ] Firebase service initialized
- [ ] Subscriptions working
- [ ] Real-time updates flowing
- [ ] Fraud alerts displaying
- [ ] Deployed to production

---

## 🎯 Next Steps

1. Create Firebase project
2. Get credentials
3. Add to environment variables
4. Install dependencies
5. Test locally
6. Deploy to production
7. Monitor real-time updates

---

**Status:** ✅ Real-Time Integration Complete

**Ready to deploy?** Follow [BEST_DEPLOYMENT_OPTION.md](./BEST_DEPLOYMENT_OPTION.md)
