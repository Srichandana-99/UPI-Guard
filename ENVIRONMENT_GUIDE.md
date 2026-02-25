# UPI-Guard Environment Variables Guide

## 📋 Complete Environment Configuration

I've created a comprehensive `.env` file with all necessary environment variables for UPI-Guard. Here's what each section contains:

### 🔧 **Core Configuration (Required for Deployment)**

```bash
# DATABASE CONFIGURATION
DATABASE_URL=sqlite:///./upi_guard.db

# EMAIL CONFIGURATION (for OTP)
SENDER_EMAIL=alonepenguin07@gmail.com
SENDER_PASSWORD=ubfh mfpf krdm xwkn

# ADMIN EMAILS
ADMIN_EMAILS=admin@upiguard.com,security@upiguard.com,alonepenguin07@gmail.com

# CORS ORIGINS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://your-app.vercel.app
```

### 🚀 **How to Use**

#### **For Local Development**
```bash
# Copy the complete .env file
cp .env.example .env
# Update with your values
# Start the application
```

#### **For Production Deployment**
```bash
# On Render, set these environment variables:
DATABASE_URL=your-postgres-connection-string
SENDER_EMAIL=alonepenguin07@gmail.com
SENDER_PASSWORD=ubfh mfpf krdm xwkn
ADMIN_EMAILS=admin@upiguard.com,alonepenguin07@gmail.com
CORS_ORIGINS=https://your-app.vercel.app
```

#### **For Vercel Frontend**
```bash
# Set this environment variable:
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

### 📊 **Environment Sections Explained**

#### **1. Database Configuration**
- `DATABASE_URL`: Database connection string
- Local: SQLite for development
- Production: PostgreSQL from Render

#### **2. Email Configuration**
- `SENDER_EMAIL`: Your Gmail for OTP
- `SENDER_PASSWORD`: Gmail app password
- Alternative services: SendGrid, Brevo

#### **3. Security Configuration**
- `JWT_SECRET`: For future JWT implementation
- `SESSION_TIMEOUT`: User session duration
- `OTP_EXPIRY_MINUTES`: OTP validity period

#### **4. Fraud Detection Configuration**
- `FRAUD_THRESHOLD`: ML model sensitivity
- `HIGH_AMOUNT_THRESHOLD`: High-risk transaction amount
- `VELOCITY_THRESHOLD`: Max transactions per hour

#### **5. Feature Flags**
- Enable/disable specific features
- `ENABLE_LOCATION_TRACKING`: GPS tracking
- `ENABLE_FRAUD_DETECTION`: AI fraud detection
- `ENABLE_EMAIL_NOTIFICATIONS`: OTP emails

#### **6. Performance & Monitoring**
- Database connection pooling
- Rate limiting settings
- Error tracking (Sentry)

### 🎯 **Quick Setup for Deployment**

#### **Step 1: Update Core Values**
```bash
# Edit these in your .env file:
SENDER_EMAIL=alonepenguin07@gmail.com
SENDER_PASSWORD=ubfh mfpf krdm xwkn
ADMIN_EMAILS=your-email@domain.com
```

#### **Step 2: Deploy to Render**
Add these environment variables in Render dashboard:
```bash
DATABASE_URL=your-postgres-url
SENDER_EMAIL=alonepenguin07@gmail.com
SENDER_PASSWORD=ubfh mfpf krdm xwkn
ADMIN_EMAILS=alonepenguin07@gmail.com
CORS_ORIGINS=https://your-app.vercel.app
```

#### **Step 3: Deploy to Vercel**
Add this environment variable:
```bash
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

### 🔒 **Security Notes**

- **Never commit** `.env` file to Git
- **Change default values** in production
- **Use strong passwords** and secrets
- **Enable HTTPS** in production
- **Regularly rotate** secrets and passwords

### 📱 **Testing Your Configuration**

#### **Test Email OTP**
```bash
# Start backend locally
cd backend
uvicorn app.main:app --reload

# Test registration
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","mobile":"+91 98765 43210","dob":"1990-01-01","age":34}'
```

#### **Test Database Connection**
```bash
# Initialize database
python3 init_db.py

# Check database status
sqlite3 upi_guard.db ".tables"
```

### 🚀 **Ready for Deployment**

Your `.env` file now includes:
- ✅ **All required variables** for deployment
- ✅ **Security configurations**
- ✅ **Feature flags** for customization
- ✅ **Performance settings**
- ✅ **Monitoring options**
- ✅ **Compliance settings**

**Next Steps:**
1. Update the `.env` file with your specific values
2. Deploy backend to Render with environment variables
3. Deploy frontend to Vercel with API URL
4. Test your live application

**🎉 Your UPI-Guard is now fully configurable for any deployment scenario!**
