import { MangaCard } from "@/components/manga-card";
import { ArrowRight, Clock } from "lucide-react";
import { fetchRecentUpdates, type Manga } from "@/lib/api";

export async function RecentUpdates() {
  let recentUpdates: Manga[] = [];

  try {
    recentUpdates = await fetchRecentUpdates();
  } catch (error) {
    console.error("Failed to fetch recent updates:", error);
  }

  if (!recentUpdates || recentUpdates.length === 0) {
    return null;
  }

  // Limit to 12 items for a clean 2-row display on desktop (6 cols × 2 rows)
  const displayItems = recentUpdates.slice(0, 12);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-foreground">
          <Clock className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Recent Updates
          </h2>
        </div>
        <button className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group">
          View All{" "}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/*
       * Gradual column progression avoids the jarring jump from 3 → 6.
       * mobile  : 2 cols
       * sm 640  : 3 cols
       * md 768  : 4 cols
       * lg 1024 : 5 cols
       * xl 1280 : 6 cols
       */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {displayItems.map((item) => (
          <MangaCard
            key={item.id}
            title={item.title}
            image={item.image}
            rating={item.rating}
            chapter={item.chapter}
            type={item.type}
            source={item.source}
            className="w-full"
          />
        ))}
      </div>
    </section>
  );
}
