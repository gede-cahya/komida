
import { fetchGenre, Manga } from "@/lib/api";
import { MangaCard } from "@/components/manga-card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface GenreSectionProps {
    title: string;
    genre: string; // Used for link and fetching if initialData not provided
    initialData?: Manga[];
}

export async function GenreSection({ title, genre, initialData }: GenreSectionProps) {
    let data: Manga[] = [];

    if (initialData) {
        data = initialData;
    } else {
        try {
            const res = await fetchGenre(genre);
            // Handle different response structures just in case
            if (Array.isArray(res)) {
                data = res;
            } else if (res && Array.isArray(res.data)) {
                data = res.data;
            } else {
                console.warn(`Unexpected response format for genre ${genre}`, res);
                data = [];
            }
        } catch (e) {
            console.error(`Failed to fetch genre ${genre}`, e);
            // Don't crash the page, just return null or empty section
            data = [];
        }
    }

    // Limit to 6 items
    const displayItems = data.slice(0, 6);

    if (displayItems.length === 0) return null;

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

            {/* 
         Mobile: grid-cols-3 (3 items per row) -> 2 rows = 6 items
         User requested: "3 kesamping 2 kebawah"
      */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4">
                {displayItems.map((manga, idx) => (
                    <MangaCard
                        key={`${manga.title}-${idx}`}
                        {...manga}
                        // Ensure compatibility if types differ slightly
                        chapter={manga.chapter}
                    />
                ))}
            </div>
        </section>
    );
}
