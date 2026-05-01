import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/cbf-classroom/',
  build: {
    minify: false,
    outDir: 'dist',
  },
})
