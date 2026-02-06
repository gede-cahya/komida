
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // Assume NEXT_PUBLIC_API_URL includes /api suffix if set (e.g. http://localhost:3001/api)
            // If not set, use default with /api
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            // Just append /auth/login
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            login(data.token, data.user);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
            <div className="w-full max-w-md bg-[#111] p-8 rounded-2xl border border-white/10 shadow-xl">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Login to Komida</h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="Enter username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95"
                    >
                        Login
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-500 text-sm">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
