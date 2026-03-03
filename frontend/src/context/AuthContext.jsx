import React, { createContext, useContext, useEffect, useState } from 'react'
import { saveUser, getUser, saveTransaction, getTransactions, initDB } from '../lib/offline-storage'
import { 
  loginUser, 
  logoutUser, 
  getCurrentUser, 
  getAuthToken,
  logUserLocation as apiLogUserLocation,
  getTransactionHistory
} from '../lib/api'

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
    const [transactions, setTransactions] = useState([])

    // Initialize offline storage
    useEffect(() => {
        const initServices = async () => {
            try {
                await initDB()
                console.log('✅ Offline storage initialized')
            } catch (error) {
                console.error('❌ Failed to initialize offline storage:', error)
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

    // Load transactions
    const loadTransactions = async () => {
        try {
            if (isOnline) {
                const txns = await getTransactionHistory(50)
                setTransactions(txns)
                
                // Save to offline storage
                for (const txn of txns) {
                    await saveTransaction(txn)
                }
            } else {
                // Load from offline storage
                const offlineTxns = await getTransactions(user?.email)
                setTransactions(offlineTxns || [])
            }
        } catch (error) {
            console.error('Failed to load transactions:', error)
            setTransactions([])
        }
    }

    // Sync pending data when coming back online
    const syncPendingData = async () => {
        console.log('🔄 Syncing pending data...')
        // TODO: Implement sync logic for pending transactions
    }

    // Load user from token on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = getAuthToken()
                if (token) {
                    // Try to get user from API
                    try {
                        const userData = await getCurrentUser()
                        setUser(userData)
                        
                        // Save to offline storage
                        await saveUser(userData)
                        
                        // Load transactions
                        await loadTransactions()
                    } catch (error) {
                        console.error('Failed to load user from API:', error)
                        
                        // Try to load from offline storage
                        if (user?.email) {
                            const offlineUser = await getUser(user.email)
                            if (offlineUser) {
                                setUser(offlineUser)
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading user:', error)
            } finally {
                setLoading(false)
            }
        }

        loadUser()
    }, [])

    // Login function
    const login = async (email, password) => {
        try {
            const data = await loginUser(email, password)
            setUser(data.user)
            
            // Save to offline storage
            await saveUser(data.user)
            
            // Load transactions
            await loadTransactions()
            
            console.log('✅ User logged in:', data.user.uid)
            return data.user
        } catch (error) {
            console.error('❌ Login failed:', error)
            throw error
        }
    }

    // Logout function
    const logout = async () => {
        try {
            await logoutUser()
            setUser(null)
            setTransactions([])
            console.log('✅ User logged out')
        } catch (error) {
            console.error('❌ Logout error:', error)
            // Still clear user data even if logout fails
            setUser(null)
            setTransactions([])
        }
    }

    // Log user location
    const logUserLocation = async (email, action) => {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords
                        await apiLogUserLocation(latitude, longitude, action)
                    },
                    (error) => {
                        console.warn('Geolocation error:', error)
                    }
                )
            }
        } catch (error) {
            console.error('Failed to log location:', error)
        }
    }

    // Refresh user data
    const refreshUser = async () => {
        try {
            const userData = await getCurrentUser()
            setUser(userData)
            await saveUser(userData)
        } catch (error) {
            console.error('Failed to refresh user:', error)
        }
    }

    // Refresh transactions
    const refreshTransactions = async () => {
        await loadTransactions()
    }

    const value = {
        user,
        loading,
        isOnline,
        transactions,
        realtimeTransactions: transactions, // Add alias for compatibility
        login,
        logout,
        logUserLocation,
        refreshUser,
        refreshTransactions,
        showNotification
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
