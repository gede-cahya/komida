'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { GenresListSkeleton } from "@/components/skeletons";

interface Genre {
    name: string;
    slug: string;
}

const API_URL = '/api';

const gradients = [
    'from-rose-500 to-orange-500',
    'from-violet-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-green-500',
    'from-amber-500 to-yellow-500',
    'from-fuchsia-500 to-pink-500'
];

export default function GenresPage() {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/genres', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setGenres(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 py-24">
                <div className="flex items-center gap-2 mb-8">
                    <Tag className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight text-white">Browse Genres</h1>
                </div>

                {loading ? (
                    <GenresListSkeleton />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {genres.map((genre, index) => {
                            const gradient = gradients[index % gradients.length];
                            return (
                                <Link key={genre.slug} href={`/genres/${genre.slug}`}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="relative group overflow-hidden rounded-xl h-24 md:h-32 flex items-center justify-center p-4 bg-secondary/30 hover:bg-secondary/60 border border-white/5 transition-all text-center"
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                        <h3 className="text-lg md:text-xl font-bold text-gray-200 group-hover:text-white transition-colors relative z-10">
                                            {genre.name}
                                        </h3>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
