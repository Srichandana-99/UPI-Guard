# Email OTP Setup Guide

## 📧 Free Email OTP Setup

### Option 1: Gmail (Free & Easy)

#### Step 1: Create Gmail Account
1. Create a new Gmail account: `upiguard.demo@gmail.com`
2. Go to Google Account settings

#### Step 2: Enable App Password
1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate new app password:
   - App: "UPI-Guard"
   - Device: "Other (Custom name)"
   - Copy the 16-character password

#### Step 3: Configure Environment
Add these to your `.env` file:
```bash
SENDER_EMAIL=upiguard.demo@gmail.com
SENDER_PASSWORD=your-16-character-app-password
```

### Option 2: SendGrid (Free Tier)

#### Step 1: Create SendGrid Account
1. Sign up: https://sendgrid.com
2. Verify your email address
3. Complete sender verification

#### Step 2: Get API Key
1. Go to Settings → API Keys
2. Create API Key with "Mail Send" permissions
3. Copy the API key

#### Step 3: Configure Environment
```bash
SENDGRID_API_KEY=your-sendgrid-api-key
SENDER_EMAIL=your-verified-email@domain.com
```

### Option 3: Brevo (Sendinblue) - Free

#### Step 1: Create Brevo Account
1. Sign up: https://www.brevo.com
2. Verify your email
3. Complete SMTP setup

#### Step 2: Get SMTP Credentials
1. Go to SMTP & API
2. Copy SMTP credentials

#### Step 3: Configure Environment
```bash
SENDER_EMAIL=your-brevo-email@domain.com
SENDER_PASSWORD=your-smtp-password
```

---

## 🚀 Quick Setup (Gmail Recommended)

### 1. Setup Gmail App Password
```bash
# Create Gmail account: upiguard.demo@gmail.com
# Enable 2-Step Verification
# Generate App Password
# Add to .env:
SENDER_EMAIL=upiguard.demo@gmail.com
SENDER_PASSWORD=abcd-efgh-ijkl-mnop
```

### 2. Test Email Service
```bash
cd backend
python3 -c "
from app.services.email_service import EmailService
email = EmailService()
otp = '123456'
success = email.send_otp_email('test@gmail.com', otp, 'login')
print('Email sent:', success)
"
```

### 3. Deploy with Email OTP
Your app will now:
- ✅ Send real OTP emails for registration
- ✅ Send real OTP emails for login
- ✅ Verify OTPs with 5-minute expiry
- ✅ Show OTP in demo mode if email fails

---

## 📱 How It Works

### Registration Flow
1. User enters email and details
2. System generates 6-digit OTP
3. OTP sent to user's email
4. User enters OTP to verify
5. Account created and verified

### Login Flow
1. User enters email
2. System generates 6-digit OTP
3. OTP sent to user's email
4. User enters OTP to login
5. Access granted if OTP valid

### Security Features
- ✅ 5-minute OTP expiry
- ✅ Maximum 3 attempts
- ✅ OTP can only be used once
- ✅ Secure email delivery
- ✅ Fallback demo mode

---

## 🎯 Free Email Limits

### Gmail
- ✅ 500 emails/day (sufficient for demo)
- ✅ Free forever
- ✅ Reliable delivery

### SendGrid
- ✅ 100 emails/day forever
- ✅ Professional templates
- ✅ Delivery analytics

### Brevo
- ✅ 300 emails/day
- ✅ Email templates
- ✅ Contact management

---

## 🔧 Troubleshooting

### Gmail SMTP Issues
```bash
# Enable "Less secure app access" (if needed)
# Or use App Password (recommended)
```

### Email Not Sending
```bash
# Check credentials
# Verify SMTP settings
# Check spam folder
```

### OTP Not Working
```bash
# Check OTP expiry (5 minutes)
# Verify correct email
# Check attempts limit (3 max)
```

---

## 🎉 Result

With email OTP setup, your UPI-Guard will:
- Send real OTP emails to users
- Verify email addresses during registration
- Secure login with one-time passwords
- Work in both production and demo modes

**Total Cost: $0/month** 🎉
