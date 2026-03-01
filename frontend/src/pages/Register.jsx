import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Phone, Calendar, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        dob: '',
        age: '',
        password: '',
        confirmPassword: '',
        upiPin: '',
        confirmUpiPin: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) {
                console.error('Full error response:', data);
                throw new Error(data.detail || JSON.stringify(data) || 'Registration failed');
            }

            // Show success message and redirect to login
            alert('Registration successful! Please check your email for a verification link. You must verify your email before logging in.');
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
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
                        <h2 className="text-[1.75rem] leading-tight font-extrabold mb-1 tracking-tight">Create Account</h2>
                        <p className="text-secure-textMuted text-xs">Join the most secure payments network</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted"><User className="w-4 h-4" /></div>
                                <input
                                    type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                                    className="w-full bg-[#12101B] border border-[#232332] text-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50"
                                    placeholder="Legal Name"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted"><Mail className="w-4 h-4" /></div>
                                <input
                                    type="email" name="email" value={formData.email} onChange={handleChange} required
                                    className="w-full bg-[#12101B] border border-[#232332] text-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {/* Mobile */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Mobile Number</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted"><Phone className="w-4 h-4" /></div>
                                <input
                                    type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required
                                    className="w-full bg-[#12101B] border border-[#232332] text-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>

                        {/* DOB & Age Row */}
                        <div className="flex gap-3">
                            <div className="space-y-1 flex-[2]">
                                <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Date of Birth</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secure-textMuted"><Calendar className="w-4 h-4" /></div>
                                    <input
                                        type="date" name="dob" value={formData.dob} onChange={handleChange} required
                                        className="w-full bg-[#12101B] border border-[#232332] text-white rounded-2xl py-3.5 pl-9 pr-2 focus:outline-none focus:border-secure-blue text-sm text-secure-textMuted"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1 flex-1">
                                <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Age</label>
                                <input
                                    type="number" name="age" value={formData.age} onChange={handleChange} required min="18"
                                    className="w-full bg-[#12101B] border border-[#232332] text-center text-white rounded-2xl py-3.5 px-2 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50"
                                    placeholder="18+"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted"><Lock className="w-4 h-4" /></div>
                                <input
                                    type="password" name="password" value={formData.password} onChange={handleChange} required
                                    className="w-full bg-[#12101B] border border-[#232332] text-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50"
                                    placeholder="Min 8 chars, uppercase, number, symbol"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted"><Lock className="w-4 h-4" /></div>
                                <input
                                    type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                                    className="w-full bg-[#12101B] border border-[#232332] text-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50"
                                    placeholder="Re-enter password"
                                />
                            </div>
                        </div>

                        {/* UPI PIN & Confirm UPI PIN Row */}
                        <div className="flex gap-3">
                            <div className="space-y-1 flex-1">
                                <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">UPI PIN</label>
                                <input
                                    type="password" name="upiPin" value={formData.upiPin} onChange={handleChange} required maxLength="6" pattern="\d{4,6}"
                                    className="w-full bg-[#12101B] border border-[#232332] text-center text-white rounded-2xl py-3.5 px-2 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50"
                                    placeholder="4-6 digits"
                                />
                            </div>
                            <div className="space-y-1 flex-1">
                                <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Confirm PIN</label>
                                <input
                                    type="password" name="confirmUpiPin" value={formData.confirmUpiPin} onChange={handleChange} required maxLength="6" pattern="\d{4,6}"
                                    className="w-full bg-[#12101B] border border-[#232332] text-center text-white rounded-2xl py-3.5 px-2 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50"
                                    placeholder="Re-enter"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-secure-blue hover:bg-secure-blueHover text-white font-semibold rounded-2xl py-4 flex items-center justify-center shadow-[0_4px_20px_rgba(26,33,255,0.3)] transition-all active:scale-[0.98]"
                            >
                                <span>Register Account</span>
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-[11px] font-bold text-secure-textMuted tracking-widest uppercase hover:text-white transition-colors"
                        >
                            Already have an account? Log In
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Footer Badges */}
            <div className="mt-auto pt-6 pb-2 text-[9px] font-bold tracking-widest text-[#505068] uppercase flex items-center justify-center gap-2 opacity-80">
                <CheckCircle2 className="w-3 h-3 text-[#505068]" />
                <span>KYC Verified • RBI Compliant</span>
            </div>
        </div>
    );
}
