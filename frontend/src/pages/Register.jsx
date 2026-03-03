import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Phone, Calendar, Lock, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { registerUser } from '../lib/api';

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8) {
            errors.push('At least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('One uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('One lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('One number');
        }
        return errors;
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }
        
        if (!formData.mobile.trim()) {
            newErrors.mobile = 'Mobile number is required';
        }
        
        if (!formData.dob) {
            newErrors.dob = 'Date of birth is required';
        }
        
        if (!formData.age || formData.age < 18) {
            newErrors.age = 'Must be 18 or older';
        }
        
        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            newErrors.password = passwordErrors.join(', ');
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        if (!/^\d{4}$/.test(formData.upiPin)) {
            newErrors.upiPin = 'UPI PIN must be exactly 4 digits';
        }
        
        if (formData.upiPin !== formData.confirmUpiPin) {
            newErrors.confirmUpiPin = 'UPI PINs do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // Register user with backend API
            await registerUser(
                formData.email, 
                formData.password, 
                formData.fullName, 
                formData.mobile,
                formData.dob,
                parseInt(formData.age),
                formData.upiPin
            );
            
            alert('Registration successful! You can now login with your email and password.');
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed';
            
            if (error.message.includes('already exists')) {
                errorMessage = 'Email already in use';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secure-bg flex flex-col items-center justify-center p-6 text-secure-text overflow-y-auto">
            <div className="w-full max-w-sm flex flex-col items-center space-y-8 my-10">

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
                        <h2 className="text-[1.75rem] leading-tight font-extrabold tracking-tight">
                            Create Account
                        </h2>
                        <p className="text-secure-textMuted text-xs">
                            Join the most secure payments network
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted"><User className="w-4 h-4" /></div>
                                <input
                                    type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                                    className={`w-full bg-[#12101B] border ${errors.fullName ? 'border-red-500' : 'border-[#232332]'} text-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50`}
                                    placeholder="Legal Name"
                                />
                            </div>
                            {errors.fullName && <p className="text-red-400 text-xs ml-1">{errors.fullName}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted"><Mail className="w-4 h-4" /></div>
                                <input
                                    type="email" name="email" value={formData.email} onChange={handleChange} required
                                    className={`w-full bg-[#12101B] border ${errors.email ? 'border-red-500' : 'border-[#232332]'} text-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50`}
                                    placeholder="name@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-400 text-xs ml-1">{errors.email}</p>}
                        </div>

                        {/* Mobile */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Mobile Number</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted"><Phone className="w-4 h-4" /></div>
                                <input
                                    type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required
                                    className={`w-full bg-[#12101B] border ${errors.mobile ? 'border-red-500' : 'border-[#232332]'} text-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50`}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            {errors.mobile && <p className="text-red-400 text-xs ml-1">{errors.mobile}</p>}
                        </div>

                        {/* DOB & Age */}
                        <div className="flex gap-3">
                            <div className="space-y-1 flex-[2]">
                                <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Date of Birth</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secure-textMuted"><Calendar className="w-4 h-4" /></div>
                                    <input
                                        type="date" name="dob" value={formData.dob} onChange={handleChange} required
                                        className={`w-full bg-[#12101B] border ${errors.dob ? 'border-red-500' : 'border-[#232332]'} text-white rounded-2xl py-3.5 pl-9 pr-2 focus:outline-none focus:border-secure-blue text-sm text-secure-textMuted`}
                                    />
                                </div>
                                {errors.dob && <p className="text-red-400 text-xs ml-1">{errors.dob}</p>}
                            </div>
                            <div className="space-y-1 flex-1">
                                <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Age</label>
                                <input
                                    type="number" name="age" value={formData.age} onChange={handleChange} required min="18"
                                    className={`w-full bg-[#12101B] border ${errors.age ? 'border-red-500' : 'border-[#232332]'} text-center text-white rounded-2xl py-3.5 px-2 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50`}
                                    placeholder="18+"
                                />
                                {errors.age && <p className="text-red-400 text-xs ml-1">{errors.age}</p>}
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted"><Lock className="w-4 h-4" /></div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className={`w-full bg-[#12101B] border ${errors.password ? 'border-red-500' : 'border-[#232332]'} text-white rounded-2xl py-3.5 pl-11 pr-11 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50`}
                                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secure-textMuted hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted"><Lock className="w-4 h-4" /></div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`w-full bg-[#12101B] border ${errors.confirmPassword ? 'border-red-500' : 'border-[#232332]'} text-white rounded-2xl py-3.5 pl-11 pr-11 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50`}
                                    placeholder="Re-enter password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secure-textMuted hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-400 text-xs ml-1">{errors.confirmPassword}</p>}
                        </div>

                        {/* UPI PIN Row */}
                        <div className="flex gap-3">
                            <div className="space-y-1 flex-1">
                                <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">UPI PIN</label>
                                <input
                                    type="password"
                                    name="upiPin"
                                    value={formData.upiPin}
                                    onChange={handleChange}
                                    required
                                    maxLength="6"
                                    pattern="\d{4,6}"
                                    className={`w-full bg-[#12101B] border ${errors.upiPin ? 'border-red-500' : 'border-[#232332]'} text-center text-white rounded-2xl py-3.5 px-2 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50`}
                                    placeholder="4-6 digits"
                                />
                                {errors.upiPin && <p className="text-red-400 text-xs ml-1">{errors.upiPin}</p>}
                            </div>
                            <div className="space-y-1 flex-1">
                                <label className="text-[9px] font-bold text-secure-textMuted tracking-widest uppercase ml-1">Confirm PIN</label>
                                <input
                                    type="password"
                                    name="confirmUpiPin"
                                    value={formData.confirmUpiPin}
                                    onChange={handleChange}
                                    required
                                    maxLength="6"
                                    pattern="\d{4,6}"
                                    className={`w-full bg-[#12101B] border ${errors.confirmUpiPin ? 'border-red-500' : 'border-[#232332]'} text-center text-white rounded-2xl py-3.5 px-2 focus:outline-none focus:border-secure-blue text-sm placeholder:text-secure-textMuted/50`}
                                    placeholder="Re-enter"
                                />
                                {errors.confirmUpiPin && <p className="text-red-400 text-xs ml-1">{errors.confirmUpiPin}</p>}
                            </div>
                        </div>

                        {errors.submit && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-2xl p-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {errors.submit}
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-secure-blue hover:bg-secure-blueHover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl py-4 flex items-center justify-center shadow-[0_4px_20px_rgba(26,33,255,0.3)] transition-all active:scale-[0.98]"
                            >
                                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                                <CheckCircle2 className="ml-2 w-4 h-4" />
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
