import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield, LayoutDashboard, Users, Activity, AlertTriangle, LogOut, Menu } from 'lucide-react'
import { cn } from '../../lib/utils'

export function AdminLayout() {
    const { user, logout } = useAuth()
    const location = useLocation()

    const navItems = [
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Transactions', href: '/admin/transactions', icon: Activity },
        { name: 'Fraud Monitor', href: '/admin/fraud', icon: AlertTriangle, danger: true },
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between bg-zinc-900 text-white p-4 sticky top-0 z-10">
                <div className="flex items-center gap-2 font-bold text-xl text-blue-400">
                    <Shield className="w-6 h-6" />
                    UPI Guard <span className="text-zinc-400 text-sm font-normal">Admin</span>
                </div>
                <button className="text-zinc-400 hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar - Dark theme for Admin */}
            <aside className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 text-zinc-300 sticky top-0 h-screen">
                <div className="p-6 flex items-center gap-3 font-bold text-2xl tracking-tight text-white mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    Admin Panel
                </div>
                <div className="px-4 py-2">
                    <p className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                        Management
                    </p>
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href))
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                                        isActive
                                            ? (item.danger ? "bg-red-500/10 text-red-500" : "bg-blue-600/10 text-blue-500")
                                            : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={cn("w-5 h-5",
                                            isActive ? (item.danger ? "text-red-500" : "text-blue-500") : "text-zinc-500 group-hover:text-zinc-300"
                                        )} />
                                        {item.name}
                                    </div>
                                    {item.danger && (
                                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                            3
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-zinc-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-white truncate">{user?.name}</span>
                            <span className="text-xs text-zinc-500 truncate">System Operator</span>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-zinc-400 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-gray-100">
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
