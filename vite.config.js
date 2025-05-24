import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  // 👇 Esto ayuda para desarrollo, pero en Vercel también puede ayudar
  server: {
    historyApiFallback: true
  }
})