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
    'LARP LAB TH is an anonymous team of college students from Thailand building SaaS, tools, services and devices — and proving the "you\'re just LARPing" crowd wrong with real work.',
  email: 'larplab.th@gmail.com',
  location: 'Thailand',
  foundedYear: 2026,
  ogImage: '/og-default.png',
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
