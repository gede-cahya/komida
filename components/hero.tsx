'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// Removed Skeleton import as parent handles loading state or we show nothing

interface Manga {
    title: string;
    image: string;
    rating: number;
    synopsis: string;
    genres: string[];
    link: string;
    source?: string;
    type?: string;
}

interface HeroProps {
    items: Manga[];
}

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export function Hero({ items: featuredManga = [] }: HeroProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (featuredManga.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredManga.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [featuredManga]);

    if (featuredManga.length === 0) {
        return null; // or return a fallback hero
    }

    const currentManga = featuredManga[currentIndex];
    const slug = slugify(currentManga.title);
    // Generate a consistent color based on index or title, or just default
    const color = "from-blue-600 to-purple-600";

    return (
        <div className="relative w-full h-[90vh] overflow-hidden">
            {/* Background Image Transition */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentManga.title}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 z-0"
                >
                    <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10`} />
                    <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-20 mix-blend-overlay z-10`} />
                    <Image
                        src={currentManga.image ? `/api/image/proxy?url=${encodeURIComponent(currentManga.image)}&source=${currentManga.source || 'kiryuu'}` : '/placeholder.png'}
                        alt={currentManga.title}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                        sizes="100vw"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-end pb-24 md:pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentManga.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl"
                    >
                        <div className="flex gap-2 mb-4">
                        </div>

                        {/* Title */}
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight tracking-tight drop-shadow-xl line-clamp-2">
                            {currentManga.title}
                        </h1>

                        {/* Rating & Details */}
                        <div className="flex items-center gap-4 mb-6 text-white/90">
                            <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="font-bold text-lg">{currentManga.rating || 'N/A'}</span>
                            </div>
                            <span className="text-sm">Ongoing</span>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <Link href={`/${currentManga.type || 'manga'}/${slug}`}>
                                <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-full font-bold text-lg transition-transform active:scale-95 shadow-lg shadow-primary/25 cursor-pointer">
                                    <BookOpen className="w-5 h-5" />
                                    Read Now
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </AnimatePresence>


                {/* Carousel Indicators */}
                <div className="absolute right-4 md:right-10 bottom-1/2 translate-y-1/2 flex flex-col gap-3 z-30">
                    {featuredManga.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${idx === currentIndex
                                ? "bg-primary scale-125 ring-2 ring-primary/50"
                                : "bg-white/30 hover:bg-white/50"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
