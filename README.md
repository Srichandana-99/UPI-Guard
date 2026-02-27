# UPI Guard - Real-time Fraud Detection System

A full-stack Progressive Web App (PWA) for detecting fraudulent UPI transactions in real-time. Features OTP-based authentication via Supabase, offline support, and a modern React frontend.

## 🚀 Features
- **Secure Authentication:** Passwordless OTP login via email (Supabase Auth)
- **Real-time Fraud Detection:** Analyzes transactions for velocity, location mismatch, and new receivers
- **Admin Dashboard:** Monitor all users, transactions, and system health
- **Location Tracking:** Logs user sessions and detects geographic anomalies
- **Progressive Web App:** Install on home screen, works offline, push notifications
- **Offline Support:** IndexedDB storage, automatic sync when online
- **Push Notifications:** Real-time alerts for transactions and fraud detection

---

## 🛠️ Tech Stack
- **Frontend:** React (Vite), TailwindCSS, Framer Motion, Lucide Icons, PWA
- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth (Email OTP)
- **Offline Storage:** IndexedDB, Service Workers
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## 🏃‍♂️ Quick Start (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/Srichandana-99/UPI-Guard.git
cd UPI-Guard
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[YOUR-SUPABASE-DB-URI]:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_KEY=[YOUR-ANON-PUBLIC-KEY]
CORS_ORIGINS=http://localhost:5173
ADMIN_EMAILS=your_email@gmail.com
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_app_password
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### 3. Install Dependencies

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## 📱 PWA Installation

### On Android
1. Open the app in Chrome
2. Tap menu (⋮) → "Install app"
3. App appears on home screen

### On iOS
1. Open the app in Safari
2. Tap Share → "Add to Home Screen"
3. App appears on home screen

### On Desktop
1. Open the app in Chrome/Edge
2. Click install icon in address bar
3. App opens in standalone window

See [PWA_SETUP.md](./PWA_SETUP.md) for detailed PWA configuration.

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Push to GitHub, Vercel auto-deploys
```

### Backend (Render)
1. Set environment variables in Render dashboard
2. Connect GitHub repository
3. Deploy with start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 📚 Project Structure

```
UPI-Guard/
├── frontend/                 # React PWA application
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth context with offline support
│   │   ├── lib/             # Utilities (offline storage, etc)
│   │   └── main.jsx         # Entry point
│   ├── public/
│   │   ├── manifest.json    # PWA manifest
│   │   ├── service-worker.js # Service worker
│   │   └── offline.html     # Offline fallback
│   └── vite.config.js       # Vite + PWA config
│
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/routes/      # API endpoints
│   │   ├── db/              # Database models & CRUD
│   │   ├── services/        # Business logic (fraud detection)
│   │   ├── core/            # Config & security
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt      # Python dependencies
│   └── .env                 # Environment variables
│
├── PWA_SETUP.md             # PWA configuration guide
├── BUG_FIXES_SUMMARY.md     # Bug fixes documentation
└── README.md                # This file
```

---

## 🔐 Security Features

- ✅ Email OTP authentication (no passwords)
- ✅ Admin role-based access control
- ✅ Transaction validation and fraud detection
- ✅ Location tracking for anomaly detection
- ✅ Secure CORS configuration
- ✅ Input validation and sanitization
- ✅ Offline data encryption support

---

## 🐛 Bug Fixes

All critical bugs have been identified and fixed. See [BUG_FIXES_SUMMARY.md](./BUG_FIXES_SUMMARY.md) for details on:
- Security vulnerabilities
- Race conditions
- Input validation
- Error handling
- And more...

---

## 📖 API Documentation

Once the backend is running, visit:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Key Endpoints

**Authentication:**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Request OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP and login

**Transactions:**
- `POST /api/v1/transaction/transfer` - Send money
- `GET /api/v1/transaction/history/{email}` - Get transaction history
- `POST /api/v1/transaction/validate-upi` - Validate UPI ID

**Admin:**
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/transactions` - Get all transactions
- `GET /api/v1/admin/fraud-alerts` - Get fraud alerts
- `GET /api/v1/admin/analytics` - Get system analytics

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](./LICENSE) file for details.

---

## 🆘 Support

For issues, questions, or suggestions:
1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Include steps to reproduce
4. Attach relevant logs or screenshots

---

## 🎯 Roadmap

- [ ] Biometric authentication (fingerprint, face)
- [ ] QR code scanning improvements
- [ ] Advanced fraud detection with ML
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Transaction scheduling
- [ ] Bill payment integration
- [ ] Cryptocurrency support

---

## 📊 Performance

- **Lighthouse Score:** 95+
- **Bundle Size:** ~150KB (gzipped)
- **First Contentful Paint:** <1s
- **Time to Interactive:** <2s
- **Offline Support:** Full functionality

---

## 🔗 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Vite Documentation](https://vitejs.dev/)

---

**Made with ❤️ for secure UPI transactions**
