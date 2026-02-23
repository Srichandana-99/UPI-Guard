import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings2, User, Search, Lock, AlertTriangle, ShieldCheck } from 'lucide-react'

// Mock Data targeting the UI image requested
const transactions = [
    { id: 1, type: 'merchant', name: 'Apple Store', amount: '$1,299.00', time: '10:45 AM', date_group: 'TODAY', status: 'Checked', fraud: false, iconBg: 'bg-secure-blue' },
    { id: 2, type: 'merchant', name: 'Spotify Premium', amount: '$9.99', time: '08:20 AM', date_group: 'TODAY', status: 'Checked', fraud: false, iconBg: 'bg-[#6FCF97]' },
    { id: 3, type: 'user', name: 'Sarah Johnson', amount: '$450.00', income: true, time: '06:15 PM', date_group: 'YESTERDAY', status: 'Checked', fraud: false, iconBg: 'bg-[#219653]' },
    { id: 4, type: 'merchant', name: 'Unknown Merchant', amount: '$240.00', time: '02:30 PM', date_group: 'YESTERDAY', status: 'Blocked', fraud: true, iconBg: 'bg-[#EB5757]' },
    { id: 5, type: 'bill', name: 'Utility Bill', amount: '$84.20', time: '11:00 AM', date_group: '12 OCT 2023', status: 'Checked', fraud: false, iconBg: 'bg-[#56CCF2]' }
]

export function History() {
    const [search, setSearch] = useState('')

    // Group by date_group
    const grouped = transactions.reduce((acc, curr) => {
        if (!acc[curr.date_group]) acc[curr.date_group] = [];
        acc[curr.date_group].push(curr);
        return acc;
    }, {});

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pt-4">
                <h1 className="text-3xl font-extrabold tracking-tight">Transactions</h1>
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-[#1C1C26] flex items-center justify-center border border-[#2A2A38] text-secure-textMuted hover:text-white transition-colors">
                        <Settings2 className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-300 to-rose-400 p-[2px]">
                        <div className="w-full h-full bg-black rounded-full overflow-hidden flex items-center justify-center bg-zinc-800">
                            <User className="w-5 h-5 text-white/50" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secure-textMuted">
                    <Search className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    placeholder="Search recipients, bills, or IDs..."
                    className="w-full bg-white text-gray-900 rounded-[2rem] py-4 pl-12 pr-4 focus:outline-none shadow-[0_4px_20px_rgba(0,0,0,0.1)] text-sm font-medium"
                />
            </div>

            {/* Transactions List */}
            <div className="space-y-6">
                {Object.keys(grouped).map(group => (
                    <div key={group}>
                        <h3 className="text-[10px] font-bold tracking-widest text-[#505068] uppercase mb-3 ml-2">{group}</h3>
                        <div className="space-y-3">
                            {grouped[group].map(txn => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={txn.id}
                                    className="bg-[#12101B] border border-[#232332] rounded-3xl p-4 flex items-center gap-4 hover:bg-[#1A1825] transition-colors"
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${txn.iconBg} bg-opacity-20`}>
                                        {/* Using generic initials/icons for demo */}
                                        <span className={`font-bold ${txn.fraud ? 'text-red-500' : 'text-white'}`}>
                                            {txn.fraud ? <AlertTriangle className="w-5 h-5 text-red-500" /> : txn.name.charAt(0)}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm">{txn.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-secure-textMuted">{txn.time}</span>
                                            {txn.fraud ? (
                                                <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                                    <AlertTriangle className="w-2.5 h-2.5" /> Blocked
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-secure-blue bg-secure-blue/10 px-2 py-0.5 rounded-full border border-secure-blue/20">
                                                    <ShieldCheck className="w-2.5 h-2.5" /> Fraud Checked
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`font-bold ${txn.fraud ? 'text-secure-textMuted line-through' : (txn.income ? 'text-secure-success' : 'text-white')}`}>
                                            {txn.income ? '+' : (txn.fraud ? '' : '- ')}{txn.amount}
                                        </span>
                                        <div className={`w-2 h-2 rounded-full ${txn.fraud ? 'bg-red-500' : 'bg-secure-success'}`} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
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
