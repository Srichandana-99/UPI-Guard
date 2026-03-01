import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function SetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Get token from URL and verify magic link
        const token = searchParams.get('token');
        if (token) {
            verifyMagicLink(token);
        } else {
            alert('Invalid magic link');
            navigate('/login');
        }
    }, [searchParams]);

    const verifyMagicLink = async (token) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-magic-link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Verification failed');
            
            setEmail(data.email);
        } catch (error) {
            alert(error.message);
            navigate('/login');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/set-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to set password');

            alert('Password set successfully! You can now login.');
            navigate('/login');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secure-bg flex flex-col items-center justify-center p-6 text-secure-text">
            <div className="w-full max-w-sm flex flex-col items-center flex-1 justify-center space-y-8 mt-6">

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <div className="w-12 h-12 bg-secure-blue rounded-full mb-3 flex items-center justify-center shadow-[0_0_20px_rgba(26,33,255,0.4)]">
                        <Shield className="w-6 h-6 text-white" fill="currentColor" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">SecureUPI</h1>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="w-full bg-[#0A0713]/50 border border-[#1C1C26]/50 rounded-[2rem] p-8 shadow-2xl relative"
                    style={{ backdropFilter: "blur(20px)" }}
                >
                    <div className="mb-6">
                        <h2 className="text-[1.75rem] leading-tight font-extrabold mb-1 tracking-tight">Set Password</h2>
                        <p className="text-secure-textMuted text-xs">Create a strong password for {email}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted"><Lock className="w-4 h-4" /></div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#12101B] border border-[#232332] text-white rounded-2xl py-3.5 pl-11 pr-11 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50"
                                    placeholder="Min 8 chars, uppercase, number, symbol"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secure-textMuted"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted"><Lock className="w-4 h-4" /></div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#12101B] border border-[#232332] text-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50"
                                    placeholder="Re-enter password"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-secure-blue hover:bg-secure-blueHover text-white font-semibold rounded-2xl py-4 flex items-center justify-center shadow-[0_4px_20px_rgba(26,33,255,0.3)] transition-all active:scale-[0.98]"
                            >
                                <span>{loading ? 'Setting Password...' : 'Set Password & Login'}</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 pb-2 text-[9px] font-bold tracking-widest text-[#505068] uppercase flex items-center justify-center gap-2 opacity-80">
                <CheckCircle2 className="w-3 h-3 text-[#505068]" />
                <span>Secure Authentication</span>
            </div>
        </div>
    );
}
