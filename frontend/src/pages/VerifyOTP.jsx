import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowRight, CheckCircle, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function VerifyOTP() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [resending, setResending] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const inputRefs = useRef([]);

    useEffect(() => {
        let timer;
        if (resendCountdown > 0 && !canResend) {
            timer = setTimeout(() => {
                setResendCountdown(prev => prev - 1);
            }, 1000);
        } else if (resendCountdown === 0) {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [resendCountdown, canResend]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;
        if (error) setError(false);
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
        if (element.value && index < 5) {
            element.nextSibling?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = pastedData.split('').concat(Array(6).fill('').slice(pastedData.length));
            setOtp(newOtp);
            const focusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleResend = async () => {
        if (!canResend || resending) return;
        setResending(true);
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
        } catch (err) {
            console.error('Resend OTP failed:', err);
        } finally {
            setResending(false);
            setCanResend(false);
            setResendCountdown(30);
            setOtp(['', '', '', '', '', '']);
            setError(false);
            inputRefs.current[0]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading || success) return;
        setLoading(true);
        setError(false);
        const code = otp.join('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: code })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Verification failed');
            if (!data.user) throw new Error('No user returned');

            // Save user and redirect to dashboard
            localStorage.setItem('user', JSON.stringify(data.user));
            setSuccess(true);
            setLoading(false);
            setTimeout(() => navigate('/'), 2500);
        } catch (error) {
            setLoading(false);
            setError(true);
            setTimeout(() => {
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }, 500);
        }
    };

    const checkmarkVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: { type: "spring", stiffness: 200, damping: 15, duration: 0.6 }
        }
    };

    const containerVariants = {
        shake: {
            x: [0, -8, 8, -8, 8, 0],
            transition: { duration: 0.4 }
        }
    };

    return (
        <div className="min-h-screen bg-secure-bg flex flex-col items-center justify-center p-6 text-secure-text relative overflow-hidden">
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-secure-bg z-50 flex flex-col items-center justify-center"
                    >
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-3 h-3 rounded-full"
                                style={{
                                    backgroundColor: ['#1A21FF', '#00D06C', '#FFD1A6', '#fff'][i % 4],
                                    left: `${Math.random() * 100}%`,
                                    top: -20,
                                }}
                                animate={{
                                    y: [0, 1000],
                                    x: [0, (Math.random() - 0.5) * 200],
                                    rotate: [0, 360],
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    ease: "easeOut",
                                    delay: Math.random() * 0.5,
                                }}
                            />
                        ))}
                        <motion.div variants={checkmarkVariants} initial="hidden" animate="visible" className="relative">
                            <div className="w-24 h-24 bg-[#00D06C] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,208,108,0.4)]">
                                <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
                            </div>
                            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.3 }} className="absolute -top-2 -right-2">
                                <Sparkles className="w-8 h-8 text-[#FFD1A6]" />
                            </motion.div>
                        </motion.div>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 text-2xl font-bold text-white">Verified Successfully!</motion.h2>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-2 text-secure-textMuted">Redirecting to login...</motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full max-w-sm flex flex-col items-center flex-1 justify-center space-y-8 mt-6 relative z-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <motion.div
                        className="w-12 h-12 bg-secure-blue rounded-full mb-3 flex items-center justify-center shadow-[0_0_20px_rgba(26,33,255,0.4)]"
                        animate={error ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                        transition={{ duration: 0.4 }}
                    >
                        <Shield className="w-6 h-6 text-white" fill="currentColor" />
                    </motion.div>
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
                        {email && <p className="mt-2 text-secure-blue text-xs font-medium">{email}</p>}
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                className="mb-4 flex items-center justify-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-4"
                            >
                                <AlertCircle className="w-4 h-4" />
                                <span>Invalid OTP. Please try again.</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        <motion.div
                            className="flex justify-center gap-2"
                            variants={containerVariants}
                            animate={error ? "shake" : ""}
                        >
                            {otp.map((data, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <input
                                        ref={el => inputRefs.current[index] = el}
                                        className={`w-10 h-12 bg-[#12101B] border-2 text-white text-center rounded-xl focus:outline-none focus:border-secure-blue text-lg font-bold transition-all duration-200 ${error ? 'border-red-500 animate-pulse' : data ? 'border-secure-blue' : 'border-[#232332]'
                                            }`}
                                        type="text"
                                        name="otp"
                                        maxLength="1"
                                        value={data}
                                        onChange={e => handleChange(e.target, index)}
                                        onKeyDown={e => handleKeyDown(e, index)}
                                        onPaste={handlePaste}
                                        onFocus={e => e.target.select()}
                                        disabled={loading || success}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>

                        <div className="space-y-2">
                            <AnimatePresence mode="wait">
                                {!canResend ? (
                                    <motion.div
                                        key="countdown"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center justify-center gap-2 text-secure-textMuted text-xs"
                                    >
                                        <span>Resend code in</span>
                                        <motion.span
                                            key={resendCountdown}
                                            initial={{ scale: 1.2, color: '#1A21FF' }}
                                            animate={{ scale: 1, color: '#8A8A9E' }}
                                            className="font-bold text-secure-blue min-w-[20px]"
                                        >
                                            {resendCountdown}s
                                        </motion.span>
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        key="resend"
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resending}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-xs font-bold text-secure-blue hover:text-blue-400 flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                                    >
                                        {resending ? (
                                            <>
                                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                                    <RotateCcw className="w-4 h-4" />
                                                </motion.div>
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <RotateCcw className="w-4 h-4" />
                                                <span>Resend Code</span>
                                            </>
                                        )}
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="pt-2">
                            <motion.button
                                type="submit"
                                disabled={loading || success || otp.join('').length < 6}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-secure-blue hover:bg-secure-blueHover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl py-4 flex items-center justify-center shadow-[0_4px_20px_rgba(26,33,255,0.3)] transition-all relative overflow-hidden"
                            >
                                {loading ? (
                                    <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                                        <span>Verifying...</span>
                                    </motion.div>
                                ) : (
                                    <>
                                        <span>Verify & Create Account</span>
                                        <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </motion.div>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
