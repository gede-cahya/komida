
import { Manga } from "./api";

const STORAGE_KEY = 'komida_bookmarks';

export function getBookmarks(): Manga[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function saveBookmark(manga: Manga) {
    const bookmarks = getBookmarks();
    // Check if exists
    if (!bookmarks.some(b => b.title === manga.title)) {
        bookmarks.push(manga);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
        window.dispatchEvent(new Event('bookmarks-updated'));
    }
}

export function removeBookmark(title: string) {
    const bookmarks = getBookmarks();
    const filtered = bookmarks.filter(b => b.title !== title);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('bookmarks-updated'));
}

export function isBookmarked(title: string): boolean {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.title === title);
}
