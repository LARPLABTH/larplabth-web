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
    brand/Logo.astro        logo: full wordmark (TH → TECH on hover) + <L/> mark
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

## Contact form (Cloudflare Pages Function + Resend)

`functions/api/contact.ts` receives the form, checks it (honeypot, optional Turnstile), and emails
`larplab.th@gmail.com` through Resend. The form UI in `Contact.astro` is hidden until
`site.contactForm.enabled` is `true` in `src/config/site.ts`.

**Secrets live only in Cloudflare — never commit them (this repo is public).**
Cloudflare → Workers & Pages → `larplabth-web` → Settings → Variables and Secrets (Production):

| Name               | Type   | Notes                                                   |
| ------------------ | ------ | ------------------------------------------------------- |
| `RESEND_API_KEY`   | Secret | required                                                |
| `TURNSTILE_SECRET` | Secret | optional; if set, a valid Turnstile token is required   |
| `CONTACT_TO`       | Text   | optional, default `larplab.th@gmail.com`                |
| `CONTACT_FROM`     | Text   | optional, default `LARP LAB TH <onboarding@resend.dev>` |

Notes:

- With the default `onboarding@resend.dev` sender, Resend only delivers to the email address of the
  Resend account owner. To send from `@larplabth.com`, verify the domain in Resend (it can add the DNS
  records in Cloudflare automatically), then set `CONTACT_FROM`.
- Turnstile: Cloudflare dashboard → Turnstile → add a widget for `larplabth.com`. Put the **site key**
  in `site.contactForm.turnstileSiteKey` (public) and the **secret key** in `TURNSTILE_SECRET`.
- New variables apply on the next deployment — redeploy after adding them.
- The function is not run by `npm run dev`; test the live site, or use `npx wrangler pages dev dist`.

## TODO (content phase)

- [x] Logo v1 (custom wordmark + `<L/>` mark)
- [ ] Team profiles (team is anonymous for now)
- [x] FAQ answers (8 questions)
- [ ] Contact form: add Cloudflare secrets, then set `contactForm.enabled = true` (code is done)
- [ ] Thai version, after the first project is added
- [ ] Lab projects
- [ ] Confirm the Stack list
