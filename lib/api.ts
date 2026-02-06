const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchTrending() {
    const res = await fetch(`${API_URL}/trending`);
    if (!res.ok) {
        throw new Error('Failed to fetch trending manga');
    }
    return res.json();
}

export async function fetchRecentUpdates() {
    const res = await fetch(`${API_URL}/recent`);
    if (!res.ok) {
        throw new Error('Failed to fetch recent updates');
    }
    return res.json();
}

export async function fetchPopular(page = 1) {
    const res = await fetch(`${API_URL}/popular?page=${page}`);
    if (!res.ok) {
        // Fallback for demo if backend isn't ready
        console.warn("Retrying with fallback or returning error");
        throw new Error('Failed to fetch popular manga');
    }
    return res.json();
}

export async function fetchMangaDetail(source: string, link: string) {
    const params = new URLSearchParams({ source, link });
    const res = await fetch(`${API_URL}/manga/detail?${params.toString()}`);
    if (!res.ok) {
        throw new Error('Failed to fetch manga detail');
    }
    return res.json();
}

export interface Manga {
    id: number;
    title: string;
    image: string;
    rating: number;
    chapter: string | number; // Updated to allow string (e.g. "Chapter 1")
    type?: string;
    source?: string;
    link?: string;
}

export interface TrendingManga extends Manga {
    span: string;
}

export interface MangaDetail {
    title: string;
    image: string;
    synopsis: string;
    genres: string[];
    author: string;
    status: string;
    rating: number;
    chapters: {
        title: string;
        link: string;
        released?: string;
    }[];
}
