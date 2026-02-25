import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Copy, Plus, Shield, Send, Landmark, QrCode, User as UserIcon, CheckCircle2, AlertTriangle, ArrowDownToLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatDistanceToNow, parseISO } from 'date-fns'

export function Dashboard() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [transactions, setTransactions] = useState([])
    const [loadingTxns, setLoadingTxns] = useState(true)
    const [protectionActive, setProtectionActive] = useState(true)
    const [toastMessage, setToastMessage] = useState(null)

    const triggerToast = (msg) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(null), 2500)
    }

    const handleCopy = () => {
        if (upiId) {
            navigator.clipboard.writeText(upiId)
            triggerToast("UPI ID Copied")
        }
    }

    // Use data from backend session if available
    const balance = user?.balance ? user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null
    let initial = user?.name ? user.name.charAt(0).toUpperCase() : "U"
    let fullName = user?.name || null
    let upiId = user?.upi_id || null

    // Fetch transactions from our new API
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.email) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/transaction/history/${encodeURIComponent(user.email)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setTransactions(data.transactions);
                    }
                }
            } catch (err) {
                console.error("Failed to load history:", err);
            } finally {
                setLoadingTxns(false);
            }
        };
        fetchHistory();
    }, [user]);

    return (
        <div className="p-6 text-white min-h-full pb-20">

            {/* Top Bar: Profile & Notifications */}
            <div className="flex justify-between items-center mb-8 pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#FFD1A6] relative flex items-center justify-center p-0.5">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                            <span className="text-xl font-bold text-gray-800">{initial}</span>
                        </div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#05030A]"></div>
                    </div>
                    <div>
                        <p className="text-xs text-[#8A8A9E] font-medium tracking-wide">Welcome back,</p>
                        <h1 className="text-xl font-bold tracking-tight">{fullName || 'User'}</h1>
                    </div>
                </div>
                <button onClick={() => triggerToast("No new notifications")} className="w-10 h-10 rounded-full bg-[#12101B] flex items-center justify-center relative hover:bg-[#1C1C26] transition-colors">
                    <Bell className="w-5 h-5 text-white" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
            </div>

            {/* Main Balance Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full bg-gradient-to-b from-[#11111A] to-[#0A0A10] border border-[#1C1C26] rounded-3xl p-6 mb-6 shadow-xl relative overflow-hidden"
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-1">Available Balance</h3>
                        <h2 className="text-4xl font-extrabold tracking-tight">{balance ? `₹${balance}` : 'Loading...'}</h2>
                    </div>
                    <div className="bg-[#0D1A15] border border-[#14261E] rounded-lg py-1.5 px-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00D06C]" />
                        <span className="text-[9px] font-bold text-[#00D06C] tracking-wide uppercase">Verified<br />Account</span>
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-1.5">UPI ID</h3>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{upiId || 'Loading...'}</p>
                            {upiId && <button onClick={handleCopy} className="text-[#8A8A9E] hover:text-white"><Copy className="w-4 h-4" /></button>}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Real-time Protection Toggle Widget */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-full bg-[#11111A] border-2 border-secure-blue rounded-2xl p-4 mb-8 flex items-center justify-between shadow-[0_0_20px_rgba(26,33,255,0.1)]"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#05030A] flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-secure-blue" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white mb-0.5">Real-time Protection</h3>
                        <p className="text-[11px] text-[#8A8A9E] leading-tight pr-4">System active and monitoring transfers</p>
                    </div>
                </div>
                <div onClick={() => setProtectionActive(!protectionActive)} className="flex items-center gap-2 shrink-0 cursor-pointer">
                    <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${protectionActive ? 'text-secure-blue' : 'text-[#8A8A9E]'}`}>
                        {protectionActive ? 'Active' : 'Disabled'}
                    </span>
                    <div className={`w-10 h-6 rounded-full relative transition-colors ${protectionActive ? 'bg-secure-blue' : 'bg-[#232332]'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${protectionActive ? 'right-1' : 'left-1'}`}></div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h3 className="text-[11px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-4">Quick Actions</h3>
                <div className="grid grid-cols-4 gap-4">
                    {/* Send */}
                    <button onClick={() => navigate('/send')} className="bg-[#11111A] border border-[#1C1C26] rounded-3xl aspect-[4/5] flex flex-col items-center justify-center gap-3 hover:bg-[#161622] transition-colors">
                        <div className="w-10 h-10 bg-[#05030A] rounded-2xl flex items-center justify-center">
                            <Send className="w-5 h-5 text-secure-blue" />
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Send</span>
                    </button>
                    {/* Receive */}
                    <button onClick={() => navigate('/receive')} className="bg-[#11111A] border border-[#1C1C26] rounded-3xl aspect-[4/5] flex flex-col items-center justify-center gap-3 hover:bg-[#161622] transition-colors">
                        <div className="w-10 h-10 bg-[#05030A] rounded-2xl flex items-center justify-center">
                            <ArrowDownToLine className="w-5 h-5 text-secure-blue" />
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Receive</span>
                    </button>
                    {/* History */}
                    <button onClick={() => navigate('/history')} className="bg-[#11111A] border border-[#1C1C26] rounded-3xl aspect-[4/5] flex flex-col items-center justify-center gap-3 hover:bg-[#161622] transition-colors">
                        <div className="w-10 h-10 bg-[#05030A] rounded-2xl flex items-center justify-center">
                            <Landmark className="w-5 h-5 text-secure-blue" />
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">History</span>
                    </button>
                    {/* Scan QR */}
                    <button onClick={() => navigate('/scan')} className="bg-[#11111A] border border-[#1C1C26] rounded-3xl aspect-[4/5] flex flex-col items-center justify-center gap-3 hover:bg-[#161622] transition-colors">
                        <div className="w-10 h-10 bg-[#05030A] rounded-2xl flex items-center justify-center">
                            <QrCode className="w-5 h-5 text-secure-blue" />
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Scan</span>
                    </button>
                </div>
            </div>

            {/* Recents */}
            <div className="pb-10">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-[11px] font-bold text-[#8A8A9E] tracking-widest uppercase">Recents</h3>
                    <button onClick={() => navigate('/history')} className="text-[11px] font-bold text-secure-blue hover:text-blue-400">View All</button>
                </div>
                <div className="space-y-3">
                    {loadingTxns ? (
                        <div className="text-center py-4 text-[#8A8A9E] text-xs">Loading transactions...</div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-4 text-[#8A8A9E] text-xs bg-[#12101B] border border-[#1C1C26] rounded-2xl">No recent transactions</div>
                    ) : (
                        transactions.slice(0, 5).map((txn, idx) => {
                            const isFraud = txn.status === 'Blocked';
                            let iconObj = <UserIcon className="w-5 h-5 text-white" />;
                            if (isFraud) {
                                iconObj = <AlertTriangle className="w-5 h-5 text-red-500" />;
                            } else if (txn.receiver_upi_id.includes('merchant')) {
                                iconObj = <Landmark className="w-5 h-5 text-white" />
                            }

                            // Format relative time if date exists
                            let timeStr = "Just now";
                            try {
                                if (txn.date) {
                                    timeStr = formatDistanceToNow(parseISO(txn.date), { addSuffix: true })
                                }
                            } catch (e) { }

                            return (
                                <div key={txn.transaction_id || idx} className={`bg-[#12101B] border ${isFraud ? 'border-red-500/30' : 'border-[#1C1C26]'} rounded-2xl p-4 flex items-center gap-4 hover:bg-[#161622] transition-colors`}>
                                    <div className={`w-12 h-12 rounded-xl ${isFraud ? 'bg-red-500/10' : 'bg-[#1C1C26]'} flex items-center justify-center shrink-0`}>
                                        {iconObj}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-semibold text-sm truncate ${isFraud ? 'text-red-500' : 'text-white'}`}>
                                            {isFraud ? 'Fraud Blocked' : txn.receiver_upi_id.split('@')[0]}
                                        </h4>
                                        <p className="text-xs text-[#8A8A9E] mt-0.5 truncate">{timeStr}</p>
                                    </div>
                                    <span className={`font-bold tracking-wide ${isFraud ? 'text-red-500 line-through opacity-70' : 'text-white'}`}>
                                        -₹{parseFloat(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Custom Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-[#05030A] border rounded-2xl border-[#1C1C26] shadow-2xl py-3 px-5 z-50 flex items-center gap-3 w-[90%] max-w-[300px]"
                    >
                        <div className="w-8 h-8 rounded-full bg-secure-blue/20 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-secure-blue" />
                        </div>
                        <p className="text-sm font-semibold text-white truncate">{toastMessage}</p>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}
