import { fetchTrending, type TrendingManga } from "@/lib/api";
import { TrendingGrid } from "@/components/trending-grid";

export async function TrendingSection() {
    let items: TrendingManga[] = [];
    try {
        items = await fetchTrending();
    } catch (e) {
        console.error("Failed to fetch trending:", e);
    }

    if (!items || items.length === 0) return null;

    return <TrendingGrid items={items} />;
}
