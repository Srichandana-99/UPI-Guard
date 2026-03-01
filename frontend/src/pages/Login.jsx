import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Lock, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }
            
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Reload to update AuthContext
            window.location.href = '/dashboard';
        } catch (err) {
            console.error('Login failed:', err)
            setError(err?.message || 'Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-secure-bg flex flex-col items-center justify-center p-6 text-secure-text">
            <div className="w-full max-w-sm flex flex-col items-center flex-1 justify-center space-y-10 mt-10">
                {/* Logo Section */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <div className="w-14 h-14 bg-secure-blue rounded-full mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(26,33,255,0.4)]">
                        <Shield className="w-7 h-7 text-white" fill="currentColor" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">SecureUPI</h1>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="w-full bg-[#0A0713]/50 border border-[#1C1C26]/50 rounded-[2rem] p-8 pb-10 shadow-2xl relative"
                    style={{ backdropFilter: "blur(20px)" }}
                >
                    <div className="mb-8">
                        <h2 className="text-[2rem] leading-tight font-extrabold mb-2 tracking-tight">Welcome Back</h2>
                        <p className="text-secure-textMuted text-sm">Enter your credentials to access your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#12101B] border border-[#232332] text-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-secure-blue focus:ring-1 focus:ring-secure-blue text-sm transition-all placeholder:text-secure-textMuted/50"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#12101B] border border-[#232332] text-white rounded-2xl py-3.5 pl-11 pr-11 focus:outline-none focus:border-secure-blue focus:ring-1 focus:ring-secure-blue text-sm transition-all placeholder:text-secure-textMuted/50"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secure-textMuted hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-2xl p-3">
                                {error}
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-secure-blue hover:bg-secure-blueHover text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center shadow-[0_4px_20px_rgba(26,33,255,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span>{loading ? 'Logging in...' : 'Login'}</span>
                                <span className="ml-2 font-bold inline-block transform translate-y-[1px]">→</span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#2A2A38]"></div>
                        <span className="text-[10px] font-bold text-secure-textMuted uppercase tracking-widest">New to UPI?</span>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#2A2A38]"></div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => navigate('/register')}
                            className="w-full bg-transparent border border-[#2A2A38] hover:bg-[#12101B] text-white font-semibold rounded-2xl py-3.5 transition-colors text-sm"
                        >
                            Create Secure Account
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-8 pb-4 flex items-center justify-center text-[9px] font-bold tracking-widest text-[#505068] uppercase gap-2 flex-wrap text-center opacity-80">
                <CheckCircle2 className="w-3 h-3 text-[#505068]" />
                <span>PCI DSS Compliant • End-to-End Encrypted</span>
            </div>
        </div>
    );
}
