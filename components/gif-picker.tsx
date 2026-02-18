'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, X } from 'lucide-react';

interface TenorResponse {
    results: {
        id: string;
        media: {
            tinygif: {
                url: string;
                dims: number[];
            };
            gif: {
                url: string;
            };
        }[];
        content_description: string;
    }[];
}

interface GifPickerProps {
    onGifSelect: (url: string) => void;
    onClose: () => void;
}

export function GifPicker({ onGifSelect, onClose }: GifPickerProps) {
    const [query, setQuery] = useState('');
    const [gifs, setGifs] = useState<TenorResponse['results']>([]);
    const [loading, setLoading] = useState(false);

    // Simple debounce implementation inside component to avoid dependency issues if hook doesn't exist
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);
        return () => clearTimeout(handler);
    }, [query]);

    const fetchGifs = useCallback(async (searchQuery: string) => {
        setLoading(true);
        try {
            const apiKey = process.env.NEXT_PUBLIC_TENOR_API_KEY;
            const baseUrl = 'https://g.tenor.com/v1';
            const endpoint = searchQuery ? 'search' : 'trending';
            const url = `${baseUrl}/${endpoint}?q=${encodeURIComponent(searchQuery)}&key=${apiKey}&limit=20&media_filter=minimal`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.results) {
                setGifs(data.results);
            }
        } catch (error) {
            console.error('Failed to fetch GIFs:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGifs(debouncedQuery);
    }, [debouncedQuery, fetchGifs]);

    return (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col h-[400px]">
            {/* Header */}
            <div className="p-3 border-b border-white/10 flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search Tenor GIFs..."
                        className="w-full bg-[#111] text-sm text-white rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-500"
                        autoFocus
                    />
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-gray-500 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-xs">Loading GIFs...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {gifs.map((gif) => (
                            <button
                                key={gif.id}
                                onClick={() => onGifSelect(gif.media[0].gif.url)} // Use full size URL for insertion
                                className="relative aspect-video rounded-lg overflow-hidden group hover:ring-2 hover:ring-primary transition-all bg-[#111]"
                            >
                                <img
                                    src={gif.media[0].tinygif.url}
                                    alt={gif.content_description}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </button>
                        ))}
                        {gifs.length === 0 && !loading && (
                            <div className="col-span-2 text-center py-8 text-xs text-gray-500">
                                No GIFs found
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-white/10 bg-[#111] flex justify-center">
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    Powered by <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Tenor_logo.svg" alt="Tenor" className="h-3 opacity-50" />
                </span>
            </div>
        </div>
    );
}
