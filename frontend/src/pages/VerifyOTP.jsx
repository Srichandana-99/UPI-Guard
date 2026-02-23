import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function VerifyOTP() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const code = otp.join('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: code })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Verification failed');

            navigate('/login'); // Redirect to login
        } catch (error) {
            console.error(error);
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
                    className="w-full bg-[#0A0713]/50 border border-[#1C1C26]/50 rounded-[2rem] p-8 shadow-2xl relative text-center"
                    style={{ backdropFilter: "blur(20px)" }}
                >
                    <div className="mb-8">
                        <h2 className="text-[1.75rem] leading-tight font-extrabold mb-2 tracking-tight">Verify OTP</h2>
                        <p className="text-secure-textMuted text-xs">Enter the 6-digit code sent to your mobile & email</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        <div className="flex justify-center gap-2">
                            {otp.map((data, index) => {
                                return (
                                    <input
                                        className="w-10 h-12 bg-[#12101B] border border-[#232332] text-white text-center rounded-xl focus:outline-none focus:border-secure-blue text-lg font-bold"
                                        type="text"
                                        name="otp"
                                        maxLength="1"
                                        key={index}
                                        value={data}
                                        onChange={e => handleChange(e.target, index)}
                                        onFocus={e => e.target.select()}
                                    />
                                );
                            })}
                        </div>

                        <p className="text-[10px] font-bold text-secure-textMuted tracking-widest uppercase">
                            Didn't receive code? <button type="button" className="text-secure-blue hover:text-blue-400">Resend</button>
                        </p>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || otp.join('').length < 6}
                                className="w-full bg-secure-blue hover:bg-secure-blueHover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl py-4 flex items-center justify-center shadow-[0_4px_20px_rgba(26,33,255,0.3)] transition-all active:scale-[0.98]"
                            >
                                <span>Verify & Create Account</span>
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
