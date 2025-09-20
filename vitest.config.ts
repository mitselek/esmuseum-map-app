import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    // Explicitly include only our new authentication tests
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      'tests/**/*.{test,spec}.{jsx,tsx}'
    ],
    
    // Explicitly exclude legacy tests and E2E tests to maintain TDD constitutional compliance
    exclude: [
      'node_modules/**',
      'legacy-esmuseum-nuxt3/**',
      'tests/e2e/**',  // Exclude E2E tests - these run with Playwright
      'dist/**',
      '.nuxt/**',
      'coverage/**'
    ],
    
    // Test environment setup
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    
    // Add globals for Vue composables
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'app/**/*.{ts,vue}',
        'composables/**/*.{ts,vue}',
        'components/**/*.{ts,vue}',
        'pages/**/*.{ts,vue}'
      ],
      exclude: [
        'legacy-esmuseum-nuxt3/**',
        'coverage/**',
        'dist/**',
        '.nuxt/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/node_modules/**',
        'tests/**',
        'scripts/**',
        'specs/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
      '~~': fileURLToPath(new URL('./', import.meta.url)),
      '@@': fileURLToPath(new URL('./', import.meta.url)),
      '~/composables': fileURLToPath(new URL('./app/composables', import.meta.url)),
      '~/types': fileURLToPath(new URL('./app/types', import.meta.url))
    }
  }
})