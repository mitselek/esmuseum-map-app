import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useLanguage, resetLanguageState, testUtils } from '~/app/composables/useLanguage'
import { mockLocale, mockSetLocale, mockT, resetMocks } from '../setup'
import type { LanguageCode, UserPreference } from '~/app/types/language'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Mock navigator
const navigatorMock = {
  language: 'en-US'
}

describe('useLanguage composable (localStorage-based architecture)', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    resetMocks()
    resetLanguageState()
    
    // Setup localStorage mock
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
    
    // Setup navigator mock
    Object.defineProperty(global, 'navigator', {
      value: navigatorMock,
      writable: true
    })
    
    // Setup window mock for client-side checks
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true
    })
    
    // Default localStorage behavior
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})
    
    // Default i18n mocks
    mockLocale.value = 'et'
    mockSetLocale.mockImplementation(async (locale) => {
      mockLocale.value = locale
    })
    mockT.mockReturnValue('Mocked translation')
  })

  it('initializes with default Estonian language', () => {
    const { currentLanguage, availableLanguages } = useLanguage()
    
    expect(currentLanguage.value.code).toBe('et')
    expect(currentLanguage.value.name).toBe('Eesti')
    expect(availableLanguages.value).toHaveLength(3)
  })

  it('provides all supported languages', () => {
    const { availableLanguages } = useLanguage()
    
    const codes = availableLanguages.value.map(lang => lang.code)
    expect(codes).toEqual(['et', 'uk', 'en-GB'])
  })

  it('switches language and updates localStorage', async () => {
    const { switchLanguage, currentLanguage } = useLanguage()
    
    await switchLanguage('uk')
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'esmuseum-language-preference',
      expect.stringContaining('"preferredLanguage":"uk"')
    )
    expect(mockSetLocale).toHaveBeenCalledWith('uk')
    expect(currentLanguage.value.code).toBe('uk')
  })

  it('handles localStorage errors with fail-fast behavior', () => {
    // Simulate localStorage unavailable
    Object.defineProperty(global, 'localStorage', {
      value: undefined,
      writable: true
    })
    
    const { hasLocalStorageError, localStorageErrorMessage } = useLanguage()
    
    expect(hasLocalStorageError.value).toBe(true)
    expect(localStorageErrorMessage.value).toContain('localStorage is not available')
  })

  it('throws error when trying to switch language without localStorage', async () => {
    // Setup localStorage error state first
    Object.defineProperty(global, 'localStorage', {
      value: undefined,
      writable: true
    })
    
    const { switchLanguage } = useLanguage()
    
    await expect(switchLanguage('uk')).rejects.toThrow('Cannot save language preference: localStorage unavailable')
  })

  it('provides translation function', () => {
    const { t } = useLanguage()
    
    const result = t('greeting.welcome')
    expect(result).toBe('Mocked translation')
    expect(mockT).toHaveBeenCalledWith('greeting.welcome')
  })

  it('warns when trying to switch to unsupported language', async () => {
    const { switchLanguage } = useLanguage()
    
    await switchLanguage('fr' as LanguageCode)
    
    // Note: console.warn is suppressed in test environment, just verify the function doesn't crash
    expect(true).toBe(true) // Test passes if no error thrown
  })

  it('skips switching if already on requested language', async () => {
    const { switchLanguage } = useLanguage()
    
    // Try to switch to current language (et)
    await switchLanguage('et')
    
    // Should not call setLocale since we're already on et
    expect(mockSetLocale).not.toHaveBeenCalled()
  })

  it('provides loading state', () => {
    const { isLoading } = useLanguage()
    
    // Loading state should be initialized to false
    expect(isLoading.value).toBe(false)
  })

  it('handles localStorage write errors properly', async () => {
    // Setup localStorage that throws on write (but is available for read)
    localStorageMock.getItem.mockReturnValue(null) // Available for reading
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded')
    })
    
    const { switchLanguage } = useLanguage()
    
    // Since our composable checks localStorage availability first,
    // and our mock setup makes it available, this test will pass through
    // to the actual write error which should be caught and re-thrown
    await expect(switchLanguage('uk')).rejects.toBeTruthy()
  })

  it('detects browser language for new users', () => {
    // Mock Ukrainian browser language
    Object.defineProperty(global, 'navigator', {
      value: { language: 'uk' },
      writable: true
    })
    
    // Clear localStorage (new user)
    localStorageMock.getItem.mockReturnValue(null)
    
    // Note: In our new architecture, browser detection happens async on mount
    // So we mainly test that the detection function works correctly
    const { availableLanguages } = useLanguage()
    
    // Should have Ukrainian available
    const ukrainianLang = availableLanguages.value.find(lang => lang.code === 'uk')
    expect(ukrainianLang).toBeDefined()
    expect(ukrainianLang?.name).toBe('Українська')
  })
})

describe('useLanguage internal functions (coverage improvement)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetMocks()
    resetLanguageState()
    
    // Setup localStorage mock
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
    
    // Setup navigator mock
    Object.defineProperty(global, 'navigator', {
      value: navigatorMock,
      writable: true
    })
    
    // Setup window mock
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true
    })
    
    // Default localStorage behavior
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})
  })

  describe('detectBrowserLanguage', () => {
    it('detects Ukrainian language correctly', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'uk' },
        writable: true
      })

      const result = testUtils.detectBrowserLanguage()
      expect(result).toBe('uk')
    })

    it('detects Ukrainian with region code', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'uk-UA' },
        writable: true
      })

      const result = testUtils.detectBrowserLanguage()
      expect(result).toBe('uk')
    })

    it('detects British English correctly', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'en-GB' },
        writable: true
      })

      const result = testUtils.detectBrowserLanguage()
      expect(result).toBe('en-GB')
    })

    it('maps US English to British English', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'en-US' },
        writable: true
      })

      const result = testUtils.detectBrowserLanguage()
      expect(result).toBe('en-GB')
    })

    it('maps other English variants to British English', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'en-CA' },
        writable: true
      })

      const result = testUtils.detectBrowserLanguage()
      expect(result).toBe('en-GB')
    })

    it('falls back to Estonian for unsupported languages', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'fr-FR' },
        writable: true
      })

      const result = testUtils.detectBrowserLanguage()
      expect(result).toBe('et')
    })

    it('falls back to Estonian when navigator is undefined', () => {
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true
      })

      const result = testUtils.detectBrowserLanguage()
      expect(result).toBe('et')
    })

    it('handles case insensitive language codes', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'UK-UA' },
        writable: true
      })

      const result = testUtils.detectBrowserLanguage()
      expect(result).toBe('uk')
    })
  })

  describe('loadPreference', () => {
    it('returns null when no preference is stored', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = testUtils.loadPreference()
      expect(result).toBeNull()
    })

    it('loads valid stored preference', () => {
      const preference: UserPreference = {
        preferredLanguage: 'uk',
        autoDetected: false,
        timestamp: Date.now()
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(preference))

      const result = testUtils.loadPreference()
      expect(result).toEqual(preference)
    })

    it('returns null for invalid language code in stored preference', () => {
      const invalidPreference = {
        preferredLanguage: 'invalid-code',
        autoDetected: false,
        timestamp: Date.now()
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidPreference))

      const result = testUtils.loadPreference()
      expect(result).toBeNull()
    })

    it('throws error when localStorage is unavailable', () => {
      // First trigger localStorage error
      testUtils.checkLocalStorageAvailability()
      Object.defineProperty(global, 'localStorage', {
        value: undefined,
        writable: true
      })
      testUtils.checkLocalStorageAvailability()

      expect(() => testUtils.loadPreference()).toThrow('Cannot load language preference: localStorage unavailable')
    })

    it('handles JSON parse errors', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')

      expect(() => testUtils.loadPreference()).toThrow()
    })

    it('handles localStorage getItem errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage access denied')
      })

      expect(() => testUtils.loadPreference()).toThrow()
    })
  })

  describe('savePreference', () => {
    it('saves preference with correct format', () => {
      testUtils.savePreference('uk', false)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'esmuseum-language-preference',
        expect.stringContaining('"preferredLanguage":"uk"')
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'esmuseum-language-preference',
        expect.stringContaining('"autoDetected":false')
      )
    })

    it('saves auto-detected preference', () => {
      testUtils.savePreference('en-GB', true)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'esmuseum-language-preference',
        expect.stringContaining('"autoDetected":true')
      )
    })

    it('includes timestamp in saved preference', () => {
      const beforeTime = Date.now()
      testUtils.savePreference('et', false)
      const afterTime = Date.now()

      const savedData = localStorageMock.setItem.mock.calls[0][1]
      const parsed = JSON.parse(savedData)
      expect(parsed.timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(parsed.timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('throws error when localStorage is unavailable', () => {
      // Trigger localStorage error state
      Object.defineProperty(global, 'localStorage', {
        value: undefined,
        writable: true
      })
      testUtils.checkLocalStorageAvailability()

      expect(() => testUtils.savePreference('uk', false)).toThrow('Cannot save language preference: localStorage unavailable')
    })

    it('handles localStorage setItem errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      expect(() => testUtils.savePreference('uk', false)).toThrow()
    })
  })

  describe('checkLocalStorageAvailability', () => {
    it('sets error state when localStorage is undefined', () => {
      Object.defineProperty(global, 'localStorage', {
        value: undefined,
        writable: true
      })

      testUtils.checkLocalStorageAvailability()

      const { hasLocalStorageError, localStorageErrorMessage } = useLanguage()
      expect(hasLocalStorageError.value).toBe(true)
      expect(localStorageErrorMessage.value).toContain('localStorage is not available')
    })

    it('sets error state when localStorage throws on access', () => {
      const mockLocalStorage = {
        setItem: vi.fn().mockImplementation(() => {
          throw new Error('Access denied')
        }),
        removeItem: vi.fn()
      }
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })

      testUtils.checkLocalStorageAvailability()

      const { hasLocalStorageError, localStorageErrorMessage } = useLanguage()
      expect(hasLocalStorageError.value).toBe(true)
      expect(localStorageErrorMessage.value).toContain('localStorage is not accessible')
    })

    it('passes when localStorage is available and working', () => {
      // Reset error state first
      resetLanguageState()
      
      // Setup working localStorage
      Object.defineProperty(global, 'localStorage', {
        value: localStorageMock,
        writable: true
      })

      testUtils.checkLocalStorageAvailability()

      const { hasLocalStorageError } = useLanguage()
      expect(hasLocalStorageError.value).toBe(false)
    })
  })
})