'use client';

import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Menu, X, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ChapterData {
    images: string[];
    next?: string;
    prev?: string;
    source?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function ChapterReaderPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const source = searchParams.get('source');
    const link = searchParams.get('link');

    const type = Array.isArray(params.type) ? params.type[0] : params.type;
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const chapter = Array.isArray(params.chapter) ? params.chapter[0] : params.chapter;
    // Chapter param is now potentially the Encrypted ID.

    const [data, setData] = useState<ChapterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showControls, setShowControls] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const activeSource = source || data?.source;

    useEffect(() => {
        setLoading(true);

        let url = '';
        if (chapter && !source && !link) {
            url = `${API_URL}/manga/chapter?id=${encodeURIComponent(chapter)}`;
        } else if (source && link) {
            url = `${API_URL}/manga/chapter?source=${encodeURIComponent(source)}&link=${encodeURIComponent(link)}`;
        } else {
            setError('Invalid chapter link');
            setLoading(false);
            return;
        }

        fetch(url)
            .then(res => res.json())
            .then(resData => {
                if (resData.images) {
                    setData(resData as ChapterData);
                } else {
                    setError('Failed to load chapter data');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load chapter');
                setLoading(false);
            });
    }, [source, link, chapter]);

    const [chapters, setChapters] = useState<{ title: string; link: string; released?: string; id?: string }[]>([]);
    const [showChapterList, setShowChapterList] = useState(false);

    // Fetch chapter list for the menu
    useEffect(() => {
        if (!slug || !activeSource) return;
        fetch(`${API_URL}/manga/slug/${slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.sources) {
                    const matched = data.sources.find((s: any) => s.name === activeSource);
                    if (matched) {
                        setChapters(matched.chapters);
                    }
                }
            })
            .catch(err => console.error("Failed to fetch chapter list", err));
    }, [slug, activeSource]);

    const navigateToChapter = (chapter: { title: string; link: string; id?: string }) => {
        setShowChapterList(false);
        const urlId = chapter.id || 'error';
        // Clean URL navigation
        router.push(`/${type}/${slug}/${urlId}`);
    };

    // Auto-hide controls on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setShowControls(false);
            } else {
                setShowControls(true);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const navigateChapter = (targetId: string | undefined) => {
        if (!targetId) return;
        router.push(`/${type}/${slug}/${targetId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="animate-pulse">Loading Chapter...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
                <p>{error || 'Chapter not found'}</p>
                <Link href={`/${type}/${slug}`} className="text-blue-400 hover:underline">
                    Back to Detail
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white pb-32">
            {/* Top Bar */}
            <div className={`fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md p-4 flex items-center justify-between z-50 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="flex items-center gap-4">
                    <Link href={`/${type}/${slug}`} className="hover:text-primary transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold line-clamp-1">{slug?.replace(/-/g, ' ')}</h1>
                        {/* If we have an ID, we assume title is not easily available unless fetched or passed. 
                            Ideally API returns title too, or we just show 'Reading' */}
                        <span className="text-xs text-gray-400 capitalize">Reading Chapter</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {data.prev && (
                        <button
                            onClick={() => navigateChapter(data.prev)}
                            className="p-2 rounded hover:bg-white/10"
                        >
                            Prev
                        </button>
                    )}
                    {data.next ? (
                        <button
                            onClick={() => navigateChapter(data.next)}
                            className="p-2 rounded hover:bg-white/10"
                        >
                            Next
                        </button>
                    ) : (
                        <Link
                            href={`/${type}/${slug}`}
                            className="p-2 rounded hover:bg-white/10"
                        >
                            <Home className="w-5 h-5" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Reader Content */}
            <div className="max-w-3xl mx-auto pt-20">
                <div className="flex flex-col">
                    {data.images.map((img, idx) => (
                        <div key={idx} className="relative w-full">
                            {/* We use standard img for best compatibility with external sources and layout */}
                            <img
                                src={!img.startsWith('http') && activeSource === 'Kiryuu' ? `https://kiryuu03.com${img}` : img}
                                alt={`Page ${idx + 1}`}
                                className="w-full h-auto block"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Controls */}
            <div className={`fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur p-4 flex justify-between items-center z-50 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
                {/* Prev Button - Hide if no prev */}
                <div className="w-[100px] flex justify-start">
                    {data.prev ? (
                        <button
                            onClick={() => navigateChapter(data.prev)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" /> Prev
                        </button>
                    ) : null}
                </div>

                {/* Chapter List Button */}
                <button
                    onClick={() => setShowChapterList(true)}
                    className="flex items-center justify-center p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Next Button or Home */}
                <div className="w-[100px] flex justify-end">
                    {data.next ? (
                        <button
                            onClick={() => navigateChapter(data.next)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push(`/${type}/${slug}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                        >
                            <Home className="w-4 h-4" /> Home
                        </button>
                    )}
                </div>
            </div>

            {/* Chapter List Modal */}
            {showChapterList && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex justify-center items-end md:items-center">
                    <div className="bg-gray-900 w-full md:max-w-md h-[80vh] md:h-[70vh] rounded-t-2xl md:rounded-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="font-bold text-lg">Chapters</h3>
                            <button onClick={() => setShowChapterList(false)} className="p-2 rounded-full hover:bg-white/10">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {chapters.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Loading chapters...</p>
                            ) : (
                                chapters.map((ch, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigateToChapter(ch)}
                                        className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/5 flex items-center justify-between group"
                                    >
                                        <span className="font-medium text-gray-300 group-hover:text-white transition-colors">{ch.title}</span>
                                        <span className="text-xs text-gray-500">{ch.released}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
