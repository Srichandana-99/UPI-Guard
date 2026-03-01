import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Landmark, ShieldCheck, Fingerprint, HelpCircle, ChevronRight, CheckCircle2, Camera, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Profile() {
    const { user, logout, checkBiometricSupport, checkCameraPermission } = useAuth()
    const navigate = useNavigate()
    const [fraudShieldActive, setFraudShieldActive] = useState(true)
    const [biometricActive, setBiometricActive] = useState(false)
    const [cameraPermission, setCameraPermission] = useState('prompt')
    const [notificationPermission, setNotificationPermission] = useState('default')
    const [toastMessage, setToastMessage] = useState(null)

    useEffect(() => {
        // Check permissions on mount
        const checkPermissions = async () => {
            // Check biometric support
            const biometricSupported = await checkBiometricSupport()
            setBiometricActive(biometricSupported)

            // Check camera permission
            const camPerm = await checkCameraPermission()
            setCameraPermission(camPerm)

            // Check notification permission
            if ('Notification' in window) {
                setNotificationPermission(Notification.permission)
            }
        }
        checkPermissions()
    }, [checkBiometricSupport, checkCameraPermission])

    const triggerToast = (msg) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(null), 2500)
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const initial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"
    const fullName = user?.full_name || "User"
    const upiId = user?.upi_id || "user@secureupi"
    const balance = user?.balance ? user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"

    // Show loading if user is not loaded yet
    if (!user) {
        return (
            <div className="min-h-screen bg-[#05030A] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#05030A] text-white p-6 pb-24">
            {/* Header */}
            <div className="flex items-center mb-10 pt-4">
                <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
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
                    <div onClick={() => navigate('/reset-pin')} className="flex items-center justify-between p-4 border-b border-[#1C1C26] cursor-pointer hover:bg-[#1A1825] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#1A1825] rounded-full flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-5 h-5 text-secure-blue" />
                            </div>
                            <span className="font-semibold text-sm">Change UPI PIN</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8A8A9E]" />
                    </div>
                    <div onClick={() => navigate('/set-password')} className="flex items-center justify-between p-4 border-b border-[#1C1C26] cursor-pointer hover:bg-[#1A1825] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#1A1825] rounded-full flex items-center justify-center shrink-0">
                                <Lock className="w-5 h-5 text-secure-blue" />
                            </div>
                            <span className="font-semibold text-sm">Change Password</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8A8A9E]" />
                    </div>
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
                    <div className="flex items-center justify-between p-4 border-b border-[#1C1C26]">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${biometricActive ? 'bg-[#0014FF]/10' : 'bg-[#1A1825]'}`}>
                                <Fingerprint className={`w-5 h-5 transition-colors ${biometricActive ? 'text-secure-blue' : 'text-[#8A8A9E]'}`} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Biometric Authentication</h4>
                                <p className={`text-[9px] font-bold tracking-widest uppercase mt-0.5 transition-colors ${biometricActive ? 'text-secure-blue' : 'text-[#8A8A9E]'}`}>
                                    {biometricActive ? 'Supported' : 'Not Available'}
                                </p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${biometricActive ? 'bg-secure-blue' : 'bg-[#232332]'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${biometricActive ? 'right-1' : 'left-1'}`}></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-[#1C1C26]">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${cameraPermission === 'granted' ? 'bg-[#0014FF]/10' : 'bg-[#1A1825]'}`}>
                                <Camera className={`w-5 h-5 transition-colors ${cameraPermission === 'granted' ? 'text-secure-blue' : 'text-[#8A8A9E]'}`} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Camera Access</h4>
                                <p className={`text-[9px] font-bold tracking-widest uppercase mt-0.5 transition-colors ${cameraPermission === 'granted' ? 'text-secure-blue' : 'text-[#8A8A9E]'}`}>
                                    {cameraPermission === 'granted' ? 'Allowed' : cameraPermission === 'denied' ? 'Blocked' : 'Not Requested'}
                                </p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${cameraPermission === 'granted' ? 'bg-secure-blue' : 'bg-[#232332]'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${cameraPermission === 'granted' ? 'right-1' : 'left-1'}`}></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${notificationPermission === 'granted' ? 'bg-[#0014FF]/10' : 'bg-[#1A1825]'}`}>
                                <Bell className={`w-5 h-5 transition-colors ${notificationPermission === 'granted' ? 'text-secure-blue' : 'text-[#8A8A9E]'}`} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Push Notifications</h4>
                                <p className={`text-[9px] font-bold tracking-widest uppercase mt-0.5 transition-colors ${notificationPermission === 'granted' ? 'text-secure-blue' : 'text-[#8A8A9E]'}`}>
                                    {notificationPermission === 'granted' ? 'Enabled' : notificationPermission === 'denied' ? 'Blocked' : 'Not Requested'}
                                </p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${notificationPermission === 'granted' ? 'bg-secure-blue' : 'bg-[#232332]'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationPermission === 'granted' ? 'right-1' : 'left-1'}`}></div>
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
