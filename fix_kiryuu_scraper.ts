
import fs from 'fs';
import path from 'path';

const backendPath = path.resolve('../komida-backend/src/scrapers/providers/kiryuu.ts');

console.log(`Reading ${backendPath}...`);
let content = fs.readFileSync(backendPath, 'utf8');

// The code to inject
const fallbackLogic = `
            // Fallback: Try to find ID from body class if URL didn't have it or API failed initially
            if (images.length === 0) {
                const bodyClass = $('body').attr('class') || '';
                const postidMatch = bodyClass.match(/postid-(\\d+)/);
                if (postidMatch) {
                    const chapterId = postidMatch[1];
                    console.log(\`[Kiryuu] Found ID from HTML: \${chapterId}. Trying API...\`);
                    const apiUrl = \`\${this.baseUrl}wp-json/wp/v2/chapter/\${chapterId}\`;
                    
                    try {
                        const apiResponse = await fetch(apiUrl, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                            }
                        });

                        if (apiResponse.ok) {
                            const apiData = await apiResponse.json();
                            if (apiData.content?.rendered) {
                                const content$ = cheerio.load(apiData.content.rendered);
                                content$('img').each((_, element) => {
                                    const src = content$(element).attr('src');
                                    if (src && !src.startsWith('data:image')) {
                                        images.push(src.trim());
                                    }
                                });
                                console.log(\`[Kiryuu] API via HTML ID returned \${images.length} images\`);
                            }
                        }
                    } catch (apiErr) {
                        console.error(\`[Kiryuu] API via HTML ID failed:\`, apiErr);
                    }
                }
            }
`;

// Find insertion point: after const $ = cheerio.load(html);
const insertionPoint = 'const $ = cheerio.load(html);';
if (content.includes(insertionPoint)) {
    // Check if already applied to prevent double patch
    if (!content.includes('Found ID from HTML')) {
        content = content.replace(insertionPoint, insertionPoint + '\n' + fallbackLogic);
        console.log('Applying patch...');
        fs.writeFileSync(backendPath, content);
        console.log('Patch applied successfully.');
    } else {
        console.log('Patch already applied.');
    }
} else {
    console.error('Insertion point not found!');
}
