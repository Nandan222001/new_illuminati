import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Keep framework + i18n libs in their own cacheable chunks so page
        // chunks stay small and rarely change. Function form so SSR builds
        // (which externalize react) are unaffected.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n'
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('react-router') || id.includes('/scheduler/')) return 'vendor'
          return undefined
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    // Allow proxied preview hosts (e.g. *.e2b.app) as well as localhost.
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
  },
})
