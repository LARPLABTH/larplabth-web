/**
 * Single source of truth for site-wide identity and navigation.
 * Update copy here — components read from this file.
 */
export const site = {
  name: 'LARP LAB TH',
  shortName: 'LARP_LAB',
  url: 'https://larplabth.com',
  tagline: 'We build software, tools & devices.',
  motto: 'LARP IT TILL YOU MAKE IT',
  description:
    'LARP it till you make it. LARP LAB TH is an anonymous team of college students from Thailand building SaaS, tools, services and devices — and helping teams solve hard technical problems.',
  email: 'larplab.th@gmail.com',
  location: 'Thailand',
  foundedYear: 2026,
  ogImage: '/og-default.png',
  /** version of the Terms + Privacy text; sent with each form submission as proof of what was accepted */
  legalVersion: '2026-10-17',
  contactForm: {
    // Needs RESEND_API_KEY set as a secret on the Worker (see worker/contact.ts).
    enabled: true,
    // Public Turnstile site key (safe to commit). Leave empty to skip the captcha widget.
    turnstileSiteKey: '0x4AAAAAAFVzmMoNyDMoGUSk',
  },
  socials: [
    {
      label: 'Facebook',
      handle: 'LARP LAB TH',
      href: 'https://www.facebook.com/profile.php?id=61595003986457',
    },
    { label: 'Instagram', handle: '@larplab.th', href: 'https://www.instagram.com/larplab.th/' },
    { label: 'GitHub', handle: 'LARPLABTH', href: 'https://github.com/LARPLABTH' },
  ] as { label: string; handle: string; href: string }[],
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
