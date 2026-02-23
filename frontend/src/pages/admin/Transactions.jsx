import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Search, Filter, Download } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

// Mock Data
const allTransactions = [
    { id: 'txn_9011', sender: 'alaka@okhdfc', receiver: 'merchant_z@sbi', amount: 450, date: '10:45 AM, Today', status: 'Completed', risk: 'Low' },
    { id: 'txn_9012', sender: 'test_scammer@upi', receiver: 'victim_1@upi', amount: 50000, date: '09:12 AM, Today', status: 'Blocked', risk: 'High' },
    { id: 'txn_9013', sender: 'demo@upi', receiver: 'food_plaza@hdfc', amount: 250, date: '08:30 AM, Today', status: 'Completed', risk: 'Low' },
    { id: 'txn_9014', sender: 'ravi.k@sbi', receiver: 'unknown_a@icici', amount: 15000, date: 'Yesterday', status: 'Review', risk: 'Medium' },
    { id: 'txn_9015', sender: 'sneha99@icici', receiver: 'electricity_bill@upi', amount: 1200, date: 'Yesterday', status: 'Completed', risk: 'Low' },
]

export function Transactions() {
    const [searchTerm, setSearchTerm] = useState('')

    const filtered = allTransactions.filter(t =>
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.sender.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">All Transactions</h1>
                    <p className="text-sm text-gray-500">Global ledger of platform activity.</p>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Report
                </Button>
            </div>

            <Card className="border-0 ring-1 ring-gray-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-xl gap-4 flex-wrap">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by Txn ID or Sender..."
                            className="pl-9 h-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-10 text-gray-600"><Filter className="w-4 h-4 mr-2" /> Filter Details</Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Sender UPI</th>
                                <th className="px-6 py-4">Receiver UPI</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date/Time</th>
                                <th className="px-6 py-4">Risk Level</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filtered.map((txn) => (
                                <tr key={txn.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{txn.id}</td>
                                    <td className="px-6 py-4 text-gray-600">{txn.sender}</td>
                                    <td className="px-6 py-4 text-gray-600">{txn.receiver}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">₹{txn.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-500">{txn.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${txn.risk === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                                                txn.risk === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                            {txn.risk}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`capitalize font-medium ${txn.status === 'Completed' ? 'text-gray-600' :
                                                txn.status === 'Blocked' ? 'text-red-600' : 'text-yellow-600'
                                            }`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No transactions found matching your search.</div>
                    )}
                </div>
            </Card>
        </div>
    )
}
