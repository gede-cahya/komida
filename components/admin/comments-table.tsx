'use client';

import { useState } from 'react';
import { Trash2, Search, ExternalLink, MessageSquare, User, Calendar, MapPin, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

interface Comment {
    id: number;
    user_id: number;
    username: string;
    avatar_url: string;
    slug: string;
    chapter_slug: string | null;
    content: string;
    created_at: string;
}

interface CommentsTableProps {
    comments: Comment[];
    loading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
}

export function CommentsTable({ comments, loading, page, totalPages, onPageChange, onRefresh }: CommentsTableProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/comments/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                onRefresh();
            } else {
                alert('Failed to delete comment');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Desktop & Tablet Table View */}
            <div className="hidden md:block bg-[#111] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 font-medium">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4 w-[40%]">Comment</th>
                            <th className="px-6 py-4">Context</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-10 w-10 bg-white/5 rounded-full" /></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-white/5 w-3/4 rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-white/5 w-1/2 rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-white/5 w-24 rounded" /></td>
                                    <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-white/5 rounded ml-auto" /></td>
                                </tr>
                            ))
                        ) : comments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 bg-white/5 rounded-full">
                                            <MessageSquare className="w-6 h-6" />
                                        </div>
                                        <p>No comments found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            comments.map((comment) => (
                                <tr key={comment.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden ring-1 ring-white/10 shadow-lg">
                                                {comment.avatar_url ? (
                                                    <img src={comment.avatar_url} alt={comment.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-primary to-primary/60">
                                                        {comment.username.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white group-hover:text-primary transition-colors">
                                                    {comment.username}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono">ID: {comment.user_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-gray-300 text-sm leading-relaxed relative">
                                            <div className="absolute top-3 left-0 w-1 h-full max-h-[calc(100%-24px)] bg-primary/20 rounded-r opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {comment.content}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col gap-2">
                                            <Link
                                                href={`/manga/${comment.slug}`}
                                                target="_blank"
                                                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-primary transition-colors truncate max-w-[200px]"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                <span className="truncate">{comment.slug.replace(/-/g, ' ')}</span>
                                            </Link>

                                            {comment.chapter_slug && (
                                                <Link
                                                    href={`/manga/${comment.slug}/${comment.chapter_slug}`}
                                                    target="_blank"
                                                    className="flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition-colors px-2 py-1 bg-primary/10 rounded w-fit"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    {comment.chapter_slug.replace(/-/g, ' ')}
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500 align-top whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(comment.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right align-top">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(comment.id)}
                                            disabled={deletingId === comment.id}
                                            className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors h-9 w-9"
                                            title="Delete Comment"
                                        >
                                            {deletingId === comment.id ? (
                                                <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-[#111] p-4 rounded-xl border border-white/10 animate-pulse h-40" />
                    ))
                ) : comments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-[#111] rounded-xl border border-white/10">
                        <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p>No comments found</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-[#111] p-4 rounded-xl border border-white/10 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden ring-1 ring-white/10">
                                        {comment.avatar_url ? (
                                            <img src={comment.avatar_url} alt={comment.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-primary">
                                                {comment.username.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white text-sm">{comment.username}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(comment.created_at)}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(comment.id)}
                                    className="text-gray-500 hover:text-red-400 -mr-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="p-3 rounded-lg bg-white/[0.03] text-sm text-gray-300">
                                {comment.content}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                <div className="flex flex-col gap-1">
                                    <Link
                                        href={`/manga/${comment.slug}`}
                                        className="text-xs font-medium text-gray-400 hover:text-primary flex items-center gap-1"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        {comment.slug.replace(/-/g, ' ')}
                                    </Link>
                                </div>
                                {comment.chapter_slug && (
                                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                                        {comment.chapter_slug.replace(/-/g, ' ')}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="bg-transparent border-white/10 hover:bg-white/5 text-gray-400"
                    >
                        Previous
                    </Button>
                    <div className="text-sm text-gray-500 px-4">
                        Page <span className="text-white font-medium">{page}</span> of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className="bg-transparent border-white/10 hover:bg-white/5 text-gray-400"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
