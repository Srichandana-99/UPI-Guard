# 📋 STEP-BY-STEP DEPLOYMENT GUIDE

## 🎯 Complete Walkthrough (1 Hour)

Follow each step exactly. Don't skip any!

---

# PART 1: SUPABASE SETUP (10 minutes)

## Step 1.1: Create Supabase Account

1. Open browser and go to: **https://supabase.com**
2. Click **"Start your project"** button
3. Click **"Sign up with GitHub"**
4. Authorize Supabase to access your GitHub
5. You'll be logged in

## Step 1.2: Create New Project

1. Click **"New Project"** button
2. Fill in:
   - **Project name:** `upi-guard` (or any name)
   - **Database password:** Create a strong password (save it!)
   - **Region:** Choose closest to you
3. Click **"Create new project"**
4. Wait 2-3 minutes for database to initialize

## Step 1.3: Get Your Credentials

1. Go to **Settings** (bottom left) → **API**
2. You'll see:
   ```
   Project URL: https://xxxxx.supabase.co
   Anon Key: eyJhbGc...
   ```
3. **Copy and save these:**
   ```
   SUPABASE_URL = https://xxxxx.supabase.co
   SUPABASE_KEY = eyJhbGc...
   ```

## Step 1.4: Get Database URL

1. Go to **Settings** → **Database**
2. Look for **Connection string** section
3. Copy the PostgreSQL connection string
4. Replace `[YOUR-PASSWORD]` with your database password
5. **Save as:**
   ```
   DATABASE_URL = postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```

## Step 1.5: Enable Email Authentication

1. Go to **Authentication** (left menu)
2. Click **Providers**
3. Find **Email** and click it
4. Toggle **Enable Email provider** ON
5. Click **Save**

✅ **Supabase is ready!**

---

# PART 2: FIREBASE SETUP (10 minutes)

## Step 2.1: Create Firebase Account

1. Open browser and go to: **https://firebase.google.com**
2. Click **"Go to console"**
3. Sign in with Google account
4. Click **"Create a project"**

## Step 2.2: Create Firebase Project

1. Enter **Project name:** `upi-guard`
2. Click **Continue**
3. Disable **Google Analytics** (not needed)
4. Click **Create project**
5. Wait for project to be created

## Step 2.3: Enable Realtime Database

1. In Firebase console, click **Realtime Database** (left menu)
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
4. Select **Region:** closest to you
5. Click **Enable**
6. Wait for database to initialize

## Step 2.4: Get Firebase Credentials

1. Click **Settings** (gear icon, top left)
2. Click **Project settings**
3. Go to **General** tab
4. Scroll down to find:
   ```
   Project ID: xxxxx
   ```
5. Go to **Service Accounts** tab
6. Click **Generate new private key**
7. A JSON file will download (save it safely!)

## Step 2.5: Get Realtime Database URL

1. Go back to **Realtime Database**
2. Look at the URL bar at top
3. Copy the URL (looks like: `https://xxxxx.firebaseio.com`)
4. **Save as:**
   ```
   FIREBASE_DB_URL = https://xxxxx.firebaseio.com
   ```

## Step 2.6: Get Web API Key

1. Go to **Settings** → **Project settings**
2. Go to **General** tab
3. Look for **Web API Key** section
4. Copy the API key
5. **Save as:**
   ```
   FIREBASE_API_KEY = AIzaSy...
   FIREBASE_AUTH_DOMAIN = xxxxx.firebaseapp.com
   FIREBASE_PROJECT_ID = xxxxx
   ```

✅ **Firebase is ready!**

---

# PART 3: PREPARE YOUR CODE (5 minutes)

## Step 3.1: Update Backend Environment

1. Open your project in code editor
2. Go to `backend/.env`
3. Fill in all values:

```env
# Supabase
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...

# Deployment
CORS_ORIGINS=https://your-frontend.vercel.app
ADMIN_EMAILS=your_email@gmail.com

# Email
SENDER_EMAIL=noreply@supabase.io
SENDER_PASSWORD=your_supabase_key

# Firebase
FIREBASE_DB_URL=https://xxxxx.firebaseio.com
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
FIREBASE_PROJECT_ID=xxxxx
```

## Step 3.2: Update Frontend Environment

1. Go to `frontend/.env`
2. Fill in values:

```env
VITE_API_URL=https://your-backend-url/api/v1
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
VITE_FIREBASE_DB_URL=https://xxxxx.firebaseio.com
VITE_FIREBASE_PROJECT_ID=xxxxx
```

## Step 3.3: Commit to GitHub

```bash
git add .
git commit -m "Add environment configuration"
git push origin main
```

✅ **Code is ready!**

---

# PART 4: DEPLOY BACKEND TO RENDER (15 minutes)

## Step 4.1: Create Render Account

1. Open browser and go to: **https://render.com**
2. Click **"Sign up"**
3. Click **"Continue with GitHub"**
4. Authorize Render to access your GitHub
5. You'll be logged in

## Step 4.2: Create Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. Find your `UPI-Guard` repository
5. Click **"Connect"**

## Step 4.3: Configure Deployment

1. Fill in the form:
   - **Name:** `upi-guard-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. Scroll down to **Environment**
3. Click **"Add Environment Variable"**
4. Add each variable from your `backend/.env`:
   ```
   DATABASE_URL = postgresql://...
   SUPABASE_URL = https://...
   SUPABASE_KEY = eyJhbGc...
   CORS_ORIGINS = https://your-frontend.vercel.app
   ADMIN_EMAILS = your_email@gmail.com
   SENDER_EMAIL = noreply@supabase.io
   SENDER_PASSWORD = your_supabase_key
   FIREBASE_DB_URL = https://...
   FIREBASE_API_KEY = AIzaSy...
   FIREBASE_AUTH_DOMAIN = xxxxx.firebaseapp.com
   FIREBASE_PROJECT_ID = xxxxx
   ```

## Step 4.4: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (2-3 minutes)
3. You'll see a URL like: `https://upi-guard-backend.onrender.com`
4. **Save this URL!**

## Step 4.5: Verify Deployment

1. Open in browser: `https://your-backend-url/docs`
2. You should see API documentation
3. If you see it, backend is working! ✅

**Your Backend URL:** `https://your-backend-url.onrender.com`

---

# PART 5: DEPLOY FRONTEND TO VERCEL (10 minutes)

## Step 5.1: Create Vercel Account

1. Open browser and go to: **https://vercel.com**
2. Click **"Sign Up"**
3. Click **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub
5. You'll be logged in

## Step 5.2: Import Project

1. Click **"Add New..."** (top right)
2. Select **"Project"**
3. Click **"Import Git Repository"**
4. Find your `UPI-Guard` repository
5. Click **"Import"**

## Step 5.3: Configure Project

1. In **Project Name:** `upi-guard-frontend`
2. In **Root Directory:** Select `frontend`
3. In **Framework Preset:** Select `Vite`
4. Click **"Environment Variables"**
5. Add variables:
   ```
   VITE_API_URL = https://your-backend-url/api/v1
   VITE_FIREBASE_API_KEY = AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN = xxxxx.firebaseapp.com
   VITE_FIREBASE_DB_URL = https://xxxxx.firebaseio.com
   VITE_FIREBASE_PROJECT_ID = xxxxx
   ```

## Step 5.4: Deploy

1. Click **"Deploy"**
2. Wait for deployment (1-2 minutes)
3. You'll see a URL like: `https://upi-guard-frontend.vercel.app`
4. **Save this URL!**

## Step 5.5: Verify Deployment

1. Open in browser: `https://your-frontend-url`
2. You should see the UPI Guard app
3. If you see it, frontend is working! ✅

**Your Frontend URL:** `https://your-frontend-url.vercel.app`

---

# PART 6: UPDATE CORS (5 minutes)

## Step 6.1: Update Backend CORS

1. Go to Render dashboard
2. Find your backend service
3. Go to **Environment**
4. Find `CORS_ORIGINS`
5. Update to: `https://your-frontend-url.vercel.app`
6. Click **"Save"**
7. Render will redeploy automatically

## Step 6.2: Wait for Redeploy

1. Go to **Deploys** tab
2. Wait for new deployment to complete (2-3 minutes)
3. Check status shows "Live"

✅ **CORS is updated!**

---

# PART 7: TESTING (15 minutes)

## Step 7.1: Test Frontend Loading

1. Open: `https://your-frontend-url.vercel.app`
2. You should see the login page
3. ✅ If yes, continue

## Step 7.2: Test Registration

1. Click **"Register"** or **"Sign Up"**
2. Enter email: `test@example.com`
3. Click **"Send OTP"**
4. Check your email for OTP
5. Enter OTP
6. ✅ If successful, continue

## Step 7.3: Test Login

1. Go back to login page
2. Enter same email: `test@example.com`
3. Click **"Send OTP"**
4. Check email for OTP
5. Enter OTP
6. ✅ If you see dashboard, continue

## Step 7.4: Test Transaction

1. On dashboard, click **"Send Money"**
2. Enter:
   - Receiver UPI: `test2@upi`
   - Amount: `100`
3. Click **"Send"**
4. ✅ If transaction shows, continue

## Step 7.5: Test Real-Time Updates

1. Open app in two browser windows
2. Send money from window 1
3. Check if window 2 updates in real-time
4. ✅ If yes, real-time is working!

## Step 7.6: Test Fraud Detection

1. Try to send large amount: `100000`
2. Should be blocked with fraud alert
3. ✅ If blocked, fraud detection is working!

---

# PART 8: HANDLE COLD STARTS (Optional but Recommended)

## Step 8.1: Add Keep-Alive Script

1. Open `frontend/src/main.jsx`
2. Add this after the ReactDOM.createRoot line:

```javascript
// Keep backend alive (prevent cold starts)
setInterval(() => {
  fetch(`${import.meta.env.VITE_API_URL}/health`)
    .catch(() => {})
}, 600000) // Every 10 minutes
```

## Step 8.2: Commit and Push

```bash
git add frontend/src/main.jsx
git commit -m "Add keep-alive script for Render"
git push origin main
```

## Step 8.3: Vercel Will Auto-Redeploy

1. Go to Vercel dashboard
2. Wait for automatic redeploy
3. ✅ Done!

---

# PART 9: FINAL VERIFICATION

## Checklist

- [ ] Supabase project created
- [ ] Firebase project created
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] CORS updated
- [ ] Frontend loads
- [ ] Can register
- [ ] Can login
- [ ] Can send money
- [ ] Real-time updates work
- [ ] Fraud detection works

---

# 🎉 YOU'RE DONE!

## Your URLs

```
Frontend:  https://your-frontend-url.vercel.app
Backend:   https://your-backend-url.onrender.com
API Docs:  https://your-backend-url.onrender.com/docs
Admin:     https://your-frontend-url.vercel.app/admin
```

## Cost

```
Supabase:  FREE
Render:    FREE (with cold starts)
Vercel:    FREE
Firebase:  FREE
─────────────────
TOTAL:     $0/month
```

---

# 🆘 TROUBLESHOOTING

## Frontend won't load

```
1. Check VITE_API_URL is correct
2. Check backend is deployed
3. Check CORS is updated
4. Clear browser cache
5. Try incognito window
```

## Can't login

```
1. Check Supabase is configured
2. Check email is correct
3. Check spam folder for OTP
4. Check SUPABASE_KEY is correct
```

## Real-time not working

```
1. Check Firebase is configured
2. Check FIREBASE_DB_URL is correct
3. Check browser console for errors
4. Check Firebase security rules
```

## Backend shows error

```
1. Go to Render dashboard
2. Click your service
3. Go to Logs tab
4. Read error message
5. Fix and push to GitHub
6. Render will auto-redeploy
```

---

# 📞 SUPPORT

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)

---

**Status:** ✅ DEPLOYMENT COMPLETE

**Total Time:** ~1 hour

**Cost:** $0/month

**Ready to use:** YES ✅

Good luck! 🚀
