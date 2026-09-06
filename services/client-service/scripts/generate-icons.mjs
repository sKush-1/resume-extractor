import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import pngToIco from 'png-to-ico';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcons() {
    const publicDir = path.join(__dirname, '..', 'public');
    const inputSvg = path.join(publicDir, 'icon.svg');

    console.log('Generating icons from icon.svg...');

    // 1. apple-icon.png (180x180)
    await sharp(inputSvg).resize(180, 180).png().toFile(path.join(publicDir, 'apple-icon.png'));
    console.log('Created apple-icon.png');

    // 2. favicon-32x32.png
    await sharp(inputSvg).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('Created favicon-32x32.png');

    // 3. favicon-96x96.png
    await sharp(inputSvg).resize(96, 96).png().toFile(path.join(publicDir, 'favicon-96x96.png'));
    console.log('Created favicon-96x96.png');

    // 4. android-chrome-192x192.png
    await sharp(inputSvg).resize(192, 192).png().toFile(path.join(publicDir, 'android-chrome-192x192.png'));
    console.log('Created android-chrome-192x192.png');

    // 5. android-chrome-512x512.png
    await sharp(inputSvg).resize(512, 512).png().toFile(path.join(publicDir, 'android-chrome-512x512.png'));
    console.log('Created android-chrome-512x512.png');

    // 6. Generate multi-layer favicon.ico (16x16, 32x32, 48x48)
    const sizes = [16, 32, 48];
    const pngBuffers = await Promise.all(
        sizes.map(size =>
            sharp(inputSvg).resize(size, size).png().toBuffer()
        )
    );

    const icoBuffer = await pngToIco(pngBuffers);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    console.log('Created multi-layer favicon.ico (16, 32, 48)');

    console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
    console.error('Error generating icons:', err);
    process.exit(1);
});
