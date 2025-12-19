import React from 'react';
import { Lock, LogOut } from 'lucide-react';

const Header = ({ activeTab = 'Dashboard', onNavigate, onLogout }) => {
    return (
        <div className="bg-white px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10 w-full">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate && onNavigate('home')}>
                <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                    <Lock className="w-5 h-5" />
                </div>
                <span className="font-bold text-xl text-gray-800">PaySecure</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
                <button
                    onClick={() => onNavigate && onNavigate('dashboard')}
                    className={`text-sm font-medium transition-colors ${activeTab === 'Dashboard' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => onNavigate && onNavigate('transactions')}
                    className={`text-sm font-medium transition-colors ${activeTab === 'Transactions' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Transactions
                </button>
            </div>

            {/* Logout Button */}
            {onLogout && (
                <button
                    onClick={onLogout}
                    className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors"
                >
                    <span className="text-sm font-medium hidden md:block">Logout</span>
                    <LogOut className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

export default Header;

