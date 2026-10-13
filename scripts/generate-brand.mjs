// Generates every static brand asset from src/config/brand.ts — run: npm run brand
//   public/favicon.svg, public/apple-touch-icon.png, public/og-default.png
//   design/avatar-mark.png (GitHub / social avatar), design/logo-*.svg (standalone logos)
// Requires Node ≥ 22.18 (runs the .ts import directly).
import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { ADV, CAP, FLAG, GLYPH, LAYOUT, MARK, STROKE } from '../src/config/brand.ts';

const DARK = {
  bg: '#0f0f0f',
  fg: '#e8e8e3',
  muted: '#8a8a85',
  line: '#2a2a2a',
  red: '#e23d55',
  white: '#f4f5f8',
  blue: '#4457d6',
};
const LIGHT = {
  bg: '#f2f1ec',
  fg: '#161616',
  muted: '#6b6b66',
  line: '#d3d2cb',
  red: '#a51931',
  white: '#cfd3e0',
  blue: '#2d3a9e',
};

const letters = (word, x0) =>
  [...word]
    .map((c, i) => `<path d="${GLYPH[c]}" transform="translate(${x0 + i * ADV} 0)"/>`)
    .join('');
const flagGradient = (id, t) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${CAP}">${FLAG.stripes
    .map(
      ([a, b, k]) =>
        `<stop offset="${a / CAP}" stop-color="${t[k]}"/><stop offset="${b / CAP}" stop-color="${t[k]}"/>`,
    )
    .join('')}</linearGradient>`;

/** Wordmark in user units (viewBox 0 0 widthTH CAP). th: 'muted' | 'flag' */
function fullGroup(t, id, th = 'muted') {
  const stroke = th === 'flag' ? `url(#${id})` : t.muted;
  return `<defs>${flagGradient(id, t)}<clipPath id="c-${id}"><rect x="-1" y="0" width="${LAYOUT.widthTH + 2}" height="${CAP}"/></clipPath></defs>
<g fill="none" stroke-width="${STROKE}" stroke-linejoin="miter" stroke-linecap="butt" clip-path="url(#c-${id})">
<g stroke="${t.fg}">${letters('LARP', LAYOUT.larp)}${letters('LAB', LAYOUT.lab)}</g>
<g stroke="${stroke}">${letters('TH', LAYOUT.th)}</g></g>`;
}
function markGroup(t, id, sw = STROKE) {
  return `<defs><clipPath id="c-${id}"><rect x="-2" y="0" width="34" height="${CAP}"/></clipPath></defs>
<g fill="none" stroke-width="${sw}" stroke-linejoin="miter" stroke-linecap="butt" clip-path="url(#c-${id})">
<path d="${MARK.lt}" stroke="${t.muted}"/><path d="${MARK.l}" transform="translate(${MARK.lx} 0)" stroke="${t.fg}"/>
<path d="${MARK.slash}" stroke="${t.muted}"/><path d="${MARK.gt}" stroke="${t.muted}"/></g>`;
}

// ---- standalone SVGs (design/) ----
mkdirSync('design', { recursive: true });
for (const [name, t] of [
  ['dark', DARK],
  ['light', LIGHT],
]) {
  writeFileSync(
    `design/logo-full-${name}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ${LAYOUT.widthTH + 2} ${CAP + 2}">${fullGroup(t, 'f' + name, 'flag')}</svg>\n`,
  );
  writeFileSync(
    `design/logo-mark-${name}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 30 ${CAP + 2}">${markGroup(t, 'm' + name)}</svg>\n`,
  );
}

// ---- favicon: <L/> on a dark rounded square, heavier stroke so it survives 16px ----
const fav = (size, radius = 0.19, fill = 0.84) => {
  // visible bounds of the mark are x ∈ [-0.4, 28.2] (apex miters stick out), y ∈ [0, CAP]
  const s = (size * fill) / 28.6;
  const x = (size - 28.6 * s) / 2 + 0.4 * s;
  const y = (size - CAP * s) / 2;
  const sw = 2.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
<rect width="${size}" height="${size}" rx="${size * radius}" fill="${DARK.bg}"/>
<g transform="translate(${x} ${y}) scale(${s})">${markGroup(DARK, 'fav', sw)}</g></svg>`;
};
writeFileSync('public/favicon.svg', fav(32) + '\n');
await sharp(Buffer.from(fav(180)))
  .png()
  .toFile('public/apple-touch-icon.png');
await sharp(Buffer.from(fav(512, 0, 0.7)))
  .png()
  .toFile('design/avatar-mark.png');

// ---- Open Graph image 1200×630 ----
const W = 1200,
  H = 630;
let dots = '';
for (let y = 12; y < H; y += 24)
  for (let x = 12; x < W; x += 24)
    dots += `<rect x="${x}" y="${y}" width="2" height="2" fill="${DARK.fg}" opacity="0.07"/>`;
const sc = 10.5; // wordmark scale
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<rect width="100%" height="100%" fill="${DARK.bg}"/>${dots}
<rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="${DARK.line}" stroke-width="2"/>
<g transform="translate(96 150) scale(${sc})">${fullGroup(DARK, 'og', 'flag')}</g>
<text x="96" y="370" font-family="Menlo, monospace" font-size="30" fill="${DARK.fg}">$ We build software, tools &amp; devices.</text>
<text x="96" y="420" font-family="Menlo, monospace" font-size="22" fill="${DARK.muted}">Students from Thailand. Yes, we're LARPing. The work is real.</text>
<text x="96" y="545" font-family="Menlo, monospace" font-size="20" fill="${DARK.muted}">larplabth.com</text>
<g transform="translate(${W - 96 - 28 * 4.2} 515) scale(4.2)">${markGroup(DARK, 'ogm')}</g>
</svg>`;
await sharp(Buffer.from(og)).png().toFile('public/og-default.png');
console.log('brand assets written');
