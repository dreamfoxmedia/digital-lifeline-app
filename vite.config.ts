import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://mijn.digitallifeline.nl',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
