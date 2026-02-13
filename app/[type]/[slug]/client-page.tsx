'use client';

import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Star, User, Book, Clock, ArrowLeft, Layers, Bookmark, Heart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { isBookmarked, removeBookmark, saveBookmark } from "@/lib/bookmarks";
import { CommentSection } from "@/components/comment-section";
import { formatDate } from "@/lib/utils";

interface SourceDetail {
    name: string;
    link: string;
    rating: number;
    chapters: { title: string; link: string; released?: string; id?: string }[];
    image?: string;
}

interface AggregatedMangaDetail {
    title: string;
    image: string;
    author: string;
    status: string;
    genres: string[];
    synopsis: string;
    sources: SourceDetail[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ... imports ...

interface MangaDetailPageProps {
    initialData?: AggregatedMangaDetail | null;
}

export default function MangaDetailPage({ initialData }: MangaDetailPageProps) {
    const params = useParams();

    // params.type and params.slug are available here
    const type = Array.isArray(params.type) ? params.type[0] : params.type;
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

    const [detail, setDetail] = useState<AggregatedMangaDetail | null>(initialData || null);
    const [selectedSource, setSelectedSource] = useState<SourceDetail | null>(() => {
        if (initialData && initialData.sources.length > 0) {
            return initialData.sources.reduce((prev, current) =>
                (prev.chapters.length > current.chapters.length) ? prev : current
            );
        }
        return null;
    });
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (!slug) return;

        setLoading(true);
        // Using the new slug-based API
        fetch(`${API_URL}/manga/slug/${slug}`)
            .then(res => {
                if (!res.ok) throw new Error('Manga not found');
                return res.json();
            })
            .then((data: AggregatedMangaDetail) => {
                setDetail(data);
                if (data.sources.length > 0) {
                    // Default to the source with the most chapters
                    const bestSource = data.sources.reduce((prev, current) =>
                        (prev.chapters.length > current.chapters.length) ? prev : current
                    );
                    setSelectedSource(bestSource);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load detail');
                setLoading(false);
            });
    }, [slug]);

    useEffect(() => {
        if (detail) {
            setIsSaved(isBookmarked(detail.title));
        }
    }, [detail]);

    const toggleBookmark = () => {
        if (!detail || !selectedSource) return;
        if (isSaved) {
            removeBookmark(detail.title);
            setIsSaved(false);
        } else {
            saveBookmark({
                id: 0, // Placeholder
                title: detail.title,
                image: detail.image,
                rating: selectedSource.rating || 0,
                chapter: selectedSource.chapters[0]?.title || 'Unknown',
                type: type, // Pass type
                source: selectedSource.name,
                link: slug // Store slug for linking back
            });
            setIsSaved(true);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-24 flex justify-center">
                    <div className="text-white animate-pulse">Loading manga details...</div>
                </div>
            </main>
        );
    }

    if (error || !detail || !selectedSource) {
        return (
            <main className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-24 flex flex-col items-center gap-4">
                    <div className="text-red-500">{error || 'Manga not found'}</div>
                    <Link href="/" className="text-blue-400 hover:underline">Back to Home</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground pb-24">
            <Navbar />

            {/* Header / Hero */}
            <div className="relative w-full h-[300px] md:h-[400px]">
                {/* Blurred Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <Image
                        src={detail.image ? `/api/image/proxy?url=${encodeURIComponent(detail.image)}&source=${selectedSource?.name || 'kiryuu'}` : '/placeholder.png'}
                        alt="Background"
                        fill
                        className="object-cover blur-[50px] opacity-20 scale-110"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
                    <div className="absolute inset-0 bg-black/40" /> {/* Added overlay for contrast */}
                </div>

                <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-10">
                    <Link href="/" className="absolute top-24 left-4 md:left-0 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <ArrowLeft className="w-5 h-5" /> Back
                    </Link>
                </div>
            </div>

            {/* Content Info */}
            <div className="container mx-auto px-4 -mt-32 md:-mt-48 relative z-20">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Cover Image */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-[200px] md:w-[300px] aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl mx-auto md:mx-0 shrink-0 ring-1 ring-white/10"
                    >
                        <Image
                            src={detail.image ? `/api/image/proxy?url=${encodeURIComponent(detail.image)}&source=${selectedSource?.name || 'kiryuu'}` : '/placeholder.png'}
                            alt={detail.title}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </motion.div>

                    {/* Metadata */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex-1 space-y-6 pt-4"
                    >
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">{detail.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><Book className="w-4 h-4 text-primary" /> {selectedSource.name}</span>
                                <span className="flex items-center gap-1"><User className="w-4 h-4 text-blue-400" /> {detail.author}</span>
                                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> {selectedSource.rating || 0}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${detail.status === 'Ongoing' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {detail.status}
                                </span>
                            </div>

                            {/* Bookmark Button */}
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={toggleBookmark}
                                    className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all ${isSaved
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                        }`}
                                >
                                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                                    {isSaved ? 'Saved' : 'Bookmark'}
                                </button>
                            </div>
                        </div>

                        {/* Source Selection */}
                        {detail.sources.length > 1 && (
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <Layers className="w-3 h-3" /> Select Source
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {detail.sources.map(src => (
                                        <button
                                            key={src.name}
                                            onClick={() => setSelectedSource(src)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSource.name === src.name
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                                : 'bg-secondary hover:bg-secondary/80 text-gray-300'
                                                }`}
                                        >
                                            {src.name}
                                            <span className="ml-2 text-xs opacity-50">({src.chapters.length} ch)</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Genres */}
                        <div className="flex flex-wrap gap-2">
                            {detail.genres.map(genre => (
                                <span key={genre} className="px-3 py-1 rounded-full bg-secondary text-xs font-medium text-secondary-foreground hover:bg-secondary/80 cursor-pointer transition-colors">
                                    {genre}
                                </span>
                            ))}
                        </div>

                        {/* Synopsis */}
                        <div className="prose prose-invert prose-sm max-w-none">
                            <h3 className="text-lg font-semibold text-white mb-2">Synopsis</h3>
                            <p className="whitespace-pre-wrap text-gray-300 leading-relaxed text-sm md:text-base">
                                {detail.synopsis || "No synopsis available."}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Chapters Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-16"
                >
                    <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-bold text-white">Chapters</h2>
                            <span className="text-sm text-gray-500 mt-1">
                                Reading from <span className="text-primary font-semibold">{selectedSource.name}</span>
                            </span>
                        </div>
                        <span className="text-sm text-gray-500 bg-secondary px-3 py-1 rounded-full">
                            {selectedSource.chapters.length} chapters
                        </span>
                    </div>

                    <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {selectedSource.chapters.map((chapter, i) => {
                            // Use the encrypted ID as the chapter slug in the URL
                            const chapterUrl = `/${type}/${slug}/${chapter.id || 'error'}`;

                            return (
                                <Link
                                    key={i}
                                    href={chapterUrl}
                                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors group"
                                >
                                    <span className="font-medium text-gray-200 group-hover:text-primary transition-colors line-clamp-1">{chapter.title}</span>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatDate(chapter.released || '')}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Comment Section */}
                <div className="mt-16 border-t border-white/10 pt-8">
                    <CommentSection slug={slug as string} />
                </div>
            </div>
        </main>
    );
}
