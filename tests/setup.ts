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

// Mock useCookie composable for testing
const cookieStore = new Map<string, string | null>()

const mockUseCookie = <T = string | null>(name: string, options?: any) => {
  const cookieRef = ref<T>(cookieStore.get(name) as T || options?.default?.() || null)
  
  // Watch for changes and store in mock cookie store
  const originalValue = cookieRef.value
  Object.defineProperty(cookieRef, 'value', {
    get() {
      return cookieStore.get(name) as T || options?.default?.() || null
    },
    set(newValue: T) {
      if (newValue === null || newValue === undefined) {
        cookieStore.delete(name)
      } else {
        cookieStore.set(name, newValue as string)
      }
    },
    enumerable: true,
    configurable: true
  })
  
  return cookieRef
}

// Make composables available globally for auto-imports
;(globalThis as any).useI18n = mockUseI18n
;(globalThis as any).useCookie = mockUseCookie

// Mock the #app module for Nuxt
vi.mock('#app', () => ({
  useI18n: mockUseI18n,
  useCookie: mockUseCookie
}))

// Reset function for tests
const resetMocks = () => {
  mockLocale.value = 'et'
  mockT.mockImplementation((key: string) => defaultTranslations[key] || key)
  mockSetLocale.mockClear()
  cookieStore.clear()
  vi.clearAllMocks()
}

// Export mocks for test files to use
export { mockLocale, mockSetLocale, mockT, mockUseI18n, mockUseCookie, cookieStore, resetMocks }