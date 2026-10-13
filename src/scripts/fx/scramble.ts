import { onFirstVisible, prefersReducedMotion } from './reducedMotion';

const GLYPHS = '01<>/\\_-=+*#';

/**
 * Binary/char scramble that resolves left → right.
 * Use on short mono labels: `<span data-scramble>./saas</span>`.
 * Triggers once on reveal and again on hover of the closest [data-scramble-trigger] (or itself).
 */
export function scramble(el: HTMLElement, duration = 520): void {
  const target = el.dataset.scrambleText ?? el.textContent ?? '';
  el.dataset.scrambleText = target;
  if (el.dataset.scrambling === '1') return;
  el.dataset.scrambling = '1';

  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const settled = Math.floor(p * target.length);
    let out = target.slice(0, settled);
    for (let i = settled; i < target.length; i++) {
      out += target[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (p < 1) requestAnimationFrame(tick);
    else {
      el.textContent = target;
      el.dataset.scrambling = '0';
    }
  };
  requestAnimationFrame(tick);
}

export function initScramble(root: ParentNode = document): void {
  if (prefersReducedMotion()) return;
  root.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => {
    el.setAttribute('aria-label', el.textContent ?? '');
    onFirstVisible(el, () => scramble(el), 0.6);
    const trigger = el.closest<HTMLElement>('[data-scramble-trigger]') ?? el;
    trigger.addEventListener('pointerenter', () => scramble(el));
  });
}
