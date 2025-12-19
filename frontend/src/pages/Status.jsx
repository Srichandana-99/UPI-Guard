import React from 'react';
import { CheckCircle, AlertTriangle, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Status = ({ status, message, amount, txId, riskScore, onHome }) => {
    const isSuccess = status === 'SUCCESS';

    return (
        <div className="flex flex-col h-full bg-white items-center justify-center p-8 text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}
            >
                {isSuccess ? <CheckCircle className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
            </motion.div>

            <h2 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-gray-900' : 'text-red-600'}`}>
                {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
            </h2>

            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                {message || (isSuccess ? `₹${amount} has been sent successfully.` : 'Transaction declined due to security reasons.')}
            </p>

            {/* Risk Score Badge */}
            <div className={`mb-6 px-4 py-2 rounded-full text-xs font-bold border ${isSuccess ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                Risk Score: {riskScore || (isSuccess ? 10 : 95)}/100
            </div>

            {isSuccess && (
                <div className="bg-gray-50 p-4 rounded-xl w-full mb-8">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Amount</span>
                        <span className="font-bold">₹{amount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Transaction ID</span>
                        <span className="font-mono text-xs">{txId}</span>
                    </div>
                </div>
            )}

            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onHome}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold flex items-center space-x-2"
            >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
            </motion.button>
        </div>
    );
};

export default Status;
