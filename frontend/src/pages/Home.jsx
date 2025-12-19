import React from 'react';
import { Shield, Lock, CreditCard, Settings, Activity, Send, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';

const Home = ({ onNavigate }) => {
    return (
        <div className="flex flex-col h-full bg-gray-50 font-sans">
            <Header activeTab="Dashboard" onNavigate={onNavigate} />

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6 md:p-8 max-w-6xl mx-auto w-full">

                {/* Welcome / Stats Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
                    <p className="text-gray-500 text-sm">Welcome back, Rahul.</p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Action Card: Initiate Payment */}
                    <motion.div
                        whileHover={{ y: -4 }}
                        onClick={() => onNavigate('pay')}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer group"
                    >
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Send className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Initiate Payment</h3>
                        <p className="text-sm text-gray-500">Securely send money with real-time AI fraud protection.</p>
                    </motion.div>

                    {/* Action Card: Monitor Fraud */}
                    <motion.div
                        whileHover={{ y: -4 }}
                        onClick={() => onNavigate('monitor')}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer group"
                    >
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Live Monitor</h3>
                        <p className="text-sm text-gray-500">Watch real-time transaction traffic and fraud alerts.</p>
                    </motion.div>

                    {/* Info Card: Security Status */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center space-x-2 mb-4 text-green-400">
                                <Shield className="w-5 h-5" />
                                <span className="text-sm font-bold tracking-wide uppercase">AI Sentinel Active</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-1">Device Secure</h3>
                            <p className="text-gray-400 text-sm opacity-80">Last scan: Just now</p>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                            <Lock className="w-32 h-32" />
                        </div>
                    </div>
                </div>

                {/* Recent Activity Mini Table */}
                <div className="mt-8 bg-white rounded-3xl border shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                        <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: 'Netflix Subscription', date: 'Today, 9:41 AM', amount: '- ₹699.00', icon: 'N', color: 'bg-red-100 text-red-600' },
                            { name: 'Salary Credit', date: 'Yesterday, 5:30 PM', amount: '+ ₹85,000.00', icon: 'S', color: 'bg-green-100 text-green-600' },
                            { name: 'Uber Ride', date: 'Yesterday, 8:15 AM', amount: '- ₹450.00', icon: 'U', color: 'bg-black text-white' },
                        ].map((tx, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-default">
                                <div className="flex items-center space-x-4">
                                    <div className={`w - 10 h - 10 rounded - xl flex items - center justify - center font - bold ${tx.color} `}>
                                        {tx.icon}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{tx.name}</p>
                                        <p className="text-xs text-gray-500">{tx.date}</p>
                                    </div>
                                </div>
                                <span className={`font - bold text - sm ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-gray-800'} `}>{tx.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Home;
