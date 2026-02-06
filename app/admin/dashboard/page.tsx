
'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    const { user, token, isLoading, logout } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'admin') {
                router.push('/');
            } else {
                // Fetch stats
                fetchAdminStats();
            }
        }
    }, [user, isLoading, router]);

    const fetchAdminStats = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await fetch(`${API_URL}/admin/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // use stored token or from context
                }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (isLoading || !user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-8 pb-32">
            <div className="max-w-6xl mx-auto">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-gray-400">Welcome back, {user.username}</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                            Go Home
                        </Link>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/10">
                        <h3 className="text-gray-400 text-sm font-medium mb-2">Total Users</h3>
                        <p className="text-4xl font-bold text-white">{stats?.users ?? '-'}</p>
                    </div>
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/10">
                        <h3 className="text-gray-400 text-sm font-medium mb-2">Manga Cached</h3>
                        <p className="text-4xl font-bold text-white">{stats?.manga ?? '-'}</p>
                    </div>
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/10">
                        <h3 className="text-gray-400 text-sm font-medium mb-2">Server Uptime</h3>
                        <p className="text-4xl font-bold text-white">{stats?.serverUptime ? Math.floor(stats.serverUptime / 60) + 'm' : '-'}</p>
                    </div>
                </div>

                <div className="bg-[#111] p-8 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4">Management Actions</h2>
                    <p className="text-gray-500 text-sm mb-6">More features coming soon...</p>
                    <div className="flex gap-4">
                        <button className="px-6 py-3 bg-primary/20 text-primary border border-primary/30 rounded-xl hover:bg-primary/30 transition-colors">
                            Manage Users
                        </button>
                        <button className="px-6 py-3 bg-primary/20 text-primary border border-primary/30 rounded-xl hover:bg-primary/30 transition-colors">
                            Manage Manga
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
