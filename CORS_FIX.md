# CORS Configuration Fix

## 🌐 **CORS Issue Fixed**

### **Problem**
Frontend `https://upi-guard-001.vercel.app` cannot access backend `https://upi-guard-97x5.onrender.com` due to CORS policy.

### **Solution**

#### **1. Update Backend CORS Origins**
I've added your specific URLs to the CORS configuration.

#### **2. Update Environment Variable**
In your Render backend service, update `CORS_ORIGINS`:

```
CORS_ORIGINS=https://upi-guard-001.vercel.app,https://*.vercel.app,https://upi-guard-97x5.onrender.com,https://*.onrender.com
```

### **Steps to Fix**

#### **1. Go to Render Backend Service**
1. Visit: https://render.com/dashboard
2. Click on your backend service (`upi-guard-97x5`)
3. Go to **"Settings"** → **"Environment"**
4. **Update CORS_ORIGINS**:
   ```
   CORS_ORIGINS=https://upi-guard-001.vercel.app,https://*.vercel.app,https://upi-guard-97x5.onrender.com,https://*.onrender.com
   ```

#### **2. Redeploy Backend**
1. **Click "Save Changes"**
2. **Trigger New Deployment**
3. **Wait for deployment to complete**

#### **3. Update Frontend Environment Variable**
In your Vercel frontend service, update `VITE_API_URL`:
```
VITE_API_URL=https://upi-guard-97x5.onrender.com/api/v1
```

### **What I Fixed**

#### **Backend CORS Origins**
```python
allow_origins=[
    "https://upi-guard-001.vercel.app",      # Your specific frontend
    "https://*.vercel.app",                  # All Vercel apps
    "https://upi-guard-97x5.onrender.com",   # Your specific backend
    "https://*.onrender.com",               # All Render apps
    # ... other origins
]
```

#### **Environment Variable**
```
CORS_ORIGINS=https://upi-guard-001.vercel.app,https://*.vercel.app,https://upi-guard-97x5.onrender.com,https://*.onrender.com
```

### **Result After Fix**

✅ **Frontend can access backend**  
✅ **No CORS errors**  
✅ **API calls work**  
✅ **Login/Registration work**  

### **Current URLs**
- **Frontend**: `https://upi-guard-001.vercel.app`
- **Backend**: `https://upi-guard-97x5.onrender.com`

**🚀 Update your environment variables and redeploy both services!**
