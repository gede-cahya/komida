
import fs from 'fs';
import path from 'path';

const backendPath = path.resolve('../komida-backend/src/index.ts');

console.log(`Reading ${backendPath}...`);
let content = fs.readFileSync(backendPath, 'utf8');

// We want to force the catch block or just bypass sharp
// Locate: outputBuffer = await sharp(Buffer.from(arrayBuffer))
// Replace with comment and assignment

const sharpLogic = `outputBuffer = await sharp(Buffer.from(arrayBuffer))`;
const bypassLogic = `// BYPASS SHARP FOR DEBUGGING
            // outputBuffer = await sharp(Buffer.from(arrayBuffer))
            //    .resize({ width: 720, withoutEnlargement: true })
            //    .webp({ quality: 50 })
            //    .toBuffer();
             outputBuffer = arrayBuffer; // Direct pass-through
`;

if (content.includes(sharpLogic)) {
    // We need to replace the whole block or just the start
    // the code block is:
    /*
            try {
            outputBuffer = await sharp(Buffer.from(arrayBuffer))
                .resize({ width: 720, withoutEnlargement: true })  // Smaller resize target
                .webp({ quality: 50 })  // Lower quality = less memory + smaller output
                .toBuffer();

            c.header('Content-Type', 'image/webp');
        } catch (sharpError) {
    */

    // Simpler approach: Replace the try block start
    const target = `try {
            outputBuffer = await sharp(Buffer.from(arrayBuffer))
                .resize({ width: 720, withoutEnlargement: true })  // Smaller resize target
                .webp({ quality: 50 })  // Lower quality = less memory + smaller output
                .toBuffer();

            c.header('Content-Type', 'image/webp');
        } catch (sharpError) {`;

    const replacement = `try {
            // outputBuffer = await sharp(Buffer.from(arrayBuffer))...
            outputBuffer = arrayBuffer;
            // c.header('Content-Type', 'image/webp');
        } catch (sharpError) {`;

    // Since formatting might vary (whitespace), let's regex or find a unique string
    // Unset Content-Type header if bypassing sharp (keep original)

    // Let's just create a more robust regex replacement
    content = content.replace(
        /outputBuffer = await sharp\(Buffer\.from\(arrayBuffer\)\)[\s\S]*?\.toBuffer\(\);[\s\S]*?c\.header\('Content-Type', 'image\/webp'\);/,
        `outputBuffer = arrayBuffer; // BYPASS SHARP`
    );

    console.log('Applying Sharp bypass patch...');
    fs.writeFileSync(backendPath, content);
    console.log('Patch applied.');
} else {
    console.log('Sharp logic not found matching pattern. Checking for previous patch...');
    if (content.includes('outputBuffer = arrayBuffer; // BYPASS SHARP')) {
        console.log('Patch already applied.');
    } else {
        console.error('Could not find Sharp logic to replace.');
    }
}
