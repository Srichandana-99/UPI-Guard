# 🚀 UPI-Guard Setup and Deployment Guide

## 📋 Quick Start - 15 Minutes to Live App

### Option 1: Automated Setup (Recommended)
```bash
cd /Users/madhavsamalla/Desktop/UPI-Guard
./setup-and-deploy.sh
```

### Option 2: Manual Setup
Follow the steps below if you prefer manual setup.

---

## 🎯 Step-by-Step Setup

### Step 1: Setup Gmail for OTP (5 minutes)

1. **Create Gmail Account**
   - Create: `upiguard.demo@gmail.com`
   - Or use existing Gmail account

2. **Enable 2-Step Verification**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"
   - This is required for App Passwords

3. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select: "Mail" → "Other (Custom name)"
   - Name: "UPI-Guard"
   - Copy the 16-character password

### Step 2: Configure Environment (2 minutes)

Create `backend/.env` file:
```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit with your Gmail credentials
# SENDER_EMAIL=upiguard.demo@gmail.com
# SENDER_PASSWORD=your-16-character-app-password
# ADMIN_EMAILS=admin@upiguard.com
```

### Step 3: Setup Git Repository (2 minutes)

```bash
# Initialize git (if not already done)
git init

# Create .gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
__pycache__/
*.pyc

# Environment
.env
.env.local

# Database
*.db
*.sqlite3

# Logs
logs/
*.log

# IDE
.vscode/
.idea/
EOF

# Add and commit files
git add .
git commit -m "UPI-Guard with email OTP"
```

### Step 4: Create GitHub Repository (3 minutes)

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `upiguard`
3. **Make it public**
4. **Don't initialize with README**
5. **Click "Create repository"**

6. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/upiguard.git
git branch -M main
git push -u origin main
```

### Step 5: Deploy Backend to Render (5 minutes)

1. **Go to Render**: https://render.com
2. **Sign up** with GitHub
3. **Click "New" → "Web Service"**
4. **Connect your GitHub repository**
5. **Select "upiguard" repository**
6. **Configure service**:
   - **Name**: `upiguard-backend`
   - **Root Directory**: `./backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

7. **Add Environment Variables**:
   ```
   DATABASE_URL=postgresql://upiguard:password@postgres:5432/upiguard
   SENDER_EMAIL=upiguard.demo@gmail.com
   SENDER_PASSWORD=your-16-character-app-password
   ADMIN_EMAILS=admin@upiguard.com
   ```

8. **Create PostgreSQL Database**:
   - In Render dashboard, click "New" → "PostgreSQL"
   - Name: `upiguard-db`
   - Copy the connection string
   - Update DATABASE_URL with the actual connection string

9. **Click "Create Web Service"**

### Step 6: Deploy Frontend to Vercel (3 minutes)

1. **Go to Vercel**: https://vercel.com
2. **Sign up** with GitHub
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Configure**:
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL`: `https://your-backend.onrender.com/api/v1`

6. **Click "Deploy"**

---

## 🎉 Your App is Live!

### Access Your UPI-Guard
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **API Docs**: `https://your-backend.onrender.com/docs`

### Test Users (Already Created)
- alice@demo.com (alice@secureupi) - ₹50,000
- bob@demo.com (bob@secureupi) - ₹75,000
- admin@demo.com (admin@secureupi) - ₹100,000

### Test Email OTP
1. Go to your frontend URL
2. Click "Register"
3. Enter your email
4. Check your email for OTP
5. Enter OTP to verify

---

## 🔧 Troubleshooting

### Email OTP Not Working
1. Check Gmail App Password is correct
2. Ensure 2-Step Verification is enabled
3. Check Render environment variables
4. Look at Render logs

### Backend Not Starting
1. Check DATABASE_URL is correct
2. Verify PostgreSQL database is running
3. Check Render build logs

### Frontend Not Connecting
1. Verify VITE_API_URL is correct
2. Check backend is running
3. Look at browser console for errors

---

## 📱 Features After Deployment

✅ **Real Email OTP** - Users get actual emails  
✅ **User Registration** - Email verification required  
✅ **Secure Login** - OTP-based authentication  
✅ **Money Transfers** - Send money between users  
✅ **QR Code Payments** - Generate and scan QR codes  
✅ **Fraud Detection** - AI-powered security  
✅ **Location Tracking** - GPS + IP logging  
✅ **Transaction History** - Complete payment records  
✅ **Admin Panel** - User and transaction management  
✅ **Notifications** - Payment received alerts  

---

## 💰 Cost Breakdown

### Free Services Used
- **Vercel**: $0/month (Frontend hosting)
- **Render**: $0/month (Backend + Database)
- **Gmail**: $0/month (Email OTP)
- **GitHub**: $0/month (Code hosting)

### **Total Cost: $0/month** 🎉

---

## 🚀 Ready to Go!

Your UPI-Guard is now:
- ✅ **Live on the internet**
- ✅ **Sending real email OTPs**
- ✅ **Processing real transactions**
- ✅ **Detecting fraud with AI**
- ✅ **Tracking user locations**
- ✅ **Managing users securely**

**Start using your UPI payment platform now!** 🎉

---

## 📞 Need Help?

If you get stuck:
1. Check the troubleshooting section above
2. Look at Render and Vercel logs
3. Verify environment variables
4. Test locally first

**Your UPI-Guard is ready for users!** 🚀
