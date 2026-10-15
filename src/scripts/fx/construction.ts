import { onVisibility, prefersReducedMotion } from './reducedMotion';

/**
 * "Under construction" pixel scene for the Lab section: a LARPer (knight with a hammer)
 * and an AI robot build a rocket brick by brick. When it's done it shakes, doesn't
 * launch (not ready yet), dissolves and gets rebuilt.
 *
 * Cheap on purpose: a 64×24 cell grid redrawn ~12 times a second, only while on screen.
 * With prefers-reduced-motion it draws one finished frame and stops.
 */

const W = 64;
const H = 24;
const GROUND = 22; // row of the ground line
const TICK = 80; // ms per animation step

// Sprites: '#' solid, '+' dimmed, '.' empty
const KNIGHT = [
  '.##......',
  '..##.....',
  '..####...',
  '.######..',
  '.#+#+##..',
  '.######..',
  '..####...',
  '.######..',
  '#.####...',
  '#.####...',
  '..#..#...',
  '.##..##..',
];
// hammer held up (resting) and swung down (hitting)
const HAMMER_UP = { cells: '###,###,.#.,.#.,.#.,.#.,##.', x: 7, y: 1 };
const HAMMER_DOWN = { cells: '......#,#######,......#', x: 6, y: 7 };

const ROBOT = [
  '.....#.....',
  '....#+#....',
  '.#########.',
  '.#.......#.',
  '.#.##.##.#.',
  '.#.......#.',
  '.#..###..#.',
  '.#########.',
  '...#####...',
  '...#####...',
  '...#####...',
  '..##...##..',
];
// blink: eyes close (row 4 empty), a dim lid line shows one row lower
const BLINK = { 4: '.#.......#.', 5: '.#.++.++.#.' } as const;
const ARM_THROW = { cells: '##', x: 1, y: 9 }; // reaching out (left) to hand over a brick
const ARM_REST = { cells: '#,#', x: 2, y: 9 };

const ROCKET = [
  '.....#.....',
  '....###....',
  '....###....',
  '...#####...',
  '...##.##...',
  '...#...#...',
  '...##.##...',
  '...#####...',
  '...#####...',
  '...##+##...',
  '...#####...',
  '...#####...',
  '..#######..',
  '.##.###.##.',
  '##..###..##',
  '#...###...#',
  '....#.#....',
  '...#...#...',
];

const KX = 6;
const KY = GROUND - KNIGHT.length;
const RX = W - 6 - ROBOT[0]!.length;
const RY = GROUND - ROBOT.length;
const CX = Math.floor((W - ROCKET[0]!.length) / 2);
const CY = GROUND - ROCKET.length;
const HAND = { x: RX + 1, y: RY + 9 }; // where bricks leave the robot

type Brick = { x: number; y: number; a: number };
// build order: bottom row first, left to right
const BRICKS: Brick[] = ROCKET.flatMap((row, y) =>
  [...row].map((ch, x) =>
    ch === '.' ? null : { x: CX + x, y: CY + y, a: ch === '+' ? 0.5 : 0.92 },
  ),
)
  .filter((b): b is Brick => b !== null)
  .sort((p, q) => q.y - p.y || p.x - q.x);

const FLIGHT = 7; // ticks a brick spends in the air
const LAUNCH_EVERY = 1; // ticks between bricks
const IGNITE_TICKS = 30;
const DISSOLVE_TICKS = 18;

type Phase = 'build' | 'ignite' | 'dissolve';

export function mountConstruction(
  canvas: HTMLCanvasElement,
  progressEl?: HTMLElement | null,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = prefersReducedMotion();

  let rgb = readColor();
  let cell = 0;
  let w = 0;
  let h = 0;

  // animation state
  let phase: Phase = 'build';
  let tick = 0;
  let phaseTick = 0;
  let launched = 0; // bricks thrown so far
  let placed: boolean[] = BRICKS.map(() => false);
  let flying: { i: number; t: number }[] = [];
  let sparks: { x: number; y: number; t: number }[] = [];
  let lastLand = -99;
  let order: number[] = []; // dissolve order
  let running = false;
  let raf = 0;
  let acc = 0;
  let last = 0;
  let lastText = '';
  let bg: HTMLCanvasElement | null = null; // dot grid + ground, redrawn only on resize/theme
  let alpha = -1;

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
    cell = w / W;
    bg = null;
    draw();
  }

  function drawBackground() {
    bg = document.createElement('canvas');
    bg.width = canvas.width;
    bg.height = canvas.height;
    const b = bg.getContext('2d')!;
    b.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
    b.fillStyle = `rgb(${rgb} / 0.07)`;
    for (let y = 0; y < GROUND; y++)
      for (let x = 0; x < W; x++)
        b.fillRect(x * cell + cell / 2 - 0.6, y * cell + cell / 2 - 0.6, 1.2, 1.2);
    const gap = cell > 6 ? 1 : 0.5;
    for (let x = 0; x < W; x++) {
      b.fillStyle = `rgb(${rgb} / ${x % 2 ? 0.22 : 0.32})`;
      b.fillRect(x * cell + gap / 2, GROUND * cell + gap / 2, cell - gap, cell - gap);
    }
  }

  function px(x: number, y: number, a: number) {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    if (a !== alpha) {
      ctx!.fillStyle = `rgb(${rgb} / ${a})`;
      alpha = a;
    }
    const gap = cell > 6 ? 1 : 0.5;
    ctx!.fillRect(x * cell + gap / 2, y * cell + gap / 2, cell - gap, cell - gap);
  }

  function sprite(rows: string[], ox: number, oy: number, a = 0.95) {
    rows.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        if (ch === '#') px(ox + x, oy + y, a);
        else if (ch === '+') px(ox + x, oy + y, a * 0.5);
      }),
    );
  }
  const part = (p: { cells: string; x: number; y: number }, ox: number, oy: number) =>
    sprite(p.cells.split(','), ox + p.x, oy + p.y);

  function setText(text: string) {
    if (progressEl && text !== lastText) {
      progressEl.textContent = text;
      lastText = text;
    }
  }

  function draw() {
    if (!w) return;
    ctx!.clearRect(0, 0, w, h);
    if (!bg) drawBackground();
    ctx!.save();
    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.drawImage(bg!, 0, 0);
    ctx!.restore();
    alpha = -1;

    // rocket: a faint blueprint of the whole thing, filled in brick by brick
    // (it shakes a little while it tries to launch)
    const shake = phase === 'ignite' && !reduce ? (phaseTick % 4 < 2 ? 0 : 1) : 0;
    if (phase === 'build') BRICKS.forEach((b, i) => !placed[i] && px(b.x, b.y, 0.1));
    BRICKS.forEach((b, i) => placed[i] && px(b.x + shake, b.y, b.a));

    // exhaust puffs on the ground while it tries (and fails) to launch
    if (phase === 'ignite' && !reduce) {
      for (let k = 0; k < 6; k++) {
        const dx = ((tick * 7 + k * 13) % 9) - 4;
        const dy = (tick + k) % 2;
        px(CX + 5 + dx + (k % 2 ? -3 : 3), GROUND - 1 - dy, 0.35);
      }
    }

    // bricks in the air: a short arc from the robot's hand to their slot
    for (const f of flying) {
      const b = BRICKS[f.i]!;
      const t = f.t / FLIGHT;
      const x = HAND.x + (b.x - HAND.x) * t;
      const y = HAND.y + (b.y - HAND.y) * t - 6 * 4 * t * (1 - t);
      px(Math.round(x), Math.round(y), 1);
    }

    // sparks where bricks land
    for (const s of sparks) {
      const r = s.t < 1 ? 1 : 2;
      px(s.x - r, s.y, 0.45);
      px(s.x + r, s.y, 0.45);
      px(s.x, s.y - r, 0.45);
    }

    // the LARPer: hammer comes down right after a brick lands
    sprite(KNIGHT, KX, KY);
    // steady hammering rhythm while bricks are landing
    const hitting = phase === 'build' && !reduce && tick - lastLand <= 2 && (tick >> 1) % 2 === 0;
    part(hitting ? HAMMER_DOWN : HAMMER_UP, KX, KY);

    // the AI: reaches out while throwing, blinks now and then
    const robot = ROBOT.slice();
    if (!reduce && tick % 45 < 2) {
      robot[4] = BLINK[4];
      robot[5] = BLINK[5];
    }
    sprite(robot, RX, RY);
    const throwing = phase === 'build' && !reduce && flying.some((f) => f.t <= 1);
    part(throwing ? ARM_THROW : ARM_REST, RX, RY);
  }

  function step() {
    tick++;
    phaseTick++;
    sparks = sparks.map((s) => ({ ...s, t: s.t + 1 })).filter((s) => s.t < 3);

    if (phase === 'build') {
      if (launched < BRICKS.length && phaseTick % LAUNCH_EVERY === 0)
        flying.push({ i: launched++, t: 0 });
      flying = flying.filter((f) => {
        f.t++;
        if (f.t < FLIGHT) return true;
        placed[f.i] = true;
        const b = BRICKS[f.i]!;
        sparks.push({ x: b.x, y: b.y, t: 0 });
        lastLand = tick;
        return false;
      });
      const done = placed.filter(Boolean).length;
      const pct = Math.round((done / BRICKS.length) * 100);
      setText(`> progress ${'.'.repeat(10)} ${pct}%`);
      if (done === BRICKS.length) {
        phase = 'ignite';
        phaseTick = 0;
      }
    } else if (phase === 'ignite') {
      setText(`> launch ${'.'.repeat(12)} not yet`);
      if (phaseTick >= IGNITE_TICKS) {
        phase = 'dissolve';
        phaseTick = 0;
        order = BRICKS.map((_, i) => i).sort(() => Math.random() - 0.5);
      }
    } else {
      setText(`> rebuilding ${'.'.repeat(8)}`);
      const remove = Math.ceil(BRICKS.length / DISSOLVE_TICKS);
      for (let k = 0; k < remove && order.length; k++) placed[order.pop()!] = false;
      if (!order.length) {
        phase = 'build';
        phaseTick = 0;
        launched = 0;
        placed = BRICKS.map(() => false);
      }
    }
    draw();
  }

  function loop(now: number) {
    acc += Math.min(now - last, 250);
    last = now;
    while (acc >= TICK) {
      acc -= TICK;
      step();
    }
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running || reduce) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  if (reduce) {
    placed = BRICKS.map(() => true);
    setText('> status ............ building');
  }

  new ResizeObserver(layout).observe(canvas);
  new MutationObserver(() => {
    rgb = readColor();
    bg = null;
    draw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  onVisibility(canvas, (visible) => (visible ? start() : stop()));
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  layout();
}
