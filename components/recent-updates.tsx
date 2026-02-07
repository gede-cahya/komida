'use client';

import { MangaCard } from "@/components/manga-card";
import { ArrowRight, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchRecentUpdates, type Manga } from "@/lib/api";

export function RecentUpdates() {
    const [recentUpdates, setRecentUpdates] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentUpdates()
            .then(data => {
                setRecentUpdates(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Failed to fetch recent updates:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-white">Loading recent updates...</div>;
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-foreground">
                    <Clock className="w-6 h-6 text-blue-500" />
                    <h2 className="text-2xl font-bold tracking-tight">Recent Updates</h2>
                </div>
                <button className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group">
                    View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {recentUpdates.map((item) => (
                    <MangaCard
                        key={item.id}
                        title={item.title}
                        image={item.image}
                        rating={item.rating}
                        chapter={item.chapter}
                        source={item.source}
                        className="w-full"
                    />
                ))}
            </div>
        </section>
    );
}
