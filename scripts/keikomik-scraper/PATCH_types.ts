// ═══════════════════════════════════════════════════════════════════
// PATCH for: src/scrapers/types.ts
// Action: Add KEIKOMIK to the MangaSource enum
// ═══════════════════════════════════════════════════════════════════
//
// Find this block:
//
//   export enum MangaSource {
//       KIRYUU = 'Kiryuu',
//       MANHWAINDO = 'ManhwaIndo',
//       SHINIGAMI = 'Shinigami',
//       SOFTKOMIK = 'Softkomik',
//   }
//
// Replace with:
//
//   export enum MangaSource {
//       KIRYUU = 'Kiryuu',
//       MANHWAINDO = 'ManhwaIndo',
//       SHINIGAMI = 'Shinigami',
//       SOFTKOMIK = 'Softkomik',
//       KEIKOMIK = 'Keikomik',   // ← ADD THIS LINE
//   }
//
// ═══════════════════════════════════════════════════════════════════
// Full updated file content (copy-paste ready):
// ═══════════════════════════════════════════════════════════════════

export enum MangaSource {
    KIRYUU = 'Kiryuu',
    MANHWAINDO = 'ManhwaIndo',
    SHINIGAMI = 'Shinigami',
    SOFTKOMIK = 'Softkomik',
    KEIKOMIK = 'Keikomik',
}

export interface ScrapedManga {
    title: string;
    image: string;
    source: MangaSource;
    chapter: string; // "Chapter 123"
    rating?: number;
    previous_chapter?: string;
    link: string; // URL to the manga
}

export interface MangaChapter {
    title: string;
    link: string;
    released?: string; // e.g. "2 days ago"
}

export interface MangaDetail {
    title: string;
    image: string;
    synopsis: string;
    genres: string[];
    author?: string;
    status?: string;
    rating?: number;
    chapters: MangaChapter[];
}

export interface ChapterData {
    images: string[];
    next?: string;
    prev?: string;
}

export interface ScraperProvider {
    name: MangaSource;
    scrapePopular(page?: number): Promise<ScrapedManga[]>;
    scrapeDetail(link: string): Promise<MangaDetail | null>;
    scrapeChapter(link: string): Promise<ChapterData | null>;
    scrapeGenres?(): Promise<{ name: string; slug: string }[]>;
    scrapeByGenre?(genre: string, page?: number): Promise<ScrapedManga[]>;
    search?(query: string): Promise<ScrapedManga[]>;
}
