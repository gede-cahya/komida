import { Hero } from "@/components/hero";
import { TrendingSection } from "@/components/trending";
import { RecentUpdates } from "@/components/recent-updates";
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
import { TrendingSkeleton, RecentUpdatesSkeleton } from "@/components/skeletons";

export default async function Home() {
  // Fetch only Hero data here to unblock navigation faster if we wanted, 
  // but Hero is ATF so we await it.
  // Popular data is cached now, so it should be fast.
  const popularData = await fetchPopular().catch(() => []);

  // Filter popular data for Hero
  const featuredManga = Array.isArray(popularData)
    ? popularData.filter((m: any) => m.image).slice(0, 5)
    : [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero items={featuredManga} />
      <div className="container mx-auto px-4 py-12 space-y-20">
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
