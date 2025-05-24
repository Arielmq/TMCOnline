import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 🔥 importante

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 🔧 esto soluciona el problema
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    historyApiFallback: true,
  },
})