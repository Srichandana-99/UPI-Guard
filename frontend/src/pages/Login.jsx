import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Fingerprint, User, CheckCircle2, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export function Login() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState(null)
    const { requestOtp, verifyOtp, loading, logUserLocation } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        try {
            // Log location for login attempt
            logUserLocation(email, 'login_attempt')
            await requestOtp(email)
            navigate('/verify-otp', { state: { email, intent: 'login' } })
        } catch (err) {
            setError(err?.message || 'Failed to send OTP')
        }
    }

    // Temporary test login for UI testing
    const handleTestLogin = async () => {
        const testEmail = 'test@demo.com'
        const testUser = {
            id: 'test-user-123',
            full_name: 'Test User',
            email: testEmail,
            upi_id: 'test@secureupi',
            qr_code: 'upi://pay?pa=test@secureupi&pn=Test%20User&mc=0000&tid=TEST123',
            balance: 50000.00,
            role: 'user',
            verified: true
        }
        
        // Log location for test login
        logUserLocation(testEmail, 'test_login')
        
        // Store test user in localStorage (same as AuthContext)
        localStorage.setItem('user', JSON.stringify(testUser))
        
        // Reload to trigger auth context update
        window.location.href = '/'
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

                {/* Login Card wrapper matching UI */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="w-full bg-[#0A0713]/50 border border-[#1C1C26]/50 rounded-[2rem] p-8 pb-10 shadow-2xl relative"
                    style={{ backdropFilter: "blur(20px)" }}
                >
                    <div className="mb-8">
                        <h2 className="text-[2rem] leading-tight font-extrabold mb-2 tracking-tight">Welcome Back</h2>
                        <p className="text-secure-textMuted text-sm">We’ll send a one-time password (OTP) to your email.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Input */}
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

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-2xl p-3">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                className="bg-[#12101B] border border-[#232332] rounded-2xl w-[60px] flex items-center justify-center hover:bg-[#1A1825] transition-colors"
                            >
                                <Fingerprint className="w-6 h-6 text-secure-blue" />
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-secure-blue hover:bg-secure-blueHover text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center shadow-[0_4px_20px_rgba(26,33,255,0.3)] transition-all active:scale-[0.98]"
                            >
                                <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
                                <span className="ml-2 font-bold inline-block transform translate-y-[1px]">→</span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-4">
                        <button
                            onClick={handleTestLogin}
                            className="w-full bg-[#1C1C26] border border-dashed border-secure-blue/50 hover:bg-secure-blue/10 text-secure-blue font-semibold rounded-2xl py-3 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            <Zap className="w-4 h-4" />
                            Test Login (Skip OTP)
                        </button>
                        <p className="text-[10px] text-secure-textMuted text-center mt-2">For UI testing only</p>
                    </div>

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

            {/* Footer Badges */}
            <div className="mt-auto pt-8 pb-4 flex items-center justify-center text-[9px] font-bold tracking-widest text-[#505068] uppercase gap-2 flex-wrap text-center opacity-80">
                <CheckCircle2 className="w-3 h-3 text-[#505068]" />
                <span>PCI DSS Compliant • End-to-End Encrypted</span>
            </div>
        </div>
    );
}
