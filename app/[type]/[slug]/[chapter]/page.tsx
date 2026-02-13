import { Metadata } from 'next';
import ChapterReaderPage from './client-page';
import { fetchChapter } from '@/lib/api';

type Props = {
    params: Promise<{
        type: string;
        slug: string;
        chapter: string;
    }>;
    searchParams: Promise<{
        source?: string;
        link?: string;
    }>;
};

// Generate dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, chapter, type } = await params;

    // Format slug for title
    const formattedTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const formattedChapter = decodeURIComponent(chapter).replace(/-/g, ' ');

    return {
        title: `${formattedTitle} ${formattedChapter} - Read Online | Komida`,
        description: `Read ${formattedTitle} ${formattedChapter} online in high quality.`,
        robots: {
            index: false, // Often better to not index individual chapter pages to avoid dilution, or set to true if content is unique
            follow: true,
        },
        openGraph: {
            title: `${formattedTitle} ${formattedChapter} | Komida`,
            description: `Read ${formattedTitle} ${formattedChapter} online.`,
            type: 'book',
        }
    };
}

export default async function Page({ params, searchParams }: Props) {
    const { chapter } = await params;
    const { source, link } = await searchParams;

    let initialData = null;

    // Only fetch if we have chapter ID (which is the param)
    // If source & link are present, client-page logic handles it, but maybe we can support it here too?
    // The current client logic prioritizes chapter ID if source/link aren't present?
    // Check client-page logic:
    // if (chapter && !source && !link) -> fetch by chapter ID
    // if (source && link) -> fetch by source & link
    // We can mirror this logic.

    try {
        if (chapter && !source && !link) {
            initialData = await fetchChapter(chapter);
        }
        // If source/link are used, we skip server fetch for now or implement `fetchChapterByLink`
    } catch (error) {
        console.error("Failed to fetch chapter data for page:", error);
    }

    return <ChapterReaderPage initialData={initialData} />;
}
