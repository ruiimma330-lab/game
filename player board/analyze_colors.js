const fs = require('fs');
const PNG = require('pngjs').PNG;

const png = PNG.sync.read(fs.readFileSync('D:/claude project/game/35cd6588fd40ea9ab8d2601220114595.png'));
const { width, height, data } = png;

function getPixel(x, y) {
  const idx = (y * width + x) * 4;
  return { r: data[idx], g: data[idx+1], b: data[idx+2] };
}

// Sample a grid of colors across the image to find terrain regions
// Sample every 10px in both directions
console.log("Color map (every 10px, showing dominant colors):");
console.log("Format: y, then each x position with color classification\n");

function classifyColor(r, g, b) {
  // Board background (beige)
  if (r > 220 && g > 210 && b > 170) return 'B'; // Background beige

  // Blue (river/ship)
  if (b > 120 && g > 80 && r < 160 && (b - r) > 40 && (b - g) > 10) return 'b'; // blue

  // Light blue (variant)
  if (b > 150 && g > 130 && r > 100 && (b - r) < 60) return 'L'; // light blue

  // Green (pasture/animal)
  if (g > 100 && g > r && g > b && r < 130) return 'g'; // green

  // Dark green (mine/castle?)
  if (g > 60 && r < 100 && b < 100 && g > r && g > b) return 'G'; // dark green

  // Yellow/orange (knowledge)
  if (r > 200 && g > 150 && b < 120 && (r - b) > 80) return 'Y'; // yellow

  // Orange
  if (r > 180 && g > 100 && b < 100 && (r - g) < 80 && (r - b) > 80) return 'O'; // orange

  // Brown (city/building)
  if (r > 100 && g > 50 && b < 100 && r > g && r > b && (r - g) < 100) return 'n'; // brown

  // Gray (mine)
  if (Math.abs(r-g) < 30 && Math.abs(r-b) < 30 && r > 80 && r < 200) return 'a'; // gray

  // Red
  if (r > 150 && g < 100 && b < 100) return 'r'; // red

  // Dark/black (text, borders)
  if (r < 50 && g < 50 && b < 50) return 'k'; // black

  return '.';
}

for (let y = 0; y < height; y += 15) {
  let line = `${y.toString().padStart(3)}: `;
  for (let x = 0; x < width; x += 15) {
    const p = getPixel(x, y);
    line += classifyColor(p.r, p.g, p.b);
  }
  console.log(line);
}
