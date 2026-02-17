
'use client';

import { useState } from 'react';
import { Trash2, Search, Plus } from 'lucide-react';
import Image from 'next/image';
import MangaAddDialog from './manga-add-dialog';

interface Manga {
    id: number;
    title: string;
    image: string;
    source: string;
    chapter: string;
    last_updated: string;
}

interface MangaTableProps {
    manga: Manga[];
    loading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onSearch: (query: string) => void;
    onRefresh: () => void;
}

export function MangaTable({ manga, loading, page, totalPages, onPageChange, onSearch, onRefresh }: MangaTableProps) {
    const [search, setSearch] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(search);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this manga? This cannot be undone.')) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/manga/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                onRefresh();
            } else {
                alert('Failed to delete manga');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Helper to proxy image
    const getProxyImage = (url: string, source: string) => {
        if (!url) return '';
        const proxyUrl = `/api/image/proxy?url=${encodeURIComponent(url)}&source=${source || 'kiryuu'}`;
        // console.log('Proxying:', { original: url, source, proxyUrl });
        return proxyUrl;
    };

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    const handleUpdateAll = async () => {
        if (!confirm('Are you sure you want to update ALL manga? This will happen in the background.')) return;

        setUpdating(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/manga/update-all`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                alert('Update started in background!');
            } else {
                alert('Failed to start update');
            }
        } catch (error) {
            console.error(error);
            alert('Error starting update');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-white/10">
                <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search manga..."
                        className="w-full bg-black/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
                <div className="flex gap-2">
                    <button
                        onClick={handleUpdateAll}
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                    >
                        {updating ? 'Starting...' : 'Update All'}
                    </button>
                    <button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add Komik
                    </button>
                </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 uppercase text-xs font-semibold text-white">
                        <tr>
                            <th className="px-6 py-4">Cover</th>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Source</th>
                            <th className="px-6 py-4">Last Chapter</th>
                            <th className="px-6 py-4">Updated</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr>
                        ) : manga.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center">No manga found</td></tr>
                        ) : (
                            manga.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="relative w-10 h-14 rounded overflow-hidden bg-gray-800">
                                            {item.image && (
                                                <img
                                                    src={getProxyImage(item.image, item.source)}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white font-medium max-w-xs truncate" title={item.title}>
                                        {item.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-white/10 px-2 py-1 rounded text-xs">
                                            {item.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{item.chapter}</td>
                                    <td className="px-6 py-4">{new Date(item.last_updated).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-white/10 rounded-full text-red-400 transition-colors" title="Delete from Database">
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

            <MangaAddDialog
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onSuccess={() => {
                    setIsAddDialogOpen(false);
                    onRefresh();
                }}
            />
        </div>
    );
}
