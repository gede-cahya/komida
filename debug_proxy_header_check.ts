
async function test() {
    // This is a sample image URL we found earlier
    const imageUrl = 'https://yuucdn.com/wp-content/uploads/images/i/i-became-the-first-prince/chapter-0/1-697ed1a8eca81.webp';

    console.log(`Testing image fetch: ${imageUrl}`);

    const referers = [
        'https://kiryuu03.com/',
        'https://yuucdn.com/',
        ''
    ];

    for (const ref of referers) {
        console.log(`\nTesting with Referer: '${ref}'`);
        try {
            const headers: any = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            };
            if (ref) headers['Referer'] = ref;

            const res = await fetch(imageUrl, { headers });
            console.log(`Status: ${res.status}`);
            console.log(`Content-Type: ${res.headers.get('content-type')}`);
            console.log(`Content-Length: ${res.headers.get('content-length')}`);

            if (res.ok) {
                const buf = await res.arrayBuffer();
                console.log(`Downloaded ${buf.byteLength} bytes.`);
            }
        } catch (e) {
            console.error("Error:", e.message);
        }
    }
}

test();
