# PostgreSQL Connection URL for Render

## 🔗 **Database Connection URL**

```
postgresql://upiguard:6WTQnvTbgtjZcyaKG2Vq2bd9nk3GgVuR@postgres:5432/upiguard
```

## 📋 **Render Environment Variables**

Add this to your Render backend service:

### **DATABASE_URL**
```
postgresql://upiguard:6WTQnvTbgtjZcyaKG2Vq2bd9nk3GgVuR@postgres:5432/upiguard
```

### **Other Required Environment Variables**
```
SENDER_EMAIL=alonepenguin07@gmail.com
SENDER_PASSWORD=ubfh mfpf krdm xwkn
ADMIN_EMAILS=alonepenguin07@gmail.com
CORS_ORIGINS=https://your-app.vercel.app
```

## 🚀 **Render Setup Steps**

### **1. Create PostgreSQL Database**
1. Go to Render dashboard
2. Click "New" → "PostgreSQL"
3. **Name**: `upiguard-db`
4. **Database Name**: `upiguard`
5. **User**: `upiguard`
6. **Password**: `6WTQnvTbgtjZcyaKG2Vq2bd9nk3GgVuR`
7. **Click "Create Database"**

### **2. Create Backend Service**
1. Click "New" → "Web Service"
2. **Root Directory**: `./backend`
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Add Environment Variables** (see above)
6. **Click "Create Web Service"**

### **3. Connect Database to Backend**
1. In your backend service settings
2. Go to "Environment" tab
3. Add the DATABASE_URL from above
4. Render will automatically connect to your PostgreSQL instance

## 🔧 **Connection Details**

- **Host**: `postgres` (Render internal DNS)
- **Port**: `5432`
- **Database**: `upiguard`
- **User**: `upiguard`
- **Password**: `6WTQnvTbgtjZcyaKG2Vq2bd9nk3GgVuR`

## 🎯 **Ready for Deployment**

Copy the DATABASE_URL above and add it to your Render backend service environment variables!

**🚀 Your UPI-Guard backend will connect to PostgreSQL automatically!**
