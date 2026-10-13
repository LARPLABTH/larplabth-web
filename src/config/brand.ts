/**
 * LARP LAB TH — logo geometry (single source of truth).
 *
 * Letters are monoline strokes on a 10-unit cap height, 7-unit width, with chamfered
 * (45°) corners. The same paths drive the site logo (Logo.astro), the favicon and the
 * share image (scripts/generate-brand.mjs), so every version matches exactly.
 *
 * Draw with: fill none, stroke-width STROKE, butt caps, miter joins, clipped to y∈[0,10].
 */
export const STROKE = 1.6;
export const CAP = 10; // cap height
export const ADV = 10; // letter advance (7 wide + 3 gap)
export const WORD_GAP = 7; // extra space between words

export const GLYPH: Record<string, string> = {
  L: 'M.8 0V9.2H7',
  A: 'M.8 10V2.8L2.8.8H4.2L6.2 2.8V10M.8 6H6.2',
  R: 'M.8 10V.8H4.2L6.2 2.8V4L4.2 6H.8M3.8 6L6.5 10.9',
  P: 'M.8 10V.8H4.2L6.2 2.8V4L4.2 6H.8',
  B: 'M.8 0V10M.8 .8H4.4L6.2 2.6V3.2L4.4 5H.8M.8 5H4.6L6.2 6.6V7.6L4.6 9.2H.8',
  T: 'M0 .8H7M3.5 .8V10',
  H: 'M.8 0V10M6.2 0V10M.8 5H6.2',
  E: 'M6.2 .8H.8V9.2H6.2M.8 5H5.4',
  C: 'M6.2 .8H2.8L.8 2.8V7.2L2.8 9.2H6.2',
};

/** x offsets (in units) of each word in the full wordmark. */
export const LAYOUT = (() => {
  const larp = 0;
  const lab = larp + 4 * ADV + WORD_GAP - 3; // 44
  const th = lab + 3 * ADV + WORD_GAP - 3; // 78
  return {
    larp,
    lab,
    th, // T at th, H at th+ADV (TH) or th+3*ADV (TECH)
    widthTH: th + ADV + 7, // 95
    widthTECH: th + 3 * ADV + 7, // 115
  };
})();

/** The `<L/>` mark. L is the same glyph as the wordmark's L, offset to x=8. */
export const MARK = {
  viewBox: '-1 0 30 10',
  lt: 'M5 .8L1.6 5L5 9.2',
  l: GLYPH.L,
  lx: 8,
  slash: 'M18 10.7L21.5 -.7',
  gt: 'M23.6 .8L27 5L23.6 9.2',
} as const;

/** Thailand flag stripes, 1:1:2:1:1 (red, white, blue, white, red) as [from,to,colour] in cap units. */
export const FLAG = {
  red: '#e23d55',
  white: '#f4f5f8',
  blue: '#4457d6',
  stripes: [
    [0, 1.667, 'red'],
    [1.667, 3.333, 'white'],
    [3.333, 6.667, 'blue'],
    [6.667, 8.333, 'white'],
    [8.333, 10, 'red'],
  ],
} as const;
