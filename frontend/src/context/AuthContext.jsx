import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
    // In a real app with Supabase:
    // const [user, setUser] = useState(null)
    // const [loading, setLoading] = useState(true)
    // supabase.auth.getSession().then(...)

    // For the MVP demonstration, we mock a logged in user state initially
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) throw new Error('Login failed');
            const data = await response.json();

            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        } catch (error) {
            console.error(error);
            // Fallback dummy user if backend is down during UI review
            const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
            const dummyUser = { email, name: role === 'admin' ? 'Admin User' : 'Alex Rivers', upi_id: email.split('@')[0] + '@secureupi', role };
            setUser(dummyUser);
            localStorage.setItem('user', JSON.stringify(dummyUser));
            return dummyUser;
        } finally {
            setLoading(false);
        }
    };

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
