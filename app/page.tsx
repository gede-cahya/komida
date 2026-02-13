import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { TrendingSection } from "@/components/trending";
import { RecentUpdates } from "@/components/recent-updates";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Komida - Home | Read Manga, Manhwa, Manhua",
  description: "Discover the best Manga, Manhwa, and Manhua online. Free reading, high-quality images, and daily updates.",
  alternates: {
    canonical: 'https://komida.site',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <div className="container mx-auto px-4 py-12 space-y-20">
        <TrendingSection />
        <RecentUpdates />
      </div>
    </main>
  );
}
