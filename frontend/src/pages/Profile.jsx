import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, User, Landmark, ShieldCheck, Fingerprint, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Profile() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [fraudShieldActive, setFraudShieldActive] = useState(true)
    const [biometricActive, setBiometricActive] = useState(false)
    const [toastMessage, setToastMessage] = useState(null)

    const triggerToast = (msg) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(null), 2500)
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const initial = user?.name ? user.name.charAt(0).toUpperCase() : "A"
    const fullName = user?.name || "Alex Rivera"
    const upiId = user?.upi_id || "alex.rivera@upi"
    const balance = user?.balance ? user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "12,450.00"

    return (
        <div className="min-h-screen bg-[#05030A] text-white p-6 pb-24">
            {/* Header */}
            <div className="flex justify-between items-center mb-10 pt-4">
                <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
                <button onClick={() => triggerToast('Settings')} className="w-10 h-10 bg-[#12101B] border border-[#1C1C26] rounded-full flex items-center justify-center hover:bg-[#1A1825] transition-colors">
                    <Settings className="w-5 h-5 text-[#8A8A9E]" />
                </button>
            </div>

            {/* Profile Info & Balance */}
            <div className="flex flex-col items-center mb-10">
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-[#1A1825] border-2 border-secure-blue flex items-center justify-center p-1">
                        <div className="w-full h-full bg-[#FFD1A6] rounded-full flex items-center justify-center overflow-hidden">
                            <span className="text-4xl font-bold text-gray-800">{initial}</span>
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center border-2 border-[#05030A]">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold tracking-tight mb-1">{fullName}</h2>
                <p className="text-sm text-[#8A8A9E] mb-6">{upiId}</p>

                <div className="flex flex-col items-center">
                    <h3 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-1">Wallet Balance</h3>
                    <h2 className="text-3xl font-extrabold tracking-tight">₹{balance}</h2>
                </div>
            </div>

            {/* Account Details Section */}
            <div className="mb-6">
                <h3 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-3 ml-2">Account Details</h3>
                <div className="bg-[#12101B] rounded-[2rem] border border-[#1C1C26] overflow-hidden">
                    <div onClick={() => navigate('/personal-info')} className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#1A1825] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#1A1825] rounded-full flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-semibold text-sm">Personal Information</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8A8A9E]" />
                    </div>
                </div>
            </div>

            {/* Security Settings Section */}
            <div className="mb-6">
                <h3 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-3 ml-2">Security Settings</h3>
                <div className="bg-[#12101B] rounded-[2rem] border border-[#1C1C26] overflow-hidden">
                    <div onClick={() => setFraudShieldActive(!fraudShieldActive)} className="flex items-center justify-between p-4 border-b border-[#1C1C26] cursor-pointer hover:bg-[#1A1825] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${fraudShieldActive ? 'bg-[#0014FF]/10' : 'bg-[#1A1825]'}`}>
                                <ShieldCheck className={`w-5 h-5 transition-colors ${fraudShieldActive ? 'text-secure-blue' : 'text-[#8A8A9E]'}`} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Fraud Shield</h4>
                                <p className={`text-[9px] font-bold tracking-widest uppercase mt-0.5 transition-colors ${fraudShieldActive ? 'text-secure-blue' : 'text-[#8A8A9E]'}`}>
                                    {fraudShieldActive ? 'Active & Monitoring' : 'Disabled'}
                                </p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${fraudShieldActive ? 'bg-secure-blue' : 'bg-[#232332]'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${fraudShieldActive ? 'right-1' : 'left-1'}`}></div>
                        </div>
                    </div>
                    <div onClick={() => setBiometricActive(!biometricActive)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#1A1825] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${biometricActive ? 'bg-[#0014FF]/10' : 'bg-[#1A1825]'}`}>
                                <Fingerprint className={`w-5 h-5 transition-colors ${biometricActive ? 'text-secure-blue' : 'text-[#8A8A9E]'}`} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Biometric Lock</h4>
                                <p className={`text-[9px] font-bold tracking-widest uppercase mt-0.5 transition-colors ${biometricActive ? 'text-secure-blue' : 'text-[#8A8A9E]'}`}>
                                    {biometricActive ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${biometricActive ? 'bg-secure-blue' : 'bg-[#232332]'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${biometricActive ? 'right-1' : 'left-1'}`}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Help & Support Section */}
            <div className="mb-8">
                <h3 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-3 ml-2">Help & Support</h3>
                <div className="bg-[#12101B] rounded-[2rem] border border-[#1C1C26] overflow-hidden">
                    <div onClick={() => navigate('/support')} className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#1A1825] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#1A1825] rounded-full flex items-center justify-center shrink-0 text-white font-bold font-serif">
                                ?
                            </div>
                            <span className="font-semibold text-sm">Support Center</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8A8A9E]" />
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="w-full bg-transparent border border-red-500/30 text-red-500 font-bold rounded-2xl py-4 flex items-center justify-center hover:bg-red-500/10 transition-colors"
            >
                Logout
            </button>

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
                        <p className="text-sm font-semibold text-white truncate">Opening {toastMessage}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
