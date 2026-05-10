"use client";

import { useState, useEffect, useCallback } from "react";
import { MangaCard } from "@/components/manga-card";
import { ArrowRight, Clock, RefreshCw } from "lucide-react";
import { fetchRecentUpdates, type Manga } from "@/lib/api";
import { RecentUpdatesSkeleton } from "@/components/skeletons";

export function RecentUpdates() {
  const [recentUpdates, setRecentUpdates] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecentUpdates();
      if (!data || data.length === 0) {
        setError("No recent updates available");
      } else {
        setRecentUpdates(data);
        setError(null);
      }
    } catch (e: any) {
      console.error("Failed to fetch recent updates:", e);
      setError(e.message || "Failed to load recent updates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, retryCount]);

  // Auto-retry once after 5 seconds if we got an error
  useEffect(() => {
    if (error && retryCount === 0) {
      const timer = setTimeout(() => {
        setRetryCount((c) => c + 1);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  if (loading) return <RecentUpdatesSkeleton />;

  if (error) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <Clock className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Recent Updates
          </h2>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </section>
    );
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
