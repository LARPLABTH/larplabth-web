// LARP LAB TH — 30 s motion graphic. Renders PNG frames from brand.ts geometry.
// usage: node render.mjs <projectRoot> <outDir> [fromFrame] [toFrame]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [root, outDir, fromArg, toArg] = process.argv.slice(2);
const require = createRequire(join(root, 'package.json'));
const sharp = require('sharp');
const { ADV, CAP, GLYPH, LAYOUT, MARK, MARK_X, STROKE } = await import(join(root, 'src/config/brand.ts'));

const W = 1920, H = 1080, FPS = 30, DUR = 30;
const C = {
  bg: '#0f0f0f', fg: '#e8e8e3', muted: '#8a8a85', line: '#2a2a2a', signal: '#f5f5f0',
  red: '#e23d55', white: '#f4f5f8', blue: '#4457d6',
};
const MONO = 'Menlo, monospace';
const SANS = 'Helvetica Neue, Helvetica, Arial, sans-serif';

// ---------- helpers ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a)); // 0..1 progress within [a,b]
const eio = (k) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2); // easeInOutCubic
const eout = (k) => 1 - (1 - k) ** 4; // easeOutQuart
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, k) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join('');
};
const rand = (n) => { // deterministic hash → [0,1)
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
};

/** Length of an absolute M/H/V/L path (all brand glyphs use only these). */
function pathLen(d) {
  const tok = d.match(/[MHVL]|-?\d*\.?\d+/g);
  let x = 0, y = 0, len = 0, cmd = '';
  for (let i = 0; i < tok.length; ) {
    if (/[MHVL]/.test(tok[i])) cmd = tok[i++];
    const n = () => parseFloat(tok[i++]);
    if (cmd === 'M') { x = n(); y = n(); cmd = 'L'; continue; }
    let nx = x, ny = y;
    if (cmd === 'H') nx = n(); else if (cmd === 'V') ny = n(); else { nx = n(); ny = n(); }
    len += Math.hypot(nx - x, ny - y); x = nx; y = ny;
  }
  return len;
}
const LEN = new Map();
const len = (d) => (LEN.has(d) ? LEN.get(d) : (LEN.set(d, pathLen(d)), LEN.get(d)));

/** A stroked glyph path drawn on by `p` (0..1). */
function stroke(d, x, color, p = 1, opacity = 1) {
  if (p <= 0 || opacity <= 0) return '';
  const L = len(d);
  const dash = p >= 1 ? '' : ` stroke-dasharray="${L} ${L}" stroke-dashoffset="${(L * (1 - p)).toFixed(3)}"`;
  return `<path d="${d}" transform="translate(${x} 0)" stroke="${color}"${dash} opacity="${opacity}"/>`;
}

let clipId = 0;
/** Group of brand strokes at (cx, cy) centre, `scale` px per unit, width `w` units. */
function brandGroup(inner, cx, cy, scale, w, opacity = 1) {
  const id = `c${clipId++}`;
  const tx = cx - (w * scale) / 2, ty = cy - (CAP * scale) / 2;
  return `<defs><clipPath id="${id}"><rect x="-2" y="0" width="${w + 4}" height="${CAP}"/></clipPath></defs>
<g transform="translate(${tx} ${ty}) scale(${scale})" opacity="${opacity}">
<g fill="none" stroke-width="${STROKE}" stroke-linejoin="miter" stroke-linecap="butt" clip-path="url(#${id})">${inner}</g></g>`;
}

/** The <L/> mark parts with individual draw progress [lt, l, slash, gt], offset by ox. */
function markParts(ox, p, fgCol = C.fg) {
  return (
    stroke(MARK.lt, ox, C.muted, p[0]) +
    stroke(MARK.l, ox + MARK.lx, fgCol, p[1]) +
    stroke(MARK.slash, ox, C.muted, p[2]) +
    stroke(MARK.gt, ox, C.muted, p[3])
  );
}

/** Full wordmark. letters: draw progress for A R P L A B; th: [T,H]; tech 0..1 expands TH → TECH. */
function wordmark({ cx, cy, scale, mark = [1, 1, 1, 1], letters = Array(6).fill(1), th = [1, 1], tech = 0, opacity = 1 }) {
  const k = eio(tech);
  const w = lerp(LAYOUT.widthTH, LAYOUT.widthTECH, k);
  let s = markParts(MARK_X, mark);
  'ARP'.split('').forEach((c, i) => (s += stroke(GLYPH[c], LAYOUT.arp + i * ADV, C.fg, letters[i])));
  'LAB'.split('').forEach((c, i) => (s += stroke(GLYPH[c], LAYOUT.lab + i * ADV, C.fg, letters[3 + i])));
  const t = LAYOUT.th;
  s += stroke(GLYPH.T, t, mix(C.muted, C.red, k), th[0]);
  s += stroke(GLYPH.E, t + ADV, C.white, seg(tech, 0.35, 0.9), k);
  s += stroke(GLYPH.C, t + 2 * ADV, C.blue, seg(tech, 0.45, 1), k);
  s += stroke(GLYPH.H, t + lerp(ADV, 3 * ADV, k), mix(C.muted, C.red, k), th[1]);
  return { svg: brandGroup(s, cx, cy, scale, w, opacity), w };
}

function text(x, y, str, { size = 28, fill = C.muted, family = MONO, anchor = 'start', weight = 400, opacity = 1, ls = 0 } = {}) {
  if (opacity <= 0) return '';
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${opacity}">${esc(str)}</text>`;
}
const cursorOn = (t) => Math.floor(t * 2.2) % 2 === 0;
const typed = (str, t, start, cps = 22) => str.slice(0, Math.max(0, Math.floor((t - start) * cps)));
/** Binary/glyph scramble that resolves left-to-right into `str` as k goes 0→1. */
function scramble(str, k, f, set = '01') {
  const n = str.length, done = Math.floor(k * (n + 4)) - 4;
  return [...str].map((ch, i) => (ch === ' ' || i < done ? ch : k <= 0 ? ' ' : set[Math.floor(rand(f * 131 + i * 7) * set.length)])).join('');
}

// ---------- background ----------
function background(t, f) {
  const gridA = eout(seg(t, 0, 1.2)) * (1 - seg(t, 29.2, 30));
  const drift = (t * 6) % 40;
  let px = '';
  // flickering "pixel" cells on the grid (pixel motif, kept subtle)
  for (let i = 0; i < 26; i++) {
    const cell = Math.floor(t * 1.5 + rand(i * 97) * 10);
    const gx = Math.floor(rand(i * 13 + cell * 977) * 48), gy = Math.floor(rand(i * 29 + cell * 541) * 27);
    const life = (t * 1.5 + rand(i * 97) * 10) % 1;
    const a = Math.sin(life * Math.PI) * 0.12 * gridA;
    px += `<rect x="${gx * 40 + 17 - drift}" y="${gy * 40 + 17}" width="6" height="6" fill="${C.fg}" opacity="${a.toFixed(3)}"/>`;
  }
  return `<rect width="${W}" height="${H}" fill="${C.bg}"/>
<defs><pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse" x="${-drift}" y="0"><rect x="19" y="19" width="2" height="2" fill="${C.fg}" opacity="0.09"/></pattern>
<radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset="55%" stop-color="${C.bg}" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.75"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#dots)" opacity="${gridA}"/>${px}`;
}

function hud(t) {
  const a = eout(seg(t, 0.6, 1.6)) * (1 - seg(t, 28.8, 29.6));
  const ss = String(Math.floor(t)).padStart(2, '0'), ff = String(Math.floor((t % 1) * FPS)).padStart(2, '0');
  const m = 64;
  const corner = (x, y, dx, dy) => `<path d="M${x} ${y + dy * 22}V${y}H${x + dx * 22}" fill="none" stroke="${C.line}" stroke-width="2"/>`;
  return `<g opacity="${a}">${corner(m, m, 1, 1)}${corner(W - m, m, -1, 1)}${corner(m, H - m, 1, -1)}${corner(W - m, H - m, -1, -1)}
${text(m + 36, m + 30, 'LARP LAB TH', { size: 18, ls: 3 })}
${text(W - m - 36, m + 30, `00:${ss}:${ff} / 00:30:00`, { size: 18, anchor: 'end', ls: 1 })}
${text(m + 36, H - m - 16, 'larplabth.com', { size: 18, ls: 1 })}
${text(W - m - 36, H - m - 16, 'BUILT IN THAILAND', { size: 18, anchor: 'end', ls: 3 })}</g>`;
}

// ---------- scenes ----------
const CX = W / 2, CY = H / 2;
const WM_SCALE = 12; // wordmark px per unit
const MARK_SCALE = 26;

function scene(t, f) {
  let s = '';

  // S1 — terminal boot (0 → 3.8)
  if (t < 3.8) {
    const a = 1 - seg(t, 3.2, 3.8);
    const lift = eio(seg(t, 3.2, 3.8)) * -40;
    const x = 520, y = CY - 30 + lift;
    const l1 = '$ ./larplab --init';
    const s1 = typed(l1, t, 0.8, 18);
    s += text(x, y, s1, { size: 40, fill: C.fg, opacity: a });
    if (t >= 2.0) {
      const k = seg(t, 2.1, 3.1);
      const bars = Math.round(k * 20);
      s += text(x, y + 64, `> loading identity  [${'#'.repeat(bars)}${'.'.repeat(20 - bars)}] ${Math.round(k * 100)}%`, { size: 28, opacity: a });
    }
    const cx = x + (t < 2.0 ? s1.length : 0) * 24.1;
    const cy = t < 2.0 ? y : y + 64;
    if (cursorOn(t) && t < 3.2) s += `<rect x="${t < 2.0 ? cx + 4 : x + 690}" y="${cy - (t < 2.0 ? 32 : 23)}" width="${t < 2.0 ? 22 : 16}" height="${t < 2.0 ? 40 : 28}" fill="${C.signal}"/>`;
  }

  // S2 — <L/> mark draws on (3.6 → 8.2)
  // S3 — mark moves into the wordmark, letters draw (8.2 → 13)
  if (t >= 3.6 && t < 17.4) {
    const mp = [0, 1, 2, 3].map((i) => eio(seg(t, 3.7 + i * 0.28, 4.6 + i * 0.28)));
    const move = eio(seg(t, 7.6, 8.8));
    // mark position: alone-centred → its slot in the centred wordmark
    const wmW = LAYOUT.widthTH * WM_SCALE;
    const markAloneW = 28.6 * MARK_SCALE;
    const scale = lerp(MARK_SCALE, WM_SCALE, move);
    const leftAlone = CX - markAloneW / 2, leftWM = CX - wmW / 2;
    const left = lerp(leftAlone, leftWM, move);

    if (t < 8.8) {
      // pulse ring + binary halo around the mark
      const halo = seg(t, 5.2, 5.6) * (1 - seg(t, 7.2, 7.8));
      if (halo > 0) {
        for (let i = 0; i < 18; i++) {
          const ang = (i / 18) * Math.PI * 2 + t * 0.25;
          const r = 430 + Math.sin(t * 2 + i) * 14;
          s += text(CX + Math.cos(ang) * r, CY + Math.sin(ang) * r * 0.55 + 8, scramble('01001100', 0, f + i, '01'), { size: 18, anchor: 'middle', opacity: 0.35 * halo });
        }
      }
      const ring = seg(t, 5.0, 6.4);
      if (ring > 0 && ring < 1) s += `<rect x="${CX - 380 * eout(ring) - 20}" y="${CY - 200 * eout(ring) - 20}" width="${760 * eout(ring) + 40}" height="${400 * eout(ring) + 40}" fill="none" stroke="${C.fg}" stroke-width="2" opacity="${(1 - ring) * 0.5}"/>`;
      s += text(CX, CY + 230, scramble('<L/>  the mark', seg(t, 5.4, 6.4), f, '01'), { size: 26, anchor: 'middle', opacity: 1 - seg(t, 7.3, 7.8), ls: 4 });
    }

    // the full wordmark once the mark has landed (letters draw on)
    const lp = Array.from({ length: 6 }, (_, i) => eio(seg(t, 8.6 + i * 0.16, 9.3 + i * 0.16)));
    const thp = [0, 1].map((i) => eio(seg(t, 9.8 + i * 0.16, 10.5 + i * 0.16)));
    // TH → TECH (13 → 16.8)
    const tech = seg(t, 13.0, 14.2) * (1 - seg(t, 16.0, 17.0));
    const toTop = eio(seg(t, 16.6, 17.4));
    if (move < 1) {
      const id = `c${clipId++}`;
      const inner = markParts(0, mp);
      s += `<defs><clipPath id="${id}"><rect x="-2" y="0" width="34" height="${CAP}"/></clipPath></defs><g transform="translate(${left} ${CY - (CAP * scale) / 2}) scale(${scale})"><g fill="none" stroke-width="${STROKE}" stroke-linejoin="miter" stroke-linecap="butt" clip-path="url(#${id})">${inner}</g></g>`;
    } else {
      const k = eio(tech);
      // keep the wordmark centred while it widens; drift up to the header slot after
      const cy = lerp(CY, 190, toTop);
      const sc = lerp(WM_SCALE, 5, toTop);
      s += wordmark({ cx: CX, cy, scale: sc, letters: lp, th: thp, tech }).svg;
      // caption under the wordmark
      const cap1 = seg(t, 10.8, 11.8) * (1 - seg(t, 12.6, 13.0));
      s += text(CX, CY + 130, scramble('developer team  ·  software  ·  tools  ·  devices', seg(t, 10.8, 12.0), f, '01'), { size: 26, anchor: 'middle', opacity: cap1, ls: 3 });
      const cap2 = seg(t, 13.6, 14.2) * (1 - seg(t, 15.8, 16.4));
      s += text(CX, CY + 130, 'TH  =  TECH  ·  made in Thailand', { size: 26, anchor: 'middle', opacity: cap2, ls: 3 });
      // flag stripe under the wordmark during TECH
      if (k > 0) {
        const sw = 1640 * k * (1 - toTop), sx = CX - sw / 2, sy = CY + 168;
        const parts = [[C.red, 1], [C.white, 1], [C.blue, 2], [C.white, 1], [C.red, 1]];
        let ox = 0;
        for (const [col, wgt] of parts) { const pw = (sw * wgt) / 6; s += `<rect x="${sx + ox}" y="${sy}" width="${pw}" height="4" fill="${col}" opacity="${k * 0.85}"/>`; ox += pw; }
      }
    }
  }

  // S4 — what we build (17.2 → 25.6)
  if (t >= 17.0 && t < 26.2) {
    const WORDS = ['SAAS', 'TOOLS', 'SERVICES', 'DEVICES', 'MAKER PROJECTS', 'CONSULTING'];
    const t0 = 18.0, per = 1.2;
    const fadeIn = seg(t, 17.2, 17.8), fadeOut = 1 - seg(t, 25.4, 26.0);
    const a = fadeIn * fadeOut;
    s += wordmark({ cx: CX, cy: 190, scale: 5, opacity: 1 - seg(t, 25.2, 25.8) }).svg;
    s += text(CX, CY - 70, '$ larplab --build', { size: 30, anchor: 'middle', opacity: a, ls: 2 });
    const idx = clamp(Math.floor((t - t0) / per), 0, WORDS.length - 1);
    const local = t - t0 - idx * per;
    const word = t < t0 ? '' : WORDS[idx];
    const k = t < t0 ? 0 : seg(local, 0, 0.55);
    const shown = scramble(word, k, f, '01#/<>');
    s += text(CX, CY + 60, shown, { size: 112, fill: C.fg, anchor: 'middle', weight: 700, opacity: a, ls: 6 });
    // index + ticks
    s += text(CX, CY + 160, t < t0 ? '' : `${String(idx + 1).padStart(2, '0')} / ${String(WORDS.length).padStart(2, '0')}`, { size: 22, anchor: 'middle', opacity: a, ls: 4 });
    const tw = 60, gap = 14, total = WORDS.length * tw + (WORDS.length - 1) * gap;
    WORDS.forEach((_, i) => {
      const done = t < t0 ? 0 : i < idx ? 1 : i === idx ? clamp(local / per) : 0;
      const x = CX - total / 2 + i * (tw + gap), y = CY + 200;
      s += `<rect x="${x}" y="${y}" width="${tw}" height="3" fill="${C.line}" opacity="${a}"/><rect x="${x}" y="${y}" width="${tw * done}" height="3" fill="${C.fg}" opacity="${a}"/>`;
    });
  }

  // S5 — end lockup (25.6 → 30)
  if (t >= 25.6) {
    const mp = [0, 1, 2, 3].map((i) => eio(seg(t, 25.7 + i * 0.12, 26.3 + i * 0.12)));
    const lp = Array.from({ length: 6 }, (_, i) => eio(seg(t, 26.0 + i * 0.07, 26.6 + i * 0.07)));
    const thp = [0, 1].map((i) => eio(seg(t, 26.5 + i * 0.07, 27.1 + i * 0.07)));
    const out = 1 - seg(t, 29.2, 30);
    s += wordmark({ cx: CX, cy: CY - 80, scale: WM_SCALE, mark: mp, letters: lp, th: thp, opacity: out }).svg;
    const tag = 'We build software, tools & devices.';
    s += text(CX, CY + 90, tag, { size: 38, family: SANS, fill: C.fg, anchor: 'middle', opacity: eout(seg(t, 26.9, 27.6)) * out });
    const url = typed('larplabth.com', t, 27.6, 20);
    s += text(CX - 1, CY + 160, url, { size: 28, anchor: 'middle', opacity: out, ls: 2 });
    const urlW = 13 * (16.85 + 2);
    if (t > 27.6 && cursorOn(t)) s += `<rect x="${CX + urlW / 2 + 4}" y="${CY + 138}" width="14" height="28" fill="${C.signal}" opacity="${out}"/>`;
  }
  return s;
}

function frameSVG(f) {
  const t = f / FPS;
  clipId = 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${background(t, f)}${scene(t, f)}${hud(t)}
<rect width="${W}" height="${H}" fill="url(#vig)"/>
<rect width="${W}" height="${H}" fill="#000" opacity="${(1 - eout(seg(t, 0, 0.6))) + seg(t, 29.5, 30)}"/>
</svg>`;
}

// ---------- render ----------
mkdirSync(outDir, { recursive: true });
const from = Number(fromArg ?? 0), to = Number(toArg ?? FPS * DUR);
const queue = [];
for (let f = from; f < to; f++) queue.push(f);
const workers = Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const f = queue.shift();
    await sharp(Buffer.from(frameSVG(f))).png({ compressionLevel: 1 }).toFile(join(outDir, `f${String(f).padStart(4, '0')}.png`));
  }
});
await Promise.all(workers);
console.log(`rendered ${to - from} frames`);
