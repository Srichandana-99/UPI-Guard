import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Info, CheckCircle2, Menu, Shield, Lock, AlertTriangle, Share2, Download, ArrowLeft, XCircle, User, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserLocation, initiateTransaction, checkSuspiciousAccount } from '../lib/api'

export function SendMoney() {
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientVerified, setRecipientVerified] = useState(false);
    const [recipientSuspicious, setRecipientSuspicious] = useState(false);
    const [suspiciousData, setSuspiciousData] = useState(null);
    const [validatingUPI, setValidatingUPI] = useState(false);
    const [upiError, setUpiError] = useState('');
    const [message, setMessage] = useState('');
    const [pin, setPin] = useState(['', '', '', '']);
    const [showPinModal, setShowPinModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failed', 'fraud', null
    const [loading, setLoading] = useState(false);
    const [fraudResult, setFraudResult] = useState(null);
    const [transactionData, setTransactionData] = useState(null);
    const [showFraudConfirm, setShowFraudConfirm] = useState(false);
    const inputRefs = React.useRef([]);

    const navigate = useNavigate();
    const location = useLocation();
    const { user, refreshUser } = useAuth();

    // Check if we arrived from the QR Scanner
    React.useEffect(() => {
        if (location.state?.scannedUpiId) {
            setRecipient(location.state.scannedUpiId);
            validateRecipient(location.state.scannedUpiId);
            window.history.replaceState({}, document.title)
        }
    }, [location]);

    // Validate UPI ID when recipient changes (with debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (recipient && recipient.length > 5) {
                validateRecipient(recipient);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [recipient]);

    // Auto-focus first PIN input when modal opens
    useEffect(() => {
        if (showPinModal && inputRefs.current[0]) {
            // Small delay to allow modal animation to start
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [showPinModal]);

    const validateRecipient = async (upiId) => {
        if (!upiId || upiId.length < 5) return

        setValidatingUPI(true)
        setUpiError('')
        setRecipientSuspicious(false)
        setSuspiciousData(null)

        // Client cannot read other users due to Firestore rules; validate format only.
        const ok = /^[a-zA-Z0-9._-]{3,}@[a-zA-Z0-9._-]{2,}$/.test(upiId)
        if (!ok) {
            setRecipientVerified(false)
            setRecipientName('')
            setUpiError('Invalid UPI ID format')
            setValidatingUPI(false)
            return
        }

        // Check if account is suspicious
        try {
            console.log('🔍 Checking suspicious account for:', upiId);
            const suspiciousCheck = await checkSuspiciousAccount(upiId);
            console.log('📊 Suspicious check result:', suspiciousCheck);
            
            if (suspiciousCheck.exists && suspiciousCheck.suspicious) {
                console.log('🚨 SUSPICIOUS ACCOUNT DETECTED!');
                setRecipientSuspicious(true);
                setSuspiciousData(suspiciousCheck);
                setRecipientName(suspiciousCheck.name);
            } else if (suspiciousCheck.exists) {
                console.log('✅ Account exists but not suspicious');
                setRecipientName(suspiciousCheck.name);
            } else {
                console.log('❓ Account not found in database');
                setRecipientName(upiId.split('@')[0]);
            }
        } catch (error) {
            console.error('❌ Error checking suspicious account:', error);
            setRecipientName(upiId.split('@')[0]);
        }

        setRecipientVerified(true)
        setValidatingUPI(false)
    }

    const handleAmountChange = (e) => {
        // Only allow numbers
        const val = e.target.value.replace(/[^0-9]/g, '');
        setAmount(val);
    };

    const addAmount = (add) => {
        const current = parseInt(amount || 0);
        setAmount((current + add).toString());
    };

    const initiatePayment = () => {
        if (!amount || parseInt(amount) <= 0) return;
        if (!recipientVerified) {
            setUpiError('Please enter a valid UPI ID');
            return;
        }
        // If recipient is suspicious, show confirmation first
        if (recipientSuspicious) {
            setShowFraudConfirm(true);
            return;
        }
        setShowPinModal(true);
    };

    const handlePinChange = (index, value) => {
        if (value && !/^\d*$/.test(value)) return;
        
        const newPin = [...pin];
        // Only take the last character if multiple digits pasted
        newPin[index] = value.slice(-1);
        setPin(newPin);
        
        // Auto-advance to next field if current is filled
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    
    const handlePinKeyDown = (index, e) => {
        // Move to previous field on backspace if current is empty
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };
    
    const handlePinPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        if (pastedData) {
            const newPin = [...pin];
            pastedData.split('').forEach((digit, i) => {
                if (i < 4) newPin[i] = digit;
            });
            setPin(newPin);
            // Focus the appropriate field after paste
            const focusIndex = Math.min(pastedData.length, 3);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleAuthorize = async () => {
        if (pin.join('').length < 4) return;

        setLoading(true);

        try {
            const transactionAmount = parseFloat(amount);
            const loc = await getUserLocation().catch(() => ({ latitude: 0, longitude: 0 }))

            // Call backend API to initiate transaction
            const result = await initiateTransaction({
                recipient_upi: recipient,
                amount: transactionAmount,
                latitude: loc.latitude ?? 0,
                longitude: loc.longitude ?? 0,
                transaction_pin: pin.join('')
            })

            if (result?.is_fraud) {
                setPaymentStatus('fraud')
                setTransactionData({
                    amount: transactionAmount,
                    recipient: recipientName || recipient,
                    recipientUpi: recipient,
                    transactionId: result.transaction_id,
                    date: new Date().toLocaleString()
                })
                setFraudResult(result)
                setShowPinModal(false)
                return
            }

            if (!result?.success) {
                throw new Error(result?.error || 'Transaction failed')
            }

            setTransactionData({
                amount: transactionAmount,
                recipient: recipientName,
                recipientUpi: recipient,
                transactionId: result.transaction_id,
                date: new Date().toLocaleString(),
            });

            setPaymentStatus('success');
            setShowPinModal(false);
            
            // Refresh user balance
            if (refreshUser) {
                await refreshUser();
            }
        } catch (err) {
            console.error('Transaction error:', err);
            setPaymentStatus('failed');
            setTransactionData({
                amount: parseFloat(amount),
                recipient: recipientName || recipient,
                recipientUpi: recipient,
                error: err.message || 'Transaction failed'
            });
            setShowPinModal(false);
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------------------------
    // PIN MODAL
    // ----------------------------------------------------------------------
    const PinModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05030A]/80 backdrop-blur-sm p-6 overflow-hidden max-w-md mx-auto">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full bg-[#12101B] border border-[#232332] rounded-[2rem] p-8 shadow-2xl relative text-center"
            >
                <button className="absolute top-4 right-4 text-secure-textMuted" onClick={() => setShowPinModal(false)}>
                    <div className="w-8 h-8 rounded-full bg-[#1A1825] flex items-center justify-center">X</div>
                </button>

                <div className="w-16 h-16 bg-[#1A1825] rounded-full mx-auto flex items-center justify-center mb-6 mt-4">
                    <MessageSquareIcon className="w-8 h-8 text-secure-blue" />
                </div>

                <h3 className="text-2xl font-bold mb-2 tracking-tight text-white">Enter Transaction PIN</h3>
                <p className="text-secure-textMuted text-sm mb-8 px-2">
                    Please enter your 4-digit secure PIN to authorize this transaction and check your balance.
                </p>

                <div className="flex justify-center gap-3 mb-10">
                    {pin.map((p, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="password"
                            maxLength="1"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={p}
                            onChange={(e) => handlePinChange(index, e.target.value)}
                            onKeyDown={(e) => handlePinKeyDown(index, e)}
                            onPaste={handlePinPaste}
                            onFocus={(e) => e.target.select()}
                            className="w-14 h-16 bg-white text-black text-center text-3xl font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-secure-blue"
                        />
                    ))}
                </div>

                <button
                    onClick={handleAuthorize}
                    disabled={loading || pin.join('').length < 4}
                    className="w-full bg-secure-blue hover:bg-secure-blueHover disabled:opacity-50 text-white font-semibold rounded-2xl py-4 flex items-center justify-center transition-all"
                >
                    {loading ? 'Processing...' : 'Authorize & Pay'}
                </button>
            </motion.div>
        </div>
    );

    // ----------------------------------------------------------------------
    // FRAUD CONFIRMATION MODAL
    // ----------------------------------------------------------------------
    const FraudConfirmModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05030A]/90 backdrop-blur-sm p-6 overflow-hidden max-w-md mx-auto">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full bg-[#12101B] border-2 border-red-500/50 rounded-[2rem] p-8 shadow-2xl relative text-center"
            >
                <div className="w-20 h-20 bg-red-500/20 rounded-full mx-auto flex items-center justify-center mb-6">
                    <Shield className="w-10 h-10 text-red-500" />
                </div>

                <h3 className="text-2xl font-bold mb-3 tracking-tight text-white">⚠️ High Risk Warning</h3>
                
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-left">
                    <p className="text-red-400 text-sm font-semibold mb-2">
                        This recipient has been flagged as suspicious:
                    </p>
                    <ul className="text-red-300 text-xs space-y-1 list-disc pl-4">
                        <li>Fraud Rate: {suspiciousData?.fraud_stats?.fraud_rate || 'High'}%</li>
                        <li>Blocked Transactions: {suspiciousData?.fraud_stats?.blocked_count || 'Multiple'}</li>
                        <li>Account Status: High Risk</li>
                    </ul>
                </div>

                <p className="text-secure-textMuted text-sm mb-6">
                    Sending money to this account is <strong className="text-red-400">NOT RECOMMENDED</strong>. 
                    Your transaction may result in loss of funds.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => {
                            setShowFraudConfirm(false);
                            setShowPinModal(true);
                        }}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl py-4 flex items-center justify-center transition-all"
                    >
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        I Understand - Proceed Anyway
                    </button>
                    
                    <button
                        onClick={() => setShowFraudConfirm(false)}
                        className="w-full bg-[#1A1825] border border-[#232332] hover:bg-[#232332] text-white font-semibold rounded-2xl py-4 transition-all"
                    >
                        Cancel Transaction
                    </button>
                </div>
            </motion.div>
        </div>
    );

    // ----------------------------------------------------------------------
    // PAYMENT STATUS SCREENS (Success / Failed / Fraud)
    // ----------------------------------------------------------------------
    if (paymentStatus) {
        // SUCCESS SCREEN
        if (paymentStatus === 'success') {
            return (
                <div className="min-h-screen bg-[#05030A] flex flex-col items-center pt-8 p-6 text-white pb-24 relative overflow-hidden">
                    {/* Confetti animation */}
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: ['#1A21FF', '#00D06C', '#FFD1A6'][i % 3],
                                left: `${Math.random() * 100}%`,
                                top: -10,
                            }}
                            animate={{
                                y: [0, 800],
                                x: [0, (Math.random() - 0.5) * 150],
                                rotate: [0, 360],
                            }}
                            transition={{
                                duration: 2 + Math.random() * 1.5,
                                ease: "easeOut",
                                delay: Math.random() * 0.3,
                            }}
                        />
                    ))}
                    
                    <div className="w-full max-w-md flex flex-col items-center z-10">
                        <div className="w-full flex justify-between items-center mb-10">
                            <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-[#12101B] border border-[#1C1C26] flex items-center justify-center hover:bg-[#1A1825] transition-colors">
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <h2 className="text-lg font-bold">Payment Successful</h2>
                            <div className="w-10"></div>
                        </div>

                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="mb-8"
                        >
                            <div className="w-28 h-28 rounded-full bg-[#00D06C] flex items-center justify-center shadow-[0_0_40px_rgba(0,208,108,0.4)]">
                                <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={3} />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center mb-8"
                        >
                            <h1 className="text-4xl font-extrabold mb-2">₹{parseFloat(transactionData?.amount || 0).toLocaleString('en-IN')}</h1>
                            <p className="text-[#8A8A9E]">Sent to {transactionData?.recipient}</p>
                        </motion.div>

                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="w-full bg-[#0A0A10] border border-[#1C1C26] rounded-3xl p-6 mb-8"
                        >
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#8A8A9E]">Transaction ID</span>
                                    <span className="font-mono text-white">{transactionData?.transactionId?.slice(-12)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#8A8A9E]">To</span>
                                    <span className="text-white">{transactionData?.recipientUpi}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#8A8A9E]">Date</span>
                                    <span className="text-white">{transactionData?.date}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-[#1C1C26]">
                                    <span className="text-white font-bold">Status</span>
                                    <div className="flex items-center gap-1.5 text-[#00D06C] font-semibold">
                                        <span className="w-2 h-2 rounded-full bg-[#00D06C]"></span>
                                        Completed
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            onClick={() => navigate('/history')}
                            className="w-full bg-[#0014FF] hover:bg-blue-700 text-white font-bold rounded-2xl py-4"
                        >
                            View in History
                        </motion.button>
                    </div>
                </div>
            );
        }

        // FAILURE SCREEN
        if (paymentStatus === 'failed') {
            return (
                <div className="min-h-screen bg-[#05030A] flex flex-col items-center pt-8 p-6 text-white pb-24">
                    <div className="w-full max-w-md flex flex-col items-center z-10">
                        <div className="w-full flex justify-between items-center mb-10">
                            <button onClick={() => setPaymentStatus(null)} className="w-10 h-10 rounded-full bg-[#12101B] border border-[#1C1C26] flex items-center justify-center">
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <h2 className="text-lg font-bold">Payment Failed</h2>
                            <div className="w-10"></div>
                        </div>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="mb-8"
                        >
                            <div className="w-28 h-28 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                                <XCircle className="w-14 h-14 text-white" strokeWidth={3} />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center mb-8"
                        >
                            <h1 className="text-3xl font-extrabold mb-2 text-red-400">Payment Failed</h1>
                            <p className="text-[#8A8A9E]">{transactionData?.error || 'Something went wrong'}</p>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8"
                        >
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                                <div>
                                    <h4 className="font-bold text-sm mb-1 text-red-400">Transaction Not Completed</h4>
                                    <p className="text-xs text-[#8A8A9E]">No money was deducted from your account. Please try again.</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            onClick={() => setPaymentStatus(null)}
                            className="w-full bg-[#12101B] border border-[#232332] hover:bg-[#1A1825] text-white font-bold rounded-2xl py-4"
                        >
                            Try Again
                        </motion.button>
                    </div>
                </div>
            );
        }

        // FRAUD BLOCKED SCREEN
        if (paymentStatus === 'fraud') {
            return (
                <div className="min-h-screen bg-[#05030A] flex flex-col items-center pt-8 p-6 text-white pb-24">
                    <div className="w-full max-w-md space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-[#1A1825] flex items-center justify-center">
                                <ChevronLeft className="w-5 h-5 text-white" />
                            </button>
                            <h2 className="text-lg font-bold tracking-widest text-[#8A8A9E] uppercase">Blocked</h2>
                            <div className="w-10"></div>
                        </div>

                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="w-full bg-[#12101B] border border-red-500/30 rounded-[2rem] p-6 shadow-2xl"
                        >
                            <div className="flex flex-col items-center mb-8 bg-[#1A1825] rounded-2xl py-4 mx-4">
                                <Shield className="w-8 h-8 text-red-500 mb-2" />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-[#8A8A9E]">AI Fraud Shield</span>
                            </div>

                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border bg-red-500/10 text-red-500 border-red-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                    Transaction Blocked
                                </div>
                                <h1 className="text-4xl font-extrabold text-white mb-2">₹{parseFloat(transactionData?.amount || 0).toLocaleString('en-IN')}</h1>
                                <p className="text-sm text-[#8A8A9E]">Fraud detected. Transfer stopped.</p>
                            </div>

                            <div className="mt-6 p-4 rounded-2xl border bg-red-500/5 border-red-500/20">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-5 h-5 shrink-0 text-red-500" />
                                    <div>
                                        <h4 className="font-bold text-sm mb-1 text-red-500">Fraud Detected</h4>
                                        <p className="text-xs text-[#8A8A9E] leading-relaxed">
                                            This transaction was flagged by our AI fraud detection system. Your money is safe.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <button onClick={() => navigate('/')} className="w-full bg-[#12101B] border border-[#232332] hover:bg-[#1A1825] text-white font-bold rounded-2xl py-4 transition-colors">
                            Back to Home
                        </button>
                    </div>
                </div>
            );
        }
    }

    // ----------------------------------------------------------------------
    // SEND MONEY UI
    // ----------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-secure-bg text-secure-text p-6 max-w-md mx-auto relative flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-[#12101B] border border-[#232332] rounded-full flex items-center justify-center hover:bg-[#1A1825] transition-colors">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-lg font-bold">Send Money</h1>
                <button className="w-10 h-10 bg-[#12101B] border border-[#232332] rounded-full flex items-center justify-center hover:bg-[#1A1825] transition-colors text-secure-textMuted">
                    <Info className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6 flex-1">

                {/* Recipient Block */}
                <div className="bg-[#12101B] border border-[#232332] rounded-3xl p-5 shadow-lg">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-secure-textMuted tracking-widest uppercase">To Recipient</span>
                    </div>
                    <div className="relative mb-3">
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className={`w-full bg-[#1A1825] text-white font-medium rounded-2xl py-4 px-4 pr-12 focus:outline-none focus:ring-2 transition-all ${
                                recipientVerified 
                                    ? 'border-2 border-green-500 focus:ring-green-500/50' 
                                    : upiError 
                                        ? 'border-2 border-red-500 focus:ring-red-500/50'
                                        : 'border-2 border-transparent focus:ring-secure-blue'
                            }`}
                            placeholder="Enter UPI ID (e.g., name@secureupi)"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {validatingUPI ? (
                                <Loader2 className="w-5 h-5 text-secure-blue animate-spin" />
                            ) : recipientVerified ? (
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                            ) : upiError ? (
                                <XCircle className="w-5 h-5 text-red-500" />
                            ) : null}
                        </div>
                    </div>
                    
                    {/* Recipient validation status */}
                    {recipientVerified && recipientName && !recipientSuspicious && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-500/10 border border-green-500/20 rounded-xl py-2.5 px-3 flex items-center gap-2 mb-3"
                        >
                            <User className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-semibold text-green-400">{recipientName}</span>
                        </motion.div>
                    )}
                    
                    {/* Suspicious account warning */}
                    {recipientSuspicious && suspiciousData && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border-2 border-red-500/50 rounded-xl py-3 px-3 mb-3"
                        >
                            <div className="flex items-start gap-2 mb-2">
                                <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold text-red-500">⚠️ SUSPICIOUS ACCOUNT</span>
                                    </div>
                                    <p className="text-xs text-red-400 font-semibold mb-2">{recipientName}</p>
                                    <div className="text-[10px] text-red-300 space-y-1">
                                        <div>• Fraud Rate: {suspiciousData.fraud_stats?.fraud_rate}%</div>
                                        <div>• Blocked Transactions: {suspiciousData.fraud_stats?.blocked_count}</div>
                                        <div>• Total Transactions: {suspiciousData.fraud_stats?.total_transactions}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-red-500/20 rounded-lg py-2 px-2.5 text-[10px] text-red-200 font-semibold">
                                ⚠️ This account has a history of fraudulent activity. Proceed with caution!
                            </div>
                        </motion.div>
                    )}
                    
                    {upiError && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-xl py-2.5 px-3 flex items-center gap-2 mb-3"
                        >
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-semibold text-red-400">{upiError}</span>
                        </motion.div>
                    )}
                    
                    <div className={`rounded-xl py-2.5 px-3 flex items-center gap-2 ${
                        recipientVerified 
                            ? 'bg-green-500/10 border border-green-500/20' 
                            : 'bg-[#0D1A15] border border-[#14261E]'
                    }`}>
                        <CheckCircle2 className={`w-4 h-4 ${recipientVerified ? 'text-green-500' : 'text-[#8A8A9E]'}`} />
                        <span className={`text-xs font-semibold ${recipientVerified ? 'text-green-400' : 'text-[#8A8A9E]'}`}>
                            {recipientVerified ? 'Verified Recipient' : 'Enter recipient UPI ID'}
                        </span>
                    </div>
                </div>

                {/* Amount Block */}
                <div className="bg-[#12101B] border border-[#232332] rounded-3xl p-6 shadow-lg text-center">
                    <span className="text-[10px] font-bold text-secure-textMuted tracking-widest uppercase mb-4 block">Transaction Amount</span>

                    <div className="flex items-center justify-center gap-2 mb-8">
                        <span className="text-4xl text-[#505068]">₹</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="0"
                            className="bg-transparent text-5xl font-extrabold text-white text-center w-3/4 outline-none placeholder:text-[#232332]"
                        />
                    </div>

                    <div className="flex justify-center gap-3">
                        <button onClick={() => addAmount(100)} className="bg-[#1A1825] border border-[#2A2A38] text-white text-sm font-semibold rounded-full py-2 px-5 hover:bg-[#232332] transition-colors">+₹100</button>
                        <button onClick={() => addAmount(500)} className="bg-[#1A1825] border border-[#2A2A38] text-white text-sm font-semibold rounded-full py-2 px-5 hover:bg-[#232332] transition-colors">+₹500</button>
                        <button onClick={() => addAmount(1000)} className="bg-[#1A1825] border border-[#2A2A38] text-white text-sm font-semibold rounded-full py-2 px-5 hover:bg-[#232332] transition-colors">+₹1,000</button>
                    </div>
                </div>

                {/* Optional Message */}
                <div className="bg-[#12101B] border border-[#232332] rounded-2xl relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted">
                        <Menu className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a message (Optional)"
                        className="w-full bg-transparent text-sm font-medium text-white py-4 pl-12 pr-4 focus:outline-none"
                    />
                </div>

            </div>

            <div className="mt-8 mb-4">
                <button
                    onClick={initiatePayment}
                    disabled={!amount || parseInt(amount) === 0 || !recipientVerified}
                    className="w-full bg-secure-blue hover:bg-secure-blueHover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-4 flex items-center justify-center shadow-[0_4px_20px_rgba(26,33,255,0.4)] transition-all active:scale-[0.98] gap-2"
                >
                    <Lock className="w-4 h-4" />
                    {!recipientVerified ? 'Enter Valid UPI ID' : !amount ? 'Enter Amount' : 'Pay Securely'}
                </button>
                <div className="text-center mt-4 text-[9px] font-bold text-[#505068] tracking-widest uppercase">
                    Secured by 256-Bit Encryption
                </div>
            </div>

            <AnimatePresence>
                {showFraudConfirm && <FraudConfirmModal />}
                {showPinModal && <PinModal />}
            </AnimatePresence>
        </div>
    );
}

// Sub-components helper icons
const CheckCircleIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
)

const MessageSquareIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"></path>
    </svg>
)

const UserIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
)

const CopyIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
    </svg>
)
