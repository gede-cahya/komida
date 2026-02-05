'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, PlayCircle, BookOpen } from "lucide-react";
import Image from "next/image";

// Dummy Data for Featured Manga
const FEATURED_MANGA = [
    {
        id: 1,
        title: "Solo Leveling",
        description: "In a world where hunters, humans who possess magical abilities, must battle deadly monsters to protect the human race from certain annihilation, a notoriously weak hunter named Sung Jinwoo finds himself in a seemingly endless struggle for survival.",
        rating: 4.9,
        genres: ["Action", "Fantasy", "Adventure"],
        image: "https://images.unsplash.com/photo-1620336655052-b68d90b93d76?q=80&w=1920&auto=format&fit=crop", // Abstract anime-style placeholder
        color: "from-blue-600 to-purple-600"
    },
    {
        id: 2,
        title: "Omniscient Reader's Viewpoint",
        description: "Kim Dokja does not consider himself the protagonist of his own life. Befriending only the books he reads, he lives his life through the stories of others. But when the world changes to match the novel he's been reading, he's the only one who knows how it ends.",
        rating: 4.8,
        genres: ["Fantasy", "System", "Apocalypse"],
        image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=1920&auto=format&fit=crop", // Abstract placeholder
        color: "from-indigo-600 to-cyan-600"
    },
    {
        id: 3,
        title: "The Beginning After The End",
        description: "King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power. Reincarnated into a new world filled with magic and monsters, the king has a second chance to relive his life.",
        rating: 4.9,
        genres: ["Reincarnation", "Magic", "Adventure"],
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1920&auto=format&fit=crop", // Abstract placeholder
        color: "from-red-600 to-orange-600"
    }
];

export function Hero() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % FEATURED_MANGA.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const currentManga = FEATURED_MANGA[currentIndex];

    return (
        <div className="relative w-full h-[90vh] overflow-hidden">
            {/* Background Image Transition */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentManga.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 z-0"
                >
                    <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10`} />
                    <div className={`absolute inset-0 bg-gradient-to-r ${currentManga.color} opacity-20 mix-blend-overlay z-10`} />
                    <Image
                        src={currentManga.image}
                        alt={currentManga.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-end pb-24 md:pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentManga.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl"
                    >
                        {/* Genres */}
                        <div className="flex gap-2 mb-4">
                            {currentManga.genres.map((genre) => (
                                <span key={genre} className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white">
                                    {genre}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight tracking-tight drop-shadow-xl">
                            {currentManga.title}
                        </h1>

                        {/* Rating & Details */}
                        <div className="flex items-center gap-4 mb-6 text-white/90">
                            <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="font-bold text-lg">{currentManga.rating}</span>
                            </div>
                            <span className="text-sm">Ongoing</span>
                            <span className="text-sm">•</span>
                            <span className="text-sm">Updated 2h ago</span>
                        </div>

                        {/* Description */}
                        <p className="text-lg text-white/80 line-clamp-3 mb-8 max-w-2xl text-shadow-sm">
                            {currentManga.description}
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-full font-bold text-lg transition-transform active:scale-95 shadow-lg shadow-primary/25">
                                <BookOpen className="w-5 h-5" />
                                Read Now
                            </button>
                            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-3.5 rounded-full font-bold text-lg transition-all">
                                <PlayCircle className="w-5 h-5" />
                                Watch Trailer
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Carousel Indicators */}
                <div className="absolute right-4 md:right-10 bottom-1/2 translate-y-1/2 flex flex-col gap-3 z-30">
                    {FEATURED_MANGA.map((_, idx) => (
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
