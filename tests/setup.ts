import { vi } from 'vitest'
import { ref } from 'vue'

// Suppress expected warnings during tests
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

console.warn = vi.fn((message: string, ...args: any[]) => {
  // Suppress localStorage-related warnings during tests
  if (typeof message === 'string' && message.includes('Failed to save language preference')) {
    return
  }
  originalConsoleWarn(message, ...args)
})

console.error = vi.fn((message: string, ...args: any[]) => {
  // Suppress localStorage-related errors during tests
  if (typeof message === 'string' && message.includes('Failed to save language preference')) {
    return
  }
  originalConsoleError(message, ...args)
})

// Global mocks for Nuxt composables
const mockLocale = ref('et')
const mockSetLocale = vi.fn(async (newLocale: string) => {
  // Actually update the locale ref when setLocale is called
  mockLocale.value = newLocale
})

// Translation function with default Estonian translations
const defaultTranslations: Record<string, string> = {
  'greeting.welcome': 'Tere tulemast ESMuseumi kaardirakenduse'
}

const mockT = vi.fn((key: string) => {
  return defaultTranslations[key] || key
})

// Mock useI18n composable globally
const mockUseI18n = () => ({
  locale: mockLocale,
  setLocale: mockSetLocale,
  t: mockT
})

// Make useI18n available globally for auto-imports
;(globalThis as any).useI18n = mockUseI18n

// Mock the #app module for Nuxt
vi.mock('#app', () => ({
  useI18n: mockUseI18n
}))

// Reset function for tests
const resetMocks = () => {
  mockLocale.value = 'et'
  mockT.mockImplementation((key: string) => defaultTranslations[key] || key)
  mockSetLocale.mockClear()
  vi.clearAllMocks()
}

// Export mocks for test files to use
export { mockLocale, mockSetLocale, mockT, mockUseI18n, resetMocks }