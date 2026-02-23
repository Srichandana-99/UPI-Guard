import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Search, MessageCircle, Phone, Mail, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const faqs = [
    {
        question: "How does the Fraud Shield work?",
        answer: "SecureUPI uses an advanced AI engine to monitor your transactions in real-time. It analyzes over 50 data points including location data, recipient history, and unusual behavior patterns to instantly block suspicious transfers before money leaves your account."
    },
    {
        question: "What should I do if my payment failed but money was deducted?",
        answer: "Don't panic. If a transaction fails but money is debited, it is usually refunded automatically within 3-5 business days by your bank. You can use the transaction ID to raise a specific dispute in the History tab if the issue persists."
    },
    {
        question: "How can I change my primary linked bank account?",
        answer: "Currently, account linking is managed automatically upon registration. If you need to switch accounts, please contact support to reset your banking profile securely."
    },
    {
        question: "Is there a limit on daily transactions?",
        answer: "Yes, standard UPI limits apply (typically ₹1 Lakh per day). Your bank may also impose its own limits. High-value transactions may trigger an additional verification step via our Fraud Shield."
    }
]

export function SupportCenter() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [openFaq, setOpenFaq] = useState(null)

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index)
    }

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[#05030A] text-white p-6 pb-24 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-[#12101B] border border-[#232332] rounded-full flex items-center justify-center hover:bg-[#1A1825] transition-colors">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-lg font-bold tracking-tight">Support Center</h1>
                <div className="w-10 h-10"></div> {/* Spacer */}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md mx-auto space-y-8"
            >
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A9E]">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for help, topics, or FAQs..."
                        className="w-full bg-[#12101B] border border-[#1C1C26] text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-secure-blue focus:ring-1 focus:ring-secure-blue transition-all placeholder:text-[#8A8A9E]"
                    />
                </div>

                {/* Quick Contact Options */}
                <div>
                    <h3 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-4 ml-1">Contact Us</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="bg-[#12101B] border border-[#1C1C26] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#1A1825] transition-colors">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold">Live Chat</span>
                        </button>
                        <button className="bg-[#12101B] border border-[#1C1C26] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#1A1825] transition-colors">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                <Phone className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold">Call Support</span>
                        </button>
                    </div>
                </div>

                {/* FAQs */}
                <div>
                    <h3 className="text-[10px] font-bold text-[#8A8A9E] tracking-widest uppercase mb-4 ml-1">Frequently Asked Questions</h3>
                    <div className="bg-[#12101B] border border-[#1C1C26] rounded-3xl overflow-hidden divide-y divide-[#1C1C26]">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, index) => (
                                <div key={index} className="overflow-hidden">
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-5 text-left hover:bg-[#1A1825] transition-colors"
                                    >
                                        <span className="font-medium text-sm pr-4">{faq.question}</span>
                                        {openFaq === index ? (
                                            <ChevronUp className="w-5 h-5 text-[#8A8A9E] shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-[#8A8A9E] shrink-0" />
                                        )}
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-5 pb-5 text-sm text-[#8A8A9E] leading-relaxed"
                                            >
                                                {faq.answer}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-[#8A8A9E] text-sm flex flex-col items-center gap-3">
                                <FileText className="w-8 h-8 opacity-50" />
                                <p>No results found for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Email Option */}
                <div className="bg-[#1A1825] border border-[#2A2A38] rounded-2xl p-5 flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#12101B] flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Email Us</h4>
                            <p className="text-xs text-[#8A8A9E]">support@secureupi.com</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
