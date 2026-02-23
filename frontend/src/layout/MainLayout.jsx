import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, History, CreditCard, User, Shield, QrCode } from 'lucide-react'
import { cn } from '../lib/utils'

export function MainLayout() {
    const location = useLocation()

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'History', href: '/history', icon: History },
        { name: 'Profile', href: '/profile', icon: User },
    ]

    return (
        <div className="min-h-screen bg-secure-bg text-secure-text flex justify-center">
            {/* Mobile App Container Wrapper */}
            <div className="w-full max-w-md bg-[#05030A] min-h-screen flex flex-col relative shadow-2xl">

                {/* Main Content Area */}
                <main className="flex-1 w-full overflow-y-auto pb-24">
                    <Outlet />
                </main>

                {/* Bottom Navigation Bar */}
                <div className="fixed sm:absolute bottom-0 w-full max-w-md bg-[#0A0713]/90 backdrop-blur-md border-t border-[#1C1C26] rounded-t-3xl pt-2 pb-6 px-6 z-50">
                    <div className="flex justify-between items-end relative">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href
                            const Icon = item.icon

                            if (item.isCenter) {
                                return (
                                    <div key={item.name} className="relative z-10 flex flex-col items-center">
                                        <div className="absolute -top-10">
                                            <div className="w-16 h-16 rounded-full bg-[#05030A] flex items-center justify-center p-1 relative">
                                                {/* Outer Glow */}
                                                <div className="absolute inset-0 rounded-full bg-secure-blue/30 blur-md z-0"></div>
                                                <Link to={item.href} className="w-full h-full bg-[#0014FF] hover:bg-blue-700 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,20,255,0.6)] transition-all transform hover:scale-105 z-10 relative">
                                                    <Icon className="w-7 h-7 text-white" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        "flex flex-col items-center gap-1 transition-colors relative pb-1",
                                        isActive ? "text-secure-blue" : "text-secure-textMuted hover:text-white"
                                    )}
                                >
                                    <Icon className={cn("w-6 h-6", isActive ? "text-secure-blue" : "text-secure-textMuted")} />
                                    <span className="text-[10px] font-semibold tracking-wider mt-1">{item.name}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    )
}
