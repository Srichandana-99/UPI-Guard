import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Lock, AlertTriangle, ShieldCheck, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { getTransactionHistory } from '../lib/api'

export function History() {
    const [search, setSearch] = useState('')
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const { user } = useAuth()

    // Fetch transactions from backend
    useEffect(() => {
        const fetchTransactions = async () => {
            if (!user) return
            try {
                setLoading(true)
                const data = await getTransactionHistory(50)
                setTransactions(data)
            } catch (err) {
                console.error('Failed to load history:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchTransactions()
    }, [user])

    // Filter transactions
    const filteredTransactions = transactions.filter(txn => {
        const isSent = txn.sender_uid === user?.uid
        const isReceived = txn.recipient_uid === user?.uid
        
        console.log('Filtering transaction:', {
            txnId: txn.id,
            sender_uid: txn.sender_uid,
            recipient_uid: txn.recipient_uid,
            userUid: user?.uid,
            isSent,
            isReceived,
            filter
        });
        
        if (filter === 'sent') return isSent
        if (filter === 'received') return isReceived
        return true
    }).filter(txn => {
        if (!search) return true
        const searchLower = search.toLowerCase()
        return (
            (txn.recipient_upi && txn.recipient_upi.toLowerCase().includes(searchLower)) ||
            (txn.sender_upi && txn.sender_upi.toLowerCase().includes(searchLower)) ||
            (txn.transactionId && txn.transactionId.toLowerCase().includes(searchLower))
        )
    })

    console.log('Filtered transactions:', filteredTransactions);

    // Group by date
    const grouped = filteredTransactions.reduce((acc, curr) => {
        let date;
        try {
            if (curr.timestamp) {
                const timestamp = curr.timestamp.toDate ? curr.timestamp.toDate() : new Date(curr.timestamp);
                date = timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            } else {
                date = 'Unknown';
            }
        } catch (e) {
            date = 'Unknown';
        }
        
        if (!acc[date]) acc[date] = []
        acc[date].push(curr)
        return acc
    }, {})

    const getName = (txn) => {
        const isSent = txn.sender_uid === user?.uid
        if (isSent) {
            return txn.recipient_upi?.split('@')[0] || 'Unknown'
        }
        return txn.sender_upi?.split('@')[0] || 'Unknown'
    }

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-secure-blue animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center mb-6 pt-4">
                <h1 className="text-2xl font-extrabold tracking-tight">History</h1>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'sent', label: 'Sent' },
                    { key: 'received', label: 'Received' }
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                            filter === key
                                ? 'bg-secure-blue text-white'
                                : 'bg-[#1C1C26] text-secure-textMuted hover:text-white'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted">
                    <Search className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by UPI ID or transaction ID..."
                    className="w-full bg-[#12101B] border border-[#232332] text-white rounded-[2rem] py-3.5 pl-12 pr-4 focus:outline-none focus:border-secure-blue text-sm font-medium"
                />
            </div>

            {/* Transactions List */}
            <div className="space-y-6">
                {Object.keys(grouped).length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-[#1C1C26] rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Search className="w-8 h-8 text-secure-textMuted" />
                        </div>
                        <p className="text-secure-textMuted text-sm">No transactions found</p>
                    </div>
                ) : (
                    Object.keys(grouped).map(group => (
                        <div key={group}>
                            <h3 className="text-[10px] font-bold tracking-widest text-[#505068] uppercase mb-3 ml-2">{group}</h3>
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {grouped[group].map((txn, index) => {
                                        const isSent = txn.sender_uid === user?.uid
                                        const isReceived = txn.recipient_uid === user?.uid
                                        return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={txn.id || txn.transactionId}
                                            className="bg-[#12101B] border border-[#232332] rounded-2xl p-4 flex items-center gap-4 hover:bg-[#1A1825] transition-colors"
                                        >
                                            {/* Icon with type indicator */}
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                                txn.status === 'Blocked' 
                                                    ? 'bg-red-500/20' 
                                                    : isReceived
                                                        ? 'bg-green-500/20'
                                                        : 'bg-secure-blue/20'
                                            }`}>
                                                {txn.status === 'Blocked' ? (
                                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                                ) : isReceived ? (
                                                    <ArrowDownLeft className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <ArrowUpRight className="w-5 h-5 text-secure-blue" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-sm truncate capitalize">
                                                        {isSent ? 'To ' : 'From '}{getName(txn)}
                                                    </h4>
                                                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                        isSent
                                                            ? 'bg-secure-blue/10 text-secure-blue'
                                                            : 'bg-green-500/10 text-green-500'
                                                    }`}>
                                                        {isSent ? 'sent' : 'received'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-secure-textMuted">
                                                        {(() => {
                                                            try {
                                                                if (txn.timestamp) {
                                                                    const timestamp = txn.timestamp.toDate ? txn.timestamp.toDate() : new Date(txn.timestamp);
                                                                    return formatDistanceToNow(timestamp, { addSuffix: true });
                                                                }
                                                                return 'Unknown time';
                                                            } catch (e) {
                                                                return 'Unknown time';
                                                            }
                                                        })()}
                                                    </span>
                                                    {txn.status === 'Blocked' ? (
                                                        <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                                            <AlertTriangle className="w-2.5 h-2.5" /> Blocked
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-secure-blue bg-secure-blue/10 px-2 py-0.5 rounded-full border border-secure-blue/20">
                                                            <ShieldCheck className="w-2.5 h-2.5" /> {txn.status || 'completed'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`font-bold ${
                                                    txn.status === 'Blocked' 
                                                        ? 'text-secure-textMuted line-through' 
                                                        : isReceived
                                                            ? 'text-green-500'
                                                            : 'text-white'
                                                }`}>
                                                    {isReceived ? '+' : txn.status === 'Blocked' ? '' : '-'}
                                                    ₹{parseFloat(txn.amount).toLocaleString('en-IN')}
                                                </span>
                                                <div className={`w-2 h-2 rounded-full ${
                                                    txn.status === 'Blocked' ? 'bg-red-500' : isReceived ? 'bg-green-500' : 'bg-secure-blue'
                                                }`} />
                                            </div>
                                        </motion.div>
                                    )})}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Badge at end of scroll */}
            <div className="flex justify-center mt-8 pb-4">
                <div className="flex items-center gap-1.5 bg-[#05030A] border border-secure-blue hover:bg-secure-blue/10 px-4 py-1.5 rounded-full cursor-pointer transition-colors shadow-[0_0_15px_rgba(26,33,255,0.15)]">
                    <Lock className="w-3 h-3 text-secure-blue" />
                    <span className="text-[9px] font-bold tracking-widest text-secure-blue uppercase">Encryption Active</span>
                </div>
            </div>
        </div>
    )
}
