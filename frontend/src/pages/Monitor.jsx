import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const Monitor = ({ onBack }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTransactions = async () => {
        try {
            const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
            const response = await fetch(`${API_BASE}/transactions`);
            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }
            const data = await response.json();
            setTransactions(data);
            setError(null);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to connect to backend");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
        // Poll every 2 seconds
        const interval = setInterval(fetchTransactions, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="font-bold text-lg text-gray-800">Fraud Monitor</h1>
                <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        {error}
                    </div>
                )}

                {loading && transactions.length === 0 ? (
                    <div className="flex justify-center items-center h-40">
                        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.length === 0 ? (
                            <p className="text-center text-gray-500 mt-10">No recent transactions</p>
                        ) : (
                            transactions.map((tx, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-xl border-l-4 shadow-sm bg-white ${tx.isFraud ? 'border-red-500' : 'border-green-500'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-gray-800 text-lg">₹ {tx.amount}</p>
                                            <p className="text-xs text-gray-500">{tx.timestamp}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-bold ${tx.isFraud ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {tx.status}
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        <p><span className="font-medium">To:</span> {tx.upiId}</p>
                                        {tx.txId && <p><span className="font-medium">TxID:</span> {tx.txId}</p>}
                                    </div>

                                    {tx.message && (
                                        <div className="mt-2 text-xs bg-gray-50 p-2 rounded text-gray-700">
                                            {tx.message}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Monitor;
