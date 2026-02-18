'use client';

import { MangaCard } from "@/components/manga-card";
import { fetchPopular, type Manga } from "@/lib/api";
import { useEffect, useState } from "react";
import { Flame, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { PopularPageSkeleton } from "@/components/skeletons";

export default function PopularPage() {
    const [popularManga, setPopularManga] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isLoadMore, setIsLoadMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadManga = (pageNum: number, isAppending: boolean) => {
        if (isAppending) setIsLoadMore(true);
        else setLoading(true);

        fetchPopular(pageNum)
            .then(data => {
                if (data.length === 0) {
                    setHasMore(false);
                } else {
                    if (isAppending) {
                        setPopularManga(prev => {
                            // Filter duplicates just in case
                            const newItems = data.filter((item: Manga) => !prev.some(p => p.title === item.title));
                            return [...prev, ...newItems];
                        });
                    } else {
                        setPopularManga(data);
                    }
                }
                setLoading(false);
                setIsLoadMore(false);
            })
            .catch(error => {
                console.error("Failed to fetch popular manga:", error);
                setLoading(false);
                setIsLoadMore(false);
            });
    };

    useEffect(() => {
        loadManga(1, false);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadManga(nextPage, true);
    };

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 py-24">
                <div className="flex items-center gap-2 mb-8">
                    <Flame className="w-8 h-8 text-orange-500" />
                    <h1 className="text-3xl font-bold tracking-tight text-white">Popular Manga</h1>
                </div>

                {loading ? (
                    <PopularPageSkeleton />
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {popularManga.map((item, index) => (
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
                                        type={item.type}
                                        source={item.source}
                                        link={item.link}
                                        className="w-full aspect-[2/3]"
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Load More Pagination */}
                        {hasMore && (
                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadMore}
                                    className="px-8 py-3 bg-secondary hover:bg-secondary/80 text-white rounded-full font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isLoadMore ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        'Load More'
                                    )}
                                </button>
                            </div>
                        )}

                        {!hasMore && popularManga.length > 0 && (
                            <div className="mt-12 text-center text-gray-500">
                                You have reached the end.
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
