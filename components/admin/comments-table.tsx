'use client';

import { useState } from 'react';
import { Trash2, Search, ExternalLink, MessageSquare, User, Calendar, MapPin, AlertCircle, CornerDownRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { DeleteConfirmModal } from './delete-confirm-modal';

interface Comment {
    id: number;
    user_id: number;
    username: string;
    avatar_url: string;
    slug: string;
    chapter_slug: string | null;
    content: string;
    created_at: string;
    is_spoiler?: boolean;
    media_url?: string;
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
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/comments/${deleteModal.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                onRefresh();
                setDeleteModal({ open: false, id: null });
            } else {
                const errorData = await res.json();
                alert('Failed to delete comment: ' + (errorData.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Admin delete exception:', error);
        } finally {
            setDeleting(false);
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Desktop & Tablet Table View */}
            <div className="hidden lg:block bg-[#0f0f0f] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="px-6 py-4 w-[250px]">
                                    <div className="flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" />
                                        User
                                    </div>
                                </th>
                                <th className="px-6 py-4 w-[45%]">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Comment
                                    </div>
                                </th>
                                <th className="px-6 py-4 w-[20%]">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Context
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right w-[150px]">
                                    <div className="flex items-center justify-end gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Date
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right w-[80px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-5"><div className="flex items-center gap-3"><div className="h-10 w-10 bg-white/5 rounded-full" /><div className="space-y-2"><div className="h-4 w-24 bg-white/5 rounded" /><div className="h-3 w-16 bg-white/5 rounded" /></div></div></td>
                                        <td className="px-6 py-5"><div className="h-4 bg-white/5 w-3/4 rounded" /></td>
                                        <td className="px-6 py-5"><div className="h-4 bg-white/5 w-1/2 rounded" /></td>
                                        <td className="px-6 py-5"><div className="h-4 bg-white/5 w-24 rounded ml-auto" /></td>
                                        <td className="px-6 py-5"><div className="h-8 w-8 bg-white/5 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : comments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-white/5 rounded-full ring-1 ring-white/10">
                                                <MessageSquare className="w-8 h-8 opacity-50" />
                                            </div>
                                            <div className="text-sm">No comments to display</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                comments.map((comment) => (
                                    <tr key={comment.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-5 align-top">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden ring-1 ring-white/10 shadow-sm shrink-0">
                                                    {comment.avatar_url ? (
                                                        <img src={comment.avatar_url} alt={comment.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-gray-700 to-gray-800">
                                                            {comment.username.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                                                        {comment.username}
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-mono mt-0.5">ID: {comment.user_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 align-top">
                                            <div className="text-gray-300 text-[15px] leading-relaxed break-words pr-8 whitespace-normal">
                                                {comment.content}
                                                {comment.media_url && (
                                                    <div className="mt-2">
                                                        <a href={comment.media_url} target="_blank" rel="noopener noreferrer">
                                                            <img
                                                                src={comment.media_url}
                                                                alt="Attachment"
                                                                className="h-16 w-auto rounded border border-white/10 hover:opacity-80 transition-opacity"
                                                            />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 align-top">
                                            <div className="flex flex-col gap-2.5 max-w-[200px]">
                                                <Link
                                                    href={`/manga/${comment.slug}`}
                                                    target="_blank"
                                                    className="group/link flex items-start gap-2 text-xs font-medium text-gray-400 hover:text-primary transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-50 group-hover/link:opacity-100 transition-opacity" />
                                                    <span className="truncate" title={comment.slug.replace(/-/g, ' ')}>
                                                        {comment.slug.replace(/-/g, ' ')}
                                                    </span>
                                                </Link>

                                                {comment.chapter_slug && (
                                                    <div className="flex items-center gap-2 pl-2">
                                                        <CornerDownRight className="w-3 h-3 text-gray-600 shrink-0" />
                                                        <Link
                                                            href={`/manga/${comment.slug}/${comment.chapter_slug}`}
                                                            target="_blank"
                                                            className="text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/10 px-2 py-0.5 rounded border border-primary/20 transition-colors truncate max-w-[150px]"
                                                            title={comment.chapter_slug.replace(/-/g, ' ')}
                                                        >
                                                            {comment.chapter_slug.replace(/-/g, ' ')}
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right align-top">
                                            <span className="text-xs font-medium text-gray-500 bg-white/[0.03] px-2 py-1 rounded border border-white/[0.05]">
                                                {formatDate(comment.created_at)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right align-top">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled={deletingId === comment.id}
                                                className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Delete Comment"
                                                onClick={() => setDeleteModal({ open: true, id: comment.id })}
                                            >
                                                {deletingId === comment.id ? (
                                                    <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <DeleteConfirmModal
                                                open={deleteModal.open && deleteModal.id === comment.id}
                                                onOpenChange={(open) => setDeleteModal({ open, id: open ? comment.id : null })}
                                                onConfirm={handleDelete}
                                                title="Delete Comment?"
                                                description="Are you sure you want to delete this comment? This action cannot be undone."
                                                isLoading={deleting}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View (Cards) */}
            <div className="lg:hidden space-y-4">
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
                        <div key={comment.id} className="bg-[#0f0f0f] p-5 rounded-xl border border-white/5 space-y-4 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden ring-1 ring-white/10">
                                        {comment.avatar_url ? (
                                            <img src={comment.avatar_url} alt={comment.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-gray-700 to-gray-800">
                                                {comment.username.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white text-sm">{comment.username}</div>
                                        <div className="text-xs text-gray-500">{formatDate(comment.created_at)}</div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:text-red-400 -mr-2 h-8 w-8"
                                    onClick={() => setDeleteModal({ open: true, id: comment.id })}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                <DeleteConfirmModal
                                    open={deleteModal.open && deleteModal.id === comment.id}
                                    onOpenChange={(open) => setDeleteModal({ open, id: open ? comment.id : null })}
                                    onConfirm={handleDelete}
                                    title="Delete Comment?"
                                    description="Are you sure you want to delete this comment? This action cannot be undone."
                                    isLoading={deleting}
                                />
                            </div>

                            <div className="text-sm text-gray-300 leading-relaxed border-l-2 border-white/10 pl-3">
                                {comment.content}
                            </div>

                            <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                                <Link
                                    href={`/manga/${comment.slug}`}
                                    className="text-xs font-medium text-gray-400 hover:text-primary flex items-center gap-2 truncate"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    {comment.slug.replace(/-/g, ' ')}
                                </Link>
                                {comment.chapter_slug && (
                                    <div className="flex items-center gap-2 pl-1">
                                        <CornerDownRight className="w-3 h-3 text-gray-600" />
                                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                            {comment.chapter_slug.replace(/-/g, ' ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="bg-transparent border-white/10 hover:bg-white/5 text-gray-400 h-8 text-xs"
                    >
                        Previous
                    </Button>
                    <div className="text-xs text-gray-500 px-4 font-mono">
                        Page <span className="text-white font-medium">{page}</span> / {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className="bg-transparent border-white/10 hover:bg-white/5 text-gray-400 h-8 text-xs"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
