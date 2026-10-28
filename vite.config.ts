/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/gr-app/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Primeiro teste de cada arquivo paga o import a frio de Radix/day-picker:
    // com a máquina ocupada passava dos 5s padrão.
    testTimeout: 15_000,
    env: {
      VITE_API_URL: 'http://api.test',
      VITE_GYMRATS_KEY: 'test-key',
    },
  },
})
