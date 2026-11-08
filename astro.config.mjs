// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { AstroPWAIntegration as AstroPWA } from '@vite-pwa/astro'
import { SITE, BASE } from './site.config.mjs'

/**
 * The page's dictionary is a dynamic import that starts only once the island
 * code has loaded and run (src/i18n/index.ts), and hydration waits for it. This
 * records the hashed file of each language's dictionary as the client bundle is
 * written, so Base.astro can put a <link rel="modulepreload"> for it in the
 * HTML and the browser fetches it alongside everything else (N-04). Astro
 * renders the pages after the client build, in the same process. In dev there
 * is no hashed file and no link.
 */
function dictionaryPreload() {
  const entries = { en: '/src/i18n/en.ts', hi: '/src/i18n/hi-dictionary.ts' }
  return {
    name: 'switch-karle:dictionary-preload',
    /** @param {unknown} _ @param {Record<string, { type: string, fileName: string, facadeModuleId?: string | null }>} bundle */
    generateBundle(_, bundle) {
      const found = /** @type {Record<string, string>} */ ({})
      for (const chunk of Object.values(bundle)) {
        // Client chunks only: the server build writes its own copies elsewhere.
        if (chunk.type !== 'chunk' || !chunk.fileName.startsWith('_astro/')) continue
        for (const [lang, path] of Object.entries(entries)) {
          if (chunk.facadeModuleId?.replaceAll('\\', '/').endsWith(path)) found[lang] = chunk.fileName
        }
      }
      if (Object.keys(found).length > 0) /** @type {any} */ (globalThis).__skDictionaryChunks = found
    },
  }
}

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      // The icons, favicon and manifest in public/ are precached by
      // globPatterns below. No includeAssets: v2 of this plugin reads it only
      // when `manifest` is an object, so with `manifest: false` it did
      // nothing (under v1 it listed each icon a second time). check:base
      // fails if any of them, a font or a page is missing from sw.js.
      manifest: false,
      generateSW: {
        // MUST be present as a key. @vite-pwa/astro otherwise defaults this to
        // `base` (the home page), so an offline reload of /decoder would render
        // the home shell. Precache-all HTML + no SPA fallback = each URL is itself.
        navigateFallback: undefined,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,webmanifest,xml,txt}'],
        // GitHub Pages serves 404.html for unknown paths but answers /404/ itself with
        // HTTP 404. A precache entry that is not 200 makes Workbox abort the whole
        // install ("bad-precaching-response"), so offline never worked in production.
        globIgnores: [
          '404.html',
          // Share images: fetched by link-preview crawlers only.
          'og/**',
          // Inter subsets for scripts the site never uses (the latin face and
          // the rupee subset are declared in src/index.css).
          '**/inter-cyrillic*',
          '**/inter-greek*',
          '**/inter-vietnamese*',
        ],
        cleanupOutdatedCaches: true,
      },
      // No experimental directoryAndTrailingSlashHandler: it added a second
      // entry for every page ("decoder/" beside "decoder/index.html"), so a
      // first visit downloaded each page twice. The plugin's own transform
      // already lists each page once, as "decoder/" (N-06).
    }),
  ],
  // The site has no Markdown or code blocks. Turning the highlighter off
  // changes no page; it only stops Astro warning on every build that Shiki's
  // inline styles would not fit the CSP below.
  markdown: { syntaxHighlight: false },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "connect-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "base-uri 'self'",
        "form-action 'none'",
        "object-src 'none'",
        // frame-ancestors is ignored when delivered in a <meta> element, and
        // GitHub Pages cannot set headers. Listing it only logs a console error.
      ],
    },
  },
  vite: {
    plugins: [tailwindcss(), dictionaryPreload()],
  },
})
