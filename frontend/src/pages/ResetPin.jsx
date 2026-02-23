import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, ArrowLeft, AtSign, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export function ResetPin() {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            // Could navigate to OTP verification for reset
            navigate('/verify-otp');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#05030A] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">

            {/* Top Gradient Glow for visual effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-secure-blue/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-sm flex flex-col items-center flex-1 justify-center space-y-8 z-10 -mt-10">

                {/* Logo Section */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <div className="w-14 h-14 bg-[#0A0713] rounded-2xl border border-secure-blue/30 mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(26,33,255,0.2)]">
                        <Shield className="w-7 h-7 text-secure-blue" fill="currentColor" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">SecureUPI</h1>
                </motion.div>

                {/* Reset Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="w-full bg-[#0A0713]/80 border border-[#1C1C26] rounded-[2rem] p-8 pb-10 shadow-2xl relative"
                    style={{ backdropFilter: "blur(20px)" }}
                >
                    <div className="mb-8 text-center">
                        <h2 className="text-xl font-bold mb-2 tracking-tight">Reset Transaction PIN</h2>
                        <p className="text-[#8A8A9E] text-sm">Verify your identity to reset your PIN</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Input Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-white ml-1">
                                Mobile Number or Email
                            </label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
                                    <AtSign className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-white text-gray-900 font-medium rounded-full py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secure-blue/50 text-sm placeholder:text-gray-400"
                                    placeholder="e.g. +1 234 567 890"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !identifier}
                                className="w-full bg-[#0014FF] hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-full py-4 flex items-center justify-center transition-all active:scale-[0.98]"
                            >
                                <span>{loading ? 'Sending...' : 'Send Verification Code'}</span>
                                {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-medium text-[#0014FF] hover:text-blue-400 transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to login
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Footer Badges */}
            <div className="mt-auto pb-8 flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-[#505068] uppercase opacity-80 z-10">
                <Lock className="w-3 h-3 text-[#505068]" />
                <span>End-to-end encrypted</span>
            </div>
        </div>
    );
}
