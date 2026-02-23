import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password, 'admin'); // Pass role or backend handles it
            navigate('/admin');
        } catch (error) {
            console.error('Admin login failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#05030A] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60%] max-w-2xl h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-[#0A0713] border border-[#1C1C26] rounded-3xl p-8 relative z-10 shadow-2xl"
            >
                {/* Logo & Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-[#101026] rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(26,33,255,0.2)]">
                        <Shield className="w-7 h-7 text-secure-blue" fill="currentColor" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">SecureUPI Admin</h1>
                    <p className="text-[#8A8A9E] text-sm text-center">Sign in to manage transactions</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase ml-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-[#8A8A9E] font-medium">@</span>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#12101B] border border-[#1C1C26] text-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-secure-blue focus:ring-1 focus:ring-secure-blue transition-all"
                                placeholder="admin@secureupi.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase ml-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="w-4 h-4 text-[#8A8A9E]" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#12101B] border border-[#1C1C26] font-mono tracking-widest text-white rounded-2xl py-3.5 pl-11 pr-12 focus:outline-none focus:border-secure-blue focus:ring-1 focus:ring-secure-blue transition-all text-lg placeholder:text-sm placeholder:tracking-normal"
                                placeholder="••••••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8A8A9E] hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1210FF] hover:bg-[#1A21FF] text-white font-bold rounded-2xl py-4 mt-8 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(26,33,255,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Secure Login'}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>

                    <div className="text-center pt-4">
                        <a href="#" className="text-sm font-medium text-[#8A8A9E] hover:text-white transition-colors">Forgot Password?</a>
                    </div>
                </form>

                {/* Footer Status */}
                <div className="mt-10 pt-6 border-t border-[#1C1C26] flex justify-between items-center text-[10px] font-bold text-[#8A8A9E]">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00D06C] shadow-[0_0_8px_rgba(0,208,108,0.6)]"></div>
                        <span className="uppercase tracking-widest">Secure Connection Active</span>
                    </div>
                    <span>V2.0.4</span>
                </div>
            </motion.div>

            <div className="absolute bottom-8 text-[11px] text-[#8A8A9E]">
                © 2024 SecureUPI Technologies Inc. All rights reserved.
            </div>
        </div>
    );
}
