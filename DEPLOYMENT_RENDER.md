# Deployment Guide: UPI Guard on Render (Backend + DB) + Vercel (Frontend)

## Overview
- **Backend + ML Model + Database**: Render (Docker + PostgreSQL)
- **Frontend**: Vercel (React SPA)

---

## 1. Render: Backend + PostgreSQL

### 1.1 Prepare Repository
Ensure your repo includes:
- `backend/Dockerfile` (updated with PostgreSQL client)
- `backend/render.yaml` (defines web service + internal PostgreSQL)
- `backend/requirements.txt` (SQLAlchemy + psycopg2-binary)
- `backend/app/services/fraud_model.pkl`

### 1.2 Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. **New → Web Service**
   - Connect GitHub
   - Root Directory: `backend`
   - Environment: Docker
   - Plan: Free (or paid)
3. **Create Database**
   - In the same repo/service, click **New → PostgreSQL**
   - Name: `upi-guard-db`
   - Plan: Free
4. **Environment Variables** (Render will auto-inject `DATABASE_URL` from the database)
   - `ADMIN_EMAILS`: `admin@yourcompany.com,secops@yourcompany.com`
   - `CORS_ORIGINS`: `https://your-vercel-app.vercel.app`

Render will automatically:
- Build the Docker image
- Start the web service
- Link the PostgreSQL database and inject `DATABASE_URL`

### 1.3 Database Initialization
The app auto-creates tables on startup (`Base.metadata.create_all`). No manual migration needed.

### 1.4 Verify
- Visit `https://your-app.onrender.com/health` → should return `{"status":"ok"}`
- Test auth: `POST /api/v1/auth/login` with `{ "email": "test@example.com" }`

---

## 2. Vercel: Frontend

### 2.1 Prepare Frontend
Ensure:
- `frontend/vercel.json` exists (already configured)
- `frontend/.env.production` points to Render backend

Update `frontend/.env.production`:
```
VITE_API_URL=https://your-app.onrender.com/api/v1
```

### 2.2 Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. **Add New → Import Git Repository**
3. Set **Root Directory**: `frontend`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-app.onrender.com/api/v1`
5. Deploy

### 2.3 Verify
- Visit your Vercel URL
- Try Register/Login (uses mock OTP for demo)
- Check Network tab: calls to Render backend

---

## 3. Post-Deployment Checklist

### 3.1 CORS
- Render’s `CORS_ORIGINS` must include your Vercel domain
- Test from browser: no CORS errors

### 3.2 Auth Flow (Demo Mode)
- Register → success message (OTP mocked)
- Verify OTP → accepts any 6-digit code and logs in
- Dashboard loads with user data

### 3.3 Transactions & Fraud
- Send money → backend evaluates fraud via XGBoost model
- Admin panel shows transactions and alerts

### 3.4 Monitoring
- Render: Logs, health checks, database metrics
- Vercel: Build logs and analytics

---

## 4. Environment Variables Reference

| Service | Variable | Example |
|---------|----------|---------|
| Render Web | DATABASE_URL | auto-injected from PostgreSQL |
| Render Web | ADMIN_EMAILS | admin@yourcompany.com,secops@yourcompany.com |
| Render Web | CORS_ORIGINS | https://your-app.vercel.app |
| Vercel | VITE_API_URL | https://your-app.onrender.com/api/v1 |

---

## 5. Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Update `CORS_ORIGINS` on Render to include Vercel domain |
| 500 errors | Check Render logs; ensure `DATABASE_URL` is injected |
| DB connection failed | Ensure PostgreSQL is created and linked in render.yaml |
| Build fails | Ensure `libpq-dev` is in Dockerfile and `psycopg2-binary` in requirements.txt |
| Frontend can’t reach API | Verify `VITE_API_URL` in Vercel env and `.env.production` |

---

## 6. Scaling

### Render
- **Web Service**: Upgrade instance type for higher concurrency
- **PostgreSQL**: Upgrade to higher tier for more connections/storage

### Vercel
- **Pro Plan**: Higher bandwidth, build concurrency, and edge functions

---

## 7. Security Notes

- Render provides free SSL; enforce HTTPS in frontend
- Use Render’s health checks and auto-restart
- Set up Vercel environment variable protection
- Consider adding rate limiting on the FastAPI app

---

## 8. Custom Domains (Optional)

### Vercel
- In Vercel Dashboard → Settings → Domains
- Add your domain and follow DNS instructions

### Render
- In Render Dashboard → Custom Domains
- Add your domain and update DNS CNAME

---
