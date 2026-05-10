import { TrendingSection } from "@/components/trending";
import { RecentUpdates } from "@/components/recent-updates";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { HomeSections } from "@/components/home-sections";

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

const dayOfYear = Math.floor(
  (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
);
const genre1 = GENRE_POOL[dayOfYear % GENRE_POOL.length];
const genre2 = GENRE_POOL[(dayOfYear + 1) % GENRE_POOL.length];
const genre3 = GENRE_POOL[(dayOfYear + 2) % GENRE_POOL.length];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground pt-20 md:pt-24 space-y-12 pb-20">
      <div className="container mx-auto px-4 space-y-16">
        {/* Announcement Banner */}
        <section>
          <AnnouncementBanner />
        </section>

        {/* Popular + Genre Sections (client-side fetched) */}
        <HomeSections genre1={genre1} genre2={genre2} genre3={genre3} />

        {/* Trending */}
        <section className="pt-2 lg:pt-6 border-t border-white/10">
          <TrendingSection />
        </section>

        {/* Recent Updates */}
        <section className="mt-6 lg:mt-10 pt-6 lg:pt-10 border-t border-white/10">
          <RecentUpdates />
        </section>
      </div>
    </main>
  );
}
