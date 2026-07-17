import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          charts: ['recharts']
        }
      }
    }
  },
  define: {
    // Fix for Buffer usage in browser
    global: 'globalThis',
    'process.env': {}
  },
  resolve: {
    alias: {
      // Provide buffer polyfill
      buffer: 'buffer'
    }
  }
})
