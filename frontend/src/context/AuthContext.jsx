import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

// Notification helper
const showNotification = (title, body, icon = null) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: icon || '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'upi-transaction',
            requireInteraction: true,
            silent: false
        })
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        try {
            const raw = localStorage.getItem('user')
            if (raw) setUser(JSON.parse(raw))
        } catch {
            // ignore
        } finally {
            setLoading(false)
        }
    }, [])

    const requestOtp = async (email) => {
        setLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            const data = await response.json().catch(() => ({}))
            if (!response.ok) throw new Error(data.detail || data.message || 'Failed to send OTP')
            return true
        } finally {
            setLoading(false)
        }
    }

    const verifyOtp = async (email, otp) => {
        setLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            })
            const data = await response.json().catch(() => ({}))
            if (!response.ok) throw new Error(data.detail || 'OTP verification failed')
            if (!data.user) throw new Error('No user returned from verification')

            setUser(data.user)
            localStorage.setItem('user', JSON.stringify(data.user))
            return data.user
        } finally {
            setLoading(false)
        }
    }

    // Backwards-compat: some screens call `login(email, password)`
    const login = async (email) => requestOtp(email)

    const logout = async () => {
        setUser(null)
        localStorage.removeItem('user')
    }

    // Show payment received notification
    const showPaymentNotification = (senderName, amount) => {
        showNotification(
            'Payment Received!',
            `You received ₹${amount.toLocaleString('en-IN')} from ${senderName}`,
            null
        )
    }

    // Check for biometric support
    const checkBiometricSupport = async () => {
        if ('credentials' in navigator) {
            try {
                const available = await navigator.credentials.isUserVerifyingPlatformAuthenticatorAvailable()
                return available
            } catch {
                return false
            }
        }
        return false
    }

    // Check camera permission
    const checkCameraPermission = async () => {
        if ('permissions' in navigator) {
            try {
                const result = await navigator.permissions.query({ name: 'camera' })
                return result.state
            } catch {
                return 'prompt'
            }
        }
        return 'prompt'
    }

    // Get user location
    const getUserLocation = async () => {
        return new Promise((resolve, reject) => {
            if (!('geolocation' in navigator)) {
                resolve({ latitude: null, longitude: null, accuracy: null, error: 'Geolocation not supported' })
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    })
                },
                (error) => {
                    resolve({ latitude: null, longitude: null, accuracy: null, error: error.message })
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
            )
        })
    }

    // Log user location
    const logUserLocation = async (email, action = 'app_open') => {
        try {
            const location = await getUserLocation()
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/location/${encodeURIComponent(email)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    accuracy: location.accuracy,
                    action
                })
            })
            
            if (response.ok) {
                const data = await response.json()
                return data
            }
        } catch (err) {
            console.log('Location logging failed:', err)
        }
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            requestOtp, 
            verifyOtp, 
            login, 
            logout,
            showPaymentNotification,
            checkBiometricSupport,
            checkCameraPermission,
            getUserLocation,
            logUserLocation
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
