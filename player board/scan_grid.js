const fs = require('fs');
const PNG = require('pngjs').PNG;

const png = PNG.sync.read(fs.readFileSync('D:/claude project/game/35cd6588fd40ea9ab8d2601220114595.png'));
const { width, height, data } = png;

function getPixel(x, y) {
  const idx = Math.round(y) * width * 4 + Math.round(x) * 4;
  if (idx < 0 || idx >= data.length - 3) return { r: 0, g: 0, b: 0 };
  return { r: data[idx], g: data[idx+1], b: data[idx+2] };
}

function classifyTerrain(r, g, b) {
  // Attempt to classify hex terrain based on pixel color
  // Blue (river/ship): R<150, G>80, B>120, blue dominant
  if (b > 120 && b > r + 20 && b > g) return { t: 'river', c: 'blue' };

  // Green (pasture/animal): G dominant, relatively bright
  if (g > 100 && g > r + 10 && g > b + 10) return { t: 'pasture', c: 'green' };

  // Dark green (castle): G dominant, darker
  if (g > 50 && g > r && g > b && r < 100 && b < 100) return { t: 'castle', c: 'dark_green' };

  // Yellow (knowledge): R>200, G>170, low blue
  if (r > 200 && g > 150 && b < 100 && r > g) return { t: 'knowledge', c: 'yellow' };

  // Orange (knowledge variant): R>180, G>100, B<100
  if (r > 170 && g > 80 && b < 100 && r - g < 100 && r - b > 60) return { t: 'city', c: 'orange' };

  // Brown (city/building): R dominant, warm
  if (r > 130 && g > 60 && b < 120 && r > g + 20 && r > b + 40) return { t: 'city', c: 'brown' };

  // Gray (mine): R≈G≈B
  if (Math.abs(r-g) < 30 && Math.abs(r-b) < 30 && r > 60 && r < 200) return { t: 'mine', c: 'gray' };

  // Red/special: R dominant, very high contrast
  if (r > 150 && g < 100 && b < 100 && r > g + 60) return { t: 'special', c: 'red' };

  return { t: 'unknown', c: `rgb(${r},${g},${b})` };
}

// Try different hex grid configurations
// The grid has 7 rows: [4,5,6,7,6,5,4]
const ROW_COUNTS = [4, 5, 6, 7, 6, 5, 4];
const TOTAL_HEXES = ROW_COUNTS.reduce((a,b) => a+b, 0);

// For a pointy-top hex grid:
// - Even rows (0,2,4,6) have NO horizontal offset
// - Odd rows (1,3,5) are offset by W/2

function testConfig(BX, BY, W, H, label) {
  const HO = W / 2;
  const VG = H * 0.75;

  console.log(`\n=== ${label}: BX=${BX}, BY=${BY}, W=${W}, H=${H} ===`);

  const grid = [];
  let hexIndex = 0;

  for (let r = 0; r < 7; r++) {
    const count = ROW_COUNTS[r];
    const row = [];
    for (let c = 0; c < count; c++) {
      const cx = BX + c * W + (r % 2 === 1 ? HO : 0);
      const cy = BY + r * VG;
      const p = getPixel(cx, cy);
      const terrain = classifyTerrain(p.r, p.g, p.b);
      row.push({ r, c, cx, cy, ...terrain, ...p });
      hexIndex++;
    }
    grid.push(row);
  }

  // Print table
  grid.forEach((row, r) => {
    const rowStr = row.map(h =>
      `${h.t.charAt(0).toUpperCase()}|${h.c.charAt(0)}|${h.r},${h.g},${h.b}`
    ).join(' | ');
    console.log(`Row ${r}: ${rowStr}`);
  });

  // Count unique terrain types
  const types = {};
  grid.forEach(row => row.forEach(h => {
    types[h.t] = (types[h.t] || 0) + 1;
  }));
  console.log(`Terrain distribution:`, types);

  // Return grid for comparison
  return grid;
}

// Test with different sizes
// From color map, grid appears to span x~40 to x~540 and y~165 to y~555
// Center at approximately x=283, y=377

// Config 1: Based on center detection
// Center hex (r=3, c=3): cx=centerX=283, cy=centerY=377
testConfig(21, 182, 75, 84, "Config 1");

// Config 2: Try larger hexes
testConfig(15, 186, 78, 87, "Config 2 (large)");

// Config 3: Try smaller hexes
testConfig(30, 178, 72, 81, "Config 3 (small)");

// Config 4: Original HTML values
testConfig(80, 80, 82, 95, "Config 4 (original)");

// Config 5: Adjusted based on visual analysis
testConfig(25, 175, 74, 84, "Config 5 (medium)");
