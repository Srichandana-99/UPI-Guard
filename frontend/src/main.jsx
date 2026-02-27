import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerServiceWorker, requestNotificationPermission } from './service-worker-register'

// Register service worker for PWA functionality
registerServiceWorker()

// Request notification permission
requestNotificationPermission()

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
