/**
 * LARP LAB TH — logo geometry (single source of truth).
 *
 * Letters are monoline strokes on a 10-unit cap height, 7-unit width, with chamfered
 * (45°) corners. The same paths drive the site logo (Logo.astro), the favicon and the
 * share image (scripts/generate-brand.mjs), so every version matches exactly.
 * Wordmark = `<L/>` + ARP + LAB + TH, where TH expands to TECH on hover.
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

/** The `<L/>` mark occupies x ∈ [0, MARK_W] once shifted by MARK_X (apex miters stick out to -0.4 / 28.2). */
export const MARK_W = 28.6;
export const MARK_X = 0.4;

/**
 * x offsets (in units) in the full wordmark `<L/>ARP LAB TH`: the first letter is the
 * `<L/>` mark. TH is at `th` (T) and `th + ADV` (H); in the expanded TECH state H moves
 * to `th + 3*ADV` and E, C sit at `th + ADV`, `th + 2*ADV`.
 */
export const LAYOUT = (() => {
  const arp = MARK_W + 4; // 32.6
  const larpEnd = arp + 2 * ADV + 7; // end of P
  const lab = larpEnd + WORD_GAP;
  const labEnd = lab + 2 * ADV + 7;
  const th = labEnd + WORD_GAP;
  return {
    arp,
    lab,
    th,
    widthTH: th + ADV + 7,
    widthTECH: th + 3 * ADV + 7,
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

/** Thailand flag colours, one per letter of TECH (T red · E white · C blue · H red). */
export const TECH_COLORS = { T: 'red', E: 'white', C: 'blue', H: 'red' } as const;
