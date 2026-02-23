import React, { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, Shield, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export function Transactions() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('All')
    const [allTransactions, setAllTransactions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/transactions`)
                if (res.ok) {
                    const data = await res.json()
                    if (data.success) {
                        setAllTransactions(data.transactions)
                    }
                }
            } catch (err) {
                console.error("Failed to fetch admin transactions:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchTransactions()
    }, [])



    const filtered = allTransactions.filter(t => {
        const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.receiver.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
        return matchesSearch && matchesStatus;
    })

    return (
        <div className="p-6 text-white min-h-full pb-20 max-w-7xl mx-auto">
            {/* Header section matching Dashboard style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pt-2 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0F0D1A] rounded-2xl flex items-center justify-center shadow-inner border border-[#1C1C26]">
                        <Clock className="w-6 h-6 text-[#1A4BFF]" fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Recent Transactions</h1>
                        <p className="text-[11px] text-[#8A8A9E] mt-0.5 tracking-wide">Live Feed • Last 24 Hours</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-auto px-4 h-10 rounded-xl bg-[#1A4BFF] hover:bg-[#1238D6] font-bold text-sm shadow-[0_4px_15px_rgba(26,75,255,0.3)] transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9E]" />
                    <input
                        placeholder="Search by ID, Name or UPI..."
                        className="w-full bg-[#0A0A10] border border-[#1C1C26] text-white rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:border-[#3388FF] transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex bg-[#0A0A10] border border-[#1C1C26] rounded-xl p-1 shrink-0 overflow-x-auto hide-scrollbar">
                    {['All', 'Completed', 'Reviewing', 'Blocked'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                                filterStatus === status
                                    ? "bg-[#1A2C4D] text-[#3388FF] shadow-inner border border-[#2A447A]"
                                    : "text-[#8A8A9E] hover:text-white"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions Live Feed Table */}
            <div className="bg-[#0A0A10] border border-[#1C1C26] rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#1C1C26] bg-[#0F0D1A]">
                                <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase">Transaction Details</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase">Risk Protocol</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1C1C26]">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-[#8A8A9E]">Loading transactions...</td>
                                </tr>
                            ) : filtered.map((txn, index) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={txn.id}
                                    className="hover:bg-[#12101B] transition-colors group"
                                >
                                    {/* Details Column */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 border",
                                                txn.type === 'send' ? "bg-[#1A4BFF]/10 text-[#3388FF] border-[#1A4BFF]/20" : "bg-[#00D06C]/10 text-[#00D06C] border-[#00D06C]/20"
                                            )}>
                                                {txn.type === 'send' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-white tracking-wide">{txn.type === 'send' ? txn.receiver.name : txn.sender.name}</span>
                                                    <span className="text-[10px] text-[#4A4A5A] px-1.5 py-0.5 rounded border border-[#1C1C26] bg-[#05030A]">
                                                        {txn.type === 'send' ? txn.receiver.upi : txn.sender.upi}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-[#8A8A9E]">
                                                    <span className="font-mono">{txn.id}</span>
                                                    <span>•</span>
                                                    <span>{txn.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Amount Column */}
                                    <td className="px-6 py-4">
                                        <span className="text-lg font-extrabold text-white tracking-tight">₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </td>

                                    {/* Status Column */}
                                    <td className="px-6 py-4">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                            txn.status === 'Completed' ? "bg-[#00D06C]/10 text-[#00D06C] border-[#00D06C]/20" :
                                                txn.status === 'Blocked' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                    "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20"
                                        )}>
                                            {txn.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> :
                                                txn.status === 'Blocked' ? <AlertTriangle className="w-3 h-3" /> :
                                                    <Clock className="w-3 h-3" />}
                                            {txn.status}
                                        </div>
                                    </td>

                                    {/* Risk Column */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {txn.risk === 'Safe' && <Shield className="w-4 h-4 text-[#00D06C]" />}
                                            {txn.risk === 'Low' && <Shield className="w-4 h-4 text-[#1A4BFF]" />}
                                            {txn.risk === 'High' && <AlertTriangle className="w-4 h-4 text-[#FF6B00]" />}
                                            {txn.risk === 'Critical' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                            <span className={cn(
                                                "text-xs font-bold",
                                                txn.risk === 'Safe' ? "text-[#00D06C]" :
                                                    txn.risk === 'Low' ? "text-[#3388FF]" :
                                                        txn.risk === 'High' ? "text-[#FF6B00]" :
                                                            "text-red-500"
                                            )}>{txn.risk} Risk</span>
                                        </div>
                                    </td>

                                    {/* Action Column */}
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-[11px] font-bold text-[#3388FF] hover:text-white transition-colors bg-[#12101B] border border-[#1A2C4D] py-2 px-4 rounded-xl group-hover:bg-[#1A2C4D]">
                                            Inspect
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <Search className="w-8 h-8 text-[#4A4A5A] mb-4" />
                            <h3 className="text-white font-bold mb-1">No Transactions Found</h3>
                            <p className="text-[#8A8A9E] text-sm">Adjust your filters or search query.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
