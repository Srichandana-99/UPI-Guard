# UPI Guard - PWA Setup Guide

## Overview
UPI Guard is now configured as a Progressive Web App (PWA) with offline support, service workers, and installable app capabilities.

## Features

### 1. **Installable App**
- Install on home screen (iOS, Android, Desktop)
- Standalone display mode
- Custom app icon and splash screen
- App shortcuts for quick actions

### 2. **Offline Support**
- Service Worker caching strategy
- IndexedDB for offline data storage
- Automatic sync when back online
- Offline page for network errors

### 3. **Push Notifications**
- Real-time transaction alerts
- Fraud detection notifications
- Background sync for pending transactions

### 4. **Performance**
- Network-first caching for API calls
- Cache-first for static assets
- Automatic cache cleanup
- Optimized bundle size

## Installation

### Prerequisites
```bash
# Node.js 16+ and npm
node --version
npm --version
```

### Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Configure environment**
```bash
# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:8000/api/v1
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
EOF
```

3. **Build for production**
```bash
npm run build
```

4. **Preview PWA**
```bash
npm run preview
```

## Running Locally

### Development Mode
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## Installation Methods

### On Android
1. Open the app in Chrome
2. Tap the menu (⋮) → "Install app"
3. Confirm installation
4. App appears on home screen

### On iOS
1. Open the app in Safari
2. Tap Share → "Add to Home Screen"
3. Name the app and add
4. App appears on home screen

### On Desktop (Chrome/Edge)
1. Open the app
2. Click the install icon in address bar
3. Confirm installation
4. App opens in standalone window

## Offline Functionality

### What Works Offline
- View cached transactions
- Access user profile
- View transaction history
- Read fraud alerts (cached)

### What Requires Internet
- Send money
- Verify OTP
- Fetch real-time fraud detection
- Update user balance

### Automatic Sync
When the app detects internet connection:
1. Pending transactions are synced
2. User data is updated
3. Transaction history is refreshed
4. Notifications are sent for completed transactions

## Service Worker

### Cache Strategy
- **API Calls**: Network-first (5 min cache)
- **Static Assets**: Cache-first
- **Images**: Cache-first (30 days)

### Manual Cache Clear
```javascript
// In browser console
caches.keys().then(names => {
  names.forEach(name => caches.delete(name))
})
```

## Offline Storage

### IndexedDB Stores
- `user`: User profile data
- `transactions`: Transaction history
- `pending-transactions`: Offline transactions
- `cache`: General cache storage

### Storage Limits
- Android: ~50MB
- iOS: ~50MB
- Desktop: ~50MB+

### Check Storage Usage
```javascript
// In browser console
navigator.storage.estimate().then(estimate => {
  console.log(`Used: ${estimate.usage} bytes`)
  console.log(`Quota: ${estimate.quota} bytes`)
})
```

## Push Notifications

### Setup
1. Get VAPID keys from your push service
2. Add `VITE_VAPID_PUBLIC_KEY` to `.env`
3. User grants notification permission
4. App subscribes to push notifications

### Sending Notifications
```javascript
// From backend
const subscription = await getUserPushSubscription(email)
await sendPushNotification(subscription, {
  title: 'Payment Received',
  body: 'You received ₹500 from John',
  data: { transactionId: '123' }
})
```

## Manifest Configuration

The `manifest.json` includes:
- App name and description
- Icons (192x192, 512x512)
- Theme colors
- App shortcuts
- Screenshots

### Customize
Edit `frontend/public/manifest.json` to:
- Change app name
- Update colors
- Add custom icons
- Modify shortcuts

## Icons Required

Place these in `frontend/public/`:
- `icon-192.png` - 192x192 app icon
- `icon-512.png` - 512x512 app icon
- `icon-maskable-192.png` - Maskable icon (192x192)
- `icon-maskable-512.png` - Maskable icon (512x512)
- `screenshot-1.png` - Narrow screenshot (540x720)
- `screenshot-2.png` - Wide screenshot (1280x720)
- `apple-touch-icon.png` - iOS icon (180x180)

## Troubleshooting

### Service Worker Not Registering
```javascript
// Check in console
navigator.serviceWorker.getRegistrations()
  .then(registrations => console.log(registrations))
```

### Cache Issues
```javascript
// Clear all caches
caches.keys().then(names => {
  Promise.all(names.map(name => caches.delete(name)))
})
```

### Offline Page Not Showing
- Ensure `offline.html` exists in `public/`
- Check service worker is registered
- Clear browser cache

### Notifications Not Working
- Check notification permission: `Notification.permission`
- Verify VAPID keys are correct
- Ensure service worker is active

## Performance Tips

1. **Reduce Bundle Size**
   - Use code splitting
   - Lazy load routes
   - Minify assets

2. **Optimize Images**
   - Use WebP format
   - Compress PNG/JPG
   - Serve responsive images

3. **Cache Strategy**
   - Cache API responses
   - Use IndexedDB for large data
   - Implement cache versioning

4. **Monitor Performance**
   - Use Lighthouse
   - Check Core Web Vitals
   - Monitor cache size

## Security

### HTTPS Required
- PWA features require HTTPS
- Use self-signed cert for local development
- Production must use valid SSL certificate

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">
```

### Secure Storage
- Don't store sensitive data in localStorage
- Use IndexedDB with encryption
- Clear data on logout

## Deployment

### Vercel
```bash
npm run build
# Push to GitHub
# Vercel auto-deploys
```

### Netlify
```bash
npm run build
# Drag dist/ folder to Netlify
# Or connect GitHub repo
```

### Self-Hosted
```bash
npm run build
# Serve dist/ with HTTPS
# Configure web server for SPA routing
```

## Monitoring

### Check PWA Status
```javascript
// In browser console
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(regs => console.log('SW registered:', regs.length > 0))
}

if ('Notification' in window) {
  console.log('Notifications:', Notification.permission)
}

if ('storage' in navigator) {
  navigator.storage.estimate()
    .then(est => console.log('Storage:', est.usage, '/', est.quota))
}
```

## Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
