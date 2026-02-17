
async function test() {
    const mangaUrl = 'https://kiryuu03.com/manga/i-became-the-first-prince/';
    console.log(`Testing: ${mangaUrl}`);

    try {
        const detailRes = await fetch(mangaUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const detailHtml = await detailRes.text();

        // Match all hrefs
        const matches = detailHtml.match(/href="([^"]+)"/g);
        if (matches) {
            console.log("Found " + matches.length + " links.");
            // Filter relevant ones
            const chapters = matches.filter(l => l.includes('chapter') || l.includes('ch-'));
            console.log("Potential chapters: " + chapters.length);

            if (chapters.length > 0) {
                // Clean the link
                const rawLink = chapters[0].replace('href="', '').replace('"', '');
                const chLink = rawLink.trim();

                console.log("Fetching: '" + chLink + "'");

                const chRes = await fetch(chLink, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
                });
                console.log("Chapter Status: " + chRes.status);

                const chHtml = await chRes.text();

                // Dump reader area
                const readerIndex = chHtml.indexOf('readerarea');
                if (readerIndex !== -1) {
                    console.log("\n--- READER AREA START ---");
                    // Dump a chunk
                    console.log(chHtml.substring(readerIndex, readerIndex + 3000));
                    console.log("--- READER AREA END ---");
                } else {
                    // Maybe it's ts_reader
                    const scriptIndex = chHtml.indexOf('ts_reader');
                    if (scriptIndex !== -1) {
                        console.log("\n--- SCRIPT START ---");
                        console.log(chHtml.substring(scriptIndex, scriptIndex + 2000));
                        console.log("--- SCRIPT END ---");
                    } else {
                        console.log("No reader area or script found? Dump first 1000 chars:");
                        console.log(chHtml.substring(0, 1000));
                    }
                }
            }
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
