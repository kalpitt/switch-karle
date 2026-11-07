// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import AstroPWA from '@vite-pwa/astro'
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
      // The share images (og/*) are deliberately absent: only link-preview
      // crawlers fetch them, never the page, so precaching them would spend a
      // visitor's data on files they never see.
      includeAssets: [
        'icon.svg',
        'icon-180.png',
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-512.png',
        'favicon.ico',
        'favicon.svg',
        'icons.svg',
      ],
      manifest: false,
      workbox: {
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
      experimental: {
        directoryAndTrailingSlashHandler: true,
      },
    }),
  ],
  experimental: {
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
