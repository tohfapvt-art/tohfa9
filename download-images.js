const https = require('https');
const fs = require('fs');
const path = require('path');

const images = {
  'birthday-gift.jpg': 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&q=80&auto=format&fit=crop',
  'wedding-gift.jpg': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80&auto=format&fit=crop',
  'anniversary-gift.jpg': 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&q=80&auto=format&fit=crop',
  'corporate-gift.jpg': 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80&auto=format&fit=crop',
  'for-her-gift.jpg': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80&auto=format&fit=crop',
  'for-him-gift.jpg': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80&auto=format&fit=crop',
  'celebrate-gift.jpg': 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=80&auto=format&fit=crop'
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
  console.log('All image assets downloaded successfully!');
}

main().catch(console.error);
