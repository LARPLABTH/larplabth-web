import { onVisibility, prefersReducedMotion } from './reducedMotion';

type Options = {
  /** Cell size in CSS px. */
  cell?: number;
  /** Draws the shape (white, any alpha) that the pixels assemble into, on a cols×rows canvas. */
  shape: (ctx: CanvasRenderingContext2D, cols: number, rows: number) => void;
  /** Pointer influence radius in CSS px. */
  radius?: number;
  /** Called with pointer position in cells (or null when the pointer leaves). */
  onPointer?: (pos: { x: number; y: number } | null) => void;
  /** Called after each layout with the grid size. */
  onLayout?: (grid: { cols: number; rows: number }) => void;
};

/**
 * Canvas "pixel field": a dot grid that twinkles, with a pixel-font wordmark
 * that assembles on load and scatters away from the pointer.
 * Static single frame under prefers-reduced-motion; paused when off-screen.
 */
export function mountPixelField(canvas: HTMLCanvasElement, opts: Options) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const cell = opts.cell ?? 10;
  const radius = opts.radius ?? 120;
  const reduce = prefersReducedMotion();

  let w = 0;
  let h = 0;
  let cols = 0;
  let rows = 0;
  let mask: Uint8Array = new Uint8Array(0);
  let seed: Float32Array = new Float32Array(0);
  let rgb = readColor();
  const pointer = { x: -1e4, y: -1e4, inside: false };
  let raf = 0;
  let running = false;
  let startTime = performance.now();

  function readColor(): string {
    return (
      getComputedStyle(document.documentElement).getPropertyValue('--c-pixel').trim() ||
      '232 232 227'
    );
  }

  function layout() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / cell);
    rows = Math.ceil(h / cell);
    seed = new Float32Array(cols * rows).map(() => Math.random());
    mask = buildMask(cols, rows, opts.shape);
    opts.onLayout?.({ cols, rows });
  }

  function draw(now: number) {
    const t = (now - startTime) / 1000;
    const assemble = reduce ? 1 : easeOut(Math.min(1, t / 1.4));
    ctx!.clearRect(0, 0, w, h);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const s = seed[i]!;
        const cx = x * cell + cell / 2;
        const cy = y * cell + cell / 2;

        let f = 0; // pointer influence 0..1
        let dx = 0;
        let dy = 0;
        if (pointer.inside) {
          dx = cx - pointer.x;
          dy = cy - pointer.y;
          const d = Math.hypot(dx, dy);
          f = Math.max(0, 1 - d / radius);
          f *= f;
          if (d > 0) {
            dx /= d;
            dy /= d;
          }
        }

        if (mask[i] && s < assemble) {
          // Solid wordmark pixel — pushed away by the pointer.
          const push = f * cell * 1.6;
          const size = cell * (0.78 - f * 0.45);
          const a = 0.92 - f * 0.4;
          ctx!.fillStyle = `rgb(${rgb} / ${a})`;
          ctx!.fillRect(cx + dx * push - size / 2, cy + dy * push - size / 2, size, size);
        } else {
          // Background dot — twinkles slowly, brightens near the pointer.
          const tw = reduce ? 0.5 : 0.5 + 0.5 * Math.sin(t * (0.6 + s * 1.4) + s * 6.283);
          const a = 0.07 + tw * 0.1 + f * 0.65;
          const size = 1.4 + f * cell * 0.5;
          ctx!.fillStyle = `rgb(${rgb} / ${a})`;
          ctx!.fillRect(cx - size / 2, cy - size / 2, size, size);
        }
      }
    }
  }

  function loop(now: number) {
    draw(now);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduce) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  layout();
  startTime = performance.now();
  draw(performance.now());

  // Resize
  let resizeTimer = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      layout();
      draw(performance.now());
    }, 80);
  }).observe(canvas);

  // Theme changes swap the pixel colour.
  new MutationObserver(() => {
    rgb = readColor();
    draw(performance.now());
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  if (reduce) return;

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.inside = true;
    opts.onPointer?.({ x: Math.floor(pointer.x / cell), y: Math.floor(pointer.y / cell) });
  });
  canvas.addEventListener('pointerleave', () => {
    pointer.inside = false;
    opts.onPointer?.(null);
  });

  onVisibility(canvas, (visible) => (visible ? start() : stop()));
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}

function easeOut(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

/** Rasterises a shape into a cols×rows bitmap. */
function buildMask(cols: number, rows: number, shape: Options['shape']): Uint8Array {
  const out = new Uint8Array(cols * rows);
  const off = document.createElement('canvas');
  off.width = cols;
  off.height = rows;
  const octx = off.getContext('2d', { willReadFrequently: true });
  if (!octx) return out;
  shape(octx, cols, rows);
  const data = octx.getImageData(0, 0, cols, rows).data;
  for (let i = 0; i < out.length; i++) out[i] = data[i * 4 + 3]! > 110 ? 1 : 0;
  return out;
}
