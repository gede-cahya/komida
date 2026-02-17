
export interface ReadHistoryItem {
    mangaTitle: string;
    chapterId: string;
    timestamp: number;
}

const HISTORY_KEY = 'komida_read_history';

export function getReadHistory(): ReadHistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to parse read history", e);
        return [];
    }
}

export function saveReadHistory(mangaTitle: string, chapterId: string) {
    if (typeof window === 'undefined') return;

    try {
        const history = getReadHistory();
        // Check if already exists to avoid duplicates/unnecessary writes, 
        // using a composite key check or just simple existence.
        // We want to update timestamp if it exists.

        const existingIndex = history.findIndex(h => h.mangaTitle === mangaTitle && h.chapterId === chapterId);

        if (existingIndex >= 0) {
            history[existingIndex].timestamp = Date.now();
        } else {
            history.push({
                mangaTitle,
                chapterId,
                timestamp: Date.now()
            });
        }

        // Optional: Limit history size if needed, e.g. last 1000 chapters
        if (history.length > 1000) {
            history.sort((a, b) => a.timestamp - b.timestamp); // Oldest first
            history.splice(0, history.length - 1000); // Remove oldest
        }

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        window.dispatchEvent(new Event('history-updated'));
    } catch (e) {
        console.error("Failed to save read history", e);
    }
}

export function isChapterRead(mangaTitle: string, chapterId: string): boolean {
    const history = getReadHistory();
    return history.some(h => h.mangaTitle === mangaTitle && h.chapterId === chapterId);
}

export function getReadChaptersForManga(mangaTitle: string): Set<string> {
    const history = getReadHistory();
    const readChapters = new Set<string>();
    history.forEach(h => {
        if (h.mangaTitle === mangaTitle) {
            readChapters.add(h.chapterId);
        }
    });
    return readChapters;
}
