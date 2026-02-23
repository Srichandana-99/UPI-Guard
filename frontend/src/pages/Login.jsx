import React, { useState } from 'react'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { Shield } from 'lucide-react'

export function Login() {
    const { login } = useAuth()
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            login("demo@auth", "password")
            setLoading(false)
        }, 1000)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <Card className="w-full max-w-md shadow-xl border-0 ring-1 ring-gray-200">
                <CardContent className="p-8 space-y-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome Back</h1>
                            <p className="text-sm text-gray-500 mt-1">Sign in to your UPI Guard account</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="you@example.com"
                            defaultValue="demo@upiguard.com"
                            required
                        />
                        <Input
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            defaultValue="password123"
                            required
                        />
                        <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
                            {loading ? "Verifying Context..." : "Sign In to Dashboard"}
                        </Button>
                    </form>

                    <p className="text-center text-xs text-gray-500">
                        For demo purposes, just click Sign In.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
