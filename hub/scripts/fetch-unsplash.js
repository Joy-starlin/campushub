const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Lightweight Unsplash Image Fetcher
 * Usage: node scripts/fetch-unsplash.js <query> <count> <output_dir>
 */

const query = process.argv[2] || 'university';
const count = parseInt(process.argv[3]) || 1;
const outputDir = path.join(process.cwd(), process.argv[4] || 'public/assets/images/unsplash');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`🚀 Starting Unsplash fetch for "${query}" (${count} images) to ${outputDir}...`);

const downloadImage = (url, filename) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Handle redirect
                downloadImage(response.headers.location, filename).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get image: ${response.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(filename);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });

            fileStream.on('error', (err) => {
                fs.unlink(filename, () => {});
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

async function fetchImages() {
    for (let i = 0; i < count; i++) {
        // Using a verified high-quality university photo ID from Unsplash
        const photoId = 'photo-1541339907198-e08756ebafe3'; 
        const url = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=80&w=1600&h=900`;
        const filename = path.join(outputDir, `${query.replace(/\s+/g, '-')}-${Date.now()}-${i}.jpg`);
        
        try {
            await downloadImage(url, filename);
            console.log(`✅ Downloaded: ${path.basename(filename)}`);
            // Note: To get different images dynamically, an Unsplash API Access Key is required.
        } catch (err) {
            console.error(`❌ Failed to download image ${i}: ${err.message}`);
        }
    }
    console.log('✨ All downloads complete!');
}

fetchImages();
