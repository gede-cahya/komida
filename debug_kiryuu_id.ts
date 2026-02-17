
async function test() {
    const chapterUrl = 'https://kiryuu03.com/manga/i-became-the-first-prince/chapter-0.725161/';
    try {
        const chRes = await fetch(chapterUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const chHtml = await chRes.text();

        // Check for shortlink
        const shortlinkMatch = chHtml.match(/<link rel="shortlink" href="[^"]+\?p=(\d+)"/);
        if (shortlinkMatch) {
            console.log("Found shortlink ID: " + shortlinkMatch[1]);
        } else {
            console.log("No shortlink found.");
        }

        // Check for body class
        const bodyClassMatch = chHtml.match(/body.*class="([^"]*postid-(\d+)[^"]*)"/);
        if (bodyClassMatch) {
            console.log("Found body postid: " + bodyClassMatch[2]);
        } else {
            console.log("No body postid found.");
        }

        // Check for script with ID
        const scriptIdMatch = chHtml.match(/"post":{"id":(\d+),/);
        if (scriptIdMatch) {
            console.log("Found script ID: " + scriptIdMatch[1]);
        }

    } catch (e) {
        console.error(e);
    }
}

test();
