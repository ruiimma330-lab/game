const fs = require('fs');
const PNG = require('pngjs').PNG;

const png = PNG.sync.read(fs.readFileSync('D:/claude project/game/35cd6588fd40ea9ab8d2601220114595.png'));
const { width, height, data } = png;

function getPixel(x, y) {
  const idx = Math.round(y) * width * 4 + Math.round(x) * 4;
  if (idx < 0 || idx >= data.length - 3) return { r: 0, g: 0, b: 0 };
  return { r: data[idx], g: data[idx+1], b: data[idx+2] };
}

const ROW_COUNTS = [4, 5, 6, 7, 6, 5, 4];
const BX = 24, BY = 160, W = 70, HO = 35, VG = Math.round(81 * 0.75);

console.log("Hex data: row, col, R, G, B, cx, cy");
console.log("=========================================");

for (let r = 0; r < 7; r++) {
  const count = ROW_COUNTS[r];
  for (let c = 0; c < count; c++) {
    const cx = BX + c * W + (r % 2 === 1 ? HO : 0);
    const cy = BY + r * VG;
    const p = getPixel(cx, cy);
    // Sample a wider area to get average color
    let tr=0, tg=0, tb=0, n=0;
    for (let dx = -8; dx <= 8; dx += 4) {
      for (let dy = -8; dy <= 8; dy += 4) {
        const s = getPixel(cx + dx, cy + dy);
        tr += s.r; tg += s.g; tb += s.b; n++;
      }
    }
    tr = Math.round(tr/n); tg = Math.round(tg/n); tb = Math.round(tb/n);

    // Also get min/max to understand variation
    console.log(`[${r},${c},'x',${tr},${tg},${tb}],`);
  }
}
