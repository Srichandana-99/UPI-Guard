import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, LayoutDashboard, Send, LogOut, Menu } from 'lucide-react'
import { cn } from '../lib/utils'

export function MainLayout() {
    const { user, logout } = useAuth()
    const location = useLocation()

    const navItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Send Money', href: '/send', icon: Send },
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                    <Shield className="w-6 h-6" />
                    UPI Guard
                </div>
                <button className="text-gray-500 hover:text-gray-900">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 sticky top-0 h-screen">
                <div className="p-6 flex items-center gap-3 text-blue-600 font-bold text-2xl tracking-tight">
                    <Shield className="w-8 h-8" />
                    UPI Guard
                </div>
                <div className="px-4 py-2">
                    <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Menu
                    </p>
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-gray-400")} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-gray-900 truncate">{user?.name}</span>
                            <span className="text-xs text-gray-500 truncate">{user?.upi_id}</span>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
