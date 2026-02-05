'use client';

import { motion } from "framer-motion";
import { MangaCard } from "@/components/manga-card";
import { ArrowRight, Flame } from "lucide-react";

// Dummy Data
const TRENDING_ITEMS = [
    {
        id: 1,
        title: "Jujutsu Kaisen",
        image: "https://images.unsplash.com/photo-1621416896709-399691921c56?q=80&w=600&auto=format&fit=crop",
        rating: 4.8,
        chapter: 248,
        type: "Manga",
        span: "md:col-span-2 md:row-span-2"
    },
    {
        id: 2,
        title: "One Piece",
        image: "https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?q=80&w=600&auto=format&fit=crop",
        rating: 4.9,
        chapter: 1105,
        type: "Manga",
        span: "md:col-span-1 md:row-span-2"
    },
    {
        id: 3,
        title: "Chainsaw Man",
        image: "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?q=80&w=600&auto=format&fit=crop",
        rating: 4.7,
        chapter: 153,
        type: "Manga",
        span: "col-span-1 row-span-1"
    },
    {
        id: 4,
        title: "Blue Lock",
        image: "https://images.unsplash.com/photo-1622358826620-1a74d2216bf3?q=80&w=600&auto=format&fit=crop",
        rating: 4.6,
        chapter: 249,
        type: "Manga",
        span: "col-span-1 row-span-1"
    }
];

export function TrendingSection() {
    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-white">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <h2 className="text-3xl font-bold tracking-tight">Trending This Week</h2>
                </div>
                <button className="text-sm font-medium text-muted-foreground hover:text-white flex items-center gap-1 transition-colors group">
                    View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 h-[600px] md:h-[500px]">
                {TRENDING_ITEMS.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className={item.span}
                    >
                        <MangaCard
                            title={item.title}
                            image={item.image}
                            rating={item.rating}
                            chapter={item.chapter}
                            type={item.type}
                            className="w-full h-full"
                        />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
