import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    // Explicitly include only our new authentication tests
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      'tests/**/*.{test,spec}.{jsx,tsx}'
    ],
    
    // Explicitly exclude legacy tests to maintain TDD constitutional compliance
    exclude: [
      'node_modules/**',
      'legacy-esmuseum-nuxt3/**',
      'dist/**',
      '.nuxt/**',
      'coverage/**'
    ],
    
    // Test environment setup
    environment: 'happy-dom',
    
    // Add globals for Vue composables
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'legacy-esmuseum-nuxt3/**',
        'coverage/**',
        'dist/**',
        '.nuxt/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/node_modules/**'
      ]
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