import React, { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { Search, Mail, Shield, CheckCircle2, XCircle, UserPlus, Filter, MoreVertical, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export function Users() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('All')
    const [usersList, setUsersList] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`)
            if (res.ok) {
                const data = await res.json()
                if (data.success) {
                    setUsersList(data.users)
                }
            }
        } catch (err) {
            console.error("Failed to fetch users:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const toggleBlockStatus = async (email, currentStatus) => {
        try {
            const action = currentStatus === 'Banned' ? 'unblock' : 'block'
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${email}/block`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            })
            if (res.ok) {
                fetchUsers() // Refresh list on success
            }
        } catch (err) {
            console.error("Failed to toggle user block status", err)
        }
    }



    const filtered = usersList.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.upi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || u.status === filterStatus;
        return matchesSearch && matchesStatus;
    })

    return (
        <div className="p-6 text-white min-h-full pb-20 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pt-2 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0F0D1A] rounded-2xl flex items-center justify-center shadow-inner border border-[#1C1C26]">
                        <UserPlus className="w-6 h-6 text-[#1A4BFF]" fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">User Management</h1>
                        <p className="text-[11px] text-[#8A8A9E] mt-0.5 tracking-wide">Customer Profiles • Access Control</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-auto px-4 h-10 rounded-xl bg-[#12101B] border border-[#1C1C26] hover:bg-[#1A1825] font-bold text-sm transition-colors flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#8A8A9E]" /> Notify
                    </button>
                    <button className="w-auto px-4 h-10 rounded-xl bg-[#1A4BFF] hover:bg-[#1238D6] font-bold text-sm shadow-[0_4px_15px_rgba(26,75,255,0.3)] transition-colors flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Add User
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9E]" />
                    <input
                        placeholder="Search Name, Email or UPI ID..."
                        className="w-full bg-[#0A0A10] border border-[#1C1C26] text-white rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:border-[#3388FF] transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-[#0A0A10] border border-[#1C1C26] rounded-xl p-1 shrink-0 overflow-x-auto hide-scrollbar">
                        {['All', 'Active', 'Restricted', 'Banned'].map(status => (
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
                    <button className="w-10 h-10 bg-[#0A0A10] border border-[#1C1C26] rounded-xl flex items-center justify-center hover:text-white text-[#8A8A9E] transition-colors shrink-0">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Users Table Grid */}
            <div className="bg-[#0A0A10] border border-[#1C1C26] rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#1C1C26] bg-[#0F0D1A]">
                                <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase">Profile</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase">Contact</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase">Risk Tier</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase">Account Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1C1C26]">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-[#8A8A9E]">Loading users...</td>
                                </tr>
                            ) : filtered.map((user, index) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={user.id}
                                    className="hover:bg-[#12101B] transition-colors group"
                                >
                                    {/* Profile Column */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#1A4BFF]/10 text-[#3388FF] border border-[#1A4BFF]/20 flex items-center justify-center font-bold text-lg shrink-0">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-white tracking-wide">{user.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-[#8A8A9E]">
                                                    <span className="font-mono">{user.id}</span>
                                                    <span>•</span>
                                                    <span>Joined {user.joined}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact Column */}
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-white">{user.upi}</p>
                                            <p className="text-xs text-[#8A8A9E]">{user.email}</p>
                                        </div>
                                    </td>

                                    {/* Risk Column */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {user.riskTier === 'Safe' && <Shield className="w-4 h-4 text-[#00D06C]" />}
                                            {user.riskTier === 'Low' && <Shield className="w-4 h-4 text-[#3388FF]" />}
                                            {user.riskTier === 'High' && <AlertTriangle className="w-4 h-4 text-[#FF6B00]" />}
                                            {user.riskTier === 'Critical' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                            <span className={cn(
                                                "text-xs font-bold",
                                                user.riskTier === 'Safe' ? "text-[#00D06C]" :
                                                    user.riskTier === 'Low' ? "text-[#3388FF]" :
                                                        user.riskTier === 'High' ? "text-[#FF6B00]" :
                                                            "text-red-500"
                                            )}>{user.riskTier} Risk</span>
                                        </div>
                                    </td>

                                    {/* Status Column */}
                                    <td className="px-6 py-4">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                            user.status === 'Active' ? "bg-[#00D06C]/10 text-[#00D06C] border-[#00D06C]/20" :
                                                user.status === 'Restricted' ? "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20" :
                                                    "bg-red-500/10 text-red-500 border-red-500/20"
                                        )}>
                                            {user.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> :
                                                user.status === 'Banned' ? <XCircle className="w-3 h-3" /> :
                                                    <AlertTriangle className="w-3 h-3" />}
                                            {user.status}
                                        </div>
                                    </td>

                                    {/* Action Column */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => toggleBlockStatus(user.email, user.status)}
                                                className={cn(
                                                    "text-[11px] font-bold py-2 px-4 rounded-xl transition-colors",
                                                    user.status === 'Banned'
                                                        ? "text-[#00D06C] bg-[#00D06C]/10 hover:bg-[#00D06C]/20"
                                                        : "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                                                )}
                                            >
                                                {user.status === 'Banned' ? 'Unblock' : 'Block'}
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <Search className="w-8 h-8 text-[#4A4A5A] mb-4" />
                            <h3 className="text-white font-bold mb-1">No Users Found</h3>
                            <p className="text-[#8A8A9E] text-sm">Adjust your filters or search query.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
