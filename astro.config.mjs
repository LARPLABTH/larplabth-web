// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://larplabth.com',
  trailingSlash: 'ignore',
  // English stays at the root (/, /terms/, /privacy/); Thai lives under /th/. Keep in sync with src/i18n/ui.ts.
  i18n: {
    locales: ['en', 'th'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      // adds <xhtml:link rel="alternate" hreflang> pairs for each page
      i18n: { defaultLocale: 'en', locales: { en: 'en', th: 'th' } },
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
