import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MainLayout } from './layout/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { History } from './pages/History'
import { SendMoney } from './pages/SendMoney'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { VerifyOTP } from './pages/VerifyOTP'
import { ResetPin } from './pages/ResetPin'
import { ScanQR } from './pages/ScanQR'
import { MyQR } from './pages/MyQR'
import { Profile } from './pages/Profile'
import { PersonalInfo } from './pages/PersonalInfo'
import { SupportCenter } from './pages/SupportCenter'
import { AdminLayout } from './layout/admin/AdminLayout'
import { AdminLogin } from './pages/admin/AdminLogin'
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard'
import { Users as AdminUsers } from './pages/admin/Users'
import { Transactions as AdminTransactions } from './pages/admin/Transactions'
import { FraudMonitor as AdminFraudMonitor } from './pages/admin/FraudMonitor'

// Permission Request Hook
const usePermissions = () => {
    const { user, logUserLocation } = useAuth()

    useEffect(() => {
        const requestPermissions = async () => {
            // Request notification permission
            if ('Notification' in window) {
                if (Notification.permission === 'default') {
                    await Notification.requestPermission()
                }
            }

            // Request camera permission (for QR scanning)
            if ('mediaDevices' in navigator) {
                try {
                    await navigator.permissions.query({ name: 'camera' })
                } catch (err) {
                    console.log('Camera permission API not supported')
                }
            }

            // Request biometric permission (if available)
            if ('credentials' in navigator) {
                try {
                    await navigator.credentials.create({
                        publicKey: {
                            challenge: new Uint8Array(32),
                            rp: { name: 'SecureUPI' },
                            user: { id: new Uint8Array(16), name: 'test' },
                            pubKeyCredParams: [{ alg: -7, type: 'public-key' }]
                        }
                    })
                } catch (err) {
                    // Biometric not supported or denied
                }
            }
        }

        // Log location when user is available
        if (user?.email) {
            logUserLocation(user.email, 'app_open')
        }

        // Request permissions after a small delay to not block initial load
        const timer = setTimeout(requestPermissions, 2000)
        return () => clearTimeout(timer)
    }, [user?.email, logUserLocation])
}
// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    if (!user) return <Navigate to="/login" replace />
    return children
}

// Protected Admin Route Wrapper
const ProtectedAdminRoute = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    if (!user) return <Navigate to="/admin/login" replace />
    if (user.role !== 'admin') return <Navigate to="/" replace /> // Redirect non-admins to user dashboard
    return children
}

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-pin" element={<ResetPin />} />

            {/* User Routes */}
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="history" element={<History />} />
                <Route path="send" element={<SendMoney />} />
                <Route path="scan" element={<ScanQR />} />
                <Route path="receive" element={<MyQR />} />
                <Route path="profile" element={<Profile />} />
                <Route path="personal-info" element={<PersonalInfo />} />
                <Route path="support" element={<SupportCenter />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="fraud" element={<AdminFraudMonitor />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

const PermissionProvider = ({ children }) => {
    usePermissions()
    return children
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <PermissionProvider>
                    <AppRoutes />
                </PermissionProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
