import { onVisibility } from './reducedMotion';
import {
  COLS,
  ROWS,
  PIECES,
  clearLines,
  collides,
  dropInterval,
  emptyBoard,
  landingY,
  levelFor,
  lineScore,
  makeBag,
  merge,
  tryRotate,
  type Board,
  type Matrix,
} from './tetrisCore';

/**
 * Minimal mono Tetris. Only listens to the keyboard while it has focus, and pauses itself
 * when it loses focus, scrolls off-screen or the tab is hidden. It never starts on its own,
 * so it is safe for prefers-reduced-motion (nothing moves until the visitor presses play).
 *
 * Expected markup (see TetrisGame.astro): [data-tetris] containing
 *   canvas[data-tetris-board], canvas[data-tetris-next], button[data-tetris-overlay]
 *   with [data-tetris-msg], [data-tetris-score|lines|best], and [data-action] pad buttons.
 */

type State = 'idle' | 'playing' | 'paused' | 'over';
interface Active {
  m: Matrix;
  x: number;
  y: number;
}

const BEST_KEY = 'larp-tetris-best';

export function mountTetris(root: HTMLElement): void {
  const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const canvas = q<HTMLCanvasElement>('[data-tetris-board]');
  const nextCanvas = q<HTMLCanvasElement>('[data-tetris-next]');
  const overlay = q<HTMLButtonElement>('[data-tetris-overlay]');
  const msg = q<HTMLElement>('[data-tetris-msg]');
  const sub = q<HTMLElement>('[data-tetris-sub]');
  const scoreEl = q<HTMLElement>('[data-tetris-score]');
  const linesEl = q<HTMLElement>('[data-tetris-lines]');
  const bestEl = q<HTMLElement>('[data-tetris-best]');
  const ctx = canvas.getContext('2d');
  const nctx = nextCanvas.getContext('2d');
  if (!ctx || !nctx) return;

  let state: State = 'idle';
  let board: Board = emptyBoard();
  let bag: string[] = [];
  let queue: string[] = [];
  let piece: Active | null = null;
  let score = 0;
  let lines = 0;
  let best = 0;
  let acc = 0;
  let last = 0;
  let raf = 0;
  let rgb = readColor();

  try {
    best = Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    /* storage unavailable */
  }

  // ---------- helpers ----------
  function readColor(): string {
    return (
      getComputedStyle(document.documentElement).getPropertyValue('--c-pixel').trim() ||
      '232 232 227'
    );
  }

  function nextType(): string {
    while (queue.length < 2) {
      if (!bag.length) bag = makeBag();
      queue.push(bag.pop()!);
    }
    return queue.shift()!;
  }

  function spawn(): boolean {
    const type = nextType();
    const m = PIECES[type]!.map((r) => r.slice());
    piece = { m, x: Math.floor((COLS - m[0]!.length) / 2), y: 0 };
    return !collides(board, piece.m, piece.x, piece.y);
  }

  function setMessage(main: string, small: string) {
    msg.textContent = main;
    sub.textContent = small;
  }

  function updateHud() {
    scoreEl.textContent = String(score);
    linesEl.textContent = String(lines);
    bestEl.textContent = String(best);
  }

  // ---------- canvas sizing ----------
  const metrics = { w: 0, h: 0, cell: 0, nCell: 0 };
  function fit(c: HTMLCanvasElement, cx: CanvasRenderingContext2D) {
    const rect = c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(rect.width * dpr);
    c.height = Math.round(rect.height * dpr);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return rect;
  }
  function layout() {
    const r = fit(canvas, ctx!);
    metrics.w = r.width;
    metrics.h = r.height;
    metrics.cell = r.width / COLS;
    const n = fit(nextCanvas, nctx!);
    metrics.nCell = n.width / 4;
    draw();
  }

  // ---------- drawing ----------
  function square(cx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) {
    cx.fillStyle = `rgb(${rgb} / ${alpha})`;
    cx.fillRect(x + 1, y + 1, size - 2, size - 2);
  }

  function draw() {
    const { w, h, cell } = metrics;
    ctx!.clearRect(0, 0, w, h);

    // faint dot grid
    ctx!.fillStyle = `rgb(${rgb} / 0.12)`;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        ctx!.fillRect(c * cell + cell / 2 - 0.75, r * cell + cell / 2 - 0.75, 1.5, 1.5);

    // locked cells
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) if (board[r]![c]) square(ctx!, c * cell, r * cell, cell, 0.55);

    if (piece && (state === 'playing' || state === 'paused')) {
      // ghost (outline)
      const gy = landingY(board, piece.m, piece.x, piece.y);
      ctx!.strokeStyle = `rgb(${rgb} / 0.4)`;
      ctx!.lineWidth = 1;
      piece.m.forEach((row, r) =>
        row.forEach((v, c) => {
          if (v && gy + r >= 0)
            ctx!.strokeRect((piece!.x + c) * cell + 1.5, (gy + r) * cell + 1.5, cell - 3, cell - 3);
        }),
      );
      // active piece
      piece.m.forEach((row, r) =>
        row.forEach((v, c) => {
          if (v && piece!.y + r >= 0)
            square(ctx!, (piece!.x + c) * cell, (piece!.y + r) * cell, cell, 1);
        }),
      );
    }
    drawNext();
  }

  function drawNext() {
    const { nCell } = metrics;
    nctx!.clearRect(0, 0, nCell * 4, nCell * 4);
    const type = queue[0];
    if (!type) return;
    const m = PIECES[type]!;
    // centre the piece's bounding box in the 4×4 preview
    const rows = m.map((row, r) => (row.some(Boolean) ? r : -1)).filter((r) => r >= 0);
    const cols = m[0]!.map((_, c) => (m.some((row) => row[c]) ? c : -1)).filter((c) => c >= 0);
    const w = cols.length;
    const h = rows.length;
    const ox = (4 - w) / 2 - cols[0]!;
    const oy = (4 - h) / 2 - rows[0]!;
    m.forEach((row, r) =>
      row.forEach((v, c) => v && square(nctx!, (c + ox) * nCell, (r + oy) * nCell, nCell, 1)),
    );
  }

  // ---------- game flow ----------
  function start() {
    board = emptyBoard();
    bag = [];
    queue = [];
    score = 0;
    lines = 0;
    acc = 0;
    spawn(); // fills `piece` and leaves the following piece waiting in `queue` for the preview
    state = 'playing';
    overlay.hidden = true;
    updateHud();
    canvas.focus({ preventScroll: true });
    resume();
  }

  function resume() {
    state = 'playing';
    overlay.hidden = true;
    last = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
    draw();
  }

  function pause(reason = 'paused') {
    if (state !== 'playing') return;
    state = 'paused';
    cancelAnimationFrame(raf);
    setMessage(reason, 'click or press P to resume');
    overlay.hidden = false;
    draw();
  }

  function gameOver() {
    state = 'over';
    cancelAnimationFrame(raf);
    if (score > best) {
      best = score;
      try {
        localStorage.setItem(BEST_KEY, String(best));
      } catch {
        /* ignore */
      }
    }
    updateHud();
    setMessage('game over', `score ${score}\nclick to retry`);
    overlay.hidden = false;
    draw();
  }

  function lock() {
    if (!piece) return;
    board = merge(board, piece.m, piece.x, piece.y);
    const res = clearLines(board);
    board = res.board;
    if (res.cleared) {
      lines += res.cleared;
      score += lineScore(res.cleared, levelFor(lines - res.cleared));
    }
    updateHud();
    if (!spawn()) gameOver();
  }

  function stepDown(soft: boolean): boolean {
    if (!piece) return false;
    if (!collides(board, piece.m, piece.x, piece.y + 1)) {
      piece.y++;
      if (soft) score++;
      return true;
    }
    lock();
    return false;
  }

  function frame(t: number) {
    if (state !== 'playing') return;
    acc += Math.min(t - last, 100);
    last = t;
    const interval = dropInterval(levelFor(lines));
    while (acc >= interval && state === 'playing') {
      acc -= interval;
      stepDown(false);
    }
    updateHud();
    draw();
    if (state === 'playing') raf = requestAnimationFrame(frame);
  }

  // ---------- actions ----------
  function act(action: string) {
    if (state !== 'playing' || !piece) return;
    switch (action) {
      case 'left':
        if (!collides(board, piece.m, piece.x - 1, piece.y)) piece.x--;
        break;
      case 'right':
        if (!collides(board, piece.m, piece.x + 1, piece.y)) piece.x++;
        break;
      case 'rotate':
      case 'rotate-ccw': {
        const r = tryRotate(board, piece.m, piece.x, piece.y, action === 'rotate' ? 1 : -1);
        if (r) {
          piece.m = r.m;
          piece.x = r.x;
        }
        break;
      }
      case 'down':
        stepDown(true);
        acc = 0;
        break;
      case 'drop': {
        const gy = landingY(board, piece.m, piece.x, piece.y);
        score += (gy - piece.y) * 2;
        piece.y = gy;
        lock();
        acc = 0;
        break;
      }
    }
    updateHud();
    draw();
  }

  // ---------- input ----------
  const KEYMAP: Record<string, string> = {
    ArrowLeft: 'left',
    a: 'left',
    ArrowRight: 'right',
    d: 'right',
    ArrowUp: 'rotate',
    w: 'rotate',
    x: 'rotate',
    z: 'rotate-ccw',
    ArrowDown: 'down',
    s: 'down',
    ' ': 'drop',
  };

  root.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === 'p' || key === 'Escape') {
      if (state === 'playing') pause();
      else if (state === 'paused') resume();
      else return;
      e.preventDefault();
      return;
    }
    if (key === 'Enter' && (state === 'idle' || state === 'over') && e.target === canvas) {
      start();
      e.preventDefault();
      return;
    }
    const action = KEYMAP[key];
    if (action && state === 'playing') {
      e.preventDefault(); // stop the page scrolling while you play
      act(action);
    }
  });

  overlay.addEventListener('click', () => {
    if (state === 'paused') {
      // focus the board first: hiding the focused overlay button would otherwise blur the game
      canvas.focus({ preventScroll: true });
      resume();
    } else start();
  });

  // Pause as soon as focus leaves the game (so arrow keys go back to scrolling the page).
  root.addEventListener('focusout', (e) => {
    const next = e.relatedTarget as Node | null;
    if (state === 'playing' && !(next && root.contains(next))) pause('paused');
  });
  document.addEventListener('visibilitychange', () => document.hidden && pause());
  onVisibility(root, (visible) => !visible && pause());

  // Touch pad (shown only on coarse pointers via CSS): tap, or hold to repeat.
  root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((btn) => {
    let timer = 0;
    let repeat = 0;
    const stop = () => {
      clearTimeout(timer);
      clearInterval(repeat);
    };
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const action = btn.dataset.action!;
      if (state === 'idle' || state === 'over') return start();
      if (state === 'paused') return resume();
      act(action);
      if (action === 'left' || action === 'right' || action === 'down') {
        timer = window.setTimeout(() => (repeat = window.setInterval(() => act(action), 90)), 260);
      }
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => btn.addEventListener(ev, stop));
  });

  // Re-colour when the theme toggles; refit on resize.
  new MutationObserver(() => {
    rgb = readColor();
    draw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  new ResizeObserver(layout).observe(canvas);

  setMessage('press enter to play', 'click here, then use the arrow keys');
  updateHud();
  layout();
}
