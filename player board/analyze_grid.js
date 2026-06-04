const fs = require('fs');
const PNG = require('pngjs').PNG;

const png = PNG.sync.read(fs.readFileSync('D:/claude project/game/35cd6588fd40ea9ab8d2601220114595.png'));
const { width, height, data } = png;

console.log(`Image: ${width}x${height}`);

// Helper: get pixel color
function getPixel(x, y) {
  const idx = (y * width + x) * 4;
  return { r: data[idx], g: data[idx+1], b: data[idx+2], a: data[idx+3] };
}

function rgbDist(c1, c2) {
  return Math.sqrt((c1.r-c2.r)**2 + (c1.g-c2.g)**2 + (c1.b-c2.b)**2);
}

// First, find the board area by scanning for beige background (#f0debc ≈ rgb(240, 222, 188))
// and hex grid colors

// Scan middle of image horizontally and vertically to find hex grid
const cx = Math.round(width / 2);
const cy = Math.round(height / 2);

console.log(`\n=== Center pixel (${cx},${cy}): RGB(${getPixel(cx,cy).r},${getPixel(cx,cy).g},${getPixel(cx,cy).b}) ===`);

// Scan horizontal center line
console.log(`\n=== Horizontal scan at y=${cy} ===`);
for (let x = 0; x < width; x += 3) {
  const p = getPixel(x, cy);
  // Only print when color changes significantly
  console.log(`(${x},${cy}): RGB(${p.r},${p.g},${p.b})`);
}

// Scan vertical center line
console.log(`\n=== Vertical scan at x=${cx} ===`);
for (let y = 0; y < height; y += 3) {
  const p = getPixel(cx, y);
  console.log(`(${cx},${y}): RGB(${p.r},${p.g},${p.b})`);
}

// Sample some key positions to understand the layout
console.log(`\n=== Color samples at various points ===`);
const samplePoints = [];
for (let y = 0; y < height; y += 50) {
  for (let x = 0; x < width; x += 50) {
    const p = getPixel(x, y);
    samplePoints.push({ x, y, ...p });
  }
}

// Identify unique non-beige colors (likely hex terrain colors)
const beigeRef = { r: 240, g: 222, b: 188 };
const distinctColors = [];
for (const sp of samplePoints) {
  const d = rgbDist(sp, beigeRef);
  if (d > 30) {
    // Check if already seen
    let found = false;
    for (const dc of distinctColors) {
      if (rgbDist(sp, dc) < 25) { found = true; break; }
    }
    if (!found) {
      distinctColors.push(sp);
      console.log(`Distinct at (${sp.x},${sp.y}): RGB(${sp.r},${sp.g},${sp.b})`);
    }
  }
}
