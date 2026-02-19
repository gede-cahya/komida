import { TrendingSection } from "@/components/trending";
import { RecentUpdates } from "@/components/recent-updates";
import { GenreSection } from "@/components/genre-section";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { fetchPopular } from "@/lib/api";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Komida - Home | Read Manga, Manhwa, Manhua",
  description: "Discover the best Manga, Manhwa, and Manhua online. Free reading, high-quality images, and daily updates.",
  alternates: {
    canonical: 'https://komida.site',
  },
};

import { Suspense } from "react";
import {
  TrendingSkeleton,
  RecentUpdatesSkeleton,
  MangaGridSkeleton
} from "@/components/skeletons";

export default async function Home() {
  // Fetch Popular data safely
  const popularData = await fetchPopular().catch(() => []);
  // Ensure it's an array
  const safePopularData = Array.isArray(popularData) ? popularData : (popularData.data || []);

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
          <Suspense fallback={<MangaGridSkeleton count={6} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" />}>
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

        {/* Genre Recommendations */}
        <div className="space-y-12">
          <Suspense fallback={<MangaGridSkeleton count={6} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" />}>
            <GenreSection title="Rekomendasi Isekai 🌀" genre="isekai" />
          </Suspense>

          <Suspense fallback={<MangaGridSkeleton count={6} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" />}>
            <GenreSection title="Rekomendasi Fantasi ⚔️" genre="fantasy" />
          </Suspense>

          <Suspense fallback={<MangaGridSkeleton count={6} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" />}>
            <GenreSection title="Rekomendasi Slice of Life 🍃" genre="slice-of-life" />
          </Suspense>
        </div>

        {/* Keeping original sections below as they were not explicitly asked to be removed, only Hero was. */}
        <Suspense fallback={<TrendingSkeleton />}>
          <TrendingSection />
        </Suspense>

        <Suspense fallback={<RecentUpdatesSkeleton />}>
          <RecentUpdates />
        </Suspense>
      </div>
    </main>
  );
}
