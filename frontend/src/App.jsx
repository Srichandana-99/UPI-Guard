import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MainLayout } from './layout/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { SendMoney } from './pages/SendMoney'
import { Login } from './pages/Login'

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    if (!user) return <Navigate to="/login" replace />
    return children
}

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="send" element={<SendMoney />} />
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
