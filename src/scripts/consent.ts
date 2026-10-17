/**
 * Storage consent. The site only keeps two optional things in the browser — the visitor's
 * colour-theme choice and their Tetris best score ("preferences"). They are written only
 * after the visitor accepts; "essential only" keeps the site working without saving them.
 * The choice itself is the one essential item (so we don't ask on every visit).
 */
export const CONSENT_KEY = 'larp-consent';
export const PREF_KEYS = ['theme', 'larp-tetris-best'] as const;
export const CONSENT_EVENT = 'larp:consent';
export const OPEN_EVENT = 'larp:open-consent';

export interface Consent {
  v: 1;
  prefs: boolean;
  at: string;
}

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    return c && c.v === 1 && typeof c.prefs === 'boolean' ? c : null;
  } catch {
    return null;
  }
}

export const prefsAllowed = (): boolean => readConsent()?.prefs === true;

/** Saves the visitor's choice; declining also erases anything saved earlier. */
export function saveConsent(prefs: boolean): void {
  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ v: 1, prefs, at: new Date().toISOString() }),
    );
    if (!prefs) PREF_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage unavailable: the choice lasts for this page view only */
  }
  document.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { prefs } }));
}

export function prefGet(key: (typeof PREF_KEYS)[number]): string | null {
  if (!prefsAllowed()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function prefSet(key: (typeof PREF_KEYS)[number], value: string): void {
  if (!prefsAllowed()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}
