"use client";

import { useState, useEffect } from "react";
import { fetchPopular, fetchGenre, fetchSearch } from "@/lib/api";
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

function usePopular() {
  const [items, setItems] = useState<MangaItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    fetchPopular()
      .then((res: any) => {
        if (cancelled) return;
        const data = Array.isArray(res) ? res : res?.data || [];
        setItems(data.slice(0, 6));
      })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  return { items, loading };
}

function useGenre(genre: string, query: string) {
  const [items, setItems] = useState<MangaItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetchGenre(genre);
        let data = Array.isArray(res) ? res : res?.data || [];
        if (data.length === 0) {
          const searchRes = await fetchSearch(query);
          data = searchRes?.results || [];
        }
        if (!cancelled) setItems(data.slice(0, 6));
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [genre, query]);
  return { items, loading };
}

function SectionGrid({ title, href, items, loading }: {
  title: string;
  href: string;
  items: MangaItem[];
  loading: boolean;
}) {
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
        <Link href={href} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
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

export function HomeSections({
  genre1, genre2, genre3
}: {
  genre1: { name: string; slug: string; emoji: string };
  genre2: { name: string; slug: string; emoji: string };
  genre3: { name: string; slug: string; emoji: string };
}) {
  const popular = usePopular();
  const g1 = useGenre(genre1.slug, genre1.name);
  const g2 = useGenre(genre2.slug, genre2.name);
  const g3 = useGenre(genre3.slug, genre3.name);

  return (
    <div className="space-y-12">
      <SectionGrid
        title="Komik Hot 🔥"
        href="/popular"
        items={popular.items}
        loading={popular.loading}
      />
      <SectionGrid
        title={`List ${genre1.name} ${genre1.emoji}`}
        href={`/genres/${genre1.slug}`}
        items={g1.items}
        loading={g1.loading}
      />
      <SectionGrid
        title={`List ${genre2.name} ${genre2.emoji}`}
        href={`/genres/${genre2.slug}`}
        items={g2.items}
        loading={g2.loading}
      />
      <SectionGrid
        title={`List ${genre3.name} ${genre3.emoji}`}
        href={`/genres/${genre3.slug}`}
        items={g3.items}
        loading={g3.loading}
      />
    </div>
  );
}
