import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Configuración para SPA - todas las rutas deben servir index.html
    historyApiFallback: true
  },
  build: {
    // Asegurar que el build también maneje las rutas SPA
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
}) 