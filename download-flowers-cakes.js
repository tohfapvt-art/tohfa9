const https = require('https');
const fs = require('fs');
const path = require('path');

const images = {
  // Flowers
  'flower-birthday.jpg': 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80&auto=format&fit=crop',
  'flower-anniversary.jpg': 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&q=80&auto=format&fit=crop',
  'flower-roses.jpg': 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=600&q=80&auto=format&fit=crop',
  'flower-orchids.jpg': 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=600&q=80&auto=format&fit=crop',
  'flower-lilies.jpg': 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&q=80&auto=format&fit=crop',
  'flower-sunflowers.jpg': 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&q=80&auto=format&fit=crop',
  'flower-gerberas.jpg': 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&q=80&auto=format&fit=crop',

  // Cakes
  'cake-chocolate.jpg': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80&auto=format&fit=crop',
  'cake-lavender.jpg': 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80&auto=format&fit=crop',
  'cake-redvelvet.jpg': 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&q=80&auto=format&fit=crop',
  'cake-bento.jpg': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80&auto=format&fit=crop',
  'cake-fruit.jpg': 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80&auto=format&fit=crop',
  'cake-custom.jpg': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&q=80&auto=format&fit=crop'
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const outDir = path.join(__dirname, 'outputs');
          if (fs.existsSync(outDir)) {
            fs.copyFileSync(dest, path.join(outDir, path.basename(dest)));
          }
          resolve();
        });
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  for (const [filename, url] of Object.entries(images)) {
    console.log(`Downloading ${filename}...`);
    const target = path.join(__dirname, filename);
    await download(url, target);
    console.log(`Saved ${filename} (${fs.statSync(target).size} bytes)`);
  }
  console.log('All flower and cake images downloaded successfully!');
}

main().catch(console.error);
