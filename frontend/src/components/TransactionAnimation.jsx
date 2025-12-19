import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';

const TransactionAnimation = ({ status, message, onClose }) => {
    // status: 'processing' | 'success' | 'failed'

    const successVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 10
            }
        },
        exit: { scale: 0.8, opacity: 0 }
    };

    const failedVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 15
            }
        },
        shake: {
            x: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.4 }
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">

                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                    {status === 'processing' && (
                        <div className="py-8 flex flex-col items-center space-y-4">
                            <div className="relative">
                                <motion.div
                                    className="w-20 h-20 border-4 border-blue-100 rounded-full"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                />
                                <motion.div
                                    className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Processing</h3>
                                <p className="text-gray-500 mt-1">Securing connection...</p>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            variants={successVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="py-6 flex flex-col items-center"
                        >
                            <motion.div
                                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                            >
                                <motion.div
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                >
                                    <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
                                </motion.div>
                            </motion.div>

                            <motion.h3
                                className="text-2xl font-bold text-gray-900 mb-2"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                Payment Successful
                            </motion.h3>

                            <motion.p
                                className="text-gray-500 mb-8"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                {message || "Transaction completed successfully."}
                            </motion.p>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7 }}
                            >
                                Done
                            </motion.button>
                        </motion.div>
                    )}

                    {status === 'failed' && (
                        <motion.div
                            variants={failedVariants}
                            initial="hidden"
                            animate={['visible', 'shake']}
                            className="py-6 flex flex-col items-center"
                        >
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                <X className="w-12 h-12 text-red-600" strokeWidth={3} />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Transaction Failed</h3>

                            <p className="text-gray-500 mb-8 max-w-[200px]">
                                {message || "We couldn't process your payment. Please try again."}
                            </p>

                            <div className="flex space-x-4">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => onClose(true)} // Pass true to retry if relevant
                                    className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200"
                                >
                                    Retry
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TransactionAnimation;
