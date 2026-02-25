# Deploy to Vercel (Frontend) + Render (Backend) - FREE

## 🚀 Free Deployment Options

### Option 1: Vercel + Render (Recommended)
- **Frontend**: Vercel (Free hosting)
- **Backend**: Render (Free tier)
- **Database**: Render PostgreSQL (Free tier)
- **Email**: Gmail SMTP (Free)

### Option 2: Vercel + Supabase
- **Frontend**: Vercel (Free hosting)
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (Free tier)
- **Email**: SendGrid (Free tier)

### Option 3: Netlify + Railway
- **Frontend**: Netlify (Free hosting)
- **Backend**: Railway (Free tier)
- **Database**: Railway PostgreSQL (Free tier)
- **Email**: Brevo (Free tier)

---

## 🎯 Option 1: Vercel + Render (Easiest)

### Step 1: Setup Email OTP (Gmail - Free)
1. **Create Gmail Account**
   - Create: `upiguard.demo@gmail.com`
   - Enable 2-Step Verification
   - Generate App Password

2. **Get App Password**
   - Go to: https://myaccount.google.com/security
   - App passwords → Generate new
   - Copy the 16-character password

### Step 2: Deploy Backend to Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Add Environment Variables**
   ```
   SENDER_EMAIL=upiguard.demo@gmail.com
   SENDER_PASSWORD=your-16-character-app-password
   DATABASE_URL=your-postgres-url
   ADMIN_EMAILS=admin@upiguard.com
   ```

3. **Deploy to Render**
   - Connect your GitHub repository
   - Render will auto-detect FastAPI
   - Use these settings:
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 3: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Deploy to Vercel**
   - Import your GitHub repository
   - Add environment variable:
     - `VITE_API_URL`: Your Render backend URL

---

## 📧 Email OTP Features

### ✅ What You Get
- **Real Email OTPs** sent to users
- **Registration verification** via email
- **Secure login** with one-time passwords
- **5-minute expiry** for security
- **3 attempts maximum** per OTP
- **Demo mode fallback** if email fails

### 📱 How It Works
1. User registers/logs in with email
2. System generates 6-digit OTP
3. OTP sent via Gmail SMTP
4. User enters OTP to verify
5. Access granted if valid

### 🛡️ Security Features
- OTP expires in 5 minutes
- Maximum 3 attempts allowed
- OTP can only be used once
- Secure Gmail SMTP delivery
- Fallback shows OTP if email fails

---

## 📋 Free Tier Limits

### Vercel (Frontend)
- ✅ 100GB bandwidth/month
- ✅ Custom domains
- ✅ SSL certificates
- ✅ Global CDN

### Render (Backend + Database)
- ✅ 750 hours/month (24/7 hosting)
- ✅ 512MB RAM
- ✅ PostgreSQL (10,000 rows)
- ✅ Custom domains
- ✅ SSL certificates

### Gmail (Email OTP)
- ✅ 500 emails/day (plenty for demo)
- ✅ Free forever
- ✅ Reliable delivery
- ✅ Professional appearance

---

## 🔧 Configuration Files

### Backend: render.yaml
```yaml
services:
  - type: web
    name: upiguard-backend
    env: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SENDER_EMAIL
        value: upiguard.demo@gmail.com
      - key: SENDER_PASSWORD
        sync: false
      - key: ADMIN_EMAILS
        value: admin@upiguard.com
```

### Frontend: vercel.json
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 🚀 Quick Deploy Steps

### 1. Setup Gmail OTP
```bash
# Create Gmail: upiguard.demo@gmail.com
# Enable 2-Step Verification
# Generate App Password
# Save credentials for Render
```

### 2. Prepare Repository
```bash
git add .
git commit -m "Add email OTP and deployment configs"
git push
```

### 3. Deploy Backend (Render)
1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect GitHub repo
4. Add environment variables (including email)
5. Deploy!

### 4. Deploy Frontend (Vercel)
1. Go to https://vercel.com
2. Click "New Project"
3. Connect GitHub repo
4. Add `VITE_API_URL` environment variable
5. Deploy!

### 5. Test Email OTP
1. Register new user
2. Check email for OTP
3. Verify OTP works
4. Test login flow

---

## 🎯 Result

You'll get:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **Database**: Managed PostgreSQL
- **Email OTP**: Real email verification
- **SSL**: Automatic HTTPS
- **Custom Domain**: Free with both platforms

### 📱 Full Feature Set
- ✅ Real email OTP verification
- ✅ User registration with email verification
- ✅ Secure login with one-time passwords
- ✅ ML fraud detection
- ✅ Location tracking
- ✅ Real-time transactions
- ✅ QR code payments
- ✅ Admin panel
- ✅ Payment notifications

**Total Cost: $0/month** 🎉

---

## 🎉 Your Free UPI-Guard is Ready!

With email OTP setup, your deployed UPI-Guard will:
- Send real OTP emails to users
- Verify email addresses during registration
- Secure login with one-time passwords
- Work with professional email delivery
- Have fallback demo mode if needed

**Deploy now and get a fully functional payment platform with real email OTP!** 🚀
