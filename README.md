# UPI Guard - Real-time Fraud Detection System

A full-stack application for detecting fraudulent UPI transactions in real-time. Features OTP-based authentication via Supabase, a Python/FastAPI backend with Machine Learning capabilities, and a modern React frontend.

## 🚀 Features
- **Secure Authentication:** Passwordless OTP login via email (Supabase Auth).
- **Real-time Fraud Detection:** Analyzes transactions for velocity, location mismatch, and new receivers.
- **Admin Dashboard:** Monitor all users, transactions, and system health.
- **Location Tracking:** Logs user sessions and detects geographic anomalies.

---

## 🛠️ Tech Stack
- **Frontend:** React (Vite), TailwindCSS, Framer Motion, Lucide Icons.
- **Backend:** Python, FastAPI, SQLAlchemy.
- **Database:** PostgreSQL (via Supabase).
- **Authentication:** Supabase Auth (Email OTP).
- **Deployment:** Vercel (Frontend), Render (Backend).

---

## 🏃‍♂️ Quick Start (Local Run)

Follow these steps to clone the repository, set up the environment variables, and start the app using a single command!

### 1. Clone the Repository
Open your terminal and run:
```bash
git clone https://github.com/Srichandana-99/UPI-Guard.git
cd UPI-Guard
```

### 2. Configure Environment Variables
Before running the script, ensure your `.env` files are set up.

**Backend (`backend/.env`):**
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[YOUR-SUPABASE-DB-URI]:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_KEY=[YOUR-ANON-PUBLIC-KEY]
CORS_ORIGINS=http://localhost:5173
ADMIN_EMAILS=your_email@gmail.com
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 2. Run the App
Open your terminal in the root folder (`UPI-Guard`) and run:
```bash
./start.sh
```
*Note: If permissions are denied, run `chmod +x start.sh` first.*

This script will automatically:
1. Create a Python virtual environment (`.venv`).
2. Install all Backend requirements.
3. Install all Frontend `npm` modules.
4. Start the FastAPI backend on `http://localhost:8000`.
5. Start the React frontend on `http://localhost:5173`.

---

## 🌐 Deploying to Production
- **Backend (Render):** Set the Environment Variables exactly as in `backend/.env`. The start command is `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **Frontend (Vercel):** Set `VITE_API_URL` to your Render API deployment URL (e.g., `https://your-backend.onrender.com/api/v1`).
