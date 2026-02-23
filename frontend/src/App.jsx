import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MainLayout } from './layout/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { SendMoney } from './pages/SendMoney'
import { Login } from './pages/Login'
import { AdminLayout } from './layout/admin/AdminLayout'
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard'
import { Users as AdminUsers } from './pages/admin/Users'
import { Transactions as AdminTransactions } from './pages/admin/Transactions'
import { FraudMonitor as AdminFraudMonitor } from './pages/admin/FraudMonitor'
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
    if (!user) return <Navigate to="/login" replace />
    if (user.role !== 'admin') return <Navigate to="/" replace /> // Redirect non-admins to user dashboard
    return children
}

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* User Routes */}
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="send" element={<SendMoney />} />
            </Route>

            {/* Admin Routes */}
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

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
