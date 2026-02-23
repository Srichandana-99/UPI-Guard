import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Bell, Shield, TrendingUp, CheckCircle2, AlertCircle, Clock, Zap, Cpu, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

export function Dashboard() {
    const [metrics, setMetrics] = useState({
        total_transactions: "1.28M",
        active_threats: 14
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/analytics`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setMetrics({
                            total_transactions: data.metrics.total_transactions > 1000000
                                ? `${(data.metrics.total_transactions / 1000000).toFixed(2)}M`
                                : data.metrics.total_transactions > 1000
                                    ? `${(data.metrics.total_transactions / 1000).toFixed(1)}K`
                                    : data.metrics.total_transactions,
                            active_threats: data.metrics.blocked_transactions
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch dashboard metrics", err);
            }
        };
        fetchAnalytics();
    }, []);
    return (
        <div className="p-6 text-white min-h-full pb-20 max-w-7xl mx-auto">

            {/* Top Bar Navigation */}
            <div className="flex justify-between items-center mb-8 pt-2">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0F0D1A] rounded-2xl flex items-center justify-center shadow-inner border border-[#1C1C26]">
                        <Shield className="w-6 h-6 text-[#1A4BFF]" fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            System Analytics
                        </h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00D06C] shadow-[0_0_8px_rgba(0,208,108,0.6)]"></div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#00D06C]">Gateway Operational</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-xl bg-[#12101B] border border-[#1C1C26] flex items-center justify-center hover:bg-[#1A1825] transition-colors">
                        <Calendar className="w-4 h-4 text-[#8A8A9E]" />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-[#12101B] border border-[#1C1C26] flex items-center justify-center relative hover:bg-[#1A1825] transition-colors">
                        <Bell className="w-4 h-4 text-[#8A8A9E]" />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Transactions */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#0A0A10] border border-[#1C1C26] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#2A447A] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xs font-bold text-[#8A8A9E] tracking-widest uppercase">Total Transactions</h3>
                        <div className="p-1.5 bg-[#1A4BFF]/10 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-[#1A4BFF]" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-3 mb-2">
                        <h2 className="text-4xl font-extrabold tracking-tight">{metrics.total_transactions}</h2>
                        <span className="text-xs font-bold text-[#00D06C] flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" />+12.4%</span>
                    </div>
                    <p className="text-[11px] text-[#4A4A5A]">Vs previous 24 hours</p>
                </motion.div>

                {/* Detection Accuracy */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-[#0A0A10] border border-[#1C1C26] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#103D20] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xs font-bold text-[#8A8A9E] tracking-widest uppercase">Detection Accuracy</h3>
                        <div className="p-1.5 bg-[#00D06C]/10 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-[#00D06C]" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-3 mb-2">
                        <h2 className="text-4xl font-extrabold tracking-tight">99.82%</h2>
                        <span className="text-xs font-bold text-[#00D06C]">+0.05%</span>
                    </div>
                    <p className="text-[11px] text-[#4A4A5A]">ML Engine v4.2 Stable</p>
                </motion.div>

                {/* Active Threats */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#0A0A10] border border-[#1C1C26] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#521319] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xs font-bold text-[#8A8A9E] tracking-widest uppercase">Active Threats</h3>
                        <div className="p-1.5 bg-red-500/10 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-3 mb-2">
                        <h2 className="text-4xl font-extrabold tracking-tight text-white">{metrics.active_threats}</h2>
                        <span className="text-xs font-bold text-red-500 flex items-center">-4.2%</span>
                    </div>
                    <p className="text-[11px] text-[#4A4A5A]">Currently being mitigated</p>
                </motion.div>
            </div>

            {/* Charts & Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* Risk Classification Donut Chart */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-[#0A0A10] border border-[#1C1C26] rounded-3xl p-6 shadow-xl flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-8">
                        <h3 className="text-sm font-bold text-white tracking-wide">Risk Classification</h3>
                        <AlertCircle className="w-4 h-4 text-[#4A4A5A]" />
                    </div>

                    {/* Modern Glowing Donut Chart */}
                    <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                        {/* SVG Ring - Low 68% (Blue), Safe 22% (Green), High 7% (Orange), Critical 3% (Red) */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            {/* Base Circle */}
                            <circle cx="50" cy="50" r="40" className="stroke-[#1C1C26]" strokeWidth="12" fill="none" />

                            {/* Low Risk (Blue) 68% - 0 to 68 */}
                            <circle cx="50" cy="50" r="40" className="stroke-[#0033FF]" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 0.68)} fill="none" strokeLinecap="round" />

                            {/* Safe (Green) 22% - 68 to 90 */}
                            <circle cx="50" cy="50" r="40" className="stroke-[#00D06C]" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 0.22)} transform="rotate(244.8 50 50)" fill="none" strokeLinecap="round" />

                            {/* High (Orange) 7% - 90 to 97 */}
                            <circle cx="50" cy="50" r="40" className="stroke-[#FF6B00]" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 0.07)} transform="rotate(324 50 50)" fill="none" strokeLinecap="round" />

                            {/* Critical (Red) 3% - 97 to 100 */}
                            <circle cx="50" cy="50" r="40" className="stroke-[#FF1E46]" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 0.03)} transform="rotate(349.2 50 50)" fill="none" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-extrabold text-white tracking-tight">Total</span>
                            <span className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase">Cases</span>
                        </div>

                        {/* Glow effect behind rings */}
                        <div className="absolute inset-0 rounded-full bg-[#0033FF]/10 blur-2xl -z-10"></div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-y-4 gap-x-2 px-2 mt-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0033FF]"></span>
                            <span className="text-xs text-[#8A8A9E]">Low (68%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#00D06C]"></span>
                            <span className="text-xs text-[#8A8A9E]">Safe (22%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]"></span>
                            <span className="text-xs text-[#8A8A9E]">High (7%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FF1E46]"></span>
                            <span className="text-xs text-[#8A8A9E]">Critical (3%)</span>
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col gap-6">
                    {/* System Performance Cards */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-[#0A0A10] border border-[#1C1C26] rounded-3xl p-6 shadow-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#12101B] border border-[#1C1C26] rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-[#8A8A9E]" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-1">API Latency</h4>
                                <h2 className="text-2xl font-extrabold text-white">124ms</h2>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex gap-1 items-end h-8 mb-1">
                                <div className="w-1.5 h-4 bg-[#8A8A9E] rounded-full opacity-40"></div>
                                <div className="w-1.5 h-6 bg-[#8A8A9E] rounded-full opacity-60"></div>
                                <div className="w-1.5 h-8 bg-[#1A4BFF] rounded-full"></div>
                            </div>
                            <span className="text-[9px] font-bold text-[#1A4BFF] tracking-widest uppercase">Optimal</span>
                        </div>
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-[#0A0A10] border border-[#1C1C26] rounded-3xl p-6 shadow-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#0D1A15] border border-[#14261E] rounded-xl flex items-center justify-center">
                                <Zap className="w-5 h-5 text-[#00D06C]" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-1">Success Rate</h4>
                                <h2 className="text-2xl font-extrabold text-white">99.99%</h2>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex gap-1 items-end h-8 mb-1">
                                <div className="w-1.5 h-8 bg-[#00D06C] rounded-full"></div>
                                <div className="w-1.5 h-8 bg-[#00D06C] rounded-full opacity-80"></div>
                                <div className="w-1.5 h-8 bg-[#00D06C] rounded-full opacity-60"></div>
                            </div>
                            <span className="text-[9px] font-bold text-[#00D06C] tracking-widest uppercase">Healthy</span>
                        </div>
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="bg-[#0A0A10] border border-[#1C1C26] rounded-3xl p-6 shadow-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#1A1005] border border-[#26180D] rounded-xl flex items-center justify-center">
                                <Cpu className="w-5 h-5 text-[#FF6B00]" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-1">Engine Load</h4>
                                <h2 className="text-2xl font-extrabold text-white">42%</h2>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex gap-1 items-end h-8 mb-1">
                                <div className="w-1.5 h-3 bg-[#FF6B00] rounded-full"></div>
                                <div className="w-1.5 h-5 bg-[#FF6B00] rounded-full opacity-80"></div>
                                <div className="w-1.5 h-4 bg-[#FF6B00] rounded-full opacity-40"></div>
                            </div>
                            <span className="text-[9px] font-bold text-[#FF6B00] tracking-widest uppercase">Normal</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Recent Alerts Feed underneath charts */}
            <div>
                <div className="flex justify-between items-end mb-4 px-2">
                    <h3 className="text-[11px] font-bold text-white tracking-widest uppercase">Recent High-Risk Alerts</h3>
                    <Link to="/admin/fraud" className="text-[11px] font-bold text-[#3388FF] hover:text-white transition-colors">View All</Link>
                </div>
                <div className="space-y-3">
                    <div className="bg-[#0A0A10] border border-[#1C1C26] rounded-2xl p-4 flex items-center gap-4 hover:border-red-500/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-white">Multiple Rapid Login Attempts</h4>
                            <p className="text-xs text-[#8A8A9E] mt-0.5">User: upi_user_8829 | IP: 103.24.32.1</p>
                        </div>
                        <button className="bg-[#12101B] border border-[#1A2C4D] text-[#3388FF] text-xs font-bold py-2 px-4 rounded-xl hover:bg-[#1A2C4D] transition-colors">Review</button>
                    </div>
                    <div className="bg-[#0A0A10] border border-[#1C1C26] rounded-2xl p-4 flex items-center gap-4 hover:border-red-500/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-white">Large Transaction Pattern Deviation</h4>
                            <p className="text-xs text-[#8A8A9E] mt-0.5">Amount: ₹45,000 | Location: Bengaluru, IN</p>
                        </div>
                        <button className="bg-[#12101B] border border-[#1A2C4D] text-[#3388FF] text-xs font-bold py-2 px-4 rounded-xl hover:bg-[#1A2C4D] transition-colors">Review</button>
                    </div>
                </div>
            </div>

        </div>
    )
}
