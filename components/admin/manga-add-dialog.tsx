
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Search, Loader2, Plus, Download, X } from 'lucide-react';

interface MangaAddDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface SearchResult {
    title: string;
    image: string;
    source: string;
    chapter: string;
    rating: number;
    link: string;
}


const API_URL = '/api';

export default function MangaAddDialog({ isOpen, onClose, onSuccess }: MangaAddDialogProps) {
    const [query, setQuery] = useState('');
    const [source, setSource] = useState(''); // Empty = All, or specific
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [importing, setImporting] = useState<string | null>(null); // Link of manga being imported
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);

        try {
            const res = await fetch(`${API_URL}/admin/manga/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ query, source: source || undefined })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Search failed: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            setResults(data.results || []);
        } catch (err: any) {
            console.error('Search error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (manga: SearchResult) => {
        setImporting(manga.link);
        setError('');

        try {
            const res = await fetch(`${API_URL}/admin/manga/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ source: manga.source, link: manga.link })
            });

            if (!res.ok) throw new Error('Failed to import');
            // Suggest success?
            // Optionally close dialog or just show success state on item
            alert(`Successfully imported: ${manga.title}`);
            onSuccess();
        } catch (err: any) {
            setError('Import failed: ' + err.message);
        } finally {
            setImporting(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-500" />
                        Add New Comic
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 border-b border-gray-800 bg-gray-900/50">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search title..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <select
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">All Sources</option>
                            <option value="Kiryuu">Kiryuu</option>
                            <option value="ManhwaIndo">ManhwaIndo</option>
                            {/* Add others if supported */}
                        </select>
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                        </button>
                    </form>
                    {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p>Searching external sources...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.map((manga, idx) => (
                                <div key={idx} className="flex gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors">
                                    <div className="w-20 h-28 flex-shrink-0 bg-gray-700 rounded overflow-hidden">
                                        <img
                                            src={manga.image}
                                            alt={manga.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white truncate" title={manga.title}>{manga.title}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                                            <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-blue-200">{manga.source}</span>
                                            <span>{manga.rating > 0 ? `★ ${manga.rating}` : ''}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{manga.chapter}</p>

                                        <button
                                            onClick={() => handleImport(manga)}
                                            disabled={importing === manga.link}
                                            className="mt-3 w-full flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 py-1.5 rounded-lg text-sm transition-colors border border-green-600/30"
                                        >
                                            {importing === manga.link ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Importing...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-4 h-4" />
                                                    Import to Library
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p>Search for a comic to add to your library</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
