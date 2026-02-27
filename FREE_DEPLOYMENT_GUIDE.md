# UPI Guard - Complete Free Deployment Guide

## 🎯 Your Requirements
1. ✅ Email OTP authentication
2. ✅ Deploy ML fraud detection model
3. ✅ Real-time transactions
4. ✅ Real-time fraud detection
5. ✅ 100% FREE

---

## 🏗️ Best Free Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel Free)                   │
│  React PWA + Vite + TailwindCSS                             │
│  - Installable app                                          │
│  - Offline support                                          │
│  - Push notifications                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Railway/Render Free)                  │
│  FastAPI + Python                                           │
│  - Email OTP (Supabase Auth)                                │
│  - Real-time transactions                                   │
│  - ML fraud detection                                       │
│  - WebSocket for real-time updates                          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌──────────┐
    │Supabase│  │Railway │  │Firebase  │
    │(Free)  │  │Postgres│  │Realtime  │
    │Auth+DB │  │(Free)  │  │(Free)    │
    └────────┘  └────────┘  └──────────┘
```

---

## 📋 Step-by-Step Deployment

### STEP 1: Setup Supabase (Email OTP + Database)

**Cost: FREE**

1. Go to https://supabase.com
2. Sign up with GitHub
3. Create new project
4. In Authentication → Providers → Enable "Email"
5. Configure email settings (use Supabase's default SMTP)
6. Get credentials:
   ```
   SUPABASE_URL = https://your-project.supabase.co
   SUPABASE_KEY = your-anon-key
   DATABASE_URL = postgresql://postgres:password@host:5432/postgres
   ```

**Tables created automatically by backend**

---

### STEP 2: Deploy Backend (Railway or Render - FREE)

#### Option A: Railway (Recommended for Free Tier)

**Cost: FREE ($5/month credit, enough for small projects)**

1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project
4. Connect GitHub repository
5. Add environment variables:
   ```
   DATABASE_URL=postgresql://...
   SUPABASE_URL=https://...
   SUPABASE_KEY=...
   CORS_ORIGINS=https://your-frontend.vercel.app
   ADMIN_EMAILS=your_email@gmail.com
   SENDER_EMAIL=your_email@gmail.com
   SENDER_PASSWORD=your_app_password
   ```
6. Set start command:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
7. Deploy

**Get your backend URL:** `https://your-project.railway.app`

#### Option B: Render (Alternative)

**Cost: FREE (with limitations)**

1. Go to https://render.com
2. Sign up with GitHub
3. Create new Web Service
4. Connect repository
5. Add environment variables (same as above)
6. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Deploy

**Get your backend URL:** `https://your-project.onrender.com`

---

### STEP 3: Deploy Frontend (Vercel - FREE)

**Cost: FREE**

1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your repository
4. Set environment variables:
   ```
   VITE_API_URL=https://your-backend-url/api/v1
   VITE_VAPID_PUBLIC_KEY=your_vapid_key (optional)
   ```
5. Build command: `npm run build`
6. Output directory: `dist`
7. Deploy

**Get your frontend URL:** `https://your-project.vercel.app`

---

### STEP 4: Setup Real-Time Transactions (Firebase Realtime - FREE)

**Cost: FREE (100 connections, 1GB storage)**

1. Go to https://firebase.google.com
2. Create new project
3. Enable Realtime Database
4. Set security rules:
   ```json
   {
     "rules": {
       "transactions": {
         ".read": "auth != null",
         ".write": "auth != null"
       },
       "fraud_alerts": {
         ".read": "root.child('admins').child(auth.uid).exists()",
         ".write": false
       }
     }
   }
   ```
5. Get Firebase config

---

### STEP 5: Deploy ML Model (FREE Options)

#### Option A: Hugging Face Spaces (BEST FOR FREE)

**Cost: FREE**

1. Go to https://huggingface.co/spaces
2. Create new Space
3. Choose Docker runtime
4. Upload your model files
5. Create `app.py`:
   ```python
   import gradio as gr
   import joblib
   import pandas as pd

   model = joblib.load('fraud_model.pkl')

   def predict_fraud(amount, hour, location_mismatch, is_new_receiver, velocity):
       features = pd.DataFrame({
           'amount': [amount],
           'hour_of_day': [hour],
           'location_mismatch': [location_mismatch],
           'is_new_receiver': [is_new_receiver],
           'velocity_1h': [velocity]
       })
       prediction = model.predict_proba(features)[0][1]
       return f"Fraud Risk: {prediction:.2%}"

   interface = gr.Interface(
       fn=predict_fraud,
       inputs=["number", "number", "number", "number", "number"],
       outputs="text"
   )
   interface.launch()
   ```
6. Deploy
7. Get API endpoint: `https://huggingface.co/spaces/your-username/your-space/api/predict`

#### Option B: Backend Integration (RECOMMENDED)

Keep model in backend, no separate deployment needed.

---

## 🔧 Configuration Files

### `backend/.env` (FREE)
```env
# Supabase (FREE)
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Deployment
CORS_ORIGINS=https://your-frontend.vercel.app
ADMIN_EMAILS=your_email@gmail.com

# Email (Supabase default)
SENDER_EMAIL=noreply@supabase.io
SENDER_PASSWORD=supabase_key
```

### `frontend/.env` (FREE)
```env
VITE_API_URL=https://your-backend-url/api/v1
VITE_VAPID_PUBLIC_KEY=your_vapid_key
```

---

## 📊 Real-Time Architecture

### Real-Time Transactions Flow
```
User sends money
    ↓
Frontend → Backend API
    ↓
Backend processes transaction
    ↓
Backend updates Supabase
    ↓
Backend sends to Firebase Realtime
    ↓
Frontend receives via WebSocket
    ↓
UI updates in real-time
```

### Real-Time Fraud Detection Flow
```
Transaction received
    ↓
Backend loads ML model
    ↓
Model predicts fraud risk
    ↓
If fraud detected:
  - Block transaction
  - Send alert to admin
  - Update Firebase
  - Send push notification
    ↓
Frontend receives alert
    ↓
UI shows fraud alert
```

---

## 🚀 Implementation Steps

### 1. Update Backend for Real-Time

**Add to `backend/requirements.txt`:**
```
firebase-admin
websockets
python-socketio
```

**Create `backend/app/services/realtime_service.py`:**
```python
import firebase_admin
from firebase_admin import db
import json

def init_firebase():
    firebase_admin.initialize_app(options={
        'databaseURL': 'https://your-project.firebaseio.com'
    })

def send_transaction_update(transaction_data):
    ref = db.reference('transactions')
    ref.push(transaction_data)

def send_fraud_alert(alert_data):
    ref = db.reference('fraud_alerts')
    ref.push(alert_data)

def get_real_time_transactions(email):
    ref = db.reference(f'transactions/{email}')
    return ref.get()
```

**Update `backend/app/api/routes/transaction_db.py`:**
```python
from app.services.realtime_service import send_transaction_update, send_fraud_alert

@router.post("/transfer")
async def transfer_money(req: TransferRequest, db: Session = Depends(get_db)):
    # ... existing code ...
    
    # Send real-time update
    send_transaction_update({
        "transaction_id": req.transaction_id,
        "sender_email": req.sender_email,
        "receiver_upi_id": req.receiver_upi_id,
        "amount": req.amount,
        "status": "Completed",
        "timestamp": datetime.now().isoformat()
    })
    
    # If fraud detected
    if fraud_result.get("decision") == "Block":
        send_fraud_alert({
            "transaction_id": req.transaction_id,
            "sender_email": req.sender_email,
            "risk_score": fraud_result.get("risk_score"),
            "timestamp": datetime.now().isoformat()
        })
```

### 2. Update Frontend for Real-Time

**Create `frontend/src/lib/realtime.js`:**
```javascript
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DB_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

export function subscribeToTransactions(email, callback) {
  const transactionsRef = ref(database, `transactions/${email}`)
  return onValue(transactionsRef, (snapshot) => {
    const data = snapshot.val()
    if (data) callback(data)
  })
}

export function subscribeToFraudAlerts(callback) {
  const alertsRef = ref(database, 'fraud_alerts')
  return onValue(alertsRef, (snapshot) => {
    const data = snapshot.val()
    if (data) callback(data)
  })
}
```

**Update `frontend/src/context/AuthContext.jsx`:**
```javascript
import { subscribeToTransactions, subscribeToFraudAlerts } from '../lib/realtime'

export const AuthProvider = ({ children }) => {
  // ... existing code ...
  
  useEffect(() => {
    if (!user?.email) return
    
    // Subscribe to real-time transactions
    const unsubscribe = subscribeToTransactions(user.email, (data) => {
      console.log('Real-time transaction:', data)
      // Update UI
    })
    
    return () => unsubscribe()
  }, [user])
}
```

---

## 💰 Cost Breakdown (100% FREE)

| Service | Cost | Limit |
|---------|------|-------|
| Supabase | FREE | 500MB DB, 2GB bandwidth |
| Railway | FREE | $5/month credit |
| Vercel | FREE | 100GB bandwidth |
| Firebase | FREE | 100 connections, 1GB |
| Hugging Face | FREE | 1 Space |
| **TOTAL** | **$0** | **Sufficient for MVP** |

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All code committed to GitHub
- [ ] Environment variables ready
- [ ] Model file in backend
- [ ] Database schema ready
- [ ] Email configured

### Supabase Setup
- [ ] Project created
- [ ] Auth enabled
- [ ] Database configured
- [ ] Credentials saved

### Backend Deployment
- [ ] Railway/Render account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Start command configured
- [ ] Deployed successfully
- [ ] API endpoints tested

### Frontend Deployment
- [ ] Vercel account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Build command configured
- [ ] Deployed successfully
- [ ] App loads correctly

### Real-Time Setup
- [ ] Firebase project created
- [ ] Realtime database configured
- [ ] Security rules set
- [ ] Backend integration done
- [ ] Frontend integration done
- [ ] Real-time updates working

### Testing
- [ ] Authentication works
- [ ] Transactions process
- [ ] Real-time updates work
- [ ] Fraud detection works
- [ ] Alerts display
- [ ] No errors in logs

---

## 📱 Access Your App

After deployment:

1. **Frontend:** `https://your-project.vercel.app`
2. **Backend API:** `https://your-backend-url/api/v1`
3. **API Docs:** `https://your-backend-url/docs`
4. **Admin Dashboard:** `https://your-project.vercel.app/admin`

---

## 🔐 Security Notes

1. **Never commit `.env` files**
2. **Use environment variables for secrets**
3. **Enable HTTPS everywhere**
4. **Set proper CORS origins**
5. **Use strong admin emails**
6. **Enable database backups**

---

## 📊 Monitoring (FREE)

### Backend Logs
- Railway: Dashboard → Logs
- Render: Dashboard → Logs

### Frontend Errors
- Vercel: Analytics → Web Vitals
- Browser Console: DevTools

### Database
- Supabase: Dashboard → Logs

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check logs
# Verify environment variables
# Check Python version (3.8+)
# Verify requirements.txt
```

### Frontend won't load
```bash
# Check VITE_API_URL
# Verify CORS configuration
# Check browser console
# Clear cache
```

### Real-time not working
```bash
# Verify Firebase config
# Check security rules
# Verify WebSocket connection
# Check browser console
```

### Email OTP not sending
```bash
# Verify Supabase email config
# Check email provider settings
# Verify SENDER_EMAIL
# Check spam folder
```

---

## 🎯 Next Steps

1. **Day 1:** Setup Supabase + Railway
2. **Day 2:** Deploy frontend to Vercel
3. **Day 3:** Setup Firebase real-time
4. **Day 4:** Test all features
5. **Day 5:** Go live!

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)

---

## ✅ Summary

**Your Free Stack:**
- ✅ Email OTP: Supabase Auth
- ✅ Database: Supabase PostgreSQL
- ✅ Backend: Railway/Render
- ✅ Frontend: Vercel
- ✅ Real-time: Firebase
- ✅ ML Model: Backend integrated
- ✅ Cost: $0/month

**Total Setup Time:** ~2 hours

**Ready to deploy?** Start with Supabase! 🚀
