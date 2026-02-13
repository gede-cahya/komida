'use client';

import { Navbar } from "@/components/navbar";
import { MangaCard } from "@/components/manga-card";
import { useEffect, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { getBookmarks, removeBookmark, type Manga } from "@/lib/bookmarks";
import Link from "next/link";
// We need Manga type from api or compatible
// lib/bookmarks imports Manga from lib/api, so strict type.

export default function BookmarksPage() {
    const [bookmarks, setBookmarks] = useState<any[]>([]); // Use any or Manga
    const [loading, setLoading] = useState(true);

    const loadBookmarks = () => {
        setBookmarks(getBookmarks());
        setLoading(false);
    };

    useEffect(() => {
        loadBookmarks();
        window.addEventListener('bookmarks-updated', loadBookmarks);
        return () => window.removeEventListener('bookmarks-updated', loadBookmarks);
    }, []);

    const handleRemove = (e: React.MouseEvent, title: string) => {
        e.preventDefault(); // Prevent navigation if clicking card container
        e.stopPropagation();
        removeBookmark(title);
    };

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="container mx-auto px-4 py-24">
                <div className="flex items-center gap-2 mb-8">
                    <Bookmark className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight text-white">My Bookmarks</h1>
                </div>

                {loading ? (
                    <div className="text-white animate-pulse">Loading...</div>
                ) : bookmarks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                        <Bookmark className="w-16 h-16 opacity-20" />
                        <p className="text-xl">No bookmarks yet</p>
                        <Link href="/" className="text-primary hover:underline">
                            Discover Manga
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {bookmarks.map((item, index) => (
                            <div key={item.title} className="relative group">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <MangaCard
                                        title={item.title}
                                        image={item.image}
                                        rating={item.rating}
                                        chapter={item.chapter}
                                        type={item.type || 'Manga'}
                                        source={item.source || 'Unknown'}
                                        link={item.link || ''}
                                        className="w-full aspect-[2/3]"
                                    />
                                    {/* Remove Button Overlay */}
                                    <button
                                        onClick={(e) => handleRemove(e, item.title)}
                                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700 z-20"
                                        title="Remove Bookmark"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
