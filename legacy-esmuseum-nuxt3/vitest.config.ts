import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    env: {
      // Override environment for tests
      NUXT_ENTU_URL: 'http://localhost:3001',
      NUXT_ENTU_ACCOUNT: 'test-account',
      NUXT_ENTU_KEY: 'test-key-not-real'
    }
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url))
    }
  }
})
