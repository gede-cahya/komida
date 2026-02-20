
'use client';

import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth'; // Ensure this path is correct
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';

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
    const [isVerifyingWallet, setIsVerifyingWallet] = useState(false);

    const { login } = useAuth();
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setError('');
        setLoading(false);
    };

    const handleWalletLogin = async () => {
        if (!address) {
            setError('Please connect your wallet first.');
            return;
        }

        try {
            setIsVerifyingWallet(true);
            setError('');

            // 1. Get nonce
            const nonceRes = await fetch('/api/auth/nonce');
            const { nonce } = await nonceRes.json();

            // 2. Create message
            const message = new SiweMessage({
                domain: window.location.host,
                address,
                statement: 'Sign in to Komida. This does not cost any gas or perform a transaction.',
                uri: window.location.origin,
                version: '1',
                chainId: 8453,
                nonce,
            });

            // 3. Sign
            const signature = await signMessageAsync({
                message: message.prepareMessage(),
            });

            // 4. Verify
            const verifyRes = await fetch('/api/auth/verify-wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message.prepareMessage(), signature }),
                credentials: 'include',
            });

            const data = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(data.error || 'Verification failed');

            // 5. Login
            login(data.user);
            onClose();
            resetForm();
            setEmailMode(false);
        } catch (err: any) {
            console.error('Wallet login error', err);
            setError(err.message || 'Failed to login with wallet');
        } finally {
            setIsVerifyingWallet(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

            const body: any = { username, password };
            if (mode === 'register') body.role = role;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) {
                let errorMessage = data.error || 'Authentication failed';
                if (typeof errorMessage !== 'string') {
                    // Handle Zod/Object errors
                    if (errorMessage.issues && Array.isArray(errorMessage.issues)) {
                        errorMessage = errorMessage.issues.map((i: any) => i.message).join(', ');
                    } else if (errorMessage.name === 'ZodError' && typeof errorMessage.message === 'string') {
                        try {
                            const parsed = JSON.parse(errorMessage.message);
                            if (Array.isArray(parsed)) {
                                errorMessage = parsed.map((i: any) => i.message).join(', ');
                            } else {
                                errorMessage = errorMessage.message;
                            }
                        } catch {
                            errorMessage = errorMessage.message;
                        }
                    } else if (errorMessage.message) {
                        errorMessage = errorMessage.message;
                    } else {
                        errorMessage = JSON.stringify(errorMessage);
                    }
                }
                throw new Error(errorMessage);
            }

            // Success
            login(data.user);
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

                                    <div className="w-full">
                                        <ConnectButton.Custom>
                                            {({
                                                account,
                                                chain,
                                                openAccountModal,
                                                openConnectModal,
                                                authenticationStatus,
                                                mounted,
                                            }) => {
                                                const ready = mounted && authenticationStatus !== 'loading';
                                                const connected =
                                                    ready &&
                                                    account &&
                                                    chain &&
                                                    (!authenticationStatus ||
                                                        authenticationStatus === 'authenticated');

                                                return (
                                                    <div
                                                        {...(!ready && {
                                                            'aria-hidden': true,
                                                            'style': {
                                                                opacity: 0,
                                                                pointerEvents: 'none',
                                                                userSelect: 'none',
                                                            },
                                                        })}
                                                        className="w-full flex-col flex gap-2"
                                                    >
                                                        {(() => {
                                                            if (!connected) {
                                                                return (
                                                                    <button onClick={openConnectModal} type="button" className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-white/10 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3">
                                                                        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                                                                            <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.89 6 10 6.9 10 8V16C10 17.1 10.89 18 12 18H21ZM12 16H22V8H12V16ZM16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z" />
                                                                        </svg>
                                                                        Connect Wallet (Web3)
                                                                    </button>
                                                                );
                                                            }

                                                            return (
                                                                <div className="flex flex-col gap-2">
                                                                    <button
                                                                        onClick={handleWalletLogin}
                                                                        disabled={isVerifyingWallet}
                                                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                                                                    >
                                                                        {isVerifyingWallet ? 'Verifying...' : 'Sign In with Ethereum'}
                                                                    </button>
                                                                    <button onClick={openAccountModal} type="button" className="text-xs text-gray-500 hover:text-white transition-colors">
                                                                        Connected: {account.displayName} ({account.displayBalance})
                                                                    </button>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                );
                                            }}
                                        </ConnectButton.Custom>
                                    </div>

                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-2 bg-[#111] text-gray-500 uppercase">Or</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setEmailMode(true)}
                                        className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] text-white font-medium py-3.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                                    >
                                        <Mail className="w-5 h-5" />
                                        Continue with Email
                                    </button>

                                    {error && (
                                        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
                                    )}

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
