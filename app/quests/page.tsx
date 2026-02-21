'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Lock, CheckCircle, Sparkles, Target, Zap } from 'lucide-react';
import Image from 'next/image';

interface Quest {
    id: number;
    title: string;
    description: string;
    quest_type: string;
    target_value: number;
    target_genre: string | null;
    reward_type: string;
    reward_badge_id: number | null;
    reward_decoration_id: number | null;
    is_active: boolean;
    starts_at: string | null;
    expires_at: string | null;
    progress: number;
    is_completed: boolean;
    completed_at: string | null;
    // Joined from badges table
    badge_name?: string;
    badge_icon_url?: string;
    // Joined from decorations table
    decoration_name?: string;
    decoration_image_url?: string;
}

export default function QuestsPage() {
    const { user } = useAuth();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<number | null>(null);
    const [showConfetti, setShowConfetti] = useState<number | null>(null);

    useEffect(() => {
        fetchQuests();
    }, [user]);

    const fetchQuests = async () => {
        setLoading(true);
        try {
            if (user) {
                // Logged in: get personalized progress
                const res = await fetch('/api/user/quests', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setQuests(data.quests);
                }
            } else {
                // Guest: show all active quests without progress
                const res = await fetch('/api/quests');
                if (res.ok) {
                    const data = await res.json();
                    setQuests(data.quests.map((q: any) => ({ ...q, progress: 0, is_completed: false })));
                }
            }
        } catch (e) {
            console.error('Failed to fetch quests:', e);
        } finally {
            setLoading(false);
        }
    };

    const claimReward = async (questId: number) => {
        setClaimingId(questId);
        try {
            const res = await fetch(`/api/user/quests/${questId}/claim`, {
                method: 'POST',
                credentials: 'include',
            });
            if (res.ok) {
                setShowConfetti(questId);
                setTimeout(() => setShowConfetti(null), 3000);
                fetchQuests(); // Refresh
            }
        } catch (e) {
            console.error('Failed to claim reward:', e);
        } finally {
            setClaimingId(null);
        }
    };

    const getQuestTypeLabel = (type: string) => {
        switch (type) {
            case 'genre_read': return 'Genre Quest';
            case 'comics_read': return 'Milestone';
            case 'chapters_read': return 'Chapter Quest';
            default: return 'Quest';
        }
    };

    const getQuestTypeColor = (type: string) => {
        switch (type) {
            case 'genre_read': return 'from-purple-500 to-indigo-600';
            case 'comics_read': return 'from-amber-500 to-orange-600';
            case 'chapters_read': return 'from-emerald-500 to-teal-600';
            default: return 'from-blue-500 to-cyan-600';
        }
    };

    const getProgressBarColor = (type: string) => {
        switch (type) {
            case 'genre_read': return 'bg-gradient-to-r from-purple-500 to-indigo-500';
            case 'comics_read': return 'bg-gradient-to-r from-amber-500 to-orange-500';
            case 'chapters_read': return 'bg-gradient-to-r from-emerald-500 to-teal-500';
            default: return 'bg-gradient-to-r from-blue-500 to-cyan-500';
        }
    };

    const getBadgeIconUrl = (quest: Quest) => {
        if (quest.badge_icon_url) {
            // Resolve backend-relative paths through API proxy
            if (quest.badge_icon_url.startsWith('/uploads')) {
                return `/api${quest.badge_icon_url}`;
            }
            return quest.badge_icon_url;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-[var(--background)] pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="relative">
                            <Trophy className="w-12 h-12 text-amber-400" />
                            <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
                            Quests
                        </h1>
                    </div>
                    <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
                        Selesaikan quest untuk mendapatkan badge eksklusif dan avatar decoration!
                    </p>
                    {!user && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm">
                            <Lock className="w-4 h-4" />
                            Login untuk mulai tracking progress quest
                        </div>
                    )}
                </motion.div>

                {/* Loading */}
                {loading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-[var(--card)]/50 rounded-2xl p-6 animate-pulse border border-[var(--border)]">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-[var(--muted)] rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-[var(--muted)] rounded w-1/3" />
                                        <div className="h-4 bg-[var(--muted)] rounded w-2/3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quest List */}
                {!loading && (
                    <div className="space-y-5">
                        <AnimatePresence>
                            {quests.map((quest, index) => {
                                const progressPercent = Math.min(
                                    (quest.progress / (quest.target_value || 1)) * 100,
                                    100
                                );
                                const badgeUrl = getBadgeIconUrl(quest);

                                return (
                                    <motion.div
                                        key={quest.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${quest.is_completed
                                            ? 'border-emerald-500/30 bg-emerald-500/5'
                                            : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/30 hover:shadow-lg hover:shadow-[var(--primary)]/5'
                                            }`}
                                    >
                                        {/* Confetti overlay */}
                                        {showConfetti === quest.id && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 bg-gradient-to-r from-amber-400/20 to-purple-400/20 backdrop-blur-sm flex items-center justify-center"
                                            >
                                                <div className="text-center">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: 'spring', damping: 10 }}
                                                    >
                                                        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-2" />
                                                    </motion.div>
                                                    <p className="text-xl font-bold text-white">Reward Claimed!</p>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="p-6">
                                            <div className="flex items-start gap-5">
                                                {/* Badge Icon */}
                                                <div className="relative flex-shrink-0 w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-[var(--background)]">
                                                    {badgeUrl ? (
                                                        <Image
                                                            src={badgeUrl}
                                                            alt={quest.title}
                                                            fill
                                                            sizes="80px"
                                                            className={`object-cover ${quest.is_completed ? '' : 'opacity-50 grayscale'}`}
                                                        />
                                                    ) : (
                                                        <div className={`w-full h-full rounded-full bg-gradient-to-br ${getQuestTypeColor(quest.quest_type)} flex items-center justify-center`}>
                                                            <Trophy className={`w-8 h-8 ${quest.is_completed ? 'text-amber-400' : 'text-white/50'}`} />
                                                        </div>
                                                    )}
                                                    {quest.is_completed && (
                                                        <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                                                            <CheckCircle className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Quest Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${getQuestTypeColor(quest.quest_type)} text-white`}>
                                                            {getQuestTypeLabel(quest.quest_type)}
                                                        </span>
                                                        {quest.target_genre && (
                                                            <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded-full">
                                                                {quest.target_genre}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                                                        {quest.title}
                                                    </h3>
                                                    <p className="text-sm text-[var(--muted-foreground)] mb-3">
                                                        {quest.description}
                                                    </p>

                                                    {/* Reward Info */}
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        {quest.badge_name && (
                                                            <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">
                                                                <Star className="w-3 h-3" />
                                                                {quest.badge_name}
                                                            </span>
                                                        )}
                                                        {quest.decoration_name && (
                                                            <span className="inline-flex items-center gap-1 text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                                                                <Sparkles className="w-3 h-3" />
                                                                {quest.decoration_name}
                                                            </span>
                                                        )}
                                                        {!quest.badge_name && !quest.decoration_name && (
                                                            <span className="text-xs text-[var(--muted-foreground)]">Reward: Badge</span>
                                                        )}
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-[var(--muted-foreground)]">
                                                                <Target className="w-3 h-3 inline mr-1" />
                                                                Progress
                                                            </span>
                                                            <span className={`font-mono font-bold ${quest.is_completed ? 'text-emerald-400' : 'text-[var(--foreground)]'}`}>
                                                                {quest.progress}/{quest.target_value}
                                                            </span>
                                                        </div>
                                                        <div className="h-2.5 bg-[var(--muted)] rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${progressPercent}%` }}
                                                                transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                                                                className={`h-full rounded-full ${quest.is_completed
                                                                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                                    : getProgressBarColor(quest.quest_type)
                                                                    }`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                <div className="flex-shrink-0">
                                                    {quest.is_completed ? (
                                                        <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg text-sm font-medium">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Done
                                                        </div>
                                                    ) : user ? (
                                                        <div className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-3 py-2 rounded-lg text-center">
                                                            <Zap className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                                                            {Math.round(progressPercent)}%
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-3 py-2 rounded-lg">
                                                            <Lock className="w-4 h-4 mx-auto mb-1" />
                                                            Login
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expires at */}
                                        {quest.expires_at && (
                                            <div className="px-6 pb-3 text-xs text-[var(--muted-foreground)]">
                                                ⏰ Expires: {new Date(quest.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {quests.length === 0 && (
                            <div className="text-center py-20">
                                <Trophy className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4 opacity-30" />
                                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Belum Ada Quest</h3>
                                <p className="text-[var(--muted-foreground)]">Quest baru akan segera hadir!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
