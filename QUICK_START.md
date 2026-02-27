# UPI Guard - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 16+ (`node --version`)
- Python 3.8+ (`python3 --version`)
- Git

### Step 1: Clone & Setup

```bash
# Clone repository
git clone https://github.com/Srichandana-99/UPI-Guard.git
cd UPI-Guard

# Create environment files
cat > backend/.env << 'EOF'
DATABASE_URL=postgresql://user:password@host:5432/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
CORS_ORIGINS=http://localhost:5173
ADMIN_EMAILS=admin@example.com
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password
EOF

cat > frontend/.env << 'EOF'
VITE_API_URL=http://localhost:8000/api/v1
VITE_VAPID_PUBLIC_KEY=your-vapid-key
EOF
```

### Step 2: Install Dependencies

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend (in new terminal)
cd frontend
npm install
```

### Step 3: Run the App

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📱 Install as PWA

### Android
1. Open http://localhost:5173 in Chrome
2. Tap ⋮ → "Install app"
3. Confirm

### iOS
1. Open http://localhost:5173 in Safari
2. Tap Share → "Add to Home Screen"
3. Confirm

### Desktop
1. Open http://localhost:5173 in Chrome/Edge
2. Click install icon in address bar
3. Confirm

---

## 🔧 Common Commands

### Backend
```bash
# Run server
uvicorn app.main:app --reload

# Run with specific port
uvicorn app.main:app --port 8001

# Check syntax
python3 -m py_compile app/main.py

# Run tests
pytest
```

### Frontend
```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint
```

---

## 🗄️ Database Setup

### Using Supabase (Recommended)

1. Create account at https://supabase.com
2. Create new project
3. Get credentials from project settings
4. Add to `backend/.env`:
   ```
   DATABASE_URL=postgresql://postgres:password@host:5432/postgres
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   ```

### Local PostgreSQL

```bash
# Install PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql
# Windows: Download from postgresql.org

# Start PostgreSQL
# macOS: brew services start postgresql
# Ubuntu: sudo service postgresql start

# Create database
createdb upi_guard

# Update .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/upi_guard
```

---

## 🔐 Authentication Setup

### Email OTP (Supabase)

1. Go to Supabase dashboard
2. Auth → Providers → Email
3. Enable "Email OTP"
4. Configure email settings
5. Get SUPABASE_KEY and add to `.env`

### Admin Setup

1. Add admin email to `backend/.env`:
   ```
   ADMIN_EMAILS=admin@example.com,admin2@example.com
   ```
2. Register with admin email
3. Verify OTP
4. Admin role assigned automatically

---

## 🧪 Testing

### Test Authentication
```bash
# Request OTP
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Verify OTP (use OTP from email)
curl -X POST http://localhost:8000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### Test Transaction
```bash
curl -X POST http://localhost:8000/api/v1/transaction/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user@example.com" \
  -d '{
    "sender_email":"user@example.com",
    "receiver_upi_id":"receiver@upi",
    "amount":100,
    "transaction_id":"txn_123"
  }'
```

### Test Admin Endpoints
```bash
curl -X GET http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer admin@example.com"
```

---

## 🐛 Debugging

### Backend Logs
```bash
# Enable debug logging
export PYTHONUNBUFFERED=1
uvicorn app.main:app --reload --log-level debug
```

### Frontend Logs
```javascript
// In browser console
localStorage.setItem('debug', '*')
location.reload()
```

### Check Service Worker
```javascript
// In browser console
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log(regs))
```

### Clear Cache
```javascript
// In browser console
caches.keys().then(names => {
  Promise.all(names.map(name => caches.delete(name)))
})
```

---

## 📦 Build & Deploy

### Build Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

### Deploy Backend to Render
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Set environment variables
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
uvicorn app.main:app --port 8001
```

### Module Not Found
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
npm install --force
```

### CORS Errors
- Check `CORS_ORIGINS` in `backend/.env`
- Ensure frontend URL is in the list
- Restart backend after changes

### Database Connection Failed
- Check `DATABASE_URL` format
- Verify database is running
- Test connection: `psql $DATABASE_URL`

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS in production
- Clear browser cache
- Check manifest.json exists

---

## 📚 Documentation

- [PWA Setup Guide](./PWA_SETUP.md)
- [PWA Migration Summary](./PWA_MIGRATION_SUMMARY.md)
- [Bug Fixes Summary](./BUG_FIXES_SUMMARY.md)
- [API Documentation](http://localhost:8000/docs)

---

## 🎯 Next Steps

1. ✅ Get app running locally
2. ✅ Test authentication
3. ✅ Test transactions
4. ✅ Install as PWA
5. ✅ Test offline mode
6. ✅ Deploy to production

---

## 💡 Tips

- Use `npm run dev` for hot reload
- Use `--reload` flag with uvicorn for auto-restart
- Check API docs at `/docs` endpoint
- Use browser DevTools for debugging
- Test on real device for PWA features

---

## 🤝 Need Help?

1. Check documentation files
2. Review API docs at `/docs`
3. Check browser console for errors
4. Check backend logs
5. Create GitHub issue with details

---

**Happy coding! 🚀**
