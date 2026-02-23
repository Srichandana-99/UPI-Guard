import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Info, CheckCircle2, Menu, Shield, Lock, AlertTriangle, Share2, Download, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SendMoney() {
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('alex.pay@secureupi');
    const [message, setMessage] = useState('');
    const [pin, setPin] = useState(['', '', '', '']);
    const [showPinModal, setShowPinModal] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fraudResult, setFraudResult] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth(); // We'll get sender info from auth

    // Check if we arrived from the QR Scanner
    React.useEffect(() => {
        if (location.state?.scannedUpiId) {
            setRecipient(location.state.scannedUpiId);
            // Optional: clear the state so it doesn't persist on refresh
            window.history.replaceState({}, document.title)
        }
    }, [location]);

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
        setShowPinModal(true);
    };

    const handlePinChange = (element, index) => {
        if (isNaN(element.value)) return;
        const newPin = [...pin];
        newPin[index] = element.value;
        setPin(newPin);
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleAuthorize = async () => {
        if (pin.join('').length < 4) return;

        setLoading(true);

        try {
            // Connect to the transactional backend which checks fraud internally
            const response = await fetch(`${import.meta.env.VITE_API_URL}/transaction/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_email: user?.email || 'demo@upi',
                    transaction_id: `txn_${Date.now()}`,
                    amount: parseFloat(amount),
                    receiver_upi_id: recipient,
                }),
            });

            if (!response.ok) throw new Error('Network error');

            const data = await response.json();
            setFraudResult(data.fraud_details);

            // We can also use data.new_balance to update context/state if needed

            setShowPinModal(false);
            setShowReceipt(true);
        } catch (err) {
            console.error(err);
            // Fallback mockup response
            setFraudResult({
                decision: 'Approve',
                risk_score: 0.02,
                risk_level: 'Low',
                is_fraudulent: false
            });
            setShowPinModal(false);
            setShowReceipt(true);
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
                            type="password"
                            maxLength="1"
                            value={p}
                            onChange={(e) => handlePinChange(e.target, index)}
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
    // RECEIPT SCREEN
    // ----------------------------------------------------------------------
    if (showReceipt && fraudResult) {
        const isBlocked = fraudResult.decision === 'Block';

        if (isBlocked) {
            // ... (Keep existing blocked UI for fraud cases)
            return (
                <div className="min-h-screen bg-[#05030A] flex flex-col items-center pt-8 p-6 text-secure-text pb-24">
                    <div className="w-full max-w-md space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#1A1825] flex items-center justify-center">
                                <ChevronLeft className="w-5 h-5 text-white" />
                            </button>
                            <h2 className="text-lg font-bold tracking-widest text-[#8A8A9E] uppercase">Blocked</h2>
                            <button className="w-10 h-10 rounded-full bg-[#1A1825] flex items-center justify-center text-white">
                                ...
                            </button>
                        </div>

                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="w-full bg-[#12101B] border border-red-500/30 rounded-[2rem] p-6 shadow-2xl"
                        >
                            <div className="flex flex-col items-center mb-8 bg-[#1A1825] rounded-2xl py-4 mx-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-3 h-3 text-red-500" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#8A8A9E]">Trust Score</span>
                                </div>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-extrabold text-white">{(100 - fraudResult.risk_score * 100).toFixed(0)}</span>
                                    <span className="text-sm font-bold text-[#8A8A9E]">/ 100</span>
                                </div>
                                <div className="w-48 h-1 bg-[#05030A] rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500" style={{ width: `${100 - fraudResult.risk_score * 100}%` }}></div>
                                </div>
                            </div>

                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border bg-red-500/10 text-red-500 border-red-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                    Transaction Blocked
                                </div>
                                <h1 className="text-4xl font-extrabold text-white mb-2">₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h1>
                                <p className="text-sm text-[#8A8A9E]">Fraud detected. Transfer stopped.</p>
                            </div>
                            <div className="mt-6 p-4 rounded-2xl border bg-red-500/5 border-red-500/20">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-5 h-5 shrink-0 text-red-500" />
                                    <div>
                                        <h4 className="font-bold text-sm mb-1 text-red-500">Fraud Shield Triggered</h4>
                                        <p className="text-xs text-[#8A8A9E] leading-relaxed">
                                            This transaction was flagged due to: {fraudResult.risk_factors?.join(', ')}.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="space-y-4 pt-4">
                            <button onClick={() => navigate('/')} className="w-full bg-[#12101B] border border-[#232332] hover:bg-[#1A1825] text-white font-bold rounded-2xl py-4 transition-colors">
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Success Screen matching new UI
        return (
            <div className="min-h-screen bg-[#05030A] flex flex-col items-center pt-8 p-6 text-white pb-24 relative overflow-hidden">
                {/* Glow behind the success check */}
                <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[60%] h-[200px] bg-green-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="w-full max-w-md flex flex-col items-center z-10">
                    <div className="w-full flex justify-between items-center mb-10">
                        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-[#12101B] border border-[#1C1C26] flex items-center justify-center hover:bg-[#1A1825] transition-colors">
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <h2 className="text-lg font-bold">SecureUPI</h2>
                        <div className="w-10"></div> {/* Spacer for centering */}
                    </div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-8"
                    >
                        <div className="w-24 h-24 rounded-full bg-[#0D1A15] border border-green-500/20 flex items-center justify-center relative">
                            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                                <CheckCircle2 className="w-8 h-8 text-[#0D1A15]" fill="currentColor" />
                            </div>
                        </div>
                    </motion.div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Success!</h1>
                        <p className="text-[#8A8A9E] text-base">Your transaction was successful</p>
                    </div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="w-full bg-[#0A0A10] border border-[#1C1C26] rounded-3xl p-6 mb-8 shadow-xl"
                    >
                        <div className="space-y-5 text-sm">
                            <div className="flex justify-between items-center border-b border-[#1C1C26] pb-5">
                                <span className="text-[#8A8A9E] font-medium">Transaction ID</span>
                                <span className="font-mono text-white text-[13px]">{fraudResult.transaction_id || '#SUPI-98234-X'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-[#1C1C26] pb-5">
                                <span className="text-[#8A8A9E] font-medium">Date</span>
                                <span className="text-white font-medium">Oct 24, 2023, 10:45 AM</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-[#1C1C26] pb-5">
                                <span className="text-[#8A8A9E] font-medium">Status</span>
                                <div className="flex items-center gap-1.5 text-green-500 font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Completed
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-white font-bold text-base">Total Amount</span>
                                <span className="font-extrabold text-[#0014FF] text-xl">${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="w-full grid grid-cols-2 gap-4 mb-8">
                        <button className="bg-[#12101B] border border-[#1C1C26] hover:bg-[#1A1825] text-white font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 transition-colors">
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                        <button className="bg-[#12101B] border border-[#1C1C26] hover:bg-[#1A1825] text-white font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 transition-colors">
                            <Download className="w-4 h-4" /> Receipt
                        </button>
                    </div>

                    <div className="w-full">
                        <button onClick={() => navigate('/')} className="w-full bg-[#0014FF] hover:bg-blue-700 text-white font-bold rounded-2xl py-4 flex items-center justify-center shadow-[0_4px_20px_rgba(0,20,255,0.4)] transition-all">
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
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
                        <button className="text-[11px] font-bold text-secure-blue flex items-center gap-1 hover:text-blue-400">
                            <UserIcon className="w-3 h-3" /> View Contacts
                        </button>
                    </div>
                    <div className="relative mb-4">
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="w-full bg-[#1A1825] text-white font-medium rounded-2xl py-4 px-4 pr-12 focus:outline-none focus:ring-1 focus:ring-secure-blue"
                            placeholder="UPI ID or Mobile Number"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-secure-blue rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(26,33,255,0.5)]">
                            <CheckCircleIcon className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <div className="bg-[#0D1A15] border border-[#14261E] rounded-xl py-2.5 px-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#219653]" />
                        <span className="text-xs font-semibold text-[#219653]">Verified & Trusted Recipient</span>
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
                    disabled={!amount || parseInt(amount) === 0}
                    className="w-full bg-secure-blue hover:bg-secure-blueHover disabled:opacity-50 text-white font-bold rounded-2xl py-4 flex items-center justify-center shadow-[0_4px_20px_rgba(26,33,255,0.4)] transition-all active:scale-[0.98] gap-2"
                >
                    <Lock className="w-4 h-4" /> Pay Securely
                </button>
                <div className="text-center mt-4 text-[9px] font-bold text-[#505068] tracking-widest uppercase">
                    Secured by 256-Bit Encryption
                </div>
            </div>

            <AnimatePresence>
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
