"use client";

/**
 * Skeleton loading components for Komida
 * Provides beautiful shimmer-effect placeholders while content loads
 */

/* Base shimmer skeleton block */
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-white/5 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

/* ─── Hero Section ─── */
export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[90vh] bg-background overflow-hidden">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
      <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-end pb-24 md:pb-32">
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-14 w-[80%] rounded-xl" />
          <Skeleton className="h-14 w-[50%] rounded-xl" />
          <div className="flex items-center gap-4 mt-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-12 w-40 rounded-full mt-4" />
        </div>
      </div>
    </div>
  );
}

/* ─── Manga Card Skeleton ─── */
export function MangaCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`block ${className}`}>
      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
    </div>
  );
}

/* ─── Trending Section ─── */
export function TrendingSkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-8 w-56 rounded-lg" />
        </div>
        <Skeleton className="h-5 w-20 rounded" />
      </div>

      {/* Desktop bento skeleton — matches new flex layout */}
      <div className="hidden md:flex gap-4 h-[520px]">
        {/* Featured card */}
        <div className="w-[48%] xl:w-[45%] flex-shrink-0">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
        {/* 2×2 right grid */}
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-full h-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Mobile skeleton — simple 2-col grid with aspect-ratio */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
        ))}
      </div>
    </section>
  );
}

/* ─── Recent Updates Section ─── */
export function RecentUpdatesSkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-7 w-44 rounded-lg" />
        </div>
        <Skeleton className="h-5 w-20 rounded" />
      </div>
      {/* Matches RecentUpdates grid breakpoints: 2 / sm:3 / md:4 / lg:5 / xl:6 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <MangaCardSkeleton key={i} className="w-full" />
        ))}
      </div>
    </section>
  );
}

/* ─── Grid of Manga Cards ─── */
export function MangaGridSkeleton({
  count = 10,
  cols = "grid-cols-2 md:grid-cols-4 lg:grid-cols-5",
}: {
  count?: number;
  cols?: string;
}) {
  return (
    <div className={`grid ${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <MangaCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ─── Search Results ─── */
export function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <MangaCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ─── Genres List ─── */
export function GenresListSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

/* ─── Genre Detail / Popular Page ─── */
export function PopularPageSkeleton() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <MangaCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ─── Manga Detail Page ─── */
export function MangaDetailSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Background */}
      <div className="relative w-full h-[300px] md:h-[400px]">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 md:-mt-48 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <Skeleton className="w-[200px] md:w-[300px] aspect-[2/3] rounded-xl mx-auto md:mx-0 shrink-0" />

          {/* Metadata */}
          <div className="flex-1 space-y-6 pt-4">
            <div className="space-y-3">
              <Skeleton className="h-10 w-[70%] rounded-xl" />
              <Skeleton className="h-10 w-[40%] rounded-xl" />
              <div className="flex gap-3 mt-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-10 w-32 rounded-full mt-4" />
            </div>
            {/* Genre pills */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-full" />
              ))}
            </div>
            {/* Synopsis */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-24 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-[80%] rounded" />
              <Skeleton className="h-4 w-[60%] rounded" />
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div className="mt-16 space-y-3">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─── Chapter Reader ─── */
export function ChapterReaderSkeleton() {
  return (
    <div className="min-h-screen bg-[#111] flex flex-col items-center pt-16">
      <div className="w-full max-w-4xl mx-auto space-y-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-full min-h-[500px] rounded-none" />
        ))}
      </div>
    </div>
  );
}

/* ─── Bookmarks ─── */
export function BookmarksSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <MangaCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ─── Comment Section ─── */
export function CommentsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="w-10 h-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-[60%] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
