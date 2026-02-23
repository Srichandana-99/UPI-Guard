import React from 'react'
import { Card, CardContent } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Search, Mail, Shield, CheckCircle2, XCircle } from 'lucide-react'

// Mock Users
const usersList = [
    { id: 'usr_1', name: 'Alaka Nath', upi: 'alaka@okhdfc', status: 'Active', joined: 'Oct 24, 2023', riskTier: 'Low' },
    { id: 'usr_2', name: 'Ravi Kumar', upi: 'ravi.k@sbi', status: 'Restricted', joined: 'Jan 12, 2024', riskTier: 'High' },
    { id: 'usr_3', name: 'Demo User', upi: 'demo@upi', status: 'Active', joined: 'Feb 01, 2024', riskTier: 'Low' },
    { id: 'usr_4', name: 'Sneha Patel', upi: 'sneha99@icici', status: 'Active', joined: 'Mar 15, 2023', riskTier: 'Medium' },
    { id: 'usr_5', name: 'Test Account', upi: 'test_scammer@upi', status: 'Banned', joined: 'Apr 02, 2024', riskTier: 'Critical' },
]

export function Users() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Management</h1>
                    <p className="text-sm text-gray-500">View and manage platform users and their risk profiles.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><Mail className="w-4 h-4 mr-2" /> Export CSV</Button>
                    <Button>Add User</Button>
                </div>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50 rounded-t-xl">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input className="pl-9 h-9 border-gray-200" placeholder="Search by Name or UPI ID..." />
                    </div>
                    <select className="h-9 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm outline-none">
                        <option>All Statuses</option>
                        <option>Active</option>
                        <option>Restricted</option>
                        <option>Banned</option>
                    </select>
                </div>

                <div className="relative w-full overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-medium">User Details</th>
                                <th className="px-6 py-3 font-medium">UPI ID</th>
                                <th className="px-6 py-3 font-medium">Joined Date</th>
                                <th className="px-6 py-3 font-medium">Risk Tier</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {usersList.map((usr) => (
                                <tr key={usr.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                                {usr.name.charAt(0)}
                                            </div>
                                            <div className="font-medium text-gray-900">{usr.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{usr.upi}</td>
                                    <td className="px-6 py-4 text-gray-500">{usr.joined}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${usr.riskTier === 'Low' ? 'text-green-700 bg-green-50' :
                                                usr.riskTier === 'Medium' ? 'text-yellow-700 bg-yellow-50' :
                                                    'text-red-700 bg-red-50'
                                            }`}>
                                            {usr.riskTier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            {usr.status === 'Active' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                            <span className="text-gray-700">{usr.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">View Profile</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
