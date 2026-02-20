
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { User, LogOut, LayoutDashboard, Settings, UserCircle } from 'lucide-react';
import { LoginModal } from './login-modal';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function UserMenu() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getInitials = (name: string) => {
        return name.slice(0, 2).toUpperCase();
    };

    const getRandomColor = (name: string) => {
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
        const index = name.length % colors.length;
        return colors[index];
    };

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                {/* Traditional login toggle button */}
                <button
                    onClick={() => setShowLoginModal(true)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                >
                    <User className="w-5 h-5" />
                </button>
                <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
            </div>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relatve flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold text-white shadow-lg border border-white/20 transition-transform active:scale-95 overflow-hidden ${!user.avatar_url ? getRandomColor(user.username) : ''}`}
            >
                {user.avatar_url ? (
                    <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    getInitials(user.username)
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-white/5">
                            <p className="text-sm font-medium text-white truncate">{user.display_name || user.username}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                        </div>

                        <div className="py-1">
                            {user.role === 'admin' && (
                                <Link
                                    href="/admin/dashboard"
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                            )}
                            <Link
                                href="/settings"
                                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>
                        </div>

                        <div className="border-t border-white/5 py-1">
                            <button
                                onClick={() => { logout(); setIsOpen(false); }}
                                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
