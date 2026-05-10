import { TrendingSection } from "@/components/trending";
import { RecentUpdates } from "@/components/recent-updates";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { PopularSection } from "@/components/popular-section";
import { SmartGenreSection } from "@/components/smart-genre-section";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Komida - Home | Read Manga, Manhwa, Manhua",
  description:
    "Discover the best Manga, Manhwa, and Manhua online. Free reading, high-quality images, and daily updates.",
  alternates: {
    canonical: "https://komida.site",
  },
};

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

        {/* Komik Hot Section */}
        <section>
          <PopularSection />
        </section>

        <div className="space-y-12">
          <SmartGenreSection
            title={`List ${genre1.name} ${genre1.emoji}`}
            genre={genre1.slug}
            query={genre1.name}
          />

          <SmartGenreSection
            title={`List ${genre2.name} ${genre2.emoji}`}
            genre={genre2.slug}
            query={genre2.name}
          />

          <SmartGenreSection
            title={`List ${genre3.name} ${genre3.emoji}`}
            genre={genre3.slug}
            query={genre3.name}
          />
        </div>

        {/* Other Sections */}
        <section className="pt-2 lg:pt-6 border-t border-white/10">
          <TrendingSection />
        </section>

        <section className="mt-6 lg:mt-10 pt-6 lg:pt-10 border-t border-white/10">
          <RecentUpdates />
        </section>
      </div>
    </main>
  );
}
