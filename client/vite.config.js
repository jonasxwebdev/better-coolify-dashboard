import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['@heroicons/react/24/outline', '@heroicons/react/24/solid'],
          'vendor-i18n': ['react-i18next', 'i18next'],
          'vendor-toast': ['react-hot-toast'],
          'vendor-tooltip': ['react-tooltip'],
        },
      },
    },
  },
})
