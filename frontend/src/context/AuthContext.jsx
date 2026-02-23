import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
    // In a real app with Supabase:
    // const [user, setUser] = useState(null)
    // const [loading, setLoading] = useState(true)
    // supabase.auth.getSession().then(...)

    // For the MVP demonstration, we mock a logged in user state initially
    const [user, setUser] = useState({ id: 'user123', name: 'Demo User', upi_id: 'demo@upi' })
    const [loading, setLoading] = useState(false)

    const login = async (email, password) => {
        setUser({ id: 'user123', name: 'Demo User', upi_id: 'demo@upi' })
    }

    const logout = async () => {
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
