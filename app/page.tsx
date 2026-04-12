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

// Create isolated async components to enable React Suspense streaming
async function PopularSection() {
  const popularData = await fetchPopular().catch(() => []);
  const safePopularData = Array.isArray(popularData) ? popularData : popularData?.data || [];
  if (safePopularData.length === 0) return null;
  return <GenreSection title="Komik Hot 🔥" genre="popular" initialData={safePopularData} />;
}

async function SmartGenreSection({ title, genre, query }: { title: string, genre: string, query: string }) {
  try {
    const res = await fetchGenre(genre).catch(() => []);
    const data = Array.isArray(res) ? res : (res?.data || []);
    
    let finalData = data;
    if (finalData.length === 0) {
      console.log(`[HOME] Genre ${genre} is empty, falling back to search for "${query}"`);
      const searchRes = await fetchSearch(query).catch(() => ({ results: [] }));
      finalData = searchRes.results || [];
    }

    if (finalData.length === 0) return null;

    return <GenreSection title={title} genre={genre} initialData={finalData} />;
  } catch (err) {
    console.error(`[HOME] Error fetching data for ${genre}:`, err);
    return null;
  }
}

export default function Home() {
  // Implement 10-minute rotation
  const tenMinuteBlock = Math.floor(Date.now() / (1000 * 60 * 10));
  const genre1 = GENRE_POOL[tenMinuteBlock % GENRE_POOL.length];
  const genre2 = GENRE_POOL[(tenMinuteBlock + 1) % GENRE_POOL.length];
  const genre3 = GENRE_POOL[(tenMinuteBlock + 2) % GENRE_POOL.length];

  return (
    <main className="min-h-screen bg-background text-foreground pt-20 md:pt-24 space-y-12 pb-20">
      <div className="container mx-auto px-4 space-y-16">
        {/* Announcement Banner */}
        <section>
          <AnnouncementBanner />
        </section>

        {/* Komik Hot Section */}
        <section>
          <Suspense
            fallback={
              <MangaGridSkeleton
                count={6}
                cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
              />
            }
          >
            <PopularSection />
          </Suspense>
        </section>

        <div className="space-y-12">
          <Suspense
            fallback={
              <MangaGridSkeleton
                count={6}
                cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
              />
            }
          >
            <SmartGenreSection 
                title={`List ${genre1.name} ${genre1.emoji}`} 
                genre={genre1.slug} 
                query={genre1.name}
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
            <SmartGenreSection
              title={`List ${genre2.name} ${genre2.emoji}`}
              genre={genre2.slug}
              query={genre2.name}
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
            <SmartGenreSection 
                title={`List ${genre3.name} ${genre3.emoji}`} 
                genre={genre3.slug} 
                query={genre3.name}
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
