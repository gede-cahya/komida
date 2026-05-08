import {
  MangaGridSkeleton,
  TrendingSkeleton,
  RecentUpdatesSkeleton,
} from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground pt-20 md:pt-24 space-y-12 pb-20">
      <div className="container mx-auto px-4 space-y-16">
        <section>
          <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
        </section>
        <section>
          <MangaGridSkeleton
            count={6}
            cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          />
        </section>
        <div className="space-y-12">
          <MangaGridSkeleton
            count={6}
            cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          />
          <MangaGridSkeleton
            count={6}
            cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          />
          <MangaGridSkeleton
            count={6}
            cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          />
        </div>
        <section className="pt-2 lg:pt-6 border-t border-white/10">
          <TrendingSkeleton />
        </section>
        <section className="mt-6 lg:mt-10 pt-6 lg:pt-10 border-t border-white/10">
          <RecentUpdatesSkeleton />
        </section>
      </div>
    </main>
  );
}
