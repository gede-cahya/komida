
async function test() {
    const chapterUrl = 'https://kiryuu03.com/manga/i-became-the-first-prince/chapter-0.725161/';

    try {
        const chRes = await fetch(chapterUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const chHtml = await chRes.text();

        // Check for common containers
        const containers = ['readerarea', 'reader', 'content', 'chapter-content', 'entry-content', 'reading-content'];
        for (const c of containers) {
            const index = chHtml.indexOf(c);
            if (index !== -1) {
                console.log(`Found possible container: ${c} at index ${index}`);
                // Dump a bit
                console.log(chHtml.substring(index, index + 200));
            }
        }

        // Look for image sequences
        // <img ... class="wp-manga-chapter-img ...">
        const imgClassMatch = chHtml.match(/class="([^"]*wp-manga-chapter-img[^"]*)"/);
        if (imgClassMatch) {
            console.log("Found wp-manga-chapter-img class: " + imgClassMatch[1]);
        }

    } catch (e) {
        console.error(e);
    }
}

test();
