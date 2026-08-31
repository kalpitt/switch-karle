// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import AstroPWA from '@vite-pwa/astro'
import { SITE, BASE } from './site.config.mjs'

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: [
        'icon.svg',
        'icon-180.png',
        'icon-512.png',
        'favicon.svg',
        'icons.svg',
        'og/default.png',
      ],
      manifest: false,
      workbox: {
        // MUST be present as a key. @vite-pwa/astro otherwise defaults this to
        // `base` (the home page), so an offline reload of /decoder would render
        // the home shell. Precache-all HTML + no SPA fallback = each URL is itself.
        navigateFallback: undefined,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,webmanifest,xml,txt}'],
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
    plugins: [tailwindcss()],
  },
})
