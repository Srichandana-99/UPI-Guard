# Render Database Connection Fix

## 🔗 **Correct DATABASE_URL for Render**

The issue is that you're using `postgres` as the hostname, but Render provides a specific database URL.

### **How to Get the Correct DATABASE_URL**

1. **Go to your Render Dashboard**
2. **Click on your PostgreSQL database** (`upiguard-db`)
3. **Go to "Connections" tab**
4. **Copy the "External Database URL"**

It should look like:
```
postgresql://upiguard:6WTQnvTbgtjZcyaKG2Vq2bd9nk3GgVuR@dpg-xxxxx.oregon-postgres.render.com:5432/upiguard
```

### **Update Your Environment Variables**

In your Render backend service, update:

```
DATABASE_URL=postgresql://upiguard:6WTQnvTbgtjZcyaKG2Vq2bd9nk3GgVuR@dpg-xxxxx.oregon-postgres.render.com:5432/upiguard
SENDER_EMAIL=alonepenguin07@gmail.com
SENDER_PASSWORD=ubfh mfpf krdm xwkn
ADMIN_EMAILS=alonepenguin07@gmail.com
CORS_ORIGINS=https://your-app.vercel.app
```

### **What Changed**

- ❌ **Wrong**: `postgresql://upiguard:password@postgres:5432/upiguard`
- ✅ **Right**: `postgresql://upiguard:password@dpg-xxxxx.oregon-postgres.render.com:5432/upiguard`

### **Steps to Fix**

1. **Get the actual database URL** from Render dashboard
2. **Update DATABASE_URL** in your backend service
3. **Redeploy** the backend service
4. **Test** with the correct connection

### **Database URL Format**

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

Where:
- **user**: `upiguard`
- **password**: `6WTQnvTbgtjZcyaKG2Vq2bd9nk3GgVuR`
- **host**: `dpg-xxxxx.oregon-postgres.render.com` (from Render)
- **port**: `5432`
- **database**: `upiguard`

**🚀 Get the correct database URL from Render and update your environment variables!**
