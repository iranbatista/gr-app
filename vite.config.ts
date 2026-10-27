/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/gr-app/',
  plugins: [react(), tailwindcss()],
  // Dev: a API só libera CORS para o domínio do Pages. O proxy faz a chamada
  // server-side, então o browser vê mesma origem (VITE_API_URL=http://localhost:5173/api).
  server: {
    proxy: {
      '/api': {
        target: 'https://gr-api.iranbatista.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    env: {
      VITE_API_URL: 'http://api.test',
      VITE_GYMRATS_KEY: 'test-key',
    },
  },
})
