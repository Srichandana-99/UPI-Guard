import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, AlertTriangle, Shield, CheckCircle2, Search, ArrowRight, UserX, Key, MapPin, Eye, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { formatDistanceToNow, parseISO } from 'date-fns'

export function FraudMonitor() {
    const [metrics, setMetrics] = useState({ system_threat_level: 15, blocked_transactions: 0, active_mitigations: 0, pending_reviews: 0 });
    const [alerts, setAlerts] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchFraudData = async () => {
            try {
                const alertsRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/fraud-alerts`);
                if (alertsRes.ok) {
                    const data = await alertsRes.json();
                    if (data.success) {
                        setAlerts(data.alerts);
                        setWatchlist(data.watchlist);
                    }
                }

                const metricsRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/analytics`);
                if (metricsRes.ok) {
                    const params = await metricsRes.json();
                    if (params.success) {
                        setMetrics({
                            system_threat_level: params.metrics.system_threat_level,
                            blocked_transactions: params.metrics.blocked_transactions,
                            active_mitigations: params.metrics.blocked_transactions > 0 ? 4 : 0,
                            pending_reviews: params.metrics.blocked_transactions > 0 ? 2 : 0
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch fraud data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFraudData();
    }, []);

    const filteredWatchlist = watchlist.filter(user =>
        user.upi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 text-white min-h-full pb-20 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pt-2 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FF1E46]/10 rounded-2xl flex items-center justify-center shadow-inner border border-[#FF1E46]/20">
                        <ShieldAlert className="w-6 h-6 text-[#FF1E46]" fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Global Security Protocol</h1>
                        <p className="text-[11px] text-[#8A8A9E] mt-0.5 tracking-wide uppercase font-bold">Defcon 3 • Active Mitigation</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                {/* Threat Level Dial */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="lg:col-span-1 bg-[#0A0A10] border border-[#1C1C26] rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-6">
                        <h3 className="text-xs font-bold text-[#8A8A9E] tracking-widest uppercase">System Threat Level</h3>
                        <ShieldAlert className="w-4 h-4 text-[#FF1E46]" />
                    </div>

                    <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                        {/* Dial SVG */}
                        <svg className="w-full h-full -rotate-180" viewBox="0 0 100 100">
                            {/* Background Track (Half Circle) */}
                            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" className="stroke-[#1C1C26]" strokeWidth="8" strokeLinecap="round" />
                            {/* Active Value (Dynamic) */}
                            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" className="stroke-[#FF1E46]" strokeWidth="8" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * (metrics.system_threat_level / 100))} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-extrabold text-white tracking-tighter">{metrics.system_threat_level}</span>
                                <span className="text-xl font-bold text-[#8A8A9E]">%</span>
                            </div>
                            <span className="text-[10px] font-bold text-[#FF1E46] tracking-widest uppercase mt-1">{metrics.system_threat_level > 50 ? 'Severe Risk' : 'Elevated Risk'}</span>
                        </div>
                        {/* Needle/Glow */}
                        <div className="absolute inset-0 rounded-full bg-[#FF1E46]/10 blur-xl -z-10 mt-10"></div>
                    </div>

                    <div className="w-full space-y-3 mt-auto">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-[#8A8A9E]">Blocked Transactions</span>
                            <span className="font-bold text-white">{metrics.blocked_transactions}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-[#8A8A9E]">Manual Reviews Pending</span>
                            <span className="font-bold text-[#FF6B00]">{metrics.pending_reviews}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-[#8A8A9E]">Active Mitigations</span>
                            <span className="font-bold text-[#00D06C]">{metrics.active_mitigations}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Active Alerts List */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-[#0A0A10] border border-[#1C1C26] rounded-3xl p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-bold text-[#8A8A9E] tracking-widest uppercase">Active Fraud Alerts</h3>
                        <button className="text-[10px] uppercase tracking-widest font-bold text-[#3388FF] hover:text-white transition-colors">View Timeline</button>
                    </div>

                    <div className="space-y-4">
                        {loading && <div className="text-center py-8 text-[#8A8A9E] text-sm">Scanning matrix...</div>}
                        {!loading && alerts.length === 0 && <div className="text-center py-8 text-[#8A8A9E] text-sm">No active alerts detected.</div>}

                        {alerts.map((alert, idx) => {
                            let timeStr = "Just now"
                            try { if (alert.date) timeStr = formatDistanceToNow(parseISO(alert.date), { addSuffix: true }) } catch (e) { }

                            return (
                                <div key={idx} className="group bg-[#12101B] border border-[#1C1C26] hover:border-[#FF1E46]/30 rounded-2xl p-5 transition-all relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF1E46]"></div>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#FF1E46]/10 flex items-center justify-center shrink-0">
                                                <AlertTriangle className="w-5 h-5 text-[#FF1E46]" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-bold text-base text-white">Suspicious Transfer Blocked</h4>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest bg-[#FF1E46]/20 text-[#FF1E46] px-2 py-0.5 rounded border border-[#FF1E46]/30">Critical</span>
                                                </div>
                                                <p className="text-sm text-[#8A8A9E] mb-3">Amount ₹{parseFloat(alert.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} attempted to {alert.receiver_upi_id}</p>
                                                <div className="flex items-center gap-4 text-[11px] font-medium">
                                                    <span className="text-white flex items-center gap-1.5"><MapPin className="w-3 h-3 text-[#FF6B00]" /> {alert.sender_email}</span>
                                                    <span className="text-[#8A8A9E]">{timeStr}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="bg-[#1A1825] border border-[#232332] text-white hover:bg-[#FF1E46] hover:border-[#FF1E46] group-hover:bg-[#FF1E46] text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg">
                                            Investigate
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            </div>

            {/* High-Risk Watchlist */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#0A0A10] border border-[#1C1C26] rounded-3xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2 mb-1">
                            <UserX className="w-4 h-4 text-[#FF1E46]" /> High-Risk Watchlist
                        </h3>
                        <p className="text-[11px] text-[#8A8A9E] uppercase tracking-widest font-bold">Identified malicious actors</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9E]" />
                        <input
                            placeholder="Search UPI ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#12101B] border border-[#1C1C26] text-white rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-[#3388FF] transition-all text-xs w-64"
                        />
                    </div>
                </div>

                {/* Watchlist Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {!loading && filteredWatchlist.length === 0 && <div className="text-[#8A8A9E] py-4 text-center w-full col-span-full">No active watchlists found.</div>}
                    {filteredWatchlist.map((user, i) => (
                        <div key={i} className="bg-[#12101B] border border-[#1C1C26] border-t-2 border-t-[#FF1E46] rounded-2xl p-5 hover:bg-[#151320] transition-colors relative">
                            <button className="absolute top-4 right-4 text-[#8A8A9E] hover:text-[#3388FF] transition-colors">
                                <Eye className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-[#FF1E46]/10 text-[#FF1E46] font-bold flex items-center justify-center rounded-full text-lg border border-[#FF1E46]/20">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">{user.name}</h4>
                                    <p className="text-xs text-[#8A8A9E] font-mono">{user.upi}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-[10px] text-[#8A8A9E] font-bold uppercase tracking-widest mb-1">Risk Score</span>
                                    <span className="text-xl font-extrabold text-[#FF1E46]">{user.score}<span className="text-sm">/100</span></span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-[#8A8A9E] font-bold uppercase tracking-widest mb-1">Total Attempted</span>
                                    <span className="text-lg font-bold text-white tracking-tight">{user.total}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-[#1C1C26] flex justify-between items-center bg">
                                <span className="text-[10px] text-[#8A8A9E] uppercase tracking-widest font-bold">Auto-Blocked</span>
                                <span className="text-xs font-bold text-white bg-[#1A1825] px-2 py-1 rounded">{user.blocked} Txns</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
