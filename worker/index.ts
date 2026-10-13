/**
 * Cloudflare Worker entry. The built site (dist/) is served as static assets; the Worker only
 * runs for requests that are not files, which today means POST /api/contact.
 */
import { handleContact, methodNotAllowed, type ContactEnv } from './contact';

interface Env extends ContactEnv {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/contact') {
      return request.method === 'POST' ? handleContact(request, env) : methodNotAllowed();
    }

    return env.ASSETS.fetch(request);
  },
};
