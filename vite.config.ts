import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'AmtsHelfer AI — Behördenbriefe einfach verstehen',
        short_name: 'AmtsHelfer',
        description: 'AmtsHelfer AI hilft Ihnen, Behördenbriefe, Versicherungsbriefe und andere Dokumente besser zu verstehen. Keine Rechtsberatung.',
        start_url: '/home',
        display: 'standalone',
        background_color: '#f9fafb',
        theme_color: '#2563EB',
        orientation: 'portrait',
        lang: 'de',
        categories: ['utilities', 'productivity', 'business'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Prevent the service worker from intercepting App Link verification
        navigateFallbackDenylist: [/^\/.well-known\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
