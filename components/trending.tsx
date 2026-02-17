'use client';

import { motion } from "framer-motion";
import { MangaCard } from "@/components/manga-card";
import { ArrowRight, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchTrending, type TrendingManga } from "@/lib/api";
import { TrendingSkeleton } from "@/components/skeletons";

export function TrendingSection() {
    const [trendingItems, setTrendingItems] = useState<TrendingManga[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrending()
            .then(data => {
                setTrendingItems(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Failed to fetch trending:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <TrendingSkeleton />;
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-foreground">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <h2 className="text-3xl font-bold tracking-tight">Trending This Week</h2>
                </div>
                <button className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group">
                    View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[500px]">
                {trendingItems.slice(0, 5).map((item, index) => {
                    // Assign span for bento grid if not present
                    const spanClass = item.span || (index === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1");

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={spanClass}
                        >
                            <MangaCard
                                title={item.title}
                                image={item.image}
                                rating={item.rating}
                                chapter={item.chapter}
                                type={item.type}
                                source={item.source}
                                link={item.link}
                                className="w-full h-full"
                            />
                        </motion.div>
                    )
                })}
            </div>
        </section>
    );
}
