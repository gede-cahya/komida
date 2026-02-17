
export interface ReadHistoryItem {
    mangaTitle: string;
    chapterId: string;
    chapterTitle?: string;
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

export function saveReadHistory(mangaTitle: string, chapterId: string, chapterTitle?: string) {
    if (typeof window === 'undefined') return;

    try {
        const history = getReadHistory();
        const normalizedTitle = mangaTitle.toLowerCase();

        // Find by ID match preferably
        const existingIndex = history.findIndex(h =>
            h.mangaTitle === normalizedTitle &&
            (h.chapterId === String(chapterId) || (chapterTitle && h.chapterTitle === chapterTitle))
        );

        if (existingIndex >= 0) {
            history[existingIndex].timestamp = Date.now();
            // Update title if missing
            if (chapterTitle && !history[existingIndex].chapterTitle) {
                history[existingIndex].chapterTitle = chapterTitle;
            }
        } else {
            history.push({
                mangaTitle: normalizedTitle,
                chapterId: String(chapterId),
                chapterTitle: chapterTitle,
                timestamp: Date.now()
            });
        }

        if (history.length > 1000) {
            history.sort((a, b) => a.timestamp - b.timestamp);
            history.splice(0, history.length - 1000);
        }

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        window.dispatchEvent(new Event('history-updated'));
    } catch (e) {
        console.error("Failed to save read history", e);
    }
}

export interface ReadStatus {
    ids: Set<string>;
    titles: Set<string>;
    has: (id?: string, title?: string) => boolean;
}

export function getReadStatusForManga(mangaTitle: string): ReadStatus {
    const history = getReadHistory();
    const ids = new Set<string>();
    const titles = new Set<string>();
    const normalizedTitle = mangaTitle.toLowerCase();

    history.forEach(h => {
        if (h.mangaTitle === normalizedTitle) {
            ids.add(h.chapterId);
            if (h.chapterTitle) titles.add(h.chapterTitle);
        }
    });

    return {
        ids,
        titles,
        has: (id?: string, title?: string) => {
            if (id && ids.has(String(id))) return true;
            if (title && titles.has(title)) return true;
            return false;
        }
    };
}
