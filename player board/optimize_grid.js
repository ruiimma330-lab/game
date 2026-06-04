const fs = require('fs');
const PNG = require('pngjs').PNG;

const png = PNG.sync.read(fs.readFileSync('D:/claude project/game/35cd6588fd40ea9ab8d2601220114595.png'));
const { width, height, data } = png;

function getPixel(x, y) {
  const idx = Math.round(y) * width * 4 + Math.round(x) * 4;
  if (idx < 0 || idx >= data.length - 3) return { r: 0, g: 0, b: 0 };
  return { r: data[idx], g: data[idx+1], b: data[idx+2] };
}

function isBeige(r, g, b) {
  // Beige/background: light tan color
  return r > 200 && g > 185 && b > 150 && r - b < 60;
}

function isTerrain(r, g, b) {
  // Not white, not black, not beige background
  if (r > 240 && g > 235 && b > 220) return false;
  if (r < 10 && g < 10 && b < 10) return false;
  return !isBeige(r, g, b);
}

const ROW_COUNTS = [4, 5, 6, 7, 6, 5, 4];

// Sweep through parameter ranges to find best grid fit
let bestScore = -1;
let bestParams = null;
let bestGrid = null;

for (let BX = 10; BX <= 40; BX += 2) {
  for (let BY = 160; BY <= 200; BY += 2) {
    for (let W = 68; W <= 82; W += 2) {
      const HO = W / 2;
      const H = Math.round(W * 1.155); // Regular pointy-top hex
      const VG = H * 0.75;

      let score = 0;
      let gridSamples = [];

      for (let r = 0; r < 7; r++) {
        const count = ROW_COUNTS[r];
        for (let c = 0; c < count; c++) {
          const cx = BX + c * W + (r % 2 === 1 ? HO : 0);
          const cy = BY + r * VG;
          const p = getPixel(cx, cy);
          if (isTerrain(p.r, p.g, p.b)) {
            score++;
          }
          gridSamples.push({ r, c, cx, cy, ...p });
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestParams = { BX, BY, W, H, VG, HO };
        bestGrid = gridSamples;
      }
    }
  }
}

console.log(`Best params: BX=${bestParams.BX}, BY=${bestParams.BY}, W=${bestParams.W}, H=${bestParams.H}`);
console.log(`Score: ${bestScore}/${ROW_COUNTS.reduce((a,b)=>a+b, 0)}`);

// Now use the best params to sample and classify every hex
const { BX, BY, W, HO, VG } = bestParams;

console.log(`\n=== Best grid hex data ===`);
const grid = [];
for (let r = 0; r < 7; r++) {
  const count = ROW_COUNTS[r];
  const row = [];
  for (let c = 0; c < count; c++) {
    const cx = BX + c * W + (r % 2 === 1 ? HO : 0);
    const cy = BY + r * VG;
    const p = getPixel(cx, cy);
    row.push({ r, c, cx, cy, ...p });
  }
  grid.push(row);
}

// Print a readable map
grid.forEach((row, r) => {
  const cnt = ROW_COUNTS[r];
  const vals = row.map(h => {
    const { r:pr, g:pg, b:pb } = h;
    // Better color classification based on actual observed values
    // Blue: B is highest
    if (pb > 150 && pb > pr + 30 && pb > pg + 20) return '🌊R'; // river
    // Bright green: G > 130, G highest
    if (pg > 110 && pg > pr + 20 && pg > pb + 10) return '🌿P'; // pasture
    // Dark green: G moderate, R < 100
    if (pg > 60 && pr < 100 && pg >= pr && pg >= pb) return '🏰C'; // castle
    // Yellow: R > 200, G > 170, B < 100
    if (pr > 200 && pg > 140 && pb < 100 && pr > pg) return '📚K'; // knowledge
    // Orange: R > 180, G > 100, B < 120
    if (pr > 170 && pg > 80 && pb < 120 && pr > pg + 20 && pr > pb) return '🏙️Ci'; // city
    // Brown: R > 130, G > 60, B < 100, warm tone
    if (pr > 100 && pg > 40 && pb < 120 && pr > pg && pb < pg) return '🏙️Ci'; // city
    // Gray: R≈G≈B
    if (Math.abs(pr-pg) < 25 && Math.abs(pr-pb) < 25 && pr > 60 && pr < 200) return '⛏️M'; // mine
    return `(${pr},${pg},${pb})`;
  });
  console.log(`Row ${r} (${cnt}): ${vals.join(' | ')}`);
});

// Also try a different approach - sample the hex with its clip-path area
// and average colors within it
console.log(`\n=== Re-sampling with larger kernel ===`);
// For each hex, sample a 5x5 grid within its center area
for (let r = 0; r < 7; r++) {
  const count = ROW_COUNTS[r];
  const row = [];
  for (let c = 0; c < count; c++) {
    const cx = BX + c * W + (r % 2 === 1 ? HO : 0);
    const cy = BY + r * VG;

    // Sample 3x3 area around center and average
    let tr = 0, tg = 0, tb = 0;
    const sampleSize = 5;
    let n = 0;
    for (let dx = -sampleSize; dx <= sampleSize; dx += 3) {
      for (let dy = -sampleSize; dy <= sampleSize; dy += 3) {
        const p = getPixel(cx + dx, cy + dy);
        if (!isBeige(p.r, p.g, p.b)) {
          tr += p.r; tg += p.g; tb += p.b; n++;
        }
      }
    }
    if (n > 0) {
      tr /= n; tg /= n; tb /= n;
    }
    row.push({ r, c, cx, cy, r:Math.round(tr), g:Math.round(tg), b:Math.round(tb), n });
  }
  grid[r] = row;

  const vals = row.map(h => {
    const { r:pr, g:pg, b:pb } = h;
    if (pb > 150 && pb > pr + 30 && pb > pg + 20) return `🌊R${pb>200?'B':''}`;
    if (pg > 110 && pg > pr + 20 && pg > pb + 10) return `🌿P`;
    if (pg > 60 && pr < 100 && pg >= pr && pg >= pb) return `🏰C`;
    if (pr > 200 && pg > 140 && pb < 100 && pr > pg) return `📚K`;
    if (pr > 170 && pg > 80 && pb < 120 && pr > pg + 20) return `🏙️Ci`;
    if (pr > 100 && pg > 40 && pb < 100 && pr > pg && pb < pg) return `🏙️Ci`;
    if (Math.abs(pr-pg) < 25 && Math.abs(pr-pb) < 25 && pr > 60 && pr < 200) return `⛏️M`;
    return `(${pr},${pg},${pb})`;
  });
  console.log(`Row ${r}: ${vals.join(' | ')}`);
}
