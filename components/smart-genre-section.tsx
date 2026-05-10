"use client";

import { useState, useEffect } from "react";
import { fetchGenre, fetchSearch } from "@/lib/api";
import { MangaCard } from "@/components/manga-card";
import { MangaGridSkeleton } from "@/components/skeletons";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface MangaItem {
  id: number;
  title: string;
  image: string;
  rating: number;
  chapter: string;
  type?: string;
  source?: string;
  link?: string;
}

interface SmartGenreSectionProps {
  title: string;
  genre: string;
  query: string;
}

export function SmartGenreSection({ title, genre, query }: SmartGenreSectionProps) {
  const [items, setItems] = useState<MangaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchGenre(genre);
        let data = Array.isArray(res) ? res : res?.data || [];

        if (data.length === 0) {
          console.log(`[HOME] Genre ${genre} is empty, falling back to search for "${query}"`);
          const searchRes = await fetchSearch(query);
          data = searchRes?.results || [];
        }

        if (!cancelled) setItems(data.slice(0, 6));
      } catch (err) {
        console.error(`[HOME] Error fetching data for ${genre}:`, err);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [genre, query]);

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white relative pl-4 after:content-[''] after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-6 after:bg-primary after:rounded-full">
            {title}
          </h2>
        </div>
        <MangaGridSkeleton count={6} cols="grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6" />
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white relative pl-4 after:content-[''] after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-6 after:bg-primary after:rounded-full">
          {title}
        </h2>
        <Link href={`/genres/${genre}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4">
        {items.map((manga, idx) => (
          <MangaCard key={`${manga.title}-${idx}`} {...manga} chapter={manga.chapter} />
        ))}
      </div>
    </section>
  );
}
