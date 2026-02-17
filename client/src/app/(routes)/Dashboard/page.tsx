"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/src/context/AuthContext';
import {
    LogOut,
    LayoutDashboard,
    User,
    Settings,
    Bell,
    Search,
    Activity,
    ShieldCheck,
    Zap
} from 'lucide-react';

/**
 * COMPONENT: Dashboard Page
 */
export default function DashboardPage() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
                <div className="p-8 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Zap className="text-white w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-900 tracking-tighter text-2xl">PharmaGuard</span>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    {[
                        { icon: <LayoutDashboard size={20} />, label: "Overview", active: true },
                        { icon: <Activity size={20} />, label: "Prescriptions" },
                        { icon: <ShieldCheck size={20} />, label: "Safety Alerts" },
                        { icon: <User size={20} />, label: "Profile" },
                        { icon: <Settings size={20} />, label: "Settings" },
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition-all group ${item.active
                                    ? "bg-amber-50 text-amber-600"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <span className={item.active ? "text-amber-600" : "text-slate-400 group-hover:text-slate-600"}>
                                {item.icon}
                            </span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-100">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all group"
                    >
                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search prescriptions, chemicals..."
                                className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell size={22} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-900">{user?.name || "Dr. Alex Rivera"}</p>
                                <p className="text-xs font-semibold text-slate-400">{user?.email || "alex@example.com"}</p>
                            </div>
                            <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name || "Dr. Rivera"}&background=f59e0b&color=fff`}
                                    alt="Avatar"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto space-y-10">
                        {/* Welcome Section */}
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, {user?.name?.split(' ')[0] || "Clinician"}!</h1>
                            <p className="text-slate-500 font-medium mt-1">Here is what's happening with your safety layer today.</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "Active Scans", value: "24", trend: "+12%", icon: <Activity className="text-amber-600" /> },
                                { label: "Alerts Flagged", value: "08", trend: "-5%", icon: <ShieldCheck className="text-red-600" /> },
                                { label: "API Requests", value: "1.2k", trend: "+2.4%", icon: <Zap className="text-blue-600" /> },
                            ].map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -4 }}
                                    className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center justify-between"
                                >
                                    <div>
                                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                                        <h3 className="text-3xl font-black text-slate-900 mt-2">{stat.value}</h3>
                                    </div>
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
                                        {stat.icon}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Main Area */}
                        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-10 min-h-[400px] flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mb-6">
                                <Activity size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Ready for Analysis</h3>
                            <p className="text-slate-500 max-w-sm font-medium">
                                Upload a prescription photo or start a voice scan to detect potential drug-drug or drug-food interactions.
                            </p>
                            <button className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-[20px] font-bold hover:bg-amber-600 transition-all flex items-center gap-3 shadow-xl shadow-slate-900/10">
                                Start New Scan <Zap size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
