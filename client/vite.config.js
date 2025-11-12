import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // ← AJOUTEZ CETTE LIGNE

export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // ← AJOUTEZ CE PLUGIN
  ],
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000
  }
})