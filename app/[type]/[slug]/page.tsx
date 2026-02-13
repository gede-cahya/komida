import { Metadata } from 'next';
import MangaDetailPage from './client-page';
import { fetchMangaBySlug } from '@/lib/api';

type Props = {
    params: Promise<{
        type: string;
        slug: string;
    }>;
};

// Generate dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, type } = await params;

    try {
        const manga = await fetchMangaBySlug(slug);

        return {
            title: `${manga.title} - Read ${type} Online | Komida`,
            description: manga.synopsis ? manga.synopsis.slice(0, 160) + '...' : `Read ${manga.title} online at Komida.`,
            openGraph: {
                title: `${manga.title} | Komida`,
                description: manga.synopsis ? manga.synopsis.slice(0, 200) + '...' : `Read ${manga.title} online at Komida.`,
                images: [
                    {
                        url: manga.image || '/logo.png', // Or use proxy if needed to avoid mixed content in some cases? But mostly OG scrapes direct URLs
                        alt: manga.title,
                    }
                ],
                type: 'book',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${manga.title} | Komida`,
                description: manga.synopsis ? manga.synopsis.slice(0, 200) + '...' : `Read ${manga.title}.`,
                images: [manga.image || '/logo.png'],
            }
        };
    } catch (error) {
        console.error("Failed to generate metadata for manga:", error);
        return {
            title: `Read ${slug} Online | Komida`,
            description: `Read ${slug} manga online for free.`,
        };
    }
}

export default async function Page({ params }: Props) {
    const { slug } = await params;
    let initialData = null;

    try {
        initialData = await fetchMangaBySlug(slug);
    } catch (error) {
        console.error("Failed to fetch data for page:", error);
        // We can pass null and let the client handle loading/error or retry
    }

    return <MangaDetailPage initialData={initialData} />;
}
