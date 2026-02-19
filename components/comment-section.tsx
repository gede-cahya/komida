'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { MessageSquare, Send, Image as ImageIcon, Smile, Eye, EyeOff, Trash2, X, AlertTriangle, FileVideo } from 'lucide-react';
import { LoginModal } from './login-modal';
import { formatDate } from '@/lib/utils';
import { EmojiClickData, Theme } from 'emoji-picker-react';
import { CommentsSkeleton } from '@/components/skeletons';
import { GifPicker } from './gif-picker';
import dynamic from 'next/dynamic';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface Comment {
    id: number;
    username: string;
    role: string;
    content: string;
    created_at: string;
    display_name?: string;
    avatar_url?: string;
    is_spoiler?: boolean;
    media_url?: string;
    user_id?: number; // Needed for delete permission check
}

interface CommentSectionProps {
    slug: string;
    chapter?: string;
}

export function CommentSection({ slug, chapter }: CommentSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);

    const [showLoginModal, setShowLoginModal] = useState(false);

    // Enhanced Features State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [isSpoiler, setIsSpoiler] = useState(false);
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [revealedSpoilers, setRevealedSpoilers] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleEmojiClick = (emojiData: any) => {
        setNewComment((prev) => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('File too large (max 5MB)');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setMediaUrl(data.url);
            } else {
                alert('Upload failed: ' + data.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleEditClick = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setNewComment(comment.content);
        setMediaUrl(comment.media_url || null);
        setIsSpoiler(comment.is_spoiler || false);
        setPreviewMode(false);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setNewComment('');
        setMediaUrl(null);
        setIsSpoiler(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() && !mediaUrl) return;

        if (!user) {
            setShowLoginModal(true);
            return;
        }

        setPosting(true);
        try {
            if (editingCommentId) {
                // UPDATE Mode
                const res = await fetch(`/api/comments/${editingCommentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        content: newComment,
                        is_spoiler: isSpoiler,
                        media_url: mediaUrl
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    setComments(comments.map(c => c.id === editingCommentId ? { ...c, ...data.comment } : c));
                    handleCancelEdit(); // Reset form
                } else {
                    alert('Failed to update comment');
                }
            } else {
                // CREATE Mode
                const res = await fetch('/api/comments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        slug,
                        chapter,
                        content: newComment,
                        is_spoiler: isSpoiler,
                        media_url: mediaUrl
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    setComments([data.comment, ...comments]);
                    setNewComment('');
                    setMediaUrl(null);
                    setIsSpoiler(false);
                    setPreviewMode(false);
                } else {
                    alert('Failed to post comment');
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setPosting(false);
        }
    };

    const handleDelete = async (commentId: number) => {
        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setComments(comments.filter(c => c.id !== commentId));
            } else {
                const errorData = await res.json();
                alert('Failed to delete comment: ' + (errorData.error || 'Unknown error'));
            }
        } catch (e) {
            console.error('Delete exception:', e);
        }
    };

    const toggleSpoilerReveal = (id: number) => {
        const newSet = new Set(revealedSpoilers);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setRevealedSpoilers(newSet);
    };

    const getInitials = (name: string) => name.slice(0, 2).toUpperCase();
    const getRandomColor = (name: string) => {
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
        return colors[name.length % colors.length];
    };

    return (
        <section className="w-full max-w-4xl mx-auto px-4 py-12">
            {/* ... header ... */}
            <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-white">
                    Comments {chapter ? '(Chapter)' : '(Series)'} <span className="text-gray-500 text-base font-normal">({comments.length})</span>
                </h3>
            </div>

            {/* Post/Edit Comment Form */}
            <div className="bg-[#1a1a1a] rounded-2xl p-4 md:p-6 border border-white/5 mb-8">
                {user ? (
                    <div className="flex gap-4">
                        {/* ... user avatar ... */}
                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${!user.avatar_url ? getRandomColor(user.username) : ''} overflow-hidden`}>
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                getInitials(user.display_name || user.username)
                            )}
                        </div>
                        <div className="flex-1 space-y-3 min-w-0">
                            {/* Tabs */}
                            <div className="flex gap-4 text-sm font-medium border-b border-white/10 justify-between">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setPreviewMode(false)}
                                        className={`pb-2 px-1 ${!previewMode ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {editingCommentId ? 'Edit Comment' : 'Write'}
                                    </button>
                                    <button
                                        onClick={() => setPreviewMode(true)}
                                        className={`pb-2 px-1 ${previewMode ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Preview
                                    </button>
                                </div>
                                {editingCommentId && (
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-xs text-red-400 hover:text-red-300 pb-2"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>

                            {!previewMode ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder={editingCommentId ? "Update your comment..." : "Join the discussion..."}
                                        className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none h-24 min-h-[100px]"
                                    />

                                    {/* ... existing media preview ... */}
                                    {mediaUrl && (
                                        <div className="relative inline-block mt-2">
                                            <img src={mediaUrl} alt="Upload preview" className="h-20 w-auto rounded-lg border border-white/10" />
                                            <button
                                                onClick={() => setMediaUrl(null)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Toolbar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* ... existing emoji/upload/spoiler buttons ... */}
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Add Emoji"
                                                >
                                                    <Smile className="w-5 h-5" />
                                                </button>
                                                {showEmojiPicker && (
                                                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] sm:absolute sm:top-10 sm:left-0 sm:translate-x-0 sm:translate-y-0 sm:w-auto sm:max-w-none">
                                                        <div className="fixed inset-0 bg-black/50 sm:bg-transparent" onClick={() => setShowEmojiPicker(false)} />
                                                        <div className="relative shadow-xl rounded-xl overflow-hidden border border-white/10">
                                                            <EmojiPicker
                                                                theme={Theme.DARK}
                                                                onEmojiClick={handleEmojiClick}
                                                                width="100%"
                                                                height={400}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                title="Upload Image/GIF"
                                                disabled={isUploading}
                                            >
                                                <ImageIcon className="w-5 h-5" />
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                            />

                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowGifPicker(!showGifPicker)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
                                                    title="Add GIF"
                                                >
                                                    <FileVideo className="w-5 h-5" />
                                                    <span className="text-xs font-bold">GIF</span>
                                                </button>
                                                {showGifPicker && (
                                                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] sm:absolute sm:bottom-12 sm:left-0 sm:translate-x-0 sm:translate-y-0 sm:w-80 sm:max-w-none">
                                                        <div className="fixed inset-0 bg-black/50 sm:bg-transparent" onClick={() => setShowGifPicker(false)} />
                                                        <div className="relative">
                                                            <GifPicker
                                                                onGifSelect={(url) => {
                                                                    setMediaUrl(url);
                                                                    setShowGifPicker(false);
                                                                }}
                                                                onClose={() => setShowGifPicker(false)}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setIsSpoiler(!isSpoiler)}
                                                className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${isSpoiler ? 'text-red-400 bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                                title="Toggle Spoiler"
                                            >
                                                {isSpoiler ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                <span className="text-xs font-medium">{isSpoiler ? 'Spoiler On' : 'Spoiler Off'}</span>
                                            </button>
                                        </div>

                                        <button
                                            onClick={handleSubmit}
                                            disabled={posting || (!newComment.trim() && !mediaUrl)}
                                            className={`px-6 py-2 w-full sm:w-auto ${editingCommentId ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/80'} text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                                        >
                                            {posting ? (editingCommentId ? 'Updating...' : 'Posting...') : <>{isUploading ? 'Uploading...' : (editingCommentId ? 'Update' : 'Post')} <Send className="w-4 h-4" /></>}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Preview Content
                                <div className="bg-[#111] border border-white/10 rounded-xl p-4 min-h-[100px]">
                                    <div className="flex gap-4">
                                        {/* ... user avatar in preview ... */}
                                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${!user.avatar_url ? getRandomColor(user.username) : ''} overflow-hidden`}>
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                getInitials(user.display_name || user.username)
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-white">{user.display_name || user.username}</span>
                                                <span className="text-xs text-gray-500">• Preview</span>
                                            </div>

                                            {isSpoiler ? (
                                                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 text-red-400 mb-2">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <span className="text-xs font-bold uppercase tracking-wider">Spoiler Warning</span>
                                                    </div>
                                                    <div className="blur-sm select-none text-gray-400 break-words">
                                                        {newComment || 'No content'}
                                                        <br />
                                                        {mediaUrl && '[Image Hidden]'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words">{newComment}</p>
                                                    {mediaUrl && (
                                                        <img src={mediaUrl} alt="Comment attachment" className="mt-3 max-h-60 rounded-lg" />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // ... existing login prompt ...
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
                    comments.map((comment) => {
                        const isRevealed = revealedSpoilers.has(comment.id);

                        // Strict check: Only display Delete/Edit if user is owner. Admin can delete.
                        const isOwner = user?.username === comment.username; // Safer than user_id if not unified
                        const isAdmin = user?.role === 'admin';
                        const canDelete = isOwner || isAdmin;
                        const canEdit = isOwner;

                        return (
                            <div key={comment.id} className={`flex gap-4 group ${editingCommentId === comment.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                {/* ... existing comment render ... */}
                                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${!comment.avatar_url ? getRandomColor(comment.username) : ''} overflow-hidden`}>
                                    {comment.avatar_url ? (
                                        <img src={comment.avatar_url} alt={comment.username} className="w-full h-full object-cover" />
                                    ) : (
                                        getInitials(comment.display_name || comment.username)
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-white break-words">{comment.display_name || comment.username}</span>
                                            {comment.role === 'admin' && (
                                                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded uppercase tracking-wider">
                                                    Admin
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500 whitespace-nowrap">• {formatDate(comment.created_at)}</span>
                                            {/* Edited indicator could go here if we tracked updated_at */}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 shrink-0">
                                            {canEdit && (
                                                <button
                                                    onClick={() => handleEditClick(comment)}
                                                    className="opacity-0 group-hover:opacity-100 text-xs text-gray-500 hover:text-primary transition-all"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            {canDelete && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all rounded"
                                                            title="Delete Comment"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-gray-400">
                                                                Are you sure you want to delete this comment? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(comment.id)}
                                                                className="bg-red-600 hover:bg-red-700 text-white border-0"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </div>

                                    {/* ... existing content render ... */}
                                    {comment.is_spoiler && !isRevealed ? (
                                        <div className="bg-[#1a1a1a] border border-red-500/20 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-red-400">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Spoiler Content</span>
                                                </div>
                                                <button
                                                    onClick={() => toggleSpoilerReveal(comment.id)}
                                                    className="text-xs text-gray-400 hover:text-white underline"
                                                >
                                                    Show Content
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={comment.is_spoiler ? "bg-red-500/5 p-3 rounded-lg border border-red-500/10" : ""}>
                                            {comment.is_spoiler && (
                                                <div className="flex items-center justify-between mb-2 pb-2 border-b border-red-500/10">
                                                    <span className="text-xs text-red-400 font-bold uppercase tracking-wider">Spoiler Revealed</span>
                                                    <button
                                                        onClick={() => toggleSpoilerReveal(comment.id)}
                                                        className="text-xs text-gray-500 hover:text-white"
                                                    >
                                                        Hide
                                                    </button>
                                                </div>
                                            )}
                                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
                                            {comment.media_url && (
                                                <img
                                                    src={comment.media_url}
                                                    alt="Attachment"
                                                    className="mt-3 max-h-80 rounded-lg border border-white/5 cursor-pointer hover:opacity-90 transition-opacity max-w-full"
                                                    onClick={() => window.open(comment.media_url, '_blank')}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
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
