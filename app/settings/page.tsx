'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Camera, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function SettingsPage() {
    const { user, token, updateUser, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile State
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
        if (user) {
            setDisplayName(user.display_name || '');
            setEmail(user.email || '');
            setAvatarUrl(user.avatar_url || '');
        }
    }, [user, authLoading, router]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 200 * 1024) { // 200KB limit
                setMessage({ type: 'error', text: 'Image too large. Max 200KB.' });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    display_name: displayName,
                    email,
                    avatar_url: avatarUrl
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to update profile');

            updateUser(data.user);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await fetch(`${API_URL}/user/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to change password');

            setMessage({ type: 'success', text: 'Password changed successfully' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-full hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
                        Settings
                    </h1>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                    >
                        {message.text}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Profile Settings */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-xl"
                        >
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-400" />
                                Profile Information
                            </h2>

                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                {/* Avatar Upload */}
                                <div className="flex flex-col items-center sm:flex-row gap-6">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/30 bg-[#2a2a2a] relative">
                                            {avatarUrl ? (
                                                <Image
                                                    src={avatarUrl}
                                                    alt="Avatar"
                                                    width={96}
                                                    height={96}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                                                    {user.username.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <Camera className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleAvatarChange}
                                            accept="image/png, image/jpeg, image/webp"
                                            className="hidden"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1 text-center sm:text-left">
                                        <h3 className="font-medium text-lg">{user.username}</h3>
                                        <p className="text-sm text-gray-400">Changed your look? Upload a new avatar (max 200KB).</p>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                        >
                                            Upload New Photo
                                        </button>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Display Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600"
                                                placeholder="Enter display name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600"
                                                placeholder="Enter email address"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>

                    {/* Right Column: Security */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-xl"
                        >
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-pink-400" />
                                Security
                            </h2>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Current Password</label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-gray-600"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-gray-600"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-gray-600"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-200 border border-white/5 rounded-lg font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
