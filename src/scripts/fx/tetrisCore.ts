/** Pure Tetris rules (no DOM) — kept separate so they can be tested in Node. */

export const COLS = 10;
export const ROWS = 20;

export type Matrix = number[][];
export type Board = number[][];

export const PIECES: Record<string, Matrix> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};
export const PIECE_NAMES = Object.keys(PIECES);

export const emptyBoard = (): Board =>
  Array.from({ length: ROWS }, () => Array<number>(COLS).fill(0));

export const rotateCW = (m: Matrix): Matrix =>
  m[0]!.map((_, c) => m.map((row) => row[c]!).reverse());

export const rotateCCW = (m: Matrix): Matrix => rotateCW(rotateCW(rotateCW(m)));

/** True if the piece at (px, py) overlaps a wall, the floor or a locked cell. */
export function collides(board: Board, m: Matrix, px: number, py: number): boolean {
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r]!.length; c++) {
      if (!m[r]![c]) continue;
      const x = px + c;
      const y = py + r;
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      if (y >= 0 && board[y]![x]) return true;
    }
  }
  return false;
}

/** Returns a new board with the piece locked in place. */
export function merge(board: Board, m: Matrix, px: number, py: number): Board {
  const next = board.map((row) => row.slice());
  m.forEach((row, r) =>
    row.forEach((v, c) => {
      const y = py + r;
      if (v && y >= 0 && y < ROWS) next[y]![px + c] = 1;
    }),
  );
  return next;
}

/** Removes full rows; returns the new board and how many rows were cleared. */
export function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((v) => !v));
  const cleared = ROWS - kept.length;
  const fresh = Array.from({ length: cleared }, () => Array<number>(COLS).fill(0));
  return { board: [...fresh, ...kept], cleared };
}

/** Classic scoring: 100 / 300 / 500 / 800 per 1–4 rows, times (level + 1). */
export const lineScore = (cleared: number, level: number): number =>
  ([0, 100, 300, 500, 800][cleared] ?? 0) * (level + 1);

export const levelFor = (lines: number): number => Math.floor(lines / 10);

/** Milliseconds per gravity step. */
export const dropInterval = (level: number): number => Math.max(90, 800 - level * 65);

/** 7-bag randomiser: every piece appears once per bag. */
export function makeBag(rand: () => number = Math.random): string[] {
  const bag = PIECE_NAMES.slice();
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [bag[i], bag[j]] = [bag[j]!, bag[i]!];
  }
  return bag;
}

/** Row where the piece would land if dropped straight down. */
export function landingY(board: Board, m: Matrix, px: number, py: number): number {
  let y = py;
  while (!collides(board, m, px, y + 1)) y++;
  return y;
}

/** Rotate with simple wall kicks (try shifting sideways). Returns null if it can't rotate. */
export function tryRotate(
  board: Board,
  m: Matrix,
  px: number,
  py: number,
  dir: 1 | -1,
): { m: Matrix; x: number } | null {
  const rotated = dir === 1 ? rotateCW(m) : rotateCCW(m);
  for (const dx of [0, -1, 1, -2, 2]) {
    if (!collides(board, rotated, px + dx, py)) return { m: rotated, x: px + dx };
  }
  return null;
}
