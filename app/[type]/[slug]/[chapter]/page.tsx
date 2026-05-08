import { Metadata } from 'next';
import ChapterReaderPage from './client-page';

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

export default async function Page({ params }: Props) {
    return <ChapterReaderPage />;
}
