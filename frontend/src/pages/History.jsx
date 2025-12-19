import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { supabase } from '../supabase';
import { Clock, ArrowUpRight, ArrowDownLeft, AlertTriangle } from 'lucide-react';

const History = ({ user, onBack, onLogout }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchHistory = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
                const response = await fetch(`${API_BASE}/history/${user.id}`);
                const data = await response.json();
                setTransactions(data);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();

        // Real-time Subscription
        const subscription = supabase
            .channel('history-update')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'transactions',
                },
                (payload) => {
                    // Check if relates to me (Sent by me OR Received by me)
                    // Note: payload.new.user_id (Sent) or payload.new.upi_id (Received)
                    // But we don't have my upi_id easily available here without fetching or passing it.
                    // We assume 'user' prop has upi_id from App.jsx fetch.

                    const isMyTransaction =
                        payload.new.user_id === user.id ||
                        payload.new.upi_id === user.upi_id;

                    if (isMyTransaction) {
                        console.log("New Transaction!", payload.new);
                        fetchHistory(); // Re-fetch to get joined data/formatting easily
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]); // Re-run if user changes to ensure correct filter logic

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 font-sans min-h-screen">
            <Header activeTab="Transactions" onNavigate={(screen) => (screen === 'home' || screen === 'dashboard') ? onBack() : null} onLogout={onLogout} />

            <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
                <div className="bg-white rounded-3xl shadow-sm border p-6 md:p-8">
                    <div className="mb-6 flex items-center space-x-3">
                        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Loading transactions...</div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No transactions found.</div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((tx, index) => {
                                const isReceived = tx.upi_id === user.upi_id; // Check if I am the receiver
                                const isFraud = tx.status === 'FRAUD';
                                const isFailed = tx.status === 'FAILED';

                                return (
                                    <div key={index} className="flex flex-col md:flex-row justify-between items-center p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 peer-hover:bg-indigo-50 transition-all bg-gray-50/50">
                                        <div className="flex items-center space-x-4 w-full md:w-auto mb-2 md:mb-0">
                                            <div className={`p-3 rounded-full ${isFraud ? 'bg-red-100 text-red-600' : (isReceived ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600')}`}>
                                                {isFraud ? <AlertTriangle className="w-5 h-5" /> : (isReceived ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">
                                                    {isReceived ? `Received from ${tx.users?.name || 'Unknown'}` : `Sent to ${tx.upi_id}`}
                                                </p>
                                                <p className="text-xs text-gray-500">{formatDate(tx.timestamp)}</p>
                                            </div>
                                        </div>

                                        <div className="text-right w-full md:w-auto flex justify-between md:block items-center">
                                            <p className={`font-bold text-lg ${isFraud || isFailed ? 'text-gray-400 line-through' : (isReceived ? 'text-green-600' : 'text-gray-900')}`}>
                                                {isReceived ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                            </p>
                                            <p className={`text-xs font-bold px-2 py-1 rounded-full inline-block mt-1 ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                                tx.status === 'FRAUD' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {tx.status}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;
