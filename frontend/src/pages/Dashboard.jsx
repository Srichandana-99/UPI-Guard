import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Shield, BrainCircuit, Activity, AlertTriangle } from 'lucide-react'

// Mock Data for the Dashboard
const stats = [
    { name: 'Transactions Monitored', value: '1,240', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Fraud Prevented', value: '₹42,500', icon: Shield, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Active ML Models', value: '3 Active', icon: BrainCircuit, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'High Risk Alerts', value: '12', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
]

const recentTransactions = [
    { id: 'txn_001', receiver: 'merchant_a@upi', amount: 1200, status: 'approved', risk: 'Low', time: '2 mins ago' },
    { id: 'txn_002', receiver: 'unknown_sender@upi', amount: 55000, status: 'blocked', risk: 'High', time: '1 hour ago' },
    { id: 'txn_003', receiver: 'food_delivery@upi', amount: 350, status: 'approved', risk: 'Low', time: '3 hours ago' },
    { id: 'txn_004', receiver: 'scam_report@upi', amount: 15000, status: 'blocked', risk: 'High', time: '5 hours ago' },
]

export function Dashboard() {
    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Overview</h1>
                <p className="text-gray-500">Real-time monitoring of your UPI transaction security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity Evaluated</CardTitle>
                    <CardDescription>All transactions securely analyzed by XGBoost ML Model.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-gray-50/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Transaction ID</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Receiver</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Amount</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Risk Score</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Status</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Time</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {recentTransactions.map((txn) => (
                                    <tr key={txn.id} className="border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50">
                                        <td className="p-4 align-middle font-medium">{txn.id}</td>
                                        <td className="p-4 align-middle">{txn.receiver}</td>
                                        <td className="p-4 align-middle">₹{txn.amount.toLocaleString()}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${txn.risk === 'High' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {txn.risk}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`capitalize ${txn.status === 'blocked' ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-gray-500">{txn.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
