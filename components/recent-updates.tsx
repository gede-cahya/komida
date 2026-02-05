'use client';

import { MangaCard } from "@/components/manga-card";
import { ArrowRight, Clock } from "lucide-react";

// Dummy Data
const RECENT_UPDATES = [
    {
        id: 1,
        title: "Sakamoto Days",
        image: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?q=80&w=400&auto=format&fit=crop",
        rating: 4.7,
        chapter: 151
    },
    {
        id: 2,
        title: "Dandadan",
        image: "https://images.unsplash.com/photo-1620608930761-9c1626c99026?q=80&w=400&auto=format&fit=crop",
        rating: 4.8,
        chapter: 136
    },
    {
        id: 3,
        title: "Kaiju No. 8",
        image: "https://images.unsplash.com/photo-1629858686161-246e72d65d4b?q=80&w=400&auto=format&fit=crop",
        rating: 4.6,
        chapter: 101
    },
    {
        id: 4,
        title: "Spy x Family",
        image: "https://images.unsplash.com/photo-1606663889134-b1dedb5ed8b7?q=80&w=400&auto=format&fit=crop",
        rating: 4.9,
        chapter: 92
    },
    {
        id: 5,
        title: "Oshi no Ko",
        image: "https://images.unsplash.com/photo-1512418490979-92798cec1380?q=80&w=400&auto=format&fit=crop",
        rating: 4.8,
        chapter: 139
    },
    {
        id: 6,
        title: "Choujin X",
        image: "https://images.unsplash.com/photo-1605273391745-db637add0fc2?q=80&w=400&auto=format&fit=crop",
        rating: 4.5,
        chapter: 48
    }
];

export function RecentUpdates() {
    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-white">
                    <Clock className="w-6 h-6 text-blue-500" />
                    <h2 className="text-2xl font-bold tracking-tight">Recent Updates</h2>
                </div>
                <button className="text-sm font-medium text-muted-foreground hover:text-white flex items-center gap-1 transition-colors group">
                    View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {RECENT_UPDATES.map((item) => (
                    <MangaCard
                        key={item.id}
                        title={item.title}
                        image={item.image}
                        rating={item.rating}
                        chapter={item.chapter}
                        className="w-full"
                    />
                ))}
            </div>
        </section>
    );
}
