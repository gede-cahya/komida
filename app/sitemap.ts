import { MetadataRoute } from 'next';
import { fetchPopular } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const BASE_URL = 'https://komida.site';
const ALLOWED_TYPES = new Set(['manga', 'manhwa', 'manhua']);

function normalizeSlug(value: unknown): string | null {
    if (typeof value !== 'string') return null;

    let slug = value.trim();
    if (!slug) return null;

    try {
        if (/^https?:\/\//i.test(slug)) {
            const parsed = new URL(slug);
            const parts = parsed.pathname.split('/').filter(Boolean);
            slug = parts[parts.length - 1] || '';
        }
    } catch {
        return null;
    }

    slug = slug.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
    if (!slug || slug === 'undefined' || slug === 'null') return null;
    if (!/^[a-zA-Z0-9._~-]+$/.test(slug)) return null;

    return encodeURIComponent(decodeURIComponent(slug));
}

function normalizeType(value: unknown): 'manga' | 'manhwa' | 'manhua' {
    if (typeof value !== 'string') return 'manga';
    const type = value.toLowerCase().trim();
    return ALLOWED_TYPES.has(type) ? type as 'manga' | 'manhwa' | 'manhua' : 'manga';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const seen = new Set<string>();

    const addRoute = (
        url: string,
        changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
        priority: number
    ) => {
        if (seen.has(url)) return null;
        seen.add(url);
        return { url, lastModified: now, changeFrequency, priority };
    };

    const routes = [
        addRoute(BASE_URL, 'daily', 1),
        addRoute(`${BASE_URL}/popular`, 'daily', 0.9),
        // /bookmarks is user-specific, keep it out of sitemap.
    ].filter(Boolean) as MetadataRoute.Sitemap;

    let mangaRoutes: MetadataRoute.Sitemap = [];
    try {
        const popularManga = await fetchPopular(1);
        const items = Array.isArray(popularManga) ? popularManga : popularManga?.data || [];

        mangaRoutes = items
            .map((manga: any) => {
                const slug = normalizeSlug(manga?.link || manga?.slug);
                if (!slug) return null;

                const type = normalizeType(manga?.type);
                return addRoute(`${BASE_URL}/${type}/${slug}`, 'weekly', 0.8);
            })
            .filter(Boolean) as MetadataRoute.Sitemap;
    } catch (error) {
        console.error('Failed to fetch popular manga for sitemap:', error);
    }

    return [...routes, ...mangaRoutes];
}
