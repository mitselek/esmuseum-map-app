import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup-globals.ts', './tests/setup.ts'],
    server: {
      deps: {
        inline: [/\.vue$/]
      }
    },
    env: {
      // Override environment for tests
      NUXT_ENTU_URL: 'http://localhost:3001',
      NUXT_ENTU_ACCOUNT: 'test-account',
      NUXT_ENTU_KEY: 'test-key-not-real'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        statements: 60,
        branches: 55,
        functions: 55,
        lines: 60
      },
      include: [
        'app/composables/**/*.ts',
        'app/utils/**/*.ts',
        'app/components/**/*.vue',
        'server/api/**/*.ts',
        'server/utils/**/*.ts',
        'types/**/*.ts'
      ],
      exclude: [
        'app/plugins/**',
        '**/*.d.ts',
        '**/*.spec.ts',
        '**/*.test.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url))
    }
  }
})
