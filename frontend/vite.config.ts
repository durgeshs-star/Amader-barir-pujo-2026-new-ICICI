import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Target modern browsers — smaller output, faster parsing
    target: 'es2020',
    // Enable CSS minification
    cssMinify: true,
    // Increase chunk size warning threshold (inform, not block)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // ── Manual vendor chunk splitting ──────────────────────────────────
        // Splits large vendor libraries into separate cacheable chunks so the
        // browser can load them in parallel and cache them independently.
        manualChunks: (id: string) => {
          // React core — most stable, cache longest
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // Router — changes only on router upgrades
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          // Framer Motion — large, separate chunk
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          // Icon libraries — large, rarely change
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-icons')) {
            return 'ui-icons';
          }
          // Form validation libraries
          if (
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/@hookform') ||
            id.includes('node_modules/zod')
          ) {
            return 'forms';
          }
          // Toast notifications
          if (id.includes('node_modules/react-toastify')) {
            return 'toast';
          }
          // Axios — network requests
          if (id.includes('node_modules/axios')) {
            return 'network';
          }
          // Fontsource — keep separate for long-term caching
          if (id.includes('node_modules/@fontsource')) {
            return 'fonts';
          }
        },
        // Use content-hash filenames for immutable caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})