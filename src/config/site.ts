/**
 * Single source of truth for site-wide identity and navigation.
 * Update copy here — components read from this file.
 */
export const site = {
  name: 'LARP LAB TH',
  shortName: 'LARP_LAB',
  url: 'https://larplabth.com',
  tagline: 'We build software, tools & devices.',
  description:
    'LARP LAB TH is an anonymous team of college students from Thailand building SaaS, tools, services and devices — and helping teams solve hard technical problems.',
  email: 'larplab.th@gmail.com',
  location: 'Thailand',
  foundedYear: 2026,
  ogImage: '/og-default.png',
  contactForm: {
    // Needs RESEND_API_KEY set as a secret on the Worker (see worker/contact.ts).
    enabled: true,
    // Public Turnstile site key (safe to commit). Leave empty to skip the captcha widget.
    turnstileSiteKey: '0x4AAAAAAFVzmMoNyDMoGUSk',
  },
  socials: [{ label: 'GitHub', href: 'https://github.com/LARPLABTH' }] as {
    label: string;
    href: string;
  }[],
} as const;

export const nav = [
  { label: 'About', href: '#about' },
  { label: 'What we do', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'Lab', href: '#lab' },
  { label: 'Stack', href: '#stack' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
] as const;
