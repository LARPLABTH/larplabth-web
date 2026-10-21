/**
 * Single source of truth for site-wide identity and navigation.
 * Update copy here — components read from this file.
 */
export const site = {
  name: 'LARP LAB TH',
  shortName: 'LARP_LAB',
  url: 'https://larplabth.com',
  motto: 'LARP IT TILL YOU MAKE IT',
  // tagline + description are per language: src/i18n/ui.ts (meta)
  email: 'larplab.th@gmail.com',
  location: 'Thailand',
  foundedYear: 2026,
  ogImage: '/og-default.png',
  /** version of the Terms + Privacy text; sent with each form submission as proof of what was accepted */
  legalVersion: '2026-10-21',
  contactForm: {
    // Needs RESEND_API_KEY set as a secret on the Worker (see worker/contact.ts).
    enabled: true,
    // Public Turnstile site key (safe to commit). Leave empty to skip the captcha widget.
    turnstileSiteKey: '0x4AAAAAAFVzmMoNyDMoGUSk',
  },
  socials: [
    {
      label: 'Facebook',
      icon: 'facebook',
      handle: 'LARP LAB TH',
      href: 'https://www.facebook.com/profile.php?id=61595003986457',
    },
    {
      label: 'Instagram',
      icon: 'instagram',
      handle: '@larplab.th',
      href: 'https://www.instagram.com/larplab.th/',
    },
    { label: 'GitHub', icon: 'github', handle: 'LARPLABTH', href: 'https://github.com/LARPLABTH' },
  ] as {
    label: string;
    icon: 'facebook' | 'instagram' | 'github';
    handle: string;
    href: string;
  }[],
} as const;

/** Section anchors in page order; labels per language live in src/i18n/ui.ts (nav). */
export const nav = ['about', 'services', 'process', 'lab', 'stack', 'faq', 'contact'] as const;
