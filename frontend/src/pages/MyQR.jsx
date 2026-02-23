import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Share2, Download, Copy, CheckCircle2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';

export function MyQR() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [copied, setCopied] = React.useState(false);

    // Fallback ID if none is present
    const upiId = user?.upi_id || "secure@upi";
    const fullName = user?.name || "SecureUser";

    // Formatting the QR code payload to follow typical UPI URI format: upi://pay?pa=...&pn=...
    const qrPayload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(fullName)}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-secure-bg text-secure-text p-6 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-md flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-[#12101B] border border-[#232332] rounded-full flex items-center justify-center hover:bg-[#1A1825] transition-colors">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-lg font-bold">Receive Money</h1>
                <div className="w-10 h-10" /> {/* Spacer for centering */}
            </div>

            <div className="w-full max-w-md flex-1 flex flex-col justify-center items-center">

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full bg-[#12101B] border border-[#232332] rounded-[2rem] p-8 shadow-2xl relative flex flex-col items-center"
                >
                    <div className="mb-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-[#FFD1A6] mx-auto mb-3 flex items-center justify-center border-4 border-[#05030A]">
                            <span className="text-2xl font-bold text-gray-800">{fullName.charAt(0).toUpperCase()}</span>
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">{fullName}</h2>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <p className="text-[#8A8A9E] font-medium">{upiId}</p>
                            <button onClick={copyToClipboard} className="text-secure-blue hover:text-blue-400">
                                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl shadow-[0_0_30px_rgba(26,33,255,0.15)] mb-8">
                        <QRCode
                            value={qrPayload}
                            size={200}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                        />
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-[#0D1A15] border border-[#14261E] rounded-xl mb-4">
                        <CheckCircle2 className="w-4 h-4 text-[#00D06C]" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#00D06C]">Verified Merchant / User</span>
                    </div>

                    <p className="text-xs text-[#505068] text-center px-4">
                        Scan this QR code with any UPI app to send money directly to this account securely.
                    </p>
                </motion.div>

                <div className="w-full grid grid-cols-2 gap-4 mt-8">
                    <button className="bg-[#12101B] border border-[#232332] hover:bg-[#1A1825] text-white font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 transition-colors">
                        <Share2 className="w-4 h-4 text-secure-blue" /> Share QR
                    </button>
                    <button className="bg-[#12101B] border border-[#232332] hover:bg-[#1A1825] text-white font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 transition-colors">
                        <Download className="w-4 h-4 text-secure-blue" /> Download
                    </button>
                </div>
            </div>
        </div>
    );
}
