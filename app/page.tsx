import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { TrendingSection } from "@/components/trending";
import { RecentUpdates } from "@/components/recent-updates";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <div className="container mx-auto px-4 py-12 space-y-20">
        <TrendingSection />
        <RecentUpdates />
      </div>
    </main>
  );
}
