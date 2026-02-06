
'use client';

import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth'; // Ensure this path is correct
import { motion, AnimatePresence } from 'framer-motion';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [emailMode, setEmailMode] = useState(false); // Toggle between "Main" and "Email Form"

    // Form States
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setError('');
        setLoading(false);
    };

    const handleGoogleLogin = () => {
        // Placeholder for now
        alert('Google Login coming soon!');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Adjust API URL logic similar to pages
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';

            const body: any = { username, password };
            if (mode === 'register') body.role = role;

            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Success
            login(data.token, data.user);
            onClose();
            resetForm();
            setEmailMode(false); // Reset to main view
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Reset when modal closes
    if (!isOpen && (username || password)) {
        // Optional: clear state on close? Better to keep if user accidentally clicks out.
        // But for "emailMode" maybe reset to main options?
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="fixed z-[101] w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-white/5">
                            <h2 className="text-xl font-bold text-white">
                                {emailMode ? (mode === 'login' ? 'Login' : 'Create Account') : 'Welcome to Komida'}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {!emailMode ? (
                                // Main Options View
                                <div className="space-y-4">
                                    <button
                                        onClick={handleGoogleLogin}
                                        className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Continue with Google
                                    </button>

                                    <button
                                        onClick={() => setEmailMode(true)}
                                        className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] text-white font-medium py-3.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                                    >
                                        <Mail className="w-5 h-5" />
                                        Continue with Email
                                    </button>

                                    <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed">
                                        By continuing, you agree to our Terms of Service and Privacy Policy.
                                    </p>
                                </div>
                            ) : (
                                // Email Form View
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
                                            {error}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Username</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-colors"
                                            placeholder="Enter your username"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-colors"
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>

                                    {mode === 'register' && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Role (Demo)</label>
                                            <select
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-colors"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Create Account')}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between text-sm mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setEmailMode(false)}
                                            className="text-gray-500 hover:text-white transition-colors"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMode(mode === 'login' ? 'register' : 'login');
                                                setError('');
                                            }}
                                            className="text-primary hover:underline font-medium"
                                        >
                                            {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
