import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves a project site at https://<user>.github.io/<repo>/,
  // so assets must be requested from that sub-path.
  // ⚠️ This MUST match your repository name. If you name the repo something
  // other than "geopolitical-dashboard", change the string below to match.
  base: '/geopolitical-dashboard/',
})
