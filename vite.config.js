import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    allowedHosts: true,

    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,

        headers: {
          Origin: 'http://localhost:5173',
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  optimizeDeps: {
    include: ['@zxing/browser', '@zxing/library'],
  },

  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',

      manifest: {
        name: 'Encuestas de 5S',
        short_name: 'Encuestas 5S',
        description: 'Aplicación para gestión y ejecución de auditorías 5S',
        theme_color: '#f8fafc',
        background_color: '#f8fafc',

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
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
});
