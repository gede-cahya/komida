'use client';

import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Menu, X, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CommentSection } from "@/components/comment-section";
import { formatDate } from "@/lib/utils";
import { ScrollToTop } from "@/components/scroll-to-top";

interface ChapterData {
    images: string[];
    next?: string;
    prev?: string;
    source?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ChapterReaderPageProps {
    initialData?: ChapterData | null;
}

export default function ChapterReaderPage({ initialData }: ChapterReaderPageProps) {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const source = searchParams.get('source');
    const link = searchParams.get('link');

    const type = Array.isArray(params.type) ? params.type[0] : params.type;
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const chapterParam = Array.isArray(params.chapter) ? params.chapter[0] : params.chapter;
    const chapter = chapterParam ? decodeURIComponent(chapterParam) : '';
    // Chapter param is now potentially the Encrypted ID.

    const [data, setData] = useState<ChapterData | null>(initialData || null);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState('');
    const [showControls, setShowControls] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const activeSource = source || data?.source;

    useEffect(() => {
        // If we have initialData, we might not need to fetch, UNLESS params changed?
        // But this component mounts with specific params.
        // If query params (source/link) change, we might need to fetch.
        // If initialData matches the current requirement, skip.

        if (initialData && !source && !link && chapter) {
            // Initial data is likely for this chapter.
            // We can skip ensuring logic if we trust initialData.
            // But valid to double check or just rely on Loading state.
            if (data) return;
        }

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
    }, [source, link, chapter]); // Removed initialData from dep array to avoid loops, though it's stable prop

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
        router.push(`/${type}/${slug}/${encodeURIComponent(targetId)}`);
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

    // Toggle controls on tap (middle area preferably, but full screen for simplicity)
    const toggleControls = () => {
        setShowControls(prev => !prev);
    };

    return (
        <main className="min-h-screen bg-[#111] text-gray-200">
            {/* Top Bar */}
            <div
                className={`fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/90 to-transparent z-50 flex items-center px-4 transition-transform duration-300 ease-in-out ${showControls ? 'translate-y-0' : '-translate-y-full'}`}
            >
                <button onClick={() => router.push(`/${type}/${slug}`)} className="p-2 -ml-2 hover:text-white transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="ml-4 flex-1 min-w-0">
                    <h1 className="text-sm font-bold text-white truncate max-w-[80%]">
                        {slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </h1>
                    {data?.source && (
                        <p className="text-xs text-gray-400 capitalize">{data.source} • {chapter}</p>
                    )}
                </div>
            </div>

            {/* Main Content (Images) */}
            <div
                className="w-full min-h-screen flex flex-col items-center pb-32 pt-0"
                onClick={toggleControls}
            >
                <div className="w-full max-w-4xl mx-auto">
                    {data.images.map((img, idx) => (
                        <div key={idx} className="relative w-full min-h-[500px] bg-gray-900/50 mb-1 flex items-center justify-center">
                            <Image
                                src={`/api/image/proxy?url=${encodeURIComponent(img)}&source=${activeSource}`}
                                alt={`Page ${idx + 1}`}
                                width={800}
                                height={1200}
                                className="w-full h-auto object-cover"
                                unoptimized
                                priority={idx < 4}
                                loading={idx < 4 ? 'eager' : 'lazy'}
                            />
                        </div>
                    ))}
                </div>

                {/* End of Chapter Navigation Area */}
                <div className="w-full max-w-4xl mx-auto p-8 flex flex-col gap-6 items-center justify-center text-center mt-8">
                    <p className="text-gray-500 text-sm">You've reached the end of the chapter.</p>
                    <div className="flex gap-4 w-full justify-center">
                        {data.prev && (
                            <button
                                onClick={(e) => { e.stopPropagation(); navigateChapter(data.prev); }}
                                className="px-6 py-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors border border-white/10"
                            >
                                Previous
                            </button>
                        )}
                        {data.next && (
                            <button
                                onClick={(e) => { e.stopPropagation(); navigateChapter(data.next); }}
                                className="px-8 py-3 rounded-full bg-primary hover:bg-primary/80 text-white font-bold transition-colors shadow-lg shadow-primary/20"
                            >
                                Next Chapter
                            </button>
                        )}
                    </div>
                </div>

                {/* Comment Section */}
                <div className="w-full max-w-4xl mx-auto px-4 pb-20">
                    <div className="border-t border-white/10 my-8 w-full"></div>
                    <CommentSection slug={slug as string} chapter={chapter as string} />
                </div>
            </div>

            {/* Bottom Bar */}
            <div className={`fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 p-4 pb-6 z-50 transition-transform duration-300 ease-in-out ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    {/* Previous Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); if (data.prev) navigateChapter(data.prev); }}
                        disabled={!data.prev}
                        className={`flex flex-col items-center gap-1 p-2 min-w-[60px] rounded-lg transition-colors ${!data.prev ? 'text-gray-600' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-[10px]">Prev</span>
                    </button>

                    {/* Chapter List / Info */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowChapterList(true); }}
                        className="flex-1 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 h-10 rounded-full border border-white/10 transition-all"
                    >
                        <span className="text-sm font-medium text-white px-4 truncate">
                            {chapters.find(c => c.id === chapter)?.title || 'Current Chapter'}
                        </span>
                        <div className="w-8 h-1 bg-white/20 rounded-full mt-1"></div>
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); if (data.next) navigateChapter(data.next); }}
                        disabled={!data.next}
                        className={`flex flex-col items-center gap-1 p-2 min-w-[60px] rounded-lg transition-colors ${!data.next ? 'text-gray-600' : 'text-primary hover:text-primary/80 hover:bg-white/5'}`}
                    >
                        <ArrowRight className="w-5 h-5" />
                        <span className="text-[10px]">Next</span>
                    </button>
                </div>
            </div>

            {/* Chapter List Modal/Sheet */}
            {showChapterList && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowChapterList(false)} />

                    <div className="relative w-full max-w-md bg-[#1a1a1a] rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col shadow-2xl border border-white/10 animate-in slide-in-from-bottom-full duration-300">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#1a1a1a] z-10 rounded-t-2xl">
                            <h3 className="font-bold text-white pl-2">Chapters</h3>
                            <button onClick={() => setShowChapterList(false)} className="p-2 hover:bg-white/10 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-2 scrollbar-hide">
                            {chapters.map((c, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigateToChapter(c)}
                                    className={`w-full text-left p-4 rounded-xl mb-1 transition-colors flex items-center justify-between ${c.id === chapter ? 'bg-primary/20 text-primary border border-primary/30' : 'hover:bg-white/5 text-gray-300'}`}
                                >
                                    <span className="font-medium truncate">{c.title}</span>
                                    {c.released && <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{formatDate(c.released)}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Scroll To Top Button */}
            <ScrollToTop />
        </main>
    );
}
