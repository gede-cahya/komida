
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isVerifyingWallet, setIsVerifyingWallet] = useState(false);
    const { login } = useAuth();
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const handleWalletLogin = async () => {
        if (!address) {
            setError('Please connect your wallet first.');
            return;
        }

        try {
            setIsVerifyingWallet(true);
            setError('');

            // 1. Get nonce from server
            const nonceRes = await fetch('/api/auth/nonce');
            const { nonce } = await nonceRes.json();

            // 2. Create SIWE message
            const message = new SiweMessage({
                domain: window.location.host,
                address,
                statement: 'Sign in to Komida. This does not cost any gas or perform a transaction.',
                uri: window.location.origin,
                version: '1',
                chainId: 8453, // Base mainnet (matching our wagmi config)
                nonce,
            });

            // 3. Sign message
            const signature = await signMessageAsync({
                message: message.prepareMessage(),
            });

            // 4. Verify signature on server
            const verifyRes = await fetch('/api/auth/verify-wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message.prepareMessage(), signature }),
                credentials: 'include',
            });

            const data = await verifyRes.json();

            if (!verifyRes.ok) throw new Error(data.error || 'Verification failed');

            // 5. Login user in frontend context
            login(data.user);

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

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) {
                const errorMsg = data.error
                    ? (typeof data.error === 'object' ? JSON.stringify(data.error) : data.error)
                    : (data.message && typeof data.message === 'string' ? data.message : JSON.stringify(data));
                throw new Error(errorMsg);
            }

            login(data.user);
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
                        Login with Password
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-[#111] text-gray-500">Or continue with Web3</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-center w-full">
                        <ConnectButton.Custom>
                            {({
                                account,
                                chain,
                                openAccountModal,
                                openChainModal,
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
                                                    <button onClick={openConnectModal} type="button" className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-white/10 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.89 6 10 6.9 10 8V16C10 17.1 10.89 18 12 18H21ZM12 16H22V8H12V16ZM16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z" />
                                                        </svg>
                                                        Connect Wallet
                                                    </button>
                                                );
                                            }

                                            return (
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={handleWalletLogin}
                                                        disabled={isVerifyingWallet}
                                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {isVerifyingWallet ? 'Verifying...' : 'Sign In with Ethereum'}
                                                    </button>
                                                    <button onClick={openAccountModal} type="button" className="text-xs text-gray-500 hover:text-white transition-colors">
                                                        {account.displayName} ({account.displayBalance})
                                                    </button>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                );
                            }}
                        </ConnectButton.Custom>
                    </div>
                </div>

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
