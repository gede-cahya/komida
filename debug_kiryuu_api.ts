
async function test() {
    // ID from: https://kiryuu03.com/manga/i-became-the-first-prince/chapter-0.725161/
    const chapterId = '725161';
    const apiUrl = `https://kiryuu03.com/wp-json/wp/v2/chapter/${chapterId}`;

    console.log(`Testing API: ${apiUrl}`);

    try {
        const apiRes = await fetch(apiUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        console.log("API Status: " + apiRes.status);

        if (apiRes.ok) {
            const json = await apiRes.json();
            console.log("API Response Keys: " + Object.keys(json).join(', '));

            if (json.content && json.content.rendered) {
                console.log("Content found. Checking for images...");
                const content = json.content.rendered;
                // Simple regex count
                const imgCount = (content.match(/<img/g) || []).length;
                console.log("Found " + imgCount + " img tags in content.");

                // Sample src
                const srcMatch = content.match(/src="([^"]+)"/);
                if (srcMatch) {
                    console.log("Sample Image: " + srcMatch[1]);

                    // Verify access
                    console.log("Fetching sample image...");
                    const imgRes = await fetch(srcMatch[1], {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Referer': 'https://kiryuu03.com/'
                        }
                    });
                    console.log("Image Status: " + imgRes.status);
                    console.log("Image Type: " + imgRes.headers.get('content-type'));
                }
            } else {
                console.log("No content.rendered in JSON.");
            }

        } else {
            console.log("API Request failed.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

test();
