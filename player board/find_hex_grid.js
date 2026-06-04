const fs = require('fs');
const PNG = require('pngjs').PNG;

const png = PNG.sync.read(fs.readFileSync('D:/claude project/game/35cd6588fd40ea9ab8d2601220114595.png'));
const { width, height, data } = png;

function getPixel(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return { r: 0, g: 0, b: 0, a: 0 };
  const idx = (y * width + x) * 4;
  return { r: data[idx], g: data[idx+1], b: data[idx+2] };
}

function rgbDist(c1, c2) {
  return Math.sqrt((c1.r-c2.r)**2 + (c1.g-c2.g)**2 + (c1.b-c2.b)**2);
}

// Find hex grid boundaries by scanning for non-beige areas
const beige = { r: 240, g: 222, b: 188 };

// Scan from top to find where hex colors start (y threshold)
let gridTop = 0, gridBottom = height;
for (let y = 0; y < height; y++) {
  let nonBeigeCount = 0;
  for (let x = 0; x < width; x += 10) {
    if (rgbDist(getPixel(x, y), beige) > 40) nonBeigeCount++;
  }
  if (nonBeigeCount > 10) {
    if (gridTop === 0) gridTop = y;
    gridBottom = y;
  }
}

console.log(`Grid top: ${gridTop}, bottom: ${gridBottom}`);

// Scan from left to right
let gridLeft = 0, gridRight = width;
for (let x = 0; x < width; x++) {
  let nonBeigeCount = 0;
  for (let y = gridTop; y < gridBottom; y += 10) {
    if (rgbDist(getPixel(x, y), beige) > 40) nonBeigeCount++;
  }
  if (nonBeigeCount > 5) {
    if (gridLeft === 0) gridLeft = x;
    gridRight = x;
  }
}

console.log(`Grid left: ${gridLeft}, right: ${gridRight}`);

// Now, find the horizontal center of each hex by looking at vertical strips
// In the center row (row 3, the 7-hex row), find the center of each hex
const centerY = (gridTop + gridBottom) / 2;

// Find hex centers in the center row by scanning for color changes
console.log(`\nCenter row y=${Math.round(centerY)} color profile:`);
let prevColor = getPixel(gridLeft, Math.round(centerY));
let transitions = [];
for (let x = gridLeft; x <= gridRight; x++) {
  const c = getPixel(x, Math.round(centerY));
  const d = rgbDist(c, prevColor);
  if (d > 30) {
    transitions.push({ x, from: prevColor, to: c });
    prevColor = c;
  }
}

// Simplify transitions - merge nearby ones
let simplifiedTrans = [transitions[0]];
for (let i = 1; i < transitions.length; i++) {
  const last = simplifiedTrans[simplifiedTrans.length - 1];
  if (transitions[i].x - last.x > 5) {
    simplifiedTrans.push(transitions[i]);
  }
}

console.log(`Color transitions in center row (${simplifiedTrans.length}):`);
simplifiedTrans.forEach((t, i) => {
  console.log(`  ${i}: x=${t.x}, from=RGB(${t.from.r},${t.from.g},${t.from.b}), to=RGB(${t.to.r},${t.to.g},${t.to.b})`);
});

// Use the transitions to find the 7 hex centers in the center row
// Between each pair of transitions should be a hex
const hexCenters = [];
for (let i = 0; i < simplifiedTrans.length - 1; i += 2) {
  const midX = Math.round((simplifiedTrans[i].x + simplifiedTrans[i+1].x) / 2);
  hexCenters.push(midX);
}

console.log(`\nHex centers in center row: ${hexCenters.join(', ')}`);
console.log(`Found ${hexCenters.length} hexes (expected 7)`);

// If we found approximately 7, compute hex width
if (hexCenters.length >= 5) {
  const avgSpacing = (hexCenters[hexCenters.length-1] - hexCenters[0]) / (hexCenters.length - 1);
  console.log(`Average hex spacing: ${avgSpacing.toFixed(1)}px`);
}

// Now also analyze vertical profile through center column
const centerX = Math.round((gridLeft + gridRight) / 2);
console.log(`\nVertical profile at x=${centerX}:`);
prevColor = getPixel(Math.round(centerX), gridTop);
let vTransitions = [];
for (let y = gridTop; y <= gridBottom; y++) {
  const c = getPixel(Math.round(centerX), y);
  const d = rgbDist(c, prevColor);
  if (d > 40) {
    vTransitions.push({ y, from: prevColor, to: c });
    prevColor = c;
  }
}

let simplifiedVTrans = [vTransitions[0]];
for (let i = 1; i < vTransitions.length; i++) {
  const last = simplifiedVTrans[simplifiedVTrans.length - 1];
  if (vTransitions[i].y - last.y > 5) {
    simplifiedVTrans.push(vTransitions[i]);
  }
}

console.log(`Vertical transitions (${simplifiedVTrans.length}):`);
simplifiedVTrans.forEach((t, i) => {
  console.log(`  ${i}: y=${t.y}, from=RGB(${t.from.r},${t.from.g},${t.from.b}), to=RGB(${t.to.r},${t.to.g},${t.to.b})`);
});
