import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLanguage, resetLanguageState, testUtils } from '~/app/composables/useLanguage'
import { mockLocale, mockSetLocale, mockT, resetMocks, cookieStore } from '../setup'
import type { LanguageCode } from '~/app/types/language'

// Mock navigator for browser language detection
const navigatorMock = {
  language: 'en-US'
}

describe('useLanguage composable (cookie-based)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetMocks()
    resetLanguageState()
    
    // Mock browser environment
    Object.defineProperty(global, 'navigator', {
      value: navigatorMock,
      writable: true
    })
    
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true
    })
    
    // Setup i18n mocks
    mockLocale.value = 'et'
    mockSetLocale.mockImplementation(async (locale) => {
      mockLocale.value = locale
    })
    mockT.mockReturnValue('Mocked translation')
  })

  it('initializes with default Estonian language', () => {
    const { currentLanguage } = useLanguage()
    
    expect(currentLanguage.value.code).toBe('et')
    expect(currentLanguage.value.name).toBe('Eesti')
  })

  it('provides all supported languages', () => {
    const { availableLanguages } = useLanguage()
    
    const codes = availableLanguages.value.map(lang => lang.code)
    expect(codes).toEqual(['et', 'uk', 'en-GB'])
  })

  it('switches language through i18n', async () => {
    const { switchLanguage, currentLanguage } = useLanguage()
    
    await switchLanguage('uk')
    
    expect(mockSetLocale).toHaveBeenCalledWith('uk')
    expect(currentLanguage.value.code).toBe('uk')
  })

  it('reads current language from i18n locale', () => {
    mockLocale.value = 'en-GB'
    
    const { currentLanguage } = useLanguage()
    
    expect(currentLanguage.value.code).toBe('en-GB')
  })

  it('falls back to Estonian for invalid i18n locale', () => {
    mockLocale.value = 'invalid-lang' as any
    
    const { currentLanguage } = useLanguage()
    
    expect(currentLanguage.value.code).toBe('et')
  })
})

describe('testUtils functions', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: navigatorMock,
      writable: true
    })
  })

  it('detectBrowserLanguage maps US English to British English', () => {
    navigatorMock.language = 'en-US'
    expect(testUtils.detectBrowserLanguage()).toBe('en-GB')
  })

  it('detectBrowserLanguage detects Ukrainian', () => {
    navigatorMock.language = 'uk'
    expect(testUtils.detectBrowserLanguage()).toBe('uk')
  })

  it('detectBrowserLanguage falls back to Estonian', () => {
    navigatorMock.language = 'fr-FR'
    expect(testUtils.detectBrowserLanguage()).toBe('et')
  })
})