/**
 * POST /api/contact — called from worker/index.ts.
 *
 * Receives the contact form, checks it, and emails it to the team through Resend.
 * Secrets are set in Cloudflare (Worker → Settings → Variables and Secrets), never in the repo:
 *   RESEND_API_KEY     (required, secret)
 *   TURNSTILE_SECRET   (optional, secret — if set, a valid Turnstile token is required)
 * Plain variables live in wrangler.jsonc: CONTACT_TO, CONTACT_FROM (a verified larplabth.com address).
 */

export interface ContactEnv {
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

const ALLOWED_ORIGINS = new Set([
  'https://larplabth.com',
  'http://localhost:4321',
  'http://localhost:8787',
]);

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

/** Strip control characters / newlines so user input can't inject mail headers. */
const oneLine = (s: string, max: number) =>
  s
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .trim()
    .slice(0, max);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const handleContact = async (request: Request, env: ContactEnv): Promise<Response> => {
  const origin = request.headers.get('origin');
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ ok: false, error: 'forbidden' }, 403);

  if (!env.RESEND_API_KEY) return json({ ok: false, error: 'not_configured' }, 503);

  let data: Record<string, unknown>;
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  const str = (k: string) => (typeof data[k] === 'string' ? (data[k] as string) : '');

  // Honeypot: real visitors never see or fill this field. Pretend success to bots.
  if (str('website')) return json({ ok: true });

  const name = oneLine(str('name'), 100);
  const email = oneLine(str('email'), 200);
  const company = oneLine(str('company'), 120);
  const message = str('message').replace(/\r\n/g, '\n').trim().slice(0, 5000);

  if (!name) return json({ ok: false, error: 'name_required' }, 400);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'email_invalid' }, 400);
  if (message.length < 10) return json({ ok: false, error: 'message_too_short' }, 400);

  if (env.TURNSTILE_SECRET) {
    const token = str('turnstileToken');
    if (!token) return json({ ok: false, error: 'captcha_required' }, 400);
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: token,
        remoteip: request.headers.get('cf-connecting-ip') ?? '',
      }),
    });
    const result = (await verify.json().catch(() => ({}))) as { success?: boolean };
    if (!result.success) return json({ ok: false, error: 'captcha_failed' }, 400);
  }

  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM ?? 'LARP LAB TH <onboarding@resend.dev>',
      to: [env.CONTACT_TO ?? 'larplab.th@gmail.com'],
      reply_to: email,
      subject: oneLine(`[larplabth.com] ${name}${company ? ` (${company})` : ''}`, 150),
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || '-'}\n\n${message}\n`,
    }),
  });

  if (!sent.ok) return json({ ok: false, error: 'send_failed' }, 502);
  return json({ ok: true });
};

export const methodNotAllowed = (): Response =>
  json({ ok: false, error: 'method_not_allowed' }, 405);
