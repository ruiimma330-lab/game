const fs = require('fs');
const PNG = require('pngjs').PNG;

const png = PNG.sync.read(fs.readFileSync('D:/claude project/game/35cd6588fd40ea9ab8d2601220114595.png'));
const { width, height, data } = png;

function getPixel(x, y) {
  const idx = Math.round(y) * width * 4 + Math.round(x) * 4;
  if (idx < 0 || idx >= data.length - 3) return { r: 0, g: 0, b: 0 };
  return { r: data[idx], g: data[idx+1], b: data[idx+2] };
}

function avgColor(cx, cy, radius) {
  let tr=0, tg=0, tb=0, n=0;
  for (let dx = -radius; dx <= radius; dx += 3) {
    for (let dy = -radius; dy <= radius; dy += 3) {
      const s = getPixel(cx + dx, cy + dy);
      tr += s.r; tg += s.g; tb += s.b; n++;
    }
  }
  return { r: Math.round(tr/n), g: Math.round(tg/n), b: Math.round(tb/n) };
}

const ROW_COUNTS = [4, 5, 6, 7, 6, 5, 4];

// Try different BX values to find where hexes land correctly
// BY=160 seems good for the top
console.log("=== Testing different BX values ===");
for (let BX = 30; BX <= 60; BX += 5) {
  const W = 70, HO = 35, VG = Math.round(81 * 0.75);
  let row0Colors = [];
  for (let c = 0; c < 4; c++) {
    const cx = BX + c * W;
    const cy = 160;
    const avg = avgColor(cx, cy, 6);
    row0Colors.push(`(${avg.r},${avg.g},${avg.b})`);
  }
  console.log(`BX=${BX}: ${row0Colors.join(' | ')}`);
}

console.log("\n=== Testing different BY values for row 0 ===");
for (let BY = 150; BY <= 180; BY += 5) {
  const W = 70, HO = 35, VG = Math.round(81 * 0.75);
  let row0Colors = [];
  for (let c = 0; c < 4; c++) {
    const cx = 30 + c * W;
    const cy = BY;
    const avg = avgColor(cx, cy, 6);
    row0Colors.push(`(${avg.r},${avg.g},${avg.b})`);
  }
  console.log(`BY=${BY}: ${row0Colors.join(' | ')}`);
}

// Now try to find the hex grid by checking vertical sampling
// The hex grid rows should have distinct colors.
// Find where grid colors start (not beige background)
console.log("\n=== Vertical scan for hex grid start ===");
for (let y = 140; y < 200; y += 2) {
  const p = getPixel(100, y);
  // Check if this looks like terrain (not beige background)
  const isBg = p.r > 210 && p.g > 200 && p.b > 165;
  if (!isBg) {
    console.log(`Not background at y=${y}: (${p.r},${p.g},${p.b})`);
  }
}

// Also check the Y position of the first blue hex (river)
console.log("\n=== Finding first blue hex ===");
for (let y = 140; y < 300; y += 2) {
  const p = getPixel(300, y);
  if (p.b > 150 && p.b > p.r + 30) {
    console.log(`Blue at y=${y}: (${p.r},${p.g},${p.b})`);
    break;
  }
}

// Finally, let me try to map by looking at center column for row positions
console.log("\n=== Sampling along center column (x=283) to find hex rows ===");
const CENTER_X = 283;
let lastMajorColor = null;
for (let y = 140; y <= 600; y += 3) {
  const p = getPixel(CENTER_X, y);
  const isBg = p.r > 210 && p.g > 200 && p.b > 165;

  if (!isBg) {
    // Classify broadly
    let category;
    if (p.b > 150 && p.b > p.r + 20) category = 'BLUE';
    else if (p.g > 130 && p.g > p.r + 10) category = 'GREEN';
    else if (p.r > 200 && p.g > 150 && p.b < 100) category = 'YELLOW';
    else if (p.r > 170 && p.g > 80 && p.b < 120 && p.r > p.g) category = 'ORANGE';
    else if (p.r > 100 && p.r > p.g && p.r > p.b) category = 'BROWN';
    else if (Math.abs(p.r-p.g) < 25 && p.r > 80) category = 'GRAY';
    else category = `(${p.r},${p.g},${p.b})`;

    if (category !== lastMajorColor) {
      console.log(`y=${y}: ${category}`);
      lastMajorColor = category;
    }
  }
}
