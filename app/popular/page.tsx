import { Metadata } from 'next';
import PopularPage from './client-page';

export const metadata: Metadata = {
    title: 'Popular Manga | Komida',
    description: 'Browse the most popular manga, manhwa, and manhua on Komida. Updated daily.',
    alternates: {
        canonical: 'https://komida.site/popular',
    },
    openGraph: {
        title: 'Popular Manga | Komida',
        description: 'Browse the most popular manga, manhwa, and manhua on Komida.',
        url: 'https://komida.site/popular',
    },
};

export default function Page() {
    return <PopularPage />;
}
