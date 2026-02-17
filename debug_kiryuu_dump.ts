
async function test() {
    // Direct chapter link that worked: https://kiryuu03.com/manga/i-became-the-first-prince/chapter-0.725161/
    // Wait, the link structure above looks weird: chapter-0.725161/
    // Usually it is chapter-1/ or similar.
    // But let's use the one found: 
    const chapterUrl = 'https://kiryuu03.com/i-became-the-first-prince-chapter-20/';
    // I made up chapter 20 because the previous regex might have caught something weird like comments or widgets.

    // Let's try to fetch the manga detail again and print the chapter links found to ensure they are correct.
    const mangaUrl = 'https://kiryuu03.com/manga/i-became-the-first-prince/';

    try {
        const detailRes = await fetch(mangaUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const detailHtml = await detailRes.text();

        // Match all hrefs resembling chapters
        const matches = detailHtml.match(/href="(https:\/\/kiryuu03\.com\/[^"]+-chapter-[^"]+)"/g);
        if (matches && matches.length > 0) {
            console.log("Found " + matches.length + " chapter links.");
            console.log("Sample: " + matches[0]);

            const targetUrl = matches[0].replace('href="', '').replace('"', '');
            console.log("Targeting: " + targetUrl);

            const chRes = await fetch(targetUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
            });
            const chHtml = await chRes.text();

            console.log("\n--- HTML DUMP START ---");
            // Print a section that might contain images. `readerarea` is common id.
            const readerIndex = chHtml.indexOf('readerarea');
            if (readerIndex !== -1) {
                console.log(chHtml.substring(readerIndex, readerIndex + 2000));
            } else {
                console.log("No readerarea found. Dumping first 2000 chars");
                console.log(chHtml.substring(0, 2000));
            }
            console.log("\n--- HTML DUMP END ---");

        } else {
            console.log("No chapter links found.");
        }

    } catch (e) {
        console.error(e);
    }
}

test();
