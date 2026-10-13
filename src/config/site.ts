/**
 * Single source of truth for site-wide identity and navigation.
 * Update copy here — components read from this file.
 */
export const site = {
  name: 'LARP LAB TH',
  shortName: 'LARP_LAB',
  url: 'https://www.larplabth.com',
  tagline: 'We build software, tools & devices.',
  description:
    'LARP LAB TH is a developer team from Thailand building SaaS, tools, services and devices — and helping teams solve hard technical problems.',
  // TODO: confirm the real inbox once the domain is set up.
  email: 'hello@larplabth.com',
  location: 'Thailand',
  foundedYear: 2026,
  ogImage: '/og-default.png',
  socials: [
    // { label: 'GitHub', href: 'https://github.com/larplabth' },
    // { label: 'Facebook', href: 'https://facebook.com/larplabth' },
  ] as { label: string; href: string }[],
} as const;

export const nav = [
  { label: 'What we do', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'Lab', href: '#lab' },
  { label: 'Stack', href: '#stack' },
  { label: 'About', href: '#about' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
] as const;
