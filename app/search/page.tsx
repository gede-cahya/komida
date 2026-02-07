"use client";

import { Navbar } from "@/components/navbar";
import { MangaCard } from "@/components/manga-card";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Manga {
    title: string;
    image: string;
    chapter?: string;
    rating?: number;
    link: string;
    source: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            setLoading(true);
            fetch(`${API_URL}/manga/search?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    setResults(data.results || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [query]);

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <div className="flex items-center gap-4 mb-8">
                <h1 className="text-2xl font-bold">
                    Search Results for <span className="text-primary">"{query}"</span>
                </h1>
                <span className="bg-secondary px-3 py-1 rounded-full text-xs text-gray-400">
                    {results.length} Found
                </span>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="aspect-[3/4] bg-secondary/30 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {results.map((manga, i) => (
                        <MangaCard key={i} {...manga} rating={manga.rating || 0} chapter={manga.chapter || '?'} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <p>No results found.</p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-primary/30">
            <Navbar />
            <Suspense fallback={<div className="container mx-auto px-4 py-8 mt-16 text-center">Loading search...</div>}>
                <SearchContent />
            </Suspense>
            <footer className="border-t border-white/5 bg-black py-8 mt-12">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>© 2026 Komida. All rights reserved.</p>
                </div>
            </footer>
        </main>
    );
}
