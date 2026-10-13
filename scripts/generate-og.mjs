// Generates public/og-default.png (1200×630) — run: npm run og
// Uses a tiny built-in 5×7 pixel font so it needs no system fonts.
import sharp from 'sharp';

const W = 1200;
const H = 630;
const BG = '#0f0f0f';
const FG = '#e8e8e3';
const MUTED = '#8a8a85';

const FONT = {
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  _: ['00000', '00000', '00000', '00000', '00000', '00000', '11111'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};

function pixelText(text, x0, y0, px, fill) {
  let out = '';
  [...text].forEach((ch, i) => {
    const g = FONT[ch];
    g.forEach((row, y) =>
      [...row].forEach((b, x) => {
        if (b === '1')
          out += `<rect x="${x0 + (i * 6 + x) * px}" y="${y0 + y * px}" width="${px - 2}" height="${px - 2}" fill="${fill}"/>`;
      }),
    );
  });
  return out;
}

let dots = '';
for (let y = 12; y < H; y += 24)
  for (let x = 12; x < W; x += 24)
    dots += `<rect x="${x}" y="${y}" width="2" height="2" fill="${FG}" opacity="0.07"/>`;

const px = 17;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" shape-rendering="crispEdges">
  <rect width="100%" height="100%" fill="${BG}"/>
  ${dots}
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="#2a2a2a" stroke-width="2"/>
  ${pixelText('LARP_LAB', 96, 190, px, FG)}
  ${pixelText('TH', 96 + 8 * 6 * px + 16, 190 + 7 * px - 7 * 7, 7, MUTED)}
  <text x="96" y="420" font-family="Menlo, monospace" font-size="30" fill="${FG}">$ We build software, tools &amp; devices.</text>
  <text x="96" y="470" font-family="Menlo, monospace" font-size="22" fill="${MUTED}">SaaS · Tools · Services · Devices · Maker · Consulting</text>
  <text x="96" y="545" font-family="Menlo, monospace" font-size="20" fill="${MUTED}">www.larplabth.com</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og-default.png');
console.log('wrote public/og-default.png');
