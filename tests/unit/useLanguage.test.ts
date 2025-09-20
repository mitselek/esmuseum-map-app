import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useLanguage, resetLanguageState } from '~/app/composables/useLanguage'
import { mockLocale, mockSetLocale, mockT, resetMocks } from '../setup'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock navigator.language
Object.defineProperty(navigator, 'language', {
  value: 'et',
  configurable: true
})

describe('useLanguage composable', () => {
  beforeEach(() => {
    resetMocks()
    resetLanguageState()
    localStorageMock.getItem.mockReturnValue(null)
    mockLocale.value = 'et'
    Object.defineProperty(navigator, 'language', {
      value: 'et',
      configurable: true
    })
  })

  it('initializes with default Estonian language', () => {
    const { currentLanguage, availableLanguages } = useLanguage()
    
    expect(currentLanguage.value.code).toBe('et')
    expect(currentLanguage.value.isDefault).toBe(true)
    expect(availableLanguages.value).toHaveLength(3)
  })

  it('provides all supported languages', () => {
    const { availableLanguages } = useLanguage()
    
    const codes = availableLanguages.value.map(lang => lang.code)
    expect(codes).toEqual(['et', 'uk', 'en-GB'])
  })

  it('switches language and updates storage', async () => {
    const { switchLanguage, currentLanguage } = useLanguage()
    
    await switchLanguage('uk')
    
    expect(currentLanguage.value.code).toBe('uk')
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'esmuseum-language-preference',
      expect.stringContaining('"preferredLanguage":"uk"')
    )
  })

  it('loads saved preference from localStorage', () => {
    const savedPreference = {
      preferredLanguage: 'uk',
      autoDetected: false,
      timestamp: Date.now()
    }
    
    // Reset state and set up localStorage BEFORE calling useLanguage
    resetLanguageState()
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedPreference))
    
    const { currentLanguage } = useLanguage()
    
    expect(currentLanguage.value.code).toBe('uk')
  })

  it('auto-detects Ukrainian from browser language', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'uk',
      configurable: true
    })
    
    const { currentLanguage } = useLanguage()
    
    expect(currentLanguage.value.code).toBe('uk')
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'esmuseum-language-preference',
      expect.stringContaining('"autoDetected":true')
    )
  })

  it('falls back to Estonian for unsupported browser language', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'fr-FR',
      configurable: true
    })
    
    const { currentLanguage } = useLanguage()
    
    expect(currentLanguage.value.code).toBe('et')
  })

  it('handles localStorage errors gracefully', async () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded')
    })
    
    const { switchLanguage } = useLanguage()
    
    // Should not throw error
    expect(async () => {
      await switchLanguage('uk')
    }).not.toThrow()
  })

  it('detects British English from browser language', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'en-GB',
      configurable: true
    })
    
    const { currentLanguage } = useLanguage()
    
    expect(currentLanguage.value.code).toBe('en-GB')
  })

  it('maps en-US to en-GB', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      configurable: true
    })
    
    const { currentLanguage } = useLanguage()
    
    expect(currentLanguage.value.code).toBe('en-GB')
  })

  it('provides translation function', () => {
    const { t } = useLanguage()
    
    expect(typeof t).toBe('function')
    expect(t('greeting.welcome')).toBeDefined()
  })

  it('warns when trying to switch to unsupported language', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    const { switchLanguage } = useLanguage()
    
    // Try to switch to an unsupported language
    await switchLanguage('fr' as any)
    
    expect(consoleWarnSpy).toHaveBeenCalledWith('Unsupported language code: fr')
    consoleWarnSpy.mockRestore()
  })

  it('handles setLocale errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock setLocale to throw an error
    mockSetLocale.mockRejectedValueOnce(new Error('Locale setting failed'))
    
    const { switchLanguage } = useLanguage()
    
    await switchLanguage('uk')
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to switch language:', expect.any(Error))
    consoleErrorSpy.mockRestore()
  })

  it('handles corrupted localStorage data gracefully', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    // Mock localStorage to return invalid JSON
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue('invalid-json'),
      setItem: vi.fn(),
      removeItem: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })
    
    // This should trigger the error handling in loadPreference
    const { currentLanguage } = useLanguage()
    
    expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to load language preference:', expect.any(Error))
    expect(currentLanguage.value.code).toBe('et') // Should fallback to default
    
    consoleWarnSpy.mockRestore()
  })

  it('handles invalid stored language code gracefully', () => {
    // Mock localStorage to return invalid language code
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(JSON.stringify({
        preferredLanguage: 'invalid-code',
        isAutoDetected: false
      })),
      setItem: vi.fn(),
      removeItem: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })
    
    const { currentLanguage } = useLanguage()
    
    // Should fallback to default language when stored preference is invalid
    expect(currentLanguage.value.code).toBe('et')
  })
})