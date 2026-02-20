const isServer = typeof window === 'undefined';
// Ensure no trailing slash
const cleanUrl = (url: string) => url.endsWith('/') ? url.slice(0, -1) : url;

const PRIMARY_API_URL = 'https://komida-backend-production.up.railway.app/api';
// Cloudflare Tunnel URL as a reliable fallback
const SECONDARY_API_URL = 'https://api.komida.site/api';

// Initial default
let SERVER_API_URL = isServer
    ? (process.env.NODE_ENV === 'production' ? PRIMARY_API_URL : cleanUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'))
    : '/api';

// For client side, we use internal Next.js routes (/api/...) that act as proxy.
// But for server components, we fetch directly to Backend. We need to handle fallback.
let activeServerUrl = SERVER_API_URL;
let isFallbackActive = false;

/**
 * Intelligent fetch wrapper that routes to the secondary API if the primary one is down.
 */
async function fetchWithFallback(endpoint: string, options?: RequestInit) {
    const isClientTarget = endpoint.startsWith('/');

    // If running on the client, allow relative URLs pointing to the Next.js API proxy
    if (!isServer && isClientTarget) {
        return fetch(endpoint, options);
    }

    // In Server Components (isServer = true), relative endpoints MUST be appended to an absolute URL
    // since Node.js fetch does not understand relative URIs like `/popular?page=1`
    const targetEndpoint = isClientTarget ? endpoint : `/${endpoint}`;

    if (isFallbackActive) {
        return fetch(`${SECONDARY_API_URL}${targetEndpoint}`, options);
    }

    try {
        // Use Node 18+ native AbortSignal.timeout which correctly severs the underlying socket
        const signal = AbortSignal.timeout(3500); // 3.5s timeout

        const res = await fetch(`${activeServerUrl}${targetEndpoint}`, {
            ...options,
            signal
        });

        if (!res.ok && res.status >= 500 && activeServerUrl === PRIMARY_API_URL) {
            throw new Error(`Primary API Error 5xx`);
        }
        return res;

    } catch (err: any) {
        if (activeServerUrl === PRIMARY_API_URL && !isFallbackActive) {
            console.warn(`[KOMIDA PINGER] Primary API (${PRIMARY_API_URL}) failed (${err.name || err.message}). Switching to Backup Tunnel (${SECONDARY_API_URL}) for ${targetEndpoint}`);
            activeServerUrl = SECONDARY_API_URL;
            isFallbackActive = true;

            // Retry directly to secondary without timeout strictness for the first load
            try {
                return await fetch(`${activeServerUrl}${targetEndpoint}`, options);
            } catch (secondErr: any) {
                console.error(`[KOMIDA PINGER] Secondary API also failed. Returning empty mock to prevent build crash.`, secondErr.message);
                return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }
        }

        console.error(`[KOMIDA PINGER] API completely unreachable. Returning empty mock to prevent build crash.`);
        return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
}

const API_URL = isServer ? SERVER_API_URL : '/api';

export async function fetchTrending() {
    const res = await fetchWithFallback(`/trending`, { next: { revalidate: 60 } });
    if (!res.ok) {
        const text = await res.text();
        console.error('Fetch Trending Error:', res.status, text);
        throw new Error(`Failed to fetch trending manga: ${res.status} ${text.substring(0, 50)}`);
    }
    return res.json();
}

export async function fetchRecentUpdates() {
    const res = await fetchWithFallback(`/recent`, { next: { revalidate: 60 } });
    if (!res.ok) {
        const text = await res.text();
        console.error('Fetch Recent Error:', res.status, text);
        throw new Error(`Failed to fetch recent updates: ${res.status} ${text.substring(0, 50)}`);
    }
    return res.json();
}

export async function fetchPopular(page = 1) {
    const res = await fetchWithFallback(`/popular?page=${page}`, { next: { revalidate: 60 } });
    if (!res.ok) {
        // Fallback for demo if backend isn't ready
        console.warn("Retrying with fallback or returning error");
        throw new Error('Failed to fetch popular manga');
    }
    return res.json();
}

export async function fetchGenre(genre: string, page = 1) {
    const res = await fetchWithFallback(`/genres/${genre}?page=${page}`);
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
    const res = await fetchWithFallback(`/manga/chapter?id=${encodeURIComponent(id)}`);
    if (!res.ok) {
        throw new Error('Failed to fetch chapter');
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
