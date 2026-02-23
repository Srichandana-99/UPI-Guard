import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { Shield, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function SendMoney() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [formData, setFormData] = useState({
        receiver_upi: '',
        amount: '',
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        try {
            // Mocking transaction evaluation logic
            // In production, this would call our FastAPI /predict endpoint via Axios

            const payload = {
                user_id: user.id,
                transaction_id: `txn_${Date.now()}`,
                amount: parseFloat(formData.amount),
                receiver_upi_id: formData.receiver_upi,
                sender_upi_id: user.upi_id,
                // Mocked real-time device context points:
                hour_of_day: new Date().getHours(),
                location_mismatch: 0,
                is_new_receiver: 1,
                velocity_1h: 3
            }

            const response = await fetch("http://localhost:8000/api/v1/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            const data = await response.json()
            setResult(data)

        } catch (error) {
            console.error(error)
            // Fallback for mock demo if API is offline
            setTimeout(() => {
                setResult({
                    is_fraudulent: parseFloat(formData.amount) > 50000,
                    risk_level: parseFloat(formData.amount) > 50000 ? "High" : "Low",
                    decision: parseFloat(formData.amount) > 50000 ? "Block" : "Approve",
                    risk_factors: parseFloat(formData.amount) > 50000 ? ["High amount"] : []
                })
            }, 1500)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Send Money securely</h1>
                <p className="text-gray-500">ML models evaluate every transaction in real-time.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transfer Details</CardTitle>
                    <CardDescription>Enter the UPI ID and Amount</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Receiver UPI ID"
                            placeholder="e.g. merchant@okhdfc"
                            required
                            value={formData.receiver_upi}
                            onChange={(e) => setFormData({ ...formData, receiver_upi: e.target.value })}
                        />
                        <Input
                            label="Amount (INR)"
                            type="number"
                            placeholder="0.00"
                            min="1"
                            required
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />

                        <Button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2"
                            disabled={loading || !formData.amount || !formData.receiver_upi}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Shield className="w-4 h-4" />
                                    Safely Transfer
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className={cn(
                            "border-2 overflow-hidden relative",
                            result.is_fraudulent ? "border-red-500" : "border-green-500"
                        )}>
                            {/* Dynamic glowing background effect */}
                            <div className={cn(
                                "absolute inset-0 opacity-10",
                                result.is_fraudulent ? "bg-red-500" : "bg-green-500"
                            )} />

                            <CardContent className="p-6 relative">
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                                        result.is_fraudulent ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                                    )}>
                                        {result.is_fraudulent ? <ShieldAlert className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className={cn(
                                            "text-xl font-bold",
                                            result.is_fraudulent ? "text-red-700" : "text-green-700"
                                        )}>
                                            Transaction {result.decision === 'Block' ? 'Blocked' : 'Approved'}
                                        </h3>
                                        <p className="text-gray-700">
                                            Risk Engine evaluation: <span className="font-semibold">{result.risk_level} Risk</span>
                                        </p>

                                        {result.risk_factors && result.risk_factors.length > 0 && (
                                            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                                                <p className="text-sm font-medium text-red-800 mb-2">Suspicious Factors Detected:</p>
                                                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                                    {result.risk_factors.map((factor, i) => (
                                                        <li key={i}>{factor}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
