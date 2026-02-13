import { Metadata } from 'next';
import BookmarksPage from './client-page';

export const metadata: Metadata = {
    title: 'My Bookmarks | Komida',
    description: 'View your saved manga, manhwa, and manhua on Komida.',
    alternates: {
        canonical: 'https://komida.site/bookmarks',
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function Page() {
    return <BookmarksPage />;
}
