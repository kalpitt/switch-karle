/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  // Relative base: the same build must serve at the domain root
  // (chhalaang.tiwari-kalpit.workers.dev) AND under a subpath
  // (kalpit.me/switch-karle via GitHub Pages project-page routing).
  base: './',
  plugins: [react(), tailwindcss(), cloudflare()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})