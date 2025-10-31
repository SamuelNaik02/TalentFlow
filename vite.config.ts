import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use /TalentFlow/ base for GitHub Pages deployment
// This ensures all assets and routes work correctly on GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/TalentFlow/',
})


