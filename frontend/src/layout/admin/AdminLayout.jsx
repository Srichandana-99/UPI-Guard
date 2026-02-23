import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield, LayoutDashboard, Users, CreditCard, Activity, AlertTriangle, LogOut, Menu, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'

export function AdminLayout() {
    const { user, logout } = useAuth()
    const location = useLocation()

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'User Manager', href: '/admin/users', icon: Users },
        { name: 'Transactions', href: '/admin/transactions', icon: CreditCard },
        { name: 'Fraud Detection', href: '/admin/fraud', icon: Shield },
        { name: 'System Logs', href: '/admin/logs', icon: Activity },
    ]

    return (
        <div className="min-h-screen bg-[#05030A] flex flex-col md:flex-row text-white font-sans overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between bg-[#0A0713] border-b border-[#1C1C26] p-4 sticky top-0 z-50">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                    SecureUPI
                </div>
                <button className="text-[#8A8A9E] hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar - Precise UI Match */}
            <aside className="hidden md:flex flex-col w-[260px] bg-[#0A0713] border-r border-[#1C1C26] sticky top-0 h-screen shrink-0">
                <div className="p-6 flex items-center gap-3 font-bold text-xl tracking-wide text-white mb-4">
                    <div className="w-9 h-9 bg-[#1a66ff] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(26,102,255,0.4)]">
                        <Shield className="w-5 h-5 text-white" fill="currentColor" />
                    </div>
                    SecureUPI
                </div>

                <div className="px-4 flex-1">
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href))
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all group",
                                        isActive
                                            ? "bg-[#1A2C4D]/80 text-[#3388FF] shadow-inner border border-[#2A447A]"
                                            : "text-[#8A8A9E] hover:text-white hover:bg-[#12101B]"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5 mr-3 shrink-0",
                                        isActive ? "text-[#3388FF]" : "text-[#8A8A9E] group-hover:text-white"
                                    )} fill={isActive ? "currentColor" : "none"} strokeWidth={isActive ? 0 : 2} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom Settings Button styling matching screenshot */}
                <div className="p-4 border-t border-[#1C1C26]">
                    <Link
                        to="/admin/settings"
                        className="flex items-center px-4 py-3.5 text-[#8A8A9E] hover:text-white hover:bg-[#12101B] rounded-2xl text-[15px] font-medium transition-all group"
                    >
                        <Settings className="w-5 h-5 mr-3 shrink-0 text-[#8A8A9E] group-hover:text-white" />
                        Settings
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gradient-to-b from-[#0B0914] to-[#05030A]">
                {/* Blueprint grid pattern overlay typical for analytics */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                <div className="flex-1 relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
