# 🚀 FREE Deployment - Quick Reference Card

## Your Stack (100% FREE)

```
Frontend: Vercel (FREE)
   ↓
Backend: Railway (FREE - $5/month credit)
   ↓
Database: Supabase (FREE - 500MB)
   ↓
Real-time: Firebase (FREE - 100 connections)
   ↓
Auth: Supabase Email OTP (FREE)
   ↓
ML Model: Backend integrated (FREE)
```

---

## ⚡ 5-Minute Setup

### 1. Supabase (5 min)
```bash
1. Go to supabase.com
2. Sign up with GitHub
3. Create project
4. Copy credentials:
   - SUPABASE_URL
   - SUPABASE_KEY
   - DATABASE_URL
```

### 2. Railway (5 min)
```bash
1. Go to railway.app
2. Sign up with GitHub
3. Create project
4. Connect your repo
5. Add env variables
6. Deploy
```

### 3. Vercel (5 min)
```bash
1. Go to vercel.com
2. Sign up with GitHub
3. Import repo
4. Add env variables
5. Deploy
```

### 4. Firebase (5 min)
```bash
1. Go to firebase.google.com
2. Create project
3. Enable Realtime Database
4. Get config
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_KEY=...
CORS_ORIGINS=https://your-frontend.vercel.app
ADMIN_EMAILS=your_email@gmail.com
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_app_password
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url/api/v1
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DB_URL=...
VITE_FIREBASE_PROJECT_ID=...
```

---

## 📋 Deployment Order

1. **Supabase** - Database & Auth
2. **Railway** - Backend API
3. **Vercel** - Frontend
4. **Firebase** - Real-time

---

## 🔗 Your URLs After Deployment

```
Frontend:  https://your-project.vercel.app
Backend:   https://your-project.railway.app
API Docs:  https://your-project.railway.app/docs
Admin:     https://your-project.vercel.app/admin
```

---

## ✅ Testing Checklist

- [ ] Frontend loads
- [ ] Can register with email
- [ ] OTP received
- [ ] Can login
- [ ] Can send money
- [ ] Real-time update shows
- [ ] Fraud detection works
- [ ] Admin dashboard works

---

## 💰 Cost

| Service | Cost |
|---------|------|
| Supabase | FREE |
| Railway | FREE ($5 credit) |
| Vercel | FREE |
| Firebase | FREE |
| **TOTAL** | **$0** |

---

## 🆘 Quick Fixes

### Backend won't start
```
Check: Python 3.8+, requirements.txt, env vars
```

### Frontend won't load
```
Check: VITE_API_URL, CORS, browser console
```

### Real-time not working
```
Check: Firebase config, security rules, WebSocket
```

### Email OTP not sending
```
Check: Supabase email config, spam folder
```

---

## 📞 Support

- [Supabase Docs](https://supabase.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)

---

## 🎯 Next Steps

1. Read [FREE_DEPLOYMENT_GUIDE.md](./FREE_DEPLOYMENT_GUIDE.md)
2. Start with Supabase
3. Deploy backend to Railway
4. Deploy frontend to Vercel
5. Setup Firebase
6. Test everything
7. Go live! 🚀

---

**Total Setup Time: ~2 hours**  
**Cost: $0/month**  
**Status: Production Ready**

Good luck! 🎉
