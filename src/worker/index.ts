/**
 * Cloudflare Worker entry for the callback fixer. Deployed separately from the
 * static site: `npx wrangler deploy -c src/worker/wrangler.toml` (see DEPLOY.md).
 * Astro never imports this folder; it builds no page.
 */
import { handleFix, type Env } from './fix'

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleFix(request, env)
  },
}
