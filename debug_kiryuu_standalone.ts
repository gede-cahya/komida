
async function test() {
    const baseUrl = 'https://kiryuu03.com/';
    const mangaUrl = 'https://kiryuu03.com/manga/i-became-the-first-prince/'; // Valid from previous run

    console.log(`Testing Manga Detail: ${mangaUrl}`);
    try {
        const detailRes = await fetch(mangaUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        console.log('Detail Status:', detailRes.status);

        if (detailRes.ok) {
            const detailHtml = await detailRes.text();

            // Find ALL chapter links to be sure
            // href="https://kiryuu03.com/i-became-the-first-prince-chapter-..."
            const chapterMatch = detailHtml.match(/href="(https:\/\/kiryuu03\.com\/[^"]+chapter-[^"]+)"/);

            if (chapterMatch) {
                const chapterLink = chapterMatch[1];
                console.log(`Found Chapter: ${chapterLink}`);

                const chRes = await fetch(chapterLink, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });
                console.log('Chapter Status:', chRes.status);
                const chHtml = await chRes.text();

                // Find image src
                // <img src="..." ...> or data-src
                // Kiryuu images often start with https://cdn... or similar
                // Let's grab strings that look like image URLs
                const imgRegex = /src="(https:\/\/[^"]+\.(jpg|jpeg|png|webp))"/gi;
                let match;
                const images = [];
                while ((match = imgRegex.exec(chHtml)) !== null) {
                    if (!match[1].includes('logo') && !match[1].includes('kiryuu')) { // Filter out logos if possible
                        images.push(match[1]);
                    }
                }

                // Also check data-src
                const dataImgRegex = /data-src="(https:\/\/[^"]+\.(jpg|jpeg|png|webp))"/gi;
                while ((match = dataImgRegex.exec(chHtml)) !== null) {
                    images.push(match[1]);
                }

                // Also check ts_reader
                const scriptMatch = chHtml.match(/ts_reader\.run\((.*?)\);/);
                if (scriptMatch) {
                    console.log("Found ts_reader script");
                    try {
                        const json = JSON.parse(scriptMatch[1]);
                        const scriptImages = json.sources[0].images;
                        if (scriptImages && scriptImages.length > 0) {
                            images.push(...scriptImages);
                        }
                    } catch (e) {
                        console.error("Failed to parse script JSON");
                    }
                }

                if (images.length > 0) {
                    const firstImg = images[0];
                    console.log(`Found ${images.length} images.`);
                    console.log(`Testing First Image: ${firstImg}`);

                    // Test fetching image with Referer
                    console.log(`Attempting to fetch image with Referer: ${baseUrl}`);
                    const imgRes = await fetch(firstImg, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Referer': baseUrl
                        }
                    });
                    console.log('Image Fetch Status:', imgRes.status);
                    console.log('Image Content-Type:', imgRes.headers.get('content-type'));

                    if (imgRes.status === 403) {
                        console.log("403 Forbidden - Referer might be rejected");

                        // Try without referer
                        console.log("Retrying without Referer...");
                        const imgResNoRef = await fetch(firstImg, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                            }
                        });
                        console.log('Image Fetch Status (No Referer):', imgResNoRef.status);
                    }
                } else {
                    console.log('No images found in chapter.');
                }
            } else {
                console.log('No chapters found in detail page (Regex failed?)');
            }
        } else {
            console.log('Detail page load failed');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

test();
