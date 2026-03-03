# UPI Guard

A secure UPI payment application with AI-powered fraud detection. Built with React, Node.js, Express, and SQLite.

## 🎯 Features

- **Secure UPI Payments** - Send and receive money with UPI IDs
- **AI Fraud Detection** - 5-layer fraud detection engine with ML model support
- **Real-time Protection** - Location-based anomaly detection and velocity checks
- **QR Code Support** - Generate and scan UPI QR codes for instant payments
- **Transaction History** - Complete transaction logs with fraud status
- **Balance Management** - Automatic balance tracking and updates
- **JWT Authentication** - Secure email/password authentication
- **Suspicious Account Flagging** - Auto-flag high-risk accounts

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        UPI GUARD                            │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite)    │   Backend (Express + SQLite)   │
│  ├─ React Router           │   ├─ REST API                 │
│  ├─ Tailwind CSS           │   ├─ JWT Authentication       │
│  ├─ Framer Motion          │   ├─ Fraud Detection Engine   │
│  ├─ Lucide Icons           │   ├─ SQLite Database          │
│  └─ Context API            │   └─ ML Model Integration     │
│                            │                                │
│  Port: 5173               │   Port: 5001                   │
└─────────────────────────────────────────────────────────────┘
```

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        React + Vite Frontend                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │    │
│  │  │   Login     │  │  Dashboard  │  │  SendMoney  │  │  History  │ │    │
│  │  │   Page      │  │    Page     │  │    Page     │  │   Page    │ │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘ │    │
│  │                                                                    │    │
│  │  ┌─────────────────────────────────────────────────────────────┐  │    │
│  │  │              Shared Components & Context                     │  │    │
│  │  │  • AuthContext (JWT)  • API Client  • Framer Motion         │  │    │
│  │  └─────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                        │
│                              HTTP/REST                                      │
│                                    ▼                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                           SERVER LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Express.js Backend Server                       │    │
│  │                              Port 5001                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │    │
│  │  │   Auth       │  │ Transaction  │  │    User      │              │    │
│  │  │  Routes      │  │   Routes     │  │   Routes     │              │    │
│  │  │              │  │              │  │              │              │    │
│  │  │ • POST /login│  │ • POST /initiate   │ • GET /profile│           │    │
│  │  │ • POST /register   │ • GET /history│ • PUT /profile│            │    │
│  │  │ • GET /me    │  │ • GET /:id   │  │ • POST /qr   │              │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │    │
│  │         │                 │                  │                       │    │
│  │         └─────────────────┼──────────────────┘                       │    │
│  │                           ▼                                         │    │
│  │  ┌─────────────────────────────────────────────────────────────┐  │    │
│  │  │                    Middleware Layer                          │  │    │
│  │  │  • JWT Auth  • Error Handler  • CORS  • Rate Limiting        │  │    │
│  │  └─────────────────────────────────────────────────────────────┘  │    │
│  │                           │                                         │    │
│  │                           ▼                                         │    │
│  │  ┌─────────────────────────────────────────────────────────────┐  │    │
│  │  │              Fraud Detection Engine                          │  │    │
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐    │  │    │
│  │  │  │  Amount   │ │   Time    │ │ Location  │ │ Velocity  │    │  │    │
│  │  │  │  Anomaly  │ │  Anomaly  │ │  Anomaly  │ │   Check   │    │  │    │
│  │  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘    │  │    │
│  │  │                    + ML Model (Optional)                     │  │    │
│  │  └─────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                           DATA LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        SQLite Database                               │    │
│  │                                                                      │    │
│  │   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐        │    │
│  │   │    users    │◄────►│ transactions│◄────►│ fraud_accts│        │    │
│  │   │  (profiles) │      │  (payments) │      │ (blacklist) │        │    │
│  │   └─────────────┘      └─────────────┘      └─────────────┘        │    │
│  │                                                                      │    │
│  │   ┌─────────────────────────────────────────────────────────────┐   │    │
│  │   │              Database Scripts (initDatabase.js)              │   │    │
│  │   │         • Auto-generate UPI IDs  • Create QR codes           │   │    │
│  │   │         • Generate balances     • Seed fraud accounts        │   │    │
│  │   └─────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Transaction Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│    User     │────►│  Frontend   │────►│  Backend Server │
│  (Sender)   │     │  (React)    │     │   (Express)     │
└─────────────┘     └─────────────┘     └────────┬────────┘
                                                   │
                    ┌──────────────────────────────┼──────────────────────┐
                    │                              │                      │
                    ▼                              ▼                      ▼
            ┌─────────────┐              ┌─────────────────┐     ┌─────────────────┐
            │   Step 1    │              │    Step 2       │     │    Step 3       │
            │   Validate  │              │   Authenticate  │     │  Check Balance  │
            │   Input     │              │      JWT        │     │   Sufficient?   │
            └─────────────┘              └─────────────────┘     └────────┬────────┘
                                                                          │
                                                    ┌─────────────────────┼─────────────────────┐
                                                    │                     │                     │
                                                    ▼                     ▼                     ▼
                                           ┌─────────────┐      ┌─────────────────┐   ┌─────────────┐
                                           │   Step 4    │      │    Step 5       │   │   Step 6    │
                                           │  Fraud      │      │    Update       │   │  Return     │
                                           │ Detection   │      │   Balances      │   │  Response   │
                                           │  (5 Layers) │      │  (both users)   │   │             │
                                           └─────────────┘      └─────────────────┘   └─────────────┘
```

### Fraud Detection Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     TRANSACTION REQUEST RECEIVED                         │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRAUD DETECTION ENGINE                         │
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌───────────┐ │
│  │  Layer 1    │    │  Layer 2    │    │  Layer 3    │    │  Layer 4  │ │
│  │   Amount    │───►│    Time     │───►│  Location   │───►│  Velocity │ │
│  │  Anomaly    │    │  Anomaly    │    │  Anomaly    │    │   Check   │ │
│  │  (Z-score   │    │  (11PM-6AM) │    │  (>100km)   │    │ (>800km/h)│ │
│  │   > 3)      │    │             │    │             │    │           │ │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────┬─────┘ │
│                                                                   │       │
│  ┌─────────────────────────────────────────────────────────┐      │       │
│  │  Layer 5: High Amount Check (Amount > ₹50,000)        │◄─────┘       │
│  └─────────────────────────────────┬───────────────────────┘              │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    RISK SCORE CALCULATION                        │   │
│  │                                                                  │   │
│  │   Low Risk  (0-25%)      Medium Risk (25-75%)    High Risk (>75%)│   │
│  │       │                      │                      │            │   │
│  │       ▼                      ▼                      ▼            │   │
│  │   ┌─────────┐           ┌─────────┐           ┌─────────┐         │   │
│  │   │ APPROVE │           │  LOG    │           │ BLOCK   │         │   │
│  │   │         │           │  ONLY   │           │ & ALERT │         │   │
│  │   └─────────┘           └─────────┘           └─────────┘         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Database Entity Relationship Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                             │
│                                                                          │
│   ┌─────────────────────────┐                                              │
│   │        users            │                                              │
│   ├─────────────────────────┤                                              │
│   │ PK  uid (TEXT)          │◄────────────────────────┐                   │
│   │     name (TEXT)         │                         │                   │
│   │     email (TEXT)        │                         │                   │
│   │     password_hash (TEXT)│                         │                   │
│   │     upi_id (TEXT)       │                         │                   │
│   │     qr_code (TEXT)      │                         │                   │
│   │     balance (REAL)      │                         │                   │
│   │     usual_location_lat  │                         │                   │
│   │     usual_location_lon  │                         │                   │
│   │     transaction_count   │                         │                   │
│   │     created_at (DATETIME)│                        │                   │
│   └───────────┬─────────────┘                         │                   │
│               │                                       │                   │
│               │ 1                                     │ *                 │
│               │                                       │                   │
│               ▼                                       │                   │
│   ┌─────────────────────────┐                        │                   │
│   │     transactions        │                        │                   │
│   ├─────────────────────────┤                        │                   │
│   │ PK  transaction_id      │                        │                   │
│   │ FK  sender_uid ─────────┼────────────────────────┘                   │
│   │ FK  recipient_uid       │                        (self-reference)    │
│   │     recipient_upi       │                                            │
│   │     amount (REAL)       │                                            │
│   │     timestamp (DATETIME)│                                            │
│   │     latitude/longitude  │                                            │
│   │     is_fraud (BOOLEAN)  │                                            │
│   │     fraud_probability   │                                            │
│   │     fraud_reasons (JSON)│                                           │
│   │     status (TEXT)       │                                            │
│   │     balance_before        │                                            │
│   │     balance_after         │                                            │
│   └─────────────────────────┘                                            │
│                                                                          │
│   ┌─────────────────────────┐                                            │
│   │     fraud_accounts      │                                            │
│   ├─────────────────────────┤                                            │
│   │ PK  upi_id (TEXT)       │                                            │
│   │     account_name (TEXT) │                                            │
│   │     suspicious (BOOLEAN)│                                            │
│   │     fraud_stats (JSON)  │                                            │
│   │     created_at (DATETIME)│                                           │
│   └─────────────────────────┘                                            │
└───────────────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 7, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js, SQLite (better-sqlite3) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **ML** | Python, scikit-learn, XGBoost |
| **QR Codes** | qrcode (Node.js) |

### Database Schema

**Users Table:**
- `uid`, `name`, `email`, `password_hash`, `upi_id`, `qr_code`, `balance`
- `usual_location_lat`, `usual_location_lon`, `transaction_count`, `created_at`

**Transactions Table:**
- `transaction_id`, `sender_uid`, `recipient_uid`, `recipient_upi`, `amount`
- `timestamp`, `latitude`, `longitude`, `is_fraud`, `fraud_probability`
- `fraud_reasons`, `status`, `balance_before`, `balance_after`

**Fraud Accounts Table:**
- `upi_id`, `account_name`, `suspicious`, `fraud_stats`, `created_at`

## 🚀 Quick Start (From GitHub)

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ (for ML model - optional)
- Git

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/Srichandana-99/UPI-Guard.git
cd UPI-Guard

# Install all dependencies (root, backend, frontend)
npm run install:all
```

### 2. Environment Setup

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env - set JWT_SECRET and other configs
cd ..

# Frontend environment  
cd frontend
cp .env.example .env
# Edit .env - set VITE_API_URL=http://localhost:5001
cd ..
```

### 3. Start the Application

```bash
# Start both backend and frontend with one command
npm start
```

Or start separately:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 4. Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001

## � Project Structure

```
UPI-Guard/
├── backend/                 # Express.js API server
│   ├── config/             # Database config
│   ├── controllers/        # Auth, transaction, user controllers
│   ├── middleware/         # JWT auth, error handling
│   ├── routes/             # API route definitions
│   ├── utils/              # Fraud engine, QR codes, location
│   ├── scripts/            # DB initialization scripts
│   ├── server.js           # Express server entry
│   └── package.json
│
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # AuthContext
│   │   ├── lib/            # API clients
│   │   ├── pages/          # Dashboard, SendMoney, History, etc.
│   │   └── App.jsx         # Main app component
│   ├── index.html
│   └── package.json
│
├── model/                  # Python ML fraud detection model
│   ├── app.py              # Flask API for predictions
│   ├── train_model.py      # Model training script
│   └── fraud_detection_model.pkl
│
├── functions/              # Firebase Cloud Functions (optional)
│   ├── index.js            # Firebase handlers
│   └── utils/              # Shared utilities
│
├── package.json            # Root package with start scripts
└── README.md               # This file
```

## � API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/reset-password` | Reset password |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions/initiate` | Send money with fraud check |
| GET | `/api/transactions/history` | Get transaction history |
| GET | `/api/transactions/:id` | Get single transaction |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get profile & stats |
| PUT | `/api/user/profile` | Update profile |
| POST | `/api/user/regenerate-qr` | Regenerate QR code |
| POST | `/api/user/location` | Log location |

## 🛡️ Fraud Detection Engine

The 5-layer detection system analyzes each transaction:

1. **Amount Anomaly** - Z-score > 3 flags unusual amounts
2. **Time Anomaly** - Transactions 11 PM - 6 AM flagged
3. **Location Anomaly** - Distance > 100 km from usual location
4. **Velocity Check** - Speed > 800 km/h (impossible travel)
5. **High Amount** - Transactions > ₹50,000 flagged

**ML Integration:** Optional Python Flask API for advanced fraud scoring using XGBoost.

## 🧪 Testing

### Manual Testing
1. Register a new user at `/register`
2. Login with credentials
3. View auto-generated UPI ID and ₹70,000-150,000 balance
4. Send money to another UPI ID
5. Check transaction history for fraud status

### Fraud Detection Tests
```bash
Test Case 1: Send ₹60,000+ (High amount flag)
Test Case 2: Send money at 2 AM (Time anomaly)
Test Case 3: Use VPN to change location (Location anomaly)
Test Case 4: Multiple rapid transactions (Velocity check)
```

## � Development Commands

```bash
# Root directory commands
npm start              # Start backend + frontend
npm run dev            # Same as npm start
npm run install:all    # Install all dependencies

# Backend commands (cd backend)
npm start              # Start server on port 5001
npm run dev            # Start with nodemon
npm run init-db        # Initialize database

# Frontend commands (cd frontend)  
npm run dev            # Start dev server on port 5173
npm run build          # Build for production
npm run preview        # Preview production build
```

## 📝 Environment Variables

### Backend (.env)
```env
JWT_SECRET=your_jwt_secret_key_here
PORT=5001
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001
```

## 🔐 Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- SQL injection protection (parameterized queries)
- CORS enabled for frontend origin only
- Input validation on all endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues or questions:
- Open an issue on GitHub: https://github.com/Srichandana-99/UPI-Guard/issues
- Check backend logs in console
- Check browser console for frontend errors

## 📄 License

MIT License

---

Built with ❤️ for secure UPI transactions

**GitHub**: https://github.com/Srichandana-99/UPI-Guard
