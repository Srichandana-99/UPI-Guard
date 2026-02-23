import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Shield, BrainCircuit, Activity, AlertTriangle, Users } from 'lucide-react'

const stats = [
    { name: 'Total Users', value: '8,249', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Total Volume Monitored', value: '₹4.2M', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Blocked Fraud', value: '₹124K', icon: Shield, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Flagged for Review', value: '3', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
]

export function Dashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Overview</h1>
                    <p className="text-sm text-gray-500">System metrics and ML performance monitoring.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm shadow-sm">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="font-medium text-gray-700">Model Active (Latency: 24ms)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="border-0 shadow-sm ring-1 ring-gray-200">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                    <CardHeader>
                        <CardTitle>Fraud Engine Status</CardTitle>
                        <CardDescription>Metrics from the Python FastAPI /predict endpoint</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-4">
                            <BrainCircuit className="w-8 h-8 text-purple-600 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-900">XGBoost Classifier v1.2</h4>
                                <p className="text-sm text-gray-500 mt-1">Accuracy: 99.8%. Evaluating features: amount, hour_of_day, location mismatch, receiver history, velocity.</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">False Positive Rate</span>
                                <span className="font-medium">0.02%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '2%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">True Positive Rate (Recall)</span>
                                <span className="font-medium">99.4%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '99.4%' }}></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Mocking a simple recent alerts card */}
                <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                    <CardHeader>
                        <CardTitle>System Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { time: '10:45 AM', event: 'Suspicious mass-transfer blocked', user: 'usr_new_99x' },
                                { time: '09:12 AM', event: 'Model weights synchronized', user: 'system' },
                                { time: 'Yesterday', event: 'High velocity alert raised', user: 'usr_abc_123' },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 text-sm border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                    <div className="w-20 text-gray-400 shrink-0">{log.time}</div>
                                    <div>
                                        <span className="font-medium text-gray-900">{log.event}</span>
                                        <span className="block text-gray-500">Triggered by: {log.user}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
