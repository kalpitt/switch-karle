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
      includeAssets: ['icon.svg', 'icon-180.png', 'icon-512.png', 'favicon.svg', 'icons.svg'],
      manifest: false,
      workbox: {
        // MUST be present as a key. @vite-pwa/astro otherwise defaults this to
        // `base` (the home page), so an offline reload of /decoder would render
        // the home shell. Precache-all HTML + no SPA fallback = each URL is itself.
        navigateFallback: undefined,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,webmanifest}'],
        cleanupOutdatedCaches: true,
      },
      experimental: {
        directoryAndTrailingSlashHandler: true,
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
