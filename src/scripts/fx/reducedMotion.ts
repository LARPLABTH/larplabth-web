/** Shared motion guards for all FX modules. */

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Calls `cb(true|false)` as the element enters/leaves the viewport. Returns a disposer. */
export function onVisibility(
  el: Element,
  cb: (visible: boolean) => void,
  options: IntersectionObserverInit = { rootMargin: '0px' },
): () => void {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) cb(entry.isIntersecting);
  }, options);
  io.observe(el);
  return () => io.disconnect();
}

/** Calls `cb` once, the first time the element becomes visible. */
export function onFirstVisible(el: Element, cb: () => void, threshold = 0.2): void {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { threshold },
  );
  io.observe(el);
}

/** Fades in every [data-reveal] element as it scrolls into view. */
export function initReveal(root: ParentNode = document): void {
  const els = root.querySelectorAll<HTMLElement>('[data-reveal]');
  if (prefersReducedMotion()) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  els.forEach((el) => io.observe(el));
}
