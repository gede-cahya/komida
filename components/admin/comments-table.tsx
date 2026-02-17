'use client';

import { useState } from 'react';
import { Trash2, Search, ExternalLink, MessageSquare } from 'lucide-react';
import Link from 'next/link';

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

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/comments/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                onRefresh();
            } else {
                alert('Failed to delete comment');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 uppercase text-xs font-semibold text-white">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Comment</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr>
                        ) : comments.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center">No comments found</td></tr>
                        ) : (
                            comments.map((comment) => (
                                <tr key={comment.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                                                {comment.avatar_url ? (
                                                    <img src={comment.avatar_url} alt={comment.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-primary">
                                                        {comment.username.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{comment.username}</div>
                                                <div className="text-xs text-gray-500">ID: {comment.user_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-md">
                                        <div className="text-white break-words line-clamp-2" title={comment.content}>
                                            {comment.content}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded w-fit">
                                                {comment.slug}
                                            </span>
                                            {comment.chapter_slug && (
                                                <span className="text-xs text-primary">
                                                    {comment.chapter_slug}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(comment.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="p-2 hover:bg-white/10 rounded-full text-red-400 transition-colors"
                                            title="Delete Comment"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <button
                        disabled={page === totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
