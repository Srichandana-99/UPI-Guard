# 🚀 DEPLOYMENT COMMANDS REFERENCE

## Quick Copy-Paste Commands

---

## 1️⃣ PREPARE YOUR CODE

### Commit to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Check Node version
```bash
node --version  # Should be 16+
```

### Check Python version
```bash
python3 --version  # Should be 3.8+
```

---

## 2️⃣ BACKEND ENVIRONMENT VARIABLES

### Copy this to `backend/.env`
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
CORS_ORIGINS=https://your-frontend.vercel.app
ADMIN_EMAILS=your_email@gmail.com
SENDER_EMAIL=noreply@supabase.io
SENDER_PASSWORD=your_supabase_key
FIREBASE_DB_URL=https://xxxxx.firebaseio.com
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
FIREBASE_PROJECT_ID=xxxxx
```

---

## 3️⃣ FRONTEND ENVIRONMENT VARIABLES

### Copy this to `frontend/.env`
```env
VITE_API_URL=https://your-backend-url/api/v1
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
VITE_FIREBASE_DB_URL=https://xxxxx.firebaseio.com
VITE_FIREBASE_PROJECT_ID=xxxxx
```

---

## 4️⃣ SUPABASE CREDENTIALS

### Where to find them:
```
1. Go to https://supabase.com
2. Login to your project
3. Settings → API
4. Copy:
   - Project URL → SUPABASE_URL
   - Anon Key → SUPABASE_KEY
5. Settings → Database
6. Copy PostgreSQL connection string → DATABASE_URL
```

---

## 5️⃣ FIREBASE CREDENTIALS

### Where to find them:
```
1. Go to https://firebase.google.com
2. Go to your project
3. Settings → Project Settings
4. Copy:
   - Project ID → FIREBASE_PROJECT_ID
5. Realtime Database
6. Copy URL → FIREBASE_DB_URL
7. Settings → Service Accounts
8. Generate key and copy values
```

---

## 6️⃣ RENDER DEPLOYMENT

### Environment Variables to Add:
```
DATABASE_URL
SUPABASE_URL
SUPABASE_KEY
CORS_ORIGINS
ADMIN_EMAILS
SENDER_EMAIL
SENDER_PASSWORD
FIREBASE_DB_URL
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
```

### Start Command:
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Build Command:
```
pip install -r requirements.txt
```

---

## 7️⃣ VERCEL DEPLOYMENT

### Environment Variables to Add:
```
VITE_API_URL
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DB_URL
VITE_FIREBASE_PROJECT_ID
```

### Build Command:
```
npm run build
```

### Output Directory:
```
dist
```

---

## 8️⃣ TESTING COMMANDS

### Test Backend API
```bash
curl https://your-backend-url/health
```

### Test Frontend
```bash
Open https://your-frontend-url in browser
```

### Test API Documentation
```bash
Open https://your-backend-url/docs in browser
```

---

## 9️⃣ TROUBLESHOOTING COMMANDS

### Check Backend Logs (Render)
```
1. Go to Render dashboard
2. Click your service
3. Go to Logs tab
4. Read error messages
```

### Check Frontend Logs (Vercel)
```
1. Go to Vercel dashboard
2. Click your project
3. Go to Deployments
4. Click latest deployment
5. Go to Logs tab
```

### Redeploy Backend
```
1. Make changes to code
2. git add .
3. git commit -m "Fix"
4. git push origin main
5. Render auto-redeploys
```

### Redeploy Frontend
```
1. Make changes to code
2. git add .
3. git commit -m "Fix"
4. git push origin main
5. Vercel auto-redeploys
```

---

## 🔟 KEEP-ALIVE SCRIPT

### Add to `frontend/src/main.jsx`
```javascript
// Keep backend alive (prevent cold starts)
setInterval(() => {
  fetch(`${import.meta.env.VITE_API_URL}/health`)
    .catch(() => {})
}, 600000) // Every 10 minutes
```

---

## 1️⃣1️⃣ URLS AFTER DEPLOYMENT

### Frontend
```
https://your-project.vercel.app
```

### Backend
```
https://your-project.onrender.com
```

### API
```
https://your-project.onrender.com/api/v1
```

### API Docs
```
https://your-project.onrender.com/docs
```

### Admin Dashboard
```
https://your-project.vercel.app/admin
```

---

## 1️⃣2️⃣ COST SUMMARY

```
Supabase:  FREE
Render:    FREE (cold starts)
Vercel:    FREE
Firebase:  FREE
─────────────────
TOTAL:     $0/month
```

---

## 1️⃣3️⃣ QUICK CHECKLIST

- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Firebase project created
- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] CORS updated
- [ ] Frontend loads
- [ ] Can register
- [ ] Can login
- [ ] Can send money
- [ ] Real-time works
- [ ] Fraud detection works

---

## 1️⃣4️⃣ COMMON ERRORS & FIXES

### "CORS error"
```
Fix: Update CORS_ORIGINS in Render
Value: https://your-frontend-url.vercel.app
```

### "Cannot connect to database"
```
Fix: Check DATABASE_URL is correct
Format: postgresql://user:password@host:5432/db
```

### "Firebase not initialized"
```
Fix: Check FIREBASE_DB_URL is correct
Format: https://project-id.firebaseio.com
```

### "OTP not sending"
```
Fix: Check Supabase email is configured
Go to: Supabase → Authentication → Providers → Email
```

### "Real-time not working"
```
Fix: Check Firebase security rules
Go to: Firebase → Realtime Database → Rules
```

---

## 1️⃣5️⃣ SUPPORT LINKS

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [React Docs](https://react.dev)

---

**Status:** ✅ Ready to Deploy

**Time:** ~1 hour

**Cost:** $0/month

Good luck! 🚀
