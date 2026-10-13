import { onFirstVisible, prefersReducedMotion } from './reducedMotion';

/**
 * Types out server-rendered terminal lines in order.
 * Markup: a container [data-typewriter] with children [data-line]; each line's text is
 * captured, cleared, then typed. Command lines (data-kind="cmd") type slowly,
 * output lines appear quickly — like a real shell.
 * Without JS (or with reduced motion) the full static output is shown.
 */
export function initTypewriter(container: HTMLElement): void {
  if (prefersReducedMotion()) return;

  const lines = Array.from(container.querySelectorAll<HTMLElement>('[data-line]'));
  const targets = lines.map((line) => line.querySelector<HTMLElement>('[data-text]') ?? line);
  const texts = targets.map((t) => t.textContent ?? '');

  targets.forEach((t) => (t.textContent = ''));
  lines.forEach((l) => (l.hidden = true));
  container.classList.add('is-typing');

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const run = async () => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const target = targets[i]!;
      const text = texts[i]!;
      const isCmd = line.dataset.kind === 'cmd';
      line.hidden = false;
      line.classList.add('is-active');
      if (isCmd) {
        await sleep(380);
        for (let c = 1; c <= text.length; c++) {
          target.textContent = text.slice(0, c);
          await sleep(38 + Math.random() * 55);
        }
        await sleep(260);
      } else {
        target.textContent = text;
        await sleep(110);
      }
      line.classList.remove('is-active');
    }
    container.classList.remove('is-typing');
    container.classList.add('is-done');
  };

  onFirstVisible(container, () => void run(), 0.3);
}
