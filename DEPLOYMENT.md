# Deployment Guide: UPI Guard

## Overview
- **Backend + ML Model**: Render (Docker)
- **Database**: Supabase (PostgreSQL + Auth)
- **Frontend**: Vercel (React SPA)

---

## 1. Supabase Setup

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a region and create a database
3. Note your **Project URL** and **anon/public key** (Settings → API)

### 1.2 Database Schema
Run the following in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text,
  email text UNIQUE NOT NULL,
  mobile text,
  upi_id text UNIQUE,
  balance numeric DEFAULT 0.00,
  verified boolean DEFAULT false,
  role text DEFAULT 'user',
  is_fraud_risk boolean DEFAULT false,
  is_blocked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id text UNIQUE NOT NULL,
  sender_email text NOT NULL,
  receiver_upi_id text NOT NULL,
  amount numeric NOT NULL,
  date timestamptz DEFAULT now(),
  status text DEFAULT 'Completed',
  hour_of_day integer,
  location_mismatch integer DEFAULT 0,
  is_new_receiver integer DEFAULT 0,
  velocity_1h integer DEFAULT 1
);

-- Enable RLS (optional, for production)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
```

### 1.3 Supabase Auth
- Enable Email OTP in Authentication → Settings
- Add your site URL to Site URL and Redirect URLs (e.g., `https://your-app.vercel.app`)

---

## 2. Backend Deployment (Render)

### 2.1 Prepare Repo
Ensure your repo includes:
- `backend/Dockerfile`
- `backend/render.yaml`
- `backend/app/services/fraud_model.pkl`

### 2.2 Deploy on Render
1. Connect your GitHub repo to [Render](https://render.com)
2. Create a **New Web Service**
3. Choose:
   - **Environment**: Docker
   - **Root Directory**: `backend`
   - **Instance Type**: Free (or paid)
4. Add Environment Variables in Render Dashboard:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   ADMIN_EMAILS=admin@yourcompany.com,secops@yourcompany.com
   CORS_ORIGINS=https://your-app.vercel.app
   ```
5. Deploy. Render will build via Dockerfile and expose port 8000.

### 2.3 Verify
- Visit `https://your-app.onrender.com/health` → should return `{"status":"ok"}`
- Test auth: `POST /api/v1/auth/login` with `{ "email": "test@example.com" }`

---

## 3. Frontend Deployment (Vercel)

### 3.1 Prepare Repo
Ensure:
- `frontend/vercel.json` exists (already configured)
- `frontend/.env.production` exists (update API URL)

### 3.2 Update Production API URL
Edit `frontend/.env.production`:
```
VITE_API_URL=https://your-render-app.onrender.com/api/v1
```

### 3.3 Deploy on Vercel
1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Import the repo
3. Set **Root Directory**: `frontend`
4. Add Environment Variable in Vercel:
   - `VITE_API_URL`: `https://your-render-app.onrender.com/api/v1`
5. Deploy

### 3.4 Verify
- Visit your Vercel URL
- Try Register/Login flow
- Check browser Network tab for API calls to Render backend

---

## 4. Post-Deployment Checklist

### 4.1 CORS
- Ensure Render’s `CORS_ORIGINS` includes your Vercel domain
- Test from browser: no CORS errors

### 4.2 Auth Flow
- Register → OTP arrives in email
- Verify OTP → login success
- Dashboard loads user data

### 4.3 Transactions & Fraud
- Send money → backend evaluates fraud
- Admin panel shows transactions and alerts

### 4.4 Monitoring
- Render: Logs and health checks
- Supabase: Auth logs and DB usage
- Vercel: Build logs and analytics

---

## 5. Custom Domains (Optional)

### Vercel
- In Vercel Dashboard → Settings → Domains
- Add your custom domain and follow DNS instructions

### Render
- In Render Dashboard → Custom Domains
- Add your domain and update DNS CNAME

---

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Update `CORS_ORIGINS` on Render to include Vercel domain |
| 500 errors | Check Render logs; ensure Supabase URL/key are correct |
| OTP not received | Verify Supabase Auth settings and email provider |
| Build fails | Ensure `fraud_model.pkl` is committed and Dockerfile copies it |
| Frontend can’t reach API | Verify `VITE_API_URL` in Vercel env and `.env.production` |

---

## 7. Security Notes

- Rotate Supabase keys regularly
- Use Supabase Row Level Security in production
- Enable Render’s health checks and auto-deploy
- Set up Vercel’s environment variable protection
- Consider adding rate limiting on the backend (FastAPI middleware)

---

## 8. Scaling

- Render: Upgrade instance type for higher concurrency
- Supabase: Enable edge functions or larger compute
- Vercel: Pro plan for higher bandwidth and build concurrency

---
