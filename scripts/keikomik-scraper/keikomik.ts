import {
    MangaSource,
    type ScrapedManga,
    type ScraperProvider,
    type MangaDetail,
    type MangaChapter,
    type ChapterData,
} from '../types';

/**
 * KeikomikScraper
 *
 * keikomik.web.id is a Next.js site exported as static HTML (nextExport: true).
 * All page data is embedded in the <script id="__NEXT_DATA__"> tag, so no
 * headless browser or Firebase SDK is needed — plain HTTP fetches are enough.
 *
 * Data sources
 * ─────────────
 * • /sitemap.xml          → list of all /komik/{slug} URLs + lastmod dates
 * • /komik/{slug}         → full manga detail (title, image, genres, chapters …)
 * • /chapter/{slug}-chapter-{n} → images for chapter n + sorted chapter ID list
 */
export class KeikomikScraper implements ScraperProvider {
    name = MangaSource.KEIKOMIK;
    private readonly baseUrl = 'https://keikomik.web.id';

    private readonly defaultHeaders: Record<string, string> = {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
    };

    // ─── helpers ────────────────────────────────────────────────────────────

    /** Fetch a page and return its HTML, or null on any error. */
    private async fetchPage(url: string): Promise<string | null> {
        try {
            const res = await fetch(url, {
                headers: this.defaultHeaders,
                redirect: 'follow',
                signal: AbortSignal.timeout(12000),
            });
            if (!res.ok) {
                console.warn(`[Keikomik] HTTP ${res.status} for ${url}`);
                return null;
            }
            return res.text();
        } catch (err: any) {
            console.warn(`[Keikomik] Fetch error for ${url}: ${err.message}`);
            return null;
        }
    }

    /** Extract and parse the __NEXT_DATA__ JSON embedded in a page's HTML. */
    private extractNextData(html: string): any | null {
        const match = html.match(
            /<script\s+id="__NEXT_DATA__"[^>]*>\s*([\s\S]*?)\s*<\/script>/
        );
        if (!match) return null;
        try {
            return JSON.parse(match[1]);
        } catch {
            return null;
        }
    }

    /**
     * Fetch a single manga's basic info (title, image, latest chapter, type)
     * from its detail page.  Used by scrapePopular and search.
     */
    private async fetchMangaBasicInfo(
        slug: string
    ): Promise<ScrapedManga | null> {
        const html = await this.fetchPage(`${this.baseUrl}/komik/${slug}`);
        if (!html) return null;

        const nextData = this.extractNextData(html);
        const item = nextData?.props?.pageProps?.item;
        if (!item) return null;

        const title: string = item.name || item.name2 || slug;
        const image: string = item.image || '';

        // Find the latest chapter by sorting the numeric keys descending
        const komikObj: Record<string, any> = item.Komik || {};
        const chapterIds = Object.keys(komikObj)
            .map(Number)
            .filter((n) => !isNaN(n))
            .sort((a, b) => b - a);

        const latestId = chapterIds[0];
        const prevId = chapterIds[1];

        return {
            title,
            image,
            source: this.name,
            chapter: latestId != null ? `Chapter ${latestId}` : 'Chapter 1',
            previous_chapter: prevId != null ? `Chapter ${prevId}` : undefined,
            link: `${this.baseUrl}/komik/${slug}`,
        };
    }

    // ─── ScraperProvider implementation ─────────────────────────────────────

    /**
     * scrapePopular
     *
     * Reads /sitemap.xml, sorts manga URLs by <lastmod> (most-recently-updated
     * first), then batch-fetches detail pages to get title / image / chapter.
     */
    async scrapePopular(page: number = 1): Promise<ScrapedManga[]> {
        console.log(`[Keikomik] scrapePopular(page=${page})`);

        try {
            // 1. Fetch sitemap
            const sitemapXml = await this.fetchPage(`${this.baseUrl}/sitemap.xml`);
            if (!sitemapXml) return [];

            // 2. Parse manga entries (only /komik/ URLs have <lastmod>)
            const entries: { slug: string; lastmod: number }[] = [];
            const urlBlockRegex =
                /<url>\s*<loc>https:\/\/keikomik\.web\.id\/komik\/([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g;

            let m: RegExpExecArray | null;
            while ((m = urlBlockRegex.exec(sitemapXml)) !== null) {
                const slug = m[1].trim();
                const lastmod = new Date(m[2].trim()).getTime();
                if (!isNaN(lastmod)) {
                    entries.push({ slug, lastmod });
                }
            }

            if (entries.length === 0) {
                console.warn('[Keikomik] No manga entries found in sitemap');
                return [];
            }

            // 3. Sort by lastmod descending (most-recently-updated first)
            entries.sort((a, b) => b.lastmod - a.lastmod);

            // 4. Paginate
            const ITEMS_PER_PAGE = 24;
            const start = (page - 1) * ITEMS_PER_PAGE;
            const pageSlices = entries.slice(start, start + ITEMS_PER_PAGE);

            if (pageSlices.length === 0) return [];

            console.log(
                `[Keikomik] Fetching detail for ${pageSlices.length} slugs…`
            );

            // 5. Batch-fetch 5 at a time to be polite to the server
            const results: ScrapedManga[] = [];
            const BATCH = 5;
            for (let i = 0; i < pageSlices.length; i += BATCH) {
                const batch = pageSlices.slice(i, i + BATCH);
                const batchResults = await Promise.all(
                    batch.map((e) => this.fetchMangaBasicInfo(e.slug))
                );
                for (const r of batchResults) {
                    if (r) results.push(r);
                }
            }

            console.log(`[Keikomik] scrapePopular → ${results.length} items`);
            return results;
        } catch (err: any) {
            console.error('[Keikomik] scrapePopular error:', err.message);
            return [];
        }
    }

    /**
     * scrapeDetail
     *
     * Fetches /komik/{slug} and parses __NEXT_DATA__.props.pageProps.item
     * to build the full MangaDetail object (synopsis, genres, chapters …).
     */
    async scrapeDetail(link: string): Promise<MangaDetail | null> {
        console.log(`[Keikomik] scrapeDetail(${link})`);

        try {
            const html = await this.fetchPage(link);
            if (!html) return null;

            const nextData = this.extractNextData(html);
            const item = nextData?.props?.pageProps?.item;
            if (!item) {
                console.warn(`[Keikomik] No item data at ${link}`);
                return null;
            }

            // Extract slug from the link for building chapter URLs
            const slug = link
                .replace(/^https?:\/\/keikomik\.web\.id\/komik\//, '')
                .replace(/\/$/, '');

            const title: string = item.name || item.name2 || slug;
            const image: string = item.image || '';
            const synopsis: string = item.description || '';
            const genres: string[] = Array.isArray(item.genre)
                ? item.genre
                : [];
            const author: string = item.author || 'Unknown';
            const status: string = item.status || 'Unknown';
            const rating: number = parseFloat(item.rating) || 0;

            // Build chapter list from item.Komik (object keyed by chapter number)
            const komikObj: Record<string, any> = item.Komik || {};
            const chapters: MangaChapter[] = Object.keys(komikObj)
                .map(Number)
                .filter((n) => !isNaN(n))
                .sort((a, b) => b - a) // newest first
                .map((chId) => {
                    const chData = komikObj[String(chId)];
                    const rawDate: string | number | undefined =
                        chData?.UpdateAt ?? chData?.CreateAt;
                    let released: string | undefined;
                    if (rawDate) {
                        try {
                            released = new Date(rawDate).toLocaleDateString(
                                'id-ID',
                                { day: '2-digit', month: 'short', year: 'numeric' }
                            );
                        } catch {
                            // ignore invalid dates
                        }
                    }
                    return {
                        title: `Chapter ${chId}`,
                        link: `${this.baseUrl}/chapter/${slug}-chapter-${chId}`,
                        released,
                    };
                });

            return { title, image, synopsis, genres, author, status, rating, chapters };
        } catch (err: any) {
            console.error('[Keikomik] scrapeDetail error:', err.message);
            return null;
        }
    }

    /**
     * scrapeChapter
     *
     * Fetches /chapter/{slug}-chapter-{n} and parses __NEXT_DATA__.
     *
     * Key fields in pageProps:
     *   • slug        – manga slug
     *   • chapter     – current chapter ID (string)
     *   • komikIds    – sorted array of all chapter ID strings (ascending)
     *   • data.Komik  – object of chapter data keyed by ID; each entry has
     *                   an `img` array of image URLs for that chapter
     *   • subItem     – alternate source for the current chapter's images
     */
    async scrapeChapter(link: string): Promise<ChapterData | null> {
        console.log(`[Keikomik] scrapeChapter(${link})`);

        try {
            const html = await this.fetchPage(link);
            if (!html) return null;

            const nextData = this.extractNextData(html);
            const pageProps = nextData?.props?.pageProps;
            if (!pageProps) {
                console.warn(`[Keikomik] No pageProps at ${link}`);
                return null;
            }

            const slug: string = pageProps.slug || '';
            const currentChapterId: string = String(pageProps.chapter || '');
            // komikIds is sorted ascending: ['1','2','3', …]
            const komikIds: string[] = Array.isArray(pageProps.komikIds)
                ? pageProps.komikIds
                : [];

            // Prefer subItem.img for the current chapter (it's a direct object),
            // fall back to data.Komik[currentChapterId].img
            let images: string[] = [];

            const subItem = pageProps.subItem;
            if (subItem?.img && Array.isArray(subItem.img) && subItem.img.length > 0) {
                images = subItem.img.filter(
                    (s: any) => typeof s === 'string' && s.startsWith('http')
                );
            }

            if (images.length === 0) {
                const komikData =
                    pageProps.data?.Komik?.[currentChapterId];
                if (komikData?.img && Array.isArray(komikData.img)) {
                    images = komikData.img.filter(
                        (s: any) => typeof s === 'string' && s.startsWith('http')
                    );
                }
            }

            // Fallback 3: fetch manga detail page — the /komik/{slug} page
            // sometimes has image data that the chapter page doesn't (e.g. very
            // recent chapters added after the last static build of the chapter page).
            if (images.length === 0 && slug) {
                console.log(`[Keikomik] images empty — trying detail page fallback for ch ${currentChapterId}`);
                const detailHtml = await this.fetchPage(`${this.baseUrl}/komik/${slug}`);
                if (detailHtml) {
                    const detailNext = this.extractNextData(detailHtml);
                    const detailKomik = detailNext?.props?.pageProps?.item?.Komik?.[currentChapterId];
                    if (detailKomik?.img && Array.isArray(detailKomik.img)) {
                        images = detailKomik.img.filter(
                            (s: any) => typeof s === 'string' && s.startsWith('http')
                        );
                        if (images.length > 0) {
                            console.log(`[Keikomik] Got ${images.length} images from detail page fallback`);
                        }
                    }
                }
            }

            if (images.length === 0) {
                console.warn(`[Keikomik] No images found for chapter ${currentChapterId} of ${slug} — chapter may be too new (pre-build)`);
            }

            // Determine prev / next using komikIds (ascending order)
            const currentIndex = komikIds.indexOf(currentChapterId);
            const prevId =
                currentIndex > 0 ? komikIds[currentIndex - 1] : null;
            const nextId =
                currentIndex >= 0 && currentIndex < komikIds.length - 1
                    ? komikIds[currentIndex + 1]
                    : null;

            const prev = prevId
                ? `${this.baseUrl}/chapter/${slug}-chapter-${prevId}`
                : undefined;
            const next = nextId
                ? `${this.baseUrl}/chapter/${slug}-chapter-${nextId}`
                : undefined;

            return { images, prev, next };
        } catch (err: any) {
            console.error('[Keikomik] scrapeChapter error:', err.message);
            return null;
        }
    }

    /**
     * search
     *
     * Slug-based search: reads the sitemap, filters slugs that contain the
     * query string, then fetches detail pages for up to 10 matches.
     *
     * This is lightweight and avoids any Firebase dependency.
     */
    async search(query: string): Promise<ScrapedManga[]> {
        console.log(`[Keikomik] search("${query}")`);
        try {
            const sitemapXml = await this.fetchPage(
                `${this.baseUrl}/sitemap.xml`
            );
            if (!sitemapXml) return [];

            const normalizedQuery = query.toLowerCase().replace(/\s+/g, '-');
            const slugRegex =
                /https:\/\/keikomik\.web\.id\/komik\/([^<\s]+)/g;

            const matchingSlugs: string[] = [];
            let m: RegExpExecArray | null;
            while ((m = slugRegex.exec(sitemapXml)) !== null) {
                const slug = m[1].trim();
                if (slug.toLowerCase().includes(normalizedQuery)) {
                    matchingSlugs.push(slug);
                }
            }

            if (matchingSlugs.length === 0) return [];

            const topSlugs = matchingSlugs.slice(0, 10);
            const results = await Promise.all(
                topSlugs.map((s) => this.fetchMangaBasicInfo(s))
            );
            return results.filter((r): r is ScrapedManga => r !== null);
        } catch (err: any) {
            console.error('[Keikomik] search error:', err.message);
            return [];
        }
    }

    /**
     * scrapeGenres
     *
     * Returns the static genre list used by keikomik.
     */
    async scrapeGenres(): Promise<{ name: string; slug: string }[]> {
        return [
            { name: 'Action', slug: 'action' },
            { name: 'Adventure', slug: 'adventure' },
            { name: 'Comedy', slug: 'comedy' },
            { name: 'Drama', slug: 'drama' },
            { name: 'Fantasy', slug: 'fantasy' },
            { name: 'Historical', slug: 'historical' },
            { name: 'Horror', slug: 'horror' },
            { name: 'Isekai', slug: 'isekai' },
            { name: 'Magic', slug: 'magic' },
            { name: 'Martial Arts', slug: 'martial-arts' },
            { name: 'Mature', slug: 'mature' },
            { name: 'Mecha', slug: 'mecha' },
            { name: 'Mystery', slug: 'mystery' },
            { name: 'Psychological', slug: 'psychological' },
            { name: 'Romance', slug: 'romance' },
            { name: 'School Life', slug: 'school-life' },
            { name: 'Sci-Fi', slug: 'sci-fi' },
            { name: 'Seinen', slug: 'seinen' },
            { name: 'Shounen', slug: 'shounen' },
            { name: 'Slice of Life', slug: 'slice-of-life' },
            { name: 'Sports', slug: 'sports' },
            { name: 'Supernatural', slug: 'supernatural' },
            { name: 'Thriller', slug: 'thriller' },
            { name: 'Tragedy', slug: 'tragedy' },
            { name: 'Wuxia', slug: 'wuxia' },
        ];
    }

    /**
     * scrapeByGenre
     *
     * Iterates manga from the sitemap and keeps those whose genre list
     * (from their detail page) includes the requested genre.
     *
     * Limited to checking 60 manga per call to avoid excess HTTP traffic.
     */
    async scrapeByGenre(
        genre: string,
        page: number = 1
    ): Promise<ScrapedManga[]> {
        console.log(`[Keikomik] scrapeByGenre("${genre}", page=${page})`);
        try {
            const sitemapXml = await this.fetchPage(
                `${this.baseUrl}/sitemap.xml`
            );
            if (!sitemapXml) return [];

            // Collect all manga slugs (preserve sitemap order = most recent first)
            const slugRegex =
                /https:\/\/keikomik\.web\.id\/komik\/([^<\s]+)/g;
            const allSlugs: string[] = [];
            let m: RegExpExecArray | null;
            while ((m = slugRegex.exec(sitemapXml)) !== null) {
                allSlugs.push(m[1].trim());
            }

            // Scan up to 60 manga for the genre (to keep latency reasonable)
            const MAX_SCAN = 60;
            const ITEMS_PER_PAGE = 20;
            const BATCH = 5;

            const matchingManga: ScrapedManga[] = [];

            for (
                let i = 0;
                i < Math.min(allSlugs.length, MAX_SCAN);
                i += BATCH
            ) {
                const batch = allSlugs.slice(i, i + BATCH);
                const htmls = await Promise.all(
                    batch.map((slug) =>
                        this.fetchPage(`${this.baseUrl}/komik/${slug}`)
                    )
                );

                for (let j = 0; j < batch.length; j++) {
                    const html = htmls[j];
                    if (!html) continue;

                    const nextData = this.extractNextData(html);
                    const item = nextData?.props?.pageProps?.item;
                    if (!item) continue;

                    const genres: string[] = Array.isArray(item.genre)
                        ? item.genre
                        : [];
                    const matches = genres.some(
                        (g) =>
                            g.toLowerCase() === genre.toLowerCase() ||
                            g.toLowerCase().replace(/\s+/g, '-') ===
                                genre.toLowerCase()
                    );
                    if (!matches) continue;

                    // Build basic info inline to avoid a second fetch
                    const slug = batch[j];
                    const title: string = item.name || item.name2 || slug;
                    const image: string = item.image || '';
                    const komikObj: Record<string, any> = item.Komik || {};
                    const ids = Object.keys(komikObj)
                        .map(Number)
                        .filter((n) => !isNaN(n))
                        .sort((a, b) => b - a);

                    matchingManga.push({
                        title,
                        image,
                        source: this.name,
                        chapter:
                            ids[0] != null ? `Chapter ${ids[0]}` : 'Chapter 1',
                        previous_chapter:
                            ids[1] != null
                                ? `Chapter ${ids[1]}`
                                : undefined,
                        link: `${this.baseUrl}/komik/${slug}`,
                    });

                    if (matchingManga.length >= MAX_SCAN) break;
                }

                if (matchingManga.length >= MAX_SCAN) break;
            }

            const start = (page - 1) * ITEMS_PER_PAGE;
            return matchingManga.slice(start, start + ITEMS_PER_PAGE);
        } catch (err: any) {
            console.error('[Keikomik] scrapeByGenre error:', err.message);
            return [];
        }
    }
}
