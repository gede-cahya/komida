const isServer = typeof window === 'undefined';
// Ensure no trailing slash
const cleanUrl = (url: string) => url.endsWith('/') ? url.slice(0, -1) : url;

// VPS via Cloudflare Tunnel — sole backend (Railway removed)
const API_BASE_URL = 'https://api.komida.site/api';

// API key for server-to-server authentication (injected only server-side)
const SERVER_API_KEY = isServer ? (process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '') : '';

// Dev fallback to localhost
let SERVER_API_URL = isServer
    ? (process.env.NODE_ENV === 'production' ? API_BASE_URL : cleanUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3481/api'))
    : '/api';

/**
 * Direct fetch to VPS backend. No failover — single source of truth.
 */
async function fetchWithFallback(endpoint: string, options?: RequestInit) {
    const isClientTarget = endpoint.startsWith('/');

    // If running on the client, allow relative URLs pointing to the Next.js API proxy
    if (!isServer && isClientTarget) {
        const fullUrl = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
        return fetch(fullUrl, options);
    }

    // In Server Components (isServer = true), relative endpoints MUST be appended to an absolute URL
    const targetEndpoint = isClientTarget ? endpoint : `/${endpoint}`;

    // Inject API key for server-side direct backend calls
    const serverOptions: RequestInit = { ...options };
    if (isServer && SERVER_API_KEY) {
        serverOptions.headers = {
            ...(options?.headers || {}),
            'x-api-key': SERVER_API_KEY,
        };
    }

    // 15s timeout for VPS cold starts
    const signal = serverOptions.signal || AbortSignal.timeout(15000);

    return fetch(`${SERVER_API_URL}${targetEndpoint}`, {
        ...serverOptions,
        signal
    });
}

const API_URL = isServer ? SERVER_API_URL : '/api';

export async function fetchTrending() {
    const res = await fetchWithFallback(`/trending?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) {
        const text = await res.text();
        console.error('Fetch Trending Error:', res.status, text);
        throw new Error(`Failed to fetch trending manga: ${res.status} ${text.substring(0, 50)}`);
    }
    return res.json();
}

export async function fetchRecentUpdates() {
    const res = await fetchWithFallback(`/recent?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) {
        const text = await res.text();
        console.error('Fetch Recent Error:', res.status, text);
        throw new Error(`Failed to fetch recent updates: ${res.status} ${text.substring(0, 50)}`);
    }
    return res.json();
}

export async function fetchPopular(page = 1) {
    const res = await fetchWithFallback(`/popular?page=${page}`, { cache: 'no-store' });
    if (!res.ok) {
        // Fallback for demo if backend isn't ready
        console.warn("Retrying with fallback or returning error");
        throw new Error('Failed to fetch popular manga');
    }
    return res.json();
}

export async function fetchGenre(genre: string, page = 1) {
    const res = await fetchWithFallback(`/genres/${genre}?page=${page}&t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch genre manga');
    }
    return res.json();
}

export async function fetchMangaDetail(source: string, link: string) {
    const params = new URLSearchParams({ source, link });
    const res = await fetchWithFallback(`/manga/detail?${params.toString()}`);
    if (!res.ok) {
        throw new Error('Failed to fetch manga detail');
    }
    return res.json();
}

export async function fetchMangaBySlug(slug: string) {
    const res = await fetchWithFallback(`/manga/slug/${slug}`);
    if (!res.ok) {
        throw new Error('Failed to fetch manga by slug');
    }
    return res.json();
}

export async function fetchChapter(id: string) {
    const res = await fetchWithFallback(`/manga/chapter?id=${encodeURIComponent(id)}`, {
        signal: AbortSignal.timeout(30000) // Increase timeout to 30s for scraping
    });
    if (!res.ok) {
        throw new Error('Failed to fetch chapter');
    }
    return res.json();
}

export async function fetchSearch(query: string) {
    const res = await fetchWithFallback(`/manga/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
        throw new Error('Failed to fetch search results');
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
