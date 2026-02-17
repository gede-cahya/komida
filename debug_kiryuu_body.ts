
async function test() {
    const chapterUrl = 'https://kiryuu03.com/manga/i-became-the-first-prince/chapter-0.725161/'; // This redirects probably?
    // Wait, the link I found earlier was https://kiryuu03.com/manga/i-became-the-first-prince/chapter-0.725161/
    // Let's use that.

    try {
        const chRes = await fetch(chapterUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const chHtml = await chRes.text();

        console.log("HTML Length: " + chHtml.length);

        // Find where images are
        const imgIndex = chHtml.indexOf('<img');
        if (imgIndex !== -1) {
            console.log("First <img tag found at " + imgIndex);
            // Dump around it to see container
            const start = Math.max(0, imgIndex - 500);
            console.log(chHtml.substring(start, imgIndex + 500));
        } else {
            console.log("No <img tag found.");
        }

    } catch (e) {
        console.error(e);
    }
}

test();
