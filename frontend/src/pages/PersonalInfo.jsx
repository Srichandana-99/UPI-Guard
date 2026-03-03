import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, User, Mail, Phone, Calendar, Hash, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function PersonalInfo() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U"
    const fullName = user?.name || "User"
    const email = user?.email || "user@example.com"
    const mobile = user?.mobile || "Not set"
    const dob = user?.dob || "Not set"
    const age = user?.age || "N/A"

    return (
        <div className="min-h-screen bg-[#05030A] text-white p-6 pb-24 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-[#12101B] border border-[#232332] rounded-full flex items-center justify-center hover:bg-[#1A1825] transition-colors">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-lg font-bold">Personal Info</h1>
                <div className="w-10 h-10"></div> {/* Spacer for centering */}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md mx-auto"
            >
                {/* Visual Avatar */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-[#1A1825] border-2 border-secure-blue flex items-center justify-center p-1 relative mb-4">
                        <div className="w-full h-full bg-[#FFD1A6] rounded-full flex items-center justify-center overflow-hidden">
                            <span className="text-4xl font-bold text-gray-800">{initial}</span>
                        </div>
                    </div>
                    <div className="bg-[#0D1A15] border border-[#14261E] rounded-full py-1.5 px-3 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00D06C]" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#00D06C]">KYC Verified</span>
                    </div>
                </div>

                {/* Details Card */}
                <div className="bg-[#12101B] border border-[#1C1C26] rounded-3xl overflow-hidden shadow-xl mb-6">
                    <div className="p-5 border-b border-[#1C1C26] flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#1A1825] rounded-full flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-secure-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-1">Full Name</h3>
                            <p className="font-semibold text-white truncate">{fullName}</p>
                        </div>
                    </div>
                    <div className="p-5 border-b border-[#1C1C26] flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#1A1825] rounded-full flex items-center justify-center shrink-0">
                            <Mail className="w-5 h-5 text-secure-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-1">Email Address</h3>
                            <p className="font-semibold text-white truncate">{email}</p>
                        </div>
                    </div>
                    <div className="p-5 border-b border-[#1C1C26] flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#1A1825] rounded-full flex items-center justify-center shrink-0">
                            <Phone className="w-5 h-5 text-secure-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-1">Mobile Number</h3>
                            <p className="font-semibold text-white truncate">{mobile}</p>
                        </div>
                    </div>
                    <div className="p-5 border-b border-[#1C1C26] flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#1A1825] rounded-full flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-secure-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-1">Date of Birth</h3>
                            <p className="font-semibold text-white truncate">{dob}</p>
                        </div>
                    </div>
                    <div className="p-5 flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#1A1825] rounded-full flex items-center justify-center shrink-0">
                            <Hash className="w-5 h-5 text-secure-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-1">Age</h3>
                            <p className="font-semibold text-white truncate">{age} Years Old</p>
                        </div>
                    </div>
                </div>

                <button className="w-full bg-[#1A1825] hover:bg-[#232332] text-white border border-[#2A2A38] font-semibold rounded-2xl py-4 flex items-center justify-center transition-colors">
                    Request Data Update
                </button>
            </motion.div>
        </div>
    )
}
