// ═══════════════════════════════════════════════════════════════════
// PATCH for: src/service/mangaService.ts
// Action: Import KeikomikScraper and add it to the scrapers array
// ═══════════════════════════════════════════════════════════════════
//
// STEP 1 — Add the import (after the other scraper imports):
//
//   import { KiryuuScraper }           from '../scrapers/providers/kiryuu';
//   import { ManhwaIndoScraper }        from '../scrapers/providers/manhwaindo';
//   import { ShinigamiBrowserScraper }  from '../scrapers/providers/shinigami-browser';
//   import { SoftkomikScraper }         from '../scrapers/providers/softkomik';
//   import { KeikomikScraper }          from '../scrapers/providers/keikomik'; // ← ADD
//
// ─────────────────────────────────────────────────────────────────
//
// STEP 2 — Register the scraper in the constructor:
//
//   constructor() {
//       this.scrapers = [
//           new KiryuuScraper(),
//           new ManhwaIndoScraper(),
//           // new ShinigamiBrowserScraper(),
//           new SoftkomikScraper(),
//           new KeikomikScraper(),   // ← ADD THIS LINE
//       ];
//   }
//
// ═══════════════════════════════════════════════════════════════════
// Nothing else in mangaService.ts needs to change.
// The existing getMangaDetail, getChapterImages, searchExternal, and
// importManga methods all work by looking up the scraper by name —
// so adding the new instance is the only required change.
// ═══════════════════════════════════════════════════════════════════
//
// After applying both patches, rebuild and restart the backend:
//
//   bun run build   (or: tsc)
//   bun run start   (or: node dist/index.js)
//
// To verify the new source is working, hit:
//
//   GET /api/popular          → should now include Keikomik manga
//   GET /api/manga/detail?source=Keikomik&link=https://keikomik.web.id/komik/apotheosis
//   GET /api/manga/chapter?id=https://keikomik.web.id/chapter/apotheosis-chapter-1291
//
// ═══════════════════════════════════════════════════════════════════
// Full updated constructor block (copy-paste ready):
// ═══════════════════════════════════════════════════════════════════

/*

import { KiryuuScraper }           from '../scrapers/providers/kiryuu';
import { ManhwaIndoScraper }        from '../scrapers/providers/manhwaindo';
import { ShinigamiBrowserScraper }  from '../scrapers/providers/shinigami-browser';
import { SoftkomikScraper }         from '../scrapers/providers/softkomik';
import { KeikomikScraper }          from '../scrapers/providers/keikomik';
import type { ScrapedManga, ScraperProvider } from '../scrapers/types';

export class MangaService {
    private scrapers: ScraperProvider[];

    constructor() {
        this.scrapers = [
            new KiryuuScraper(),
            new ManhwaIndoScraper(),
            // new ShinigamiBrowserScraper(),
            new SoftkomikScraper(),
            new KeikomikScraper(),
        ];
    }

    // ... rest of the file stays exactly the same ...
}

*/
