import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Pre-bundlea Firebase para que el primer arranque sea mucho más rápido
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'react',
      'react-dom',
      'react-router-dom',
      'react-hot-toast',
    ],
  },
  build: {
    // Dividir chunks para que el sitio público no cargue código del admin
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          vendor:   ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})