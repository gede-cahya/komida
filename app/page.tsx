import { TrendingSection } from "@/components/trending";
import { RecentUpdates } from "@/components/recent-updates";
import { GenreSection } from "@/components/genre-section";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { fetchPopular, fetchGenre, fetchSearch } from "@/lib/api";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Komida - Home | Read Manga, Manhwa, Manhua",
  description:
    "Discover the best Manga, Manhwa, and Manhua online. Free reading, high-quality images, and daily updates.",
  alternates: {
    canonical: "https://komida.site",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 600;

import { Suspense } from "react";
import {
  TrendingSkeleton,
  RecentUpdatesSkeleton,
  MangaGridSkeleton,
} from "@/components/skeletons";

const GENRE_POOL = [
  { name: "Action", slug: "action", emoji: "⚔️" },
  { name: "Adventure", slug: "adventure", emoji: "🗺️" },
  { name: "Comedy", slug: "comedy", emoji: "😂" },
  { name: "Drama", slug: "drama", emoji: "🎭" },
  { name: "Fantasy", slug: "fantasy", emoji: "✨" },
  { name: "Isekai", slug: "isekai", emoji: "🌀" },
  { name: "Romance", slug: "romance", emoji: "❤️" },
  { name: "Slice of Life", slug: "slice-of-life", emoji: "🍃" },
  { name: "Supernatural", slug: "supernatural", emoji: "👻" },
  { name: "Sci-Fi", slug: "sci-fi", emoji: "🚀" },
  { name: "Thriller", slug: "thriller", emoji: "🔪" },
  { name: "Mystery", slug: "mystery", emoji: "🔍" },
];

export default async function Home() {
  // Fetch Popular data safely
  const popularData = await fetchPopular().catch(() => []);
  // Ensure it's an array
  const safePopularData = Array.isArray(popularData)
    ? popularData
    : popularData.data || [];

  // Helper for smart genre fetching with search fallback
  const getSmartGenreData = async (slug: string, query: string) => {
    try {
      // 1. Try fetching by genre
      const res = await fetchGenre(slug).catch(() => []);
      const data = Array.isArray(res) ? res : (res?.data || []);
      
      if (data.length > 0) return data;

      // 2. Fallback to search if genre is empty
      console.log(`[HOME] Genre ${slug} is empty, falling back to search for "${query}"`);
      const searchRes = await fetchSearch(query).catch(() => ({ results: [] }));
      return searchRes.results || [];
    } catch (err) {
      console.error(`[HOME] Error fetching data for ${slug}:`, err);
      return [];
    }
  };

  // Implement 10-minute rotation
  const tenMinuteBlock = Math.floor(Date.now() / (1000 * 60 * 10));
  const genre1 = GENRE_POOL[tenMinuteBlock % GENRE_POOL.length];
  const genre2 = GENRE_POOL[(tenMinuteBlock + 1) % GENRE_POOL.length];
  const genre3 = GENRE_POOL[(tenMinuteBlock + 2) % GENRE_POOL.length];

  // Pre-fetch dynamic sections with fallbacks
  const data1 = await getSmartGenreData(genre1.slug, genre1.name);
  const data2 = await getSmartGenreData(genre2.slug, genre2.name);
  const data3 = await getSmartGenreData(genre3.slug, genre3.name);

  return (
    <main className="min-h-screen bg-background text-foreground pt-20 md:pt-24 space-y-12 pb-20">
      <div className="container mx-auto px-4 space-y-16">
        {/* Announcement Banner */}
        <section>
          <AnnouncementBanner />
        </section>

        {/* Komik Hot Section */}
        <section>
          {/* Reuse GenreSection but pass initialData. Genre slug 'popular' used for link. */}
          <Suspense
            fallback={
              <MangaGridSkeleton
                count={6}
                cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
              />
            }
          >
            <GenreSection
              title="Komik Hot 🔥"
              genre="popular"
              initialData={safePopularData}
            />
          </Suspense>
        </section>

        {/* Existing Trending Section (Keep or Remove? User didn't explicitly say remove, but "Hot" might duplicate it.
           User said "buatkan fitu baru di home...".
           If "Komik Hot" replaces Hero, maybe we keep Trending?
           "Trending" usually means "Hot".
           Let's keep Trending and Recent underneath for now, as they are part of the original structure.
           Wait, "Komik Hot" IS the list of popular comics.
           The user implementation request replaced Hero with these lists.
           I will place these lists at the top.
        */}

        <div className="space-y-12">
          <Suspense
            fallback={
              <MangaGridSkeleton
                count={6}
                cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
              />
            }
          >
            <GenreSection 
                title={`List ${genre1.name} ${genre1.emoji}`} 
                genre={genre1.slug} 
                initialData={data1}
            />
          </Suspense>

          <Suspense
            fallback={
              <MangaGridSkeleton
                count={6}
                cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
              />
            }
          >
            <GenreSection
              title={`List ${genre2.name} ${genre2.emoji}`}
              genre={genre2.slug}
              initialData={data2}
            />
          </Suspense>

          <Suspense
            fallback={
              <MangaGridSkeleton
                count={6}
                cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
              />
            }
          >
            <GenreSection 
                title={`List ${genre3.name} ${genre3.emoji}`} 
                genre={genre3.slug} 
                initialData={data3}
            />
          </Suspense>

        </div>

        {/* Other Sections */}
        <section className="pt-2 lg:pt-6 border-t border-white/10">
          <Suspense fallback={<TrendingSkeleton />}>
            <TrendingSection />
          </Suspense>
        </section>

        <section className="mt-6 lg:mt-10 pt-6 lg:pt-10 border-t border-white/10">
          <Suspense fallback={<RecentUpdatesSkeleton />}>
            <RecentUpdates />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
