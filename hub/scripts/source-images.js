const fs = require('fs');
const path = require('path');
const https = require('https');

const IMAGE_DIR = path.join(process.cwd(), 'public/assets/images/university');

if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

console.log('🎨 Sourcing high-quality university placeholders...');

const photos = [
    'photo-1541339907198-e08756ebafe3', // Main Campus
    'photo-1523050335456-c38a20b6d5f0', // Graduation Hall
    'photo-1498243639359-2cee3e35d3cf'  // Library
];

function downloadImage(id, index) {
    const filename = path.join(IMAGE_DIR, `campus-${index}.jpg`);
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=1600&h=900`;
    
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                // follow redirect
                https.get(res.headers.location, (res2) => {
                    const file = fs.createWriteStream(filename);
                    res2.pipe(file);
                    file.on('finish', () => { file.close(); resolve(); });
                }).on('error', reject);
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to get image: ${res.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(filename);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', reject);
    });
}

async function start() {
    for (let i = 0; i < photos.length; i++) {
        console.log(`📥 Downloading Campus Asset ${i} (${photos[i]})...`);
        try {
            await downloadImage(photos[i], i);
            console.log(`✅ Saved as campus-${i}.jpg`);
        } catch (err) {
            console.error(`❌ Failed: ${err.message}`);
        }
    }
    console.log('✨ All assets successfully sourced!');
}

start();
