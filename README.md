# LARP LAB TH — www.larplabth.com

Main website for **LARP LAB TH**, a developer team building SaaS, tools, services, devices and maker
projects, and offering consulting and problem solving.

Built with Astro 7 and TypeScript as a static site. Effects are vanilla TS, with no UI framework.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro check + static build → dist/
npm run preview    # serve dist/ locally
npm run og         # regenerate public/og-default.png
npm run format     # prettier
```

## Where to edit things

| What                                     | Where                                                          |
| ---------------------------------------- | -------------------------------------------------------------- |
| Name, tagline, email, socials, nav       | `src/config/site.ts`                                           |
| Services (What we do)                    | `src/content/services/*.md`                                    |
| Process steps                            | `src/content/process/*.md`                                     |
| Lab / projects (`draft: true` hides one) | `src/content/projects/*.md`                                    |
| FAQ                                      | `src/content/faq/*.md` (frontmatter `question`, body = answer) |
| Stack table                              | `src/components/sections/Stack.astro` (array at top)           |
| About copy + stats                       | `src/components/sections/About.astro`                          |
| Contact (form stub: `FORM_ENABLED`)      | `src/components/sections/Contact.astro`                        |
| Colours, type, spacing                   | `src/styles/tokens.css`                                        |
| **Logo (placeholder)**                   | `src/components/brand/Logo.astro` + `public/favicon.svg`       |

Content schemas are validated by zod in `src/content.config.ts`, so a typo in frontmatter fails the build.

## Structure

```
src/
  config/site.ts            site identity + nav (single source of truth)
  content.config.ts         content collection schemas
  content/                  markdown content (services, process, projects, faq)
  styles/tokens.css         design tokens: light/dark palettes, type scale, spacing
  styles/global.css         reset, base, utilities (.label .mono .pixel .dot-grid .cursor)
  layouts/BaseLayout.astro  <head> SEO/OG/JSON-LD, theme init, skip link
  components/
    brand/Logo.astro        placeholder logo (swap later)
    layout/                 Header (+ mobile menu), Footer, ThemeToggle
    ui/                     SectionHeader, Button, Card, Prompt
    sections/               Hero, Ticker, Services, Process, Lab, Stack, About, Faq, Contact
  scripts/fx/
    pixelField.ts           hero canvas: pixel wordmark + reactive dot grid
    typewriter.ts           terminal typing
    scramble.ts             binary text scramble ([data-scramble])
    reducedMotion.ts        reduced-motion guard, visibility helpers, [data-reveal]
  pages/index.astro, 404.astro
public/  favicon.svg, og-default.png, robots.txt, _headers (Cloudflare)
scripts/generate-og.mjs     OG image generator (sharp)
```

## Design system (CI v0)

- Soft monochrome palette: ink `#0F0F0F` and paper `#F2F1EC`, with greys between. There's no brand colour. Dark mode is the default, the site follows the OS setting, and a header toggle lets visitors override it.
- Type: **Geist** for UI and headings, **Geist Mono** for labels and CLI text, and **Silkscreen** (a pixel font) for the wordmark and accents. Fonts are self-hosted via `@fontsource`.
- Motifs: numbered section headers (`01 // WHAT WE DO`), `$` prompts, the block cursor `█`, a dot grid, binary strips and scramble-on-hover.
- Motion: every effect respects `prefers-reduced-motion` and pauses when off-screen.

## Deploy: Cloudflare Pages

1. **Domain:** buy `larplabth.com` through Cloudflare Registrar (Dashboard → Domain Registration). It was unregistered as of 2026-10-13.
2. **Repo:** push this folder to GitHub or GitLab.
3. **Pages:** go to Workers & Pages → Create → Pages → Connect to Git.
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Env var: `NODE_VERSION=22` (or newer)
4. **Custom domain:** in the Pages project → Custom domains, add `www.larplabth.com`.
5. **Apex redirect:** add a Rules → Redirect Rule for `larplabth.com/*` → `https://www.larplabth.com/${1}` with a 301. You also need a proxied DNS record for the apex (for example `AAAA @ 100::`). Pages' `_redirects` file can't match on hostname, so this has to be a Redirect Rule.
6. **Email:** set up `hello@larplabth.com` with Cloudflare Email Routing, or update `site.email`.

`public/_headers` adds security headers and long-term caching for hashed `/_astro/*` assets.

## TODO (content phase)

- [ ] Real logo → `Logo.astro`, `favicon.svg`, re-run `npm run og`
- [ ] About copy and team profiles
- [ ] FAQ answers
- [ ] Contact: confirm email and socials; choose a form backend (e.g. a Pages Function + email API)
- [ ] Lab projects
- [ ] Confirm the Stack list
