
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { MessageSquare, Send } from 'lucide-react';
import { LoginModal } from './login-modal';
import { formatDate } from '@/lib/utils';
import { CommentsSkeleton } from '@/components/skeletons';

interface Comment {
    id: number;
    username: string;
    role: string;
    content: string;
    created_at: string;
    display_name?: string;
    avatar_url?: string;
}

interface CommentSectionProps {
    slug: string;
    chapter?: string; // Optional: if present, show chapter comments
}

export function CommentSection({ slug, chapter }: CommentSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [slug, chapter]);

    const fetchComments = async () => {
        try {
            let url = `/api/comments?slug=${slug}`;
            if (chapter) {
                url += `&chapter=${chapter}`;
            }
            const res = await fetch(url, { credentials: 'include' });
            const data = await res.json();
            if (res.ok) {
                setComments(data.comments || []);
            }
        } catch (e) {
            console.error('Failed to fetch comments', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!user) {
            setShowLoginModal(true);
            return;
        }

        setPosting(true);
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    slug,
                    chapter,
                    content: newComment
                })
            });

            if (res.ok) {
                const data = await res.json();
                setComments([data.comment, ...comments]); // Prepend new comment
                setNewComment('');
            } else {
                alert('Failed to post comment');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setPosting(false);
        }
    };



    const getInitials = (name: string) => name.slice(0, 2).toUpperCase();
    const getRandomColor = (name: string) => {
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
        return colors[name.length % colors.length];
    };

    return (
        <section className="w-full max-w-4xl mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-white">
                    Comments {chapter ? '(Chapter)' : '(Series)'} <span className="text-gray-500 text-base font-normal">({comments.length})</span>
                </h3>
            </div>

            {/* Post Comment Form */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 mb-8">
                {user ? (
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${!user.avatar_url ? getRandomColor(user.username) : ''} overflow-hidden`}>
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                getInitials(user.display_name || user.username)
                            )}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Join the discussion..."
                                className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none h-24"
                            />
                            <div className="flex justify-end mt-3">
                                <button
                                    type="submit"
                                    disabled={posting || !newComment.trim()}
                                    className="px-6 py-2 bg-primary hover:bg-primary/80 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {posting ? 'Posting...' : <>Post <Send className="w-4 h-4" /></>}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-gray-400 mb-4">Log in to join the discussion for {chapter ? 'this chapter' : 'this manga'}.</p>
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
                        >
                            Log In / Sign Up
                        </button>
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {loading ? (
                    <CommentsSkeleton />
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${!comment.avatar_url ? getRandomColor(comment.username) : ''} overflow-hidden`}>
                                {comment.avatar_url ? (
                                    <img src={comment.avatar_url} alt={comment.username} className="w-full h-full object-cover" />
                                ) : (
                                    getInitials(comment.display_name || comment.username)
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-white">{comment.display_name || comment.username}</span>
                                    {comment.role === 'admin' && (
                                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded uppercase tracking-wider">
                                            Admin
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-500">• {formatDate(comment.created_at)}</span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-[#1a1a1a]/50 rounded-2xl border border-white/5 border-dashed">
                        <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>

            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </section>
    );
}
