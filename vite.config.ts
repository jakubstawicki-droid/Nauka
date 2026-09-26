import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // względne ścieżki — działa na GitHub Pages w podkatalogu i na Vercel/Netlify
  base: './',
  build: {
    // główna paczka zawiera dane (150 pytań, 110 kart, kompendium) — i tak trafia do pamięci offline
    chunkSizeWarningLimit: 1500,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Historia sztuki — egzamin ustny LSP Gersona',
        short_name: 'Historia sztuki',
        description: 'Nauka do egzaminu ustnego z historii sztuki: pytania, karty dzieł, quizy, trener analizy, egzamin próbny.',
        lang: 'pl',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f6f1e9',
        theme_color: '#9c3d25',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // tylko alfabety łacińskie — cyrylica/greka/wietnamski nie są potrzebne
        globIgnores: ['**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            // odpowiedzi API Wikipedii/Commons (wyszukanie pliku i licencji)
            urlPattern: ({ url }) => /(^|\.)wikipedia\.org$|^commons\.wikimedia\.org$/.test(url.hostname) && url.pathname.endsWith('/api.php'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'wiki-api', expiration: { maxEntries: 600, maxAgeSeconds: 60 * 24 * 3600 } },
          },
          {
            // reprodukcje — zapisywane przy pierwszym obejrzeniu, potem działają offline
            urlPattern: ({ url }) => url.hostname === 'upload.wikimedia.org',
            handler: 'CacheFirst',
            options: {
              cacheName: 'wiki-images',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 24 * 3600, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
