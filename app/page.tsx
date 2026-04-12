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
export const revalidate = 60;

import { Suspense } from "react";
import {
  TrendingSkeleton,
  RecentUpdatesSkeleton,
  MangaGridSkeleton,
} from "@/components/skeletons";

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

  // Pre-fetch missing sections with fallbacks
  const isekaiData = await getSmartGenreData("isekai", "Isekai");
  const sliceOfLifeData = await getSmartGenreData("slice-of-life", "Slice of Life");
  const reincarnationData = await getSmartGenreData("reincarnation", "Reincarnator");

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
                title="List Isekai 🌀" 
                genre="isekai" 
                initialData={isekaiData}
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
              title="List Slice of Life 🍃"
              genre="slice-of-life"
              initialData={sliceOfLifeData}
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
                title="List Reincarnator 🔄" 
                genre="reincarnation" 
                initialData={reincarnationData}
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
