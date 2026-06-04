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
  return r > 200 && g > 185 && b > 150;
}

function isSaturated(r, g, b) {
  // A "saturated" pixel is one that's not beige, not very close to white or black
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;
  return sat > 30 && !isBeige(r, g, b) && !(r > 240 && g > 240 && b > 240) && !(r < 20 && g < 20 && b < 20);
}

// Find the horizontal extent of the hex grid at each y level
console.log("=== Hex grid horizontal extent per row (y) ===");
let prevLeft = null, prevRight = null;
for (let y = 140; y <= 620; y += 5) {
  let leftEdge = null, rightEdge = null;
  for (let x = 0; x < width; x++) {
    const p = getPixel(x, y);
    if (isSaturated(p.r, p.g, p.b)) {
      if (leftEdge === null) leftEdge = x;
      rightEdge = x;
    }
  }
  if (leftEdge !== null && rightEdge !== null) {
    const span = rightEdge - leftEdge;
    // Smooth out - only show changes
    if (prevLeft === null || Math.abs(leftEdge - prevLeft) > 5 || y % 20 === 0) {
      console.log(`y=${y}: left=${leftEdge}, right=${rightEdge}, span=${span}`);
      prevLeft = leftEdge;
      prevRight = rightEdge;
    }
  }
}

// Also check at specific y values that should be row centers
console.log("\n=== Row center candidates ===");
// Check if there are ~7 distinct vertical bands
// Sample at a horizontal position that has lots of terrain
const sampleX = 200;
let bandStart = null;
let lastIsSat = false;
const bands = [];
for (let y = 140; y <= 600; y++) {
  const p = getPixel(sampleX, y);
  const isSat = isSaturated(p.r, p.g, p.b);
  if (isSat && !lastIsSat) {
    bandStart = y;
  }
  if (!isSat && lastIsSat && bandStart !== null) {
    bands.push({ start: bandStart, end: y - 1, mid: Math.round((bandStart + y - 1) / 2) });
    bandStart = null;
  }
  lastIsSat = isSat;
}
if (bandStart !== null) {
  bands.push({ start: bandStart, end: 600, mid: Math.round((bandStart + 600) / 2) });
}

console.log(`Color bands at x=${sampleX}:`);
bands.forEach((b, i) => {
  const p = getPixel(sampleX, b.mid);
  console.log(`  Band ${i}: y=${b.start}-${b.end}, mid=${b.mid}, RGB(${p.r},${p.g},${p.b})`);
});
