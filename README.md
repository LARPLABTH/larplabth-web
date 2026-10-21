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
npm run brand      # regenerate favicon, OG image, avatar + design/ logos from brand.ts
npm run format     # prettier
```

## Where to edit things

| What                                     | Where                                                           |
| ---------------------------------------- | --------------------------------------------------------------- |
| Name, email, socials, nav order          | `src/config/site.ts`                                            |
| All UI copy, EN + TH (tagline, headings) | `src/i18n/ui.ts` (`en` and `th` must have the same keys)        |
| Services (What we do)                    | `src/content/services/{en,th}/*.md`                             |
| Process steps                            | `src/content/process/{en,th}/*.md`                              |
| Lab / projects (`draft: true` hides one) | `src/content/projects/*.md` (`summaryTh` for the Thai page)     |
| FAQ                                      | `src/content/faq/{en,th}/*.md` (`question`, body = answer)      |
| Stack table                              | `src/components/sections/Stack.astro` (tools) + `ui.ts` (areas) |
| About facts                              | `src/components/sections/About.astro`                           |
| Terms / Privacy                          | `src/pages/{terms,privacy}.astro` + `src/pages/th/…`            |
| Contact (form stub: `FORM_ENABLED`)      | `src/components/sections/Contact.astro`                         |
| Colours, type, spacing                   | `src/styles/tokens.css`                                         |
| **Logo (placeholder)**                   | `src/components/brand/Logo.astro` + `public/favicon.svg`        |

Content schemas are validated by zod in `src/content.config.ts`, so a typo in frontmatter fails the build.

## Languages (English + Thai)

- English stays at `/`, `/terms/`, `/privacy/`; Thai is the same page under `/th/` (Astro i18n,
  `prefixDefaultLocale: false`). Every page has `hreflang` en / th / x-default and its own canonical;
  the sitemap lists both languages with alternates.
- Components get their strings with `useLocale(Astro.currentLocale)` from `src/i18n/ui.ts`.
  Add a string to `en` first; TypeScript then fails until `th` has it too.
- When adding a section or content file, add it in **both** `en/` and `th/`.
- The header EN/TH switch links to the same page in the other language and keeps the `#section`.
- Thai line breaks: `src/i18n/thai.ts` keeps listed compound/loan words from splitting mid-word
  (`kw()`, applied by SectionHeader, Card, FAQ and the main copy). Add a word there if a Thai line
  breaks in an odd place.
- Thai glyphs come from IBM Plex Sans Thai (self-hosted, loaded only when Thai text renders).
- The motto, CLI/terminal lines, Tetris and the logo stay in English on purpose.
- The contact form sends `lang`; the email to the team shows which language version was accepted.

## Structure

```
src/
  config/site.ts            site identity + nav (single source of truth)
  content.config.ts         content collection schemas
  content/                  markdown content (services, process, faq in en/ + th/; projects)
  i18n/ui.ts                UI strings for en + th, locale helpers
  i18n/thai.ts              keep Thai words together when lines wrap
  styles/tokens.css         design tokens: light/dark palettes, type scale, spacing
  styles/global.css         reset, base, utilities (.label .mono .pixel .dot-grid .cursor)
  layouts/BaseLayout.astro  <head> SEO/OG/JSON-LD, theme init, skip link
  components/
    brand/Logo.astro        logo: full wordmark (TH → TECH on hover) + <L/> mark
    layout/                 Header (+ mobile menu), Footer, ThemeToggle
    ui/                     SectionHeader, Button, Card, Prompt
    sections/               Hero (+ TetrisGame), Ticker, Services, Process, Lab, Stack, About, Faq, Contact
  scripts/fx/
    pixelField.ts           hero canvas: pixel wordmark + reactive dot grid
    typewriter.ts           terminal typing
    scramble.ts             binary text scramble ([data-scramble])
    tetris.ts / tetrisCore.ts  mono Tetris under the pixel field (rules are pure + tested)
    reducedMotion.ts        reduced-motion guard, visibility helpers, [data-reveal]
  pages/index.astro, terms, privacy, 404.astro
  pages/th/                 Thai versions (index, terms, privacy)
public/  favicon.svg, og-default.png, robots.txt, _headers (Cloudflare)
scripts/generate-brand.mjs  favicon / OG / avatar generator (sharp)
design/                     exported logos (SVG, avatar PNG) for use outside the site
```

## Design system (CI v0)

- Soft monochrome palette: ink `#0F0F0F` and paper `#F2F1EC`, with greys between. There's no brand colour. Dark mode is the default, the site follows the OS setting, and a header toggle lets visitors override it.
- Type: **Geist** for UI and headings, **Geist Mono** for labels and CLI text, and **Silkscreen** (a pixel font) for small accents (ticker, stats). The logo itself is custom-drawn, not a font. Fonts are self-hosted via `@fontsource`.
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

## Contact form (Cloudflare Worker + Resend)

The site is a Cloudflare **Worker with static assets** (`wrangler.jsonc`): `dist/` is served as files, and
`worker/index.ts` handles `POST /api/contact`. `worker/contact.ts` checks the form (honeypot, optional
Turnstile) and emails `larplab.th@gmail.com` through Resend. The form UI in `Contact.astro` is hidden
until `site.contactForm.enabled` is `true` in `src/config/site.ts`.

`wrangler.jsonc` → `name` must match the Worker's name in the Cloudflare dashboard.

**Secrets live only in Cloudflare — never commit them (this repo is public).**
Cloudflare → Workers & Pages → the Worker → Settings → Variables and Secrets:

| Name               | Type   | Where                                                                   |
| ------------------ | ------ | ----------------------------------------------------------------------- |
| `RESEND_API_KEY`   | Secret | dashboard — required                                                    |
| `TURNSTILE_SECRET` | Secret | dashboard — optional; if set, a valid Turnstile token is required       |
| `CONTACT_TO`       | Text   | `wrangler.jsonc` (`larplab.th@gmail.com`)                               |
| `CONTACT_FROM`     | Text   | `wrangler.jsonc` (`contact@larplabth.com`, a domain verified in Resend) |

Notes:

- Turnstile: Cloudflare dashboard → Turnstile → add a widget for `larplabth.com`. Put the **site key**
  in `site.contactForm.turnstileSiteKey` (public) and the **secret key** in `TURNSTILE_SECRET`.
- Secrets added in the dashboard persist across deployments.
- Local check of the Worker: `npm run build && npx wrangler dev` (then http://localhost:8787).

## Consent, legal pages and the contact form

- `src/scripts/consent.ts`: the site only keeps the visitor's theme and Tetris best score in the browser
  **after they accept** the storage notice (`StorageNotice.astro`, shown once; "Storage settings" in the
  footer reopens it). "Essential only" keeps the site fully working and erases anything saved. The
  choice itself is stored as `larp-consent`. Any new thing the site stores must go through
  `prefGet`/`prefSet` and be listed in `/privacy` (section 6).
- `/terms` and `/privacy` (`src/pages`, plain-language drafts, **not legal advice** — have them
  reviewed). Bump `legalVersion` in `site.ts` **and** `LEGAL_VERSION` in `worker/contact.ts` when the text
  changes; the accepted version and time are written into every message email.
- Contact form: required "I agree to the Terms and Privacy Policy" checkbox (the Worker rejects
  messages without it), optional "email me updates" checkbox (the email says `Email updates: YES` only when
  ticked), topic chips, Turnstile.
- Socials (Facebook, Instagram, GitHub) live in `site.socials` and feed the Contact section, the footer
  and the structured data.

## TODO (content phase)

- [x] Logo v1 (custom wordmark + `<L/>` mark)
- [ ] Team profiles (team is anonymous for now)
- [x] FAQ answers (8 questions)
- [ ] Contact form: add Cloudflare secrets, then set `contactForm.enabled = true` (code is done; Resend domain verified)
- [x] Thai version (2026-10-21; Thai copy and legal text need a native/legal review)
- [ ] Lab projects
- [ ] Confirm the Stack list
