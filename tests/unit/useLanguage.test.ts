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

  it('switches language and saves to cookie', async () => {
    const { switchLanguage } = useLanguage()
    
    await switchLanguage('uk')
    
    expect(cookieStore.get('esmuseum-language')).toBe('uk')
    expect(mockSetLocale).toHaveBeenCalledWith('uk')
  })

  it('loads saved language from cookie', () => {
    cookieStore.set('esmuseum-language', 'en-GB')
    
    const { currentLanguage } = useLanguage()
    
    expect(currentLanguage.value.code).toBe('en-GB')
  })

  it('falls back to Estonian for invalid cookie values', () => {
    cookieStore.set('esmuseum-language', 'invalid-lang')
    
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

  it('loadPreference returns null when no cookie set', () => {
    cookieStore.clear()
    expect(testUtils.loadPreference()).toBeNull()
  })

  it('loadPreference returns valid language code from cookie', () => {
    cookieStore.set('esmuseum-language', 'uk')
    expect(testUtils.loadPreference()).toBe('uk')
  })

  it('savePreference stores language code in cookie', () => {
    testUtils.savePreference('en-GB')
    expect(cookieStore.get('esmuseum-language')).toBe('en-GB')
  })
})