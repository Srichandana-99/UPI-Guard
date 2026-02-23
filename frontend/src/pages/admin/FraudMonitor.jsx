import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card'
import { AlertTriangle, ShieldAlert, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'

// Mock Flagged Data
const initialFlags = [
    {
        id: 'txn_9012',
        sender: 'test_scammer@upi',
        receiver: 'victim_1@upi',
        amount: 50000,
        riskScore: 0.98,
        reasons: ['Velocity Anomaly', 'Location Mismatch', 'High Transfer Volume'],
        time: '2 hours ago',
        status: 'Pending Review'
    },
    {
        id: 'txn_8841',
        sender: 'ravi.k@sbi',
        receiver: 'unknown_crypto@upi',
        amount: 15000,
        riskScore: 0.76,
        reasons: ['New Receiver', 'Outside Normal Operating Hours'],
        time: 'Yesterday',
        status: 'Pending Review'
    },
]

export function FraudMonitor() {
    const [flags, setFlags] = useState(initialFlags)

    const handleAction = (id, action) => {
        // Optimistic UI update
        setFlags(flags.filter(f => f.id !== id))
        // Call API here in production to confirm action
        console.log(`Transaction ${id} marked as ${action}`)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <ShieldAlert className="w-6 h-6 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Fraud Action Center</h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Transactions automatically flagged by the ML pipeline waiting for manual review.</p>
                </div>
            </div>

            {flags.length === 0 ? (
                <Card className="border-0 ring-1 ring-gray-200 bg-green-50/30">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">You're all caught up!</h3>
                        <p className="text-gray-500">No pending fraud alerts to review right now.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {flags.map((flag) => (
                        <Card key={flag.id} className="border-l-4 border-l-red-500 border-0 ring-1 ring-gray-200 shadow-md">
                            <CardHeader className="pb-4 border-b border-gray-100 bg-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            Flagged Transaction: <span className="font-mono text-gray-600 bg-gray-100 px-2 rounded">{flag.id}</span>
                                        </CardTitle>
                                        <CardDescription className="mt-1">{flag.time} • Risk Score: {(flag.riskScore * 100).toFixed(0)}%</CardDescription>
                                    </div>
                                    <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                                        <AlertTriangle className="w-3 h-3" /> Action Required
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Sender</p>
                                        <p className="font-semibold text-gray-900">{flag.sender}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Receiver</p>
                                        <p className="font-semibold text-gray-900">{flag.receiver}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Amount</p>
                                        <p className="font-bold text-red-600 text-xl">₹{flag.amount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="mb-6 p-4 bg-red-50 rounded-lg ring-1 ring-red-100">
                                    <h4 className="flex items-center gap-2 font-semibold text-red-900 mb-2 text-sm">
                                        <ShieldAlert className="w-4 h-4" /> Machine Learning Triggers
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                                        {flag.reasons.map((r, i) => (
                                            <li key={i}>{r}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-gray-100">
                                    <Button
                                        className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white flex gap-2 items-center"
                                        onClick={() => handleAction(flag.id, 'Confirmed Fraud')}
                                    >
                                        <XCircle className="w-4 h-4" /> Confirm Fraud (Ban User)
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 sm:flex-none flex items-center gap-2"
                                        onClick={() => handleAction(flag.id, 'False Positive')}
                                    >
                                        <CheckCircle className="w-4 h-4 text-green-600" /> False Positive (Allow)
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
