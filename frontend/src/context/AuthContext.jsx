import React, { createContext, useContext, useEffect, useState } from 'react'
import { saveUser, getUser, saveTransaction, getTransactions, initDB } from '../lib/offline-storage'
import { initializeFirebase, subscribeToUserTransactions, subscribeToFraudAlerts, subscribeToUserBalance } from '../lib/firebase'

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
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [realtimeTransactions, setRealtimeTransactions] = useState([])
    const [fraudAlerts, setFraudAlerts] = useState([])
    const [unsubscribers, setUnsubscribers] = useState([])

    // Initialize offline storage and Firebase
    useEffect(() => {
        const initServices = async () => {
            try {
                await initDB()
                console.log('✅ Offline storage initialized')
                
                // Initialize Firebase
                initializeFirebase()
                console.log('✅ Firebase initialized')
            } catch (error) {
                console.error('❌ Failed to initialize services:', error)
            }
        }

        initServices()

        // Listen for online/offline events
        const handleOnline = () => {
            setIsOnline(true)
            console.log('🟢 Back online')
            syncPendingData()
        }

        const handleOffline = () => {
            setIsOnline(false)
            console.log('🔴 Went offline')
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    // Load user from storage
    useEffect(() => {
        const loadUser = async () => {
            try {
                const raw = localStorage.getItem('user')
                if (raw) {
                    const userData = JSON.parse(raw)
                    setUser(userData)
                    // Also save to offline storage
                    await saveUser(userData)
                }
            } catch (error) {
                console.error('Failed to load user:', error)
            } finally {
                setLoading(false)
            }
        }

        loadUser()
    }, [])

    // Subscribe to real-time updates when user logs in
    useEffect(() => {
        if (!user?.email || !isOnline) return

        const newUnsubscribers = []

        // Subscribe to user transactions
        const txnUnsubscribe = subscribeToUserTransactions(user.email, (transactions) => {
            setRealtimeTransactions(transactions)
            console.log('📊 Real-time transactions updated:', transactions.length)
        })
        if (txnUnsubscribe) newUnsubscribers.push(txnUnsubscribe)

        // Subscribe to fraud alerts
        const alertUnsubscribe = subscribeToFraudAlerts((alerts) => {
            setFraudAlerts(alerts)
            console.log('🚨 Fraud alerts updated:', alerts.length)
        })
        if (alertUnsubscribe) newUnsubscribers.push(alertUnsubscribe)

        // Subscribe to balance updates
        const balanceUnsubscribe = subscribeToUserBalance(user.email, (balance) => {
            setUser(prev => prev ? { ...prev, balance } : null)
            console.log('💰 Balance updated:', balance)
        })
        if (balanceUnsubscribe) newUnsubscribers.push(balanceUnsubscribe)

        setUnsubscribers(newUnsubscribers)

        return () => {
            newUnsubscribers.forEach(unsub => {
                if (typeof unsub === 'function') unsub()
            })
        }
    }, [user?.email, isOnline])

    // Sync pending data when back online
    const syncPendingData = async () => {
        if (!isOnline || !user) return
        console.log('🔄 Syncing pending data...')
        // Sync logic will be implemented based on your needs
    }

    const requestOtp = async (email) => {
        console.log('🔍 requestOtp called', { email, apiUrl: import.meta.env.VITE_API_URL })
        setLoading(true)
        try {
            const url = `${import.meta.env.VITE_API_URL}/auth/login`
            console.log('📡 Making request to:', url)
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            
            console.log('📡 Response status:', response.status)
            const data = await response.json().catch(() => ({}))
            console.log('📡 Response data:', data)
            
            if (!response.ok) {
                console.error('❌ Request failed:', response.status, data)
                throw new Error(data.detail || data.message || 'Failed to send OTP')
            }
            
            console.log('✅ OTP request successful')
            return true
        } catch (error) {
            console.error('❌ requestOtp error:', error)
            throw error
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
            // Save to offline storage
            await saveUser(data.user)
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
        // Unsubscribe from all real-time updates
        unsubscribers.forEach(unsub => {
            if (typeof unsub === 'function') unsub()
        })
        setUnsubscribers([])
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
            isOnline,
            realtimeTransactions,
            fraudAlerts,
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
