
async function test() {
    const query = 'Heavenly Demon';
    const apiUrl = `https://kiryuu03.com/wp-json/wp/v2/manga?search=${encodeURIComponent(query)}&_embed`;

    console.log(`Searching: ${apiUrl}`);

    try {
        const res = await fetch(apiUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });

        if (res.ok) {
            const data = await res.json();
            console.log(`Found ${data.length} results.`);

            for (const item of data) {
                console.log(`Title: ${item.title.rendered}`);
                console.log(`Link: ${item.link}`);
                // Try to find Reborn as the Heavenly Demon
                if (item.title.rendered.toLowerCase().includes('reborn')) {
                    console.log("MATCH FOUND!");
                    // Now fetch detail of this match to see chapters
                    await checkChapters(item.link);
                    break;
                }
            }
        } else {
            console.log("Search failed: " + res.status);
        }

    } catch (e) {
        console.error(e);
    }
}

async function checkChapters(mangaUrl) {
    console.log(`\nChecking chapters for: ${mangaUrl}`);
    try {
        const res = await fetch(mangaUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const html = await res.text();

        // Match chapter links
        const matches = html.match(/href="(https:\/\/kiryuu03\.com\/[^"]+chapter-[^"]+)"/g);
        if (matches) {
            console.log(`Found ${matches.length} chapter links.`);
            if (matches.length > 0) {
                console.log(`Sample: ${matches[0]}`);
                // Check if it has ID
                const link = matches[0].replace('href="', '').replace('"', '');
                const idMatch = link.match(/\.(\d+)\/?$/);
                if (idMatch) {
                    console.log(`ID extraction successful: ${idMatch[1]}`);
                } else {
                    console.log(`ID extraction FAILED for: ${link}`);
                    // If failed, we need to inspect the link format
                }
            }
        } else {
            // Try looking for list
            console.log("No chapter links found via regex. Dumping list items...");
            // ...
        }
    } catch (e) {
        console.error(e);
    }
}

test();
