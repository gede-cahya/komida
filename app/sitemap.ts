import { MetadataRoute } from 'next';
import { fetchPopular } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://komida.site';

    // Static routes
    const routes = [
        '',
        '/popular',
        '/bookmarks',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    // Dynamic routes (Popular Manga)
    let mangaRoutes: MetadataRoute.Sitemap = [];
    try {
        const popularManga = await fetchPopular(1);
        if (Array.isArray(popularManga)) {
            mangaRoutes = popularManga.map((manga: any) => {
                // Construct the URL based on type and link (slug)
                // Ensure type matches the route param expectations (lowercase usually)
                const type = manga.type ? manga.type.toLowerCase() : 'manga';
                // The 'link' from API might be the full link or just slug. 
                // Based on app/popular/page.tsx, it seems 'link' is used.
                // Let's assume 'link' is the slug safely.
                // If link is a full URL, we need to extract slug. But based on usage in `app/[type]/[slug]/page.tsx`,
                // it expects a slug.
                // Let's use a safe slug if possible.
                // Actually, looking at `MangaCard`, usually `link` property is passed.
                // Let's assume `manga.link` is the slug or we can use `manga.title` to form a slug if link is missing.
                // But better to use what we have.
                // If `link` is a URL, we need to extract the last part.
                let slug = manga.link;
                if (slug && slug.startsWith('http')) {
                    const parts = slug.split('/');
                    slug = parts[parts.length - 1];
                }

                return {
                    url: `${baseUrl}/${type}/${slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.8,
                };
            });
        }
    } catch (error) {
        console.error('Failed to fetch popular manga for sitemap:', error);
    }

    return [...routes, ...mangaRoutes];
}
