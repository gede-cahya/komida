
async function test() {
    const chapterUrl = 'https://kiryuu03.com/manga/i-became-the-first-prince/chapter-0.725161/'; // Use the one we know works via API to cross reference HTML structure

    try {
        const chRes = await fetch(chapterUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const chHtml = await chRes.text();

        // Find .jpg or .png or .webp
        const imgRegex = /(https:\/\/[^"]+\.(jpg|jpeg|png|webp))/gi;
        const matches = chHtml.match(imgRegex);

        if (matches) {
            console.log("Found " + matches.length + " image URLs.");
            // Filter out logos/icons if possible
            const contentImages = matches.filter(url => !url.includes('logo') && !url.includes('icon') && !url.includes('avatar'));
            console.log("Potential content images: " + contentImages.length);

            if (contentImages.length > 0) {
                console.log("Sample Image: " + contentImages[0]);

                // Find where this image is in the HTML
                const index = chHtml.indexOf(contentImages[0]);
                if (index !== -1) {
                    // Dump context around it
                    const start = Math.max(0, index - 500);
                    const end = Math.min(chHtml.length, index + 500);
                    console.log("\n--- CONTEXT START ---");
                    console.log(chHtml.substring(start, end));
                    console.log("--- CONTEXT END ---");
                }
            }
        } else {
            console.log("No image URLs found.");
        }

    } catch (e) {
        console.error(e);
    }
}

test();
