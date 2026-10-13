# LARP LAB TH — larplabth.com

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

The site is live at **https://larplabth.com** (the bare domain is canonical; there's no `www`).

1. **Repo:** `LARPLABTH/larplabth-web` on GitHub. Pushing to `main` deploys automatically.
2. **Pages:** Workers & Pages → Pages project connected to the repo.
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Env var: `NODE_VERSION=22`
3. **Custom domain:** `larplabth.com` attached to the Pages project (Custom domains tab).
4. **HTTPS:** SSL/TLS → Edge Certificates → turn on **Always Use HTTPS**.
5. **Email:** `larplab.th@gmail.com` (shown on the site; change in `src/config/site.ts`).

`public/_headers` adds security headers and long-term caching for hashed `/_astro/*` assets.

## TODO (content phase)

- [ ] Real logo → `Logo.astro`, `favicon.svg`, re-run `npm run og`
- [ ] Team profiles (team is anonymous for now)
- [ ] FAQ answers
- [ ] Contact form: Pages Function + email service + Turnstile (see notes in Contact.astro)
- [ ] Thai version, after the first project is added
- [ ] Lab projects
- [ ] Confirm the Stack list
