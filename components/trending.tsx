"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchTrending, type TrendingManga } from "@/lib/api";
import { TrendingGrid } from "@/components/trending-grid";
import { TrendingSkeleton } from "@/components/skeletons";
import { Flame, RefreshCw } from "lucide-react";

export function TrendingSection() {
  const [items, setItems] = useState<TrendingManga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrending();
      if (!data || data.length === 0) {
        setError("No trending data available");
      } else {
        setItems(data);
        setError(null);
      }
    } catch (e: any) {
      console.error("Failed to fetch trending:", e);
      setError(e.message || "Failed to load trending manga");
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

  if (loading) return <TrendingSkeleton />;

  if (error) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Trending This Week
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

  return <TrendingGrid items={items} />;
}
