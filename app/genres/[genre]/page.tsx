'use client';

import { Navbar } from "@/components/navbar";
import { MangaCard } from "@/components/manga-card";
import { fetchGenre, type Manga } from "@/lib/api";
import { useEffect, useState } from "react";
import { Tag, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function GenreDetailPage() {
    const params = useParams();
    const genreSlug = Array.isArray(params.genre) ? params.genre[0] : params.genre;
    const genreName = genreSlug ? genreSlug.charAt(0).toUpperCase() + genreSlug.slice(1).replace(/-/g, ' ') : 'Genre';

    const [mangaList, setMangaList] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isLoadMore, setIsLoadMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadManga = (pageNum: number, isAppending: boolean) => {
        if (!genreSlug) return;

        if (isAppending) setIsLoadMore(true);
        else setLoading(true);

        fetchGenre(genreSlug, pageNum)
            .then(data => {
                if (data.length === 0) {
                    setHasMore(false);
                } else {
                    if (isAppending) {
                        setMangaList(prev => {
                            // Filter duplicates
                            const newItems = data.filter((item: Manga) => !prev.some(p => p.title === item.title));
                            return [...prev, ...newItems];
                        });
                    } else {
                        setMangaList(data);
                    }
                }
                setLoading(false);
                setIsLoadMore(false);
            })
            .catch(error => {
                console.error("Failed to fetch genre manga:", error);
                setLoading(false);
                setIsLoadMore(false);
            });
    };

    useEffect(() => {
        loadManga(1, false);
    }, [genreSlug]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadManga(nextPage, true);
    };

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="container mx-auto px-4 py-24">
                <div className="flex flex-col gap-4 mb-8">
                    <Link href="/genres" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors w-fit">
                        <ArrowLeft className="w-4 h-4" /> Back to Genres
                    </Link>
                    <div className="flex items-center gap-2">
                        <Tag className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight text-white capitalize">{genreName} Manga</h1>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-secondary/50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        {mangaList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <p>No manga found for this genre.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                {mangaList.map((item, index) => (
                                    <motion.div
                                        key={`${item.title}-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
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
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Load More Pagination */}
                        {hasMore && mangaList.length > 0 && (
                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadMore}
                                    className="flex items-center gap-2 px-8 py-3 bg-secondary hover:bg-secondary/80 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoadMore ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        'Load More'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
