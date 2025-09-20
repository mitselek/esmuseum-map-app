import { ref, computed } from 'vue'
import type { LanguageCode, Language, LanguageComposable } from '../types/language'
import { SUPPORTED_LANGUAGES } from '../types/language'

// Global state for language management
const isLoading = ref(false)

// Browser language detection
const detectBrowserLanguage = (): LanguageCode => {
  if (typeof navigator === 'undefined') return 'et'
  
  const browserLang = navigator.language.toLowerCase()
  
  // Ukrainian detection
  if (browserLang === 'uk' || browserLang.startsWith('uk-')) {
    return 'uk'
  }
  
  // English variants (map to British English)
  if (browserLang === 'en-gb' || browserLang.startsWith('en-')) {
    return 'en-GB'
  }
  
  // Default to Estonian for unsupported languages
  return 'et'
}

/**
 * Language management composable - Relies on i18n module for cookie handling
 * Provides reactive interface to i18n's locale management
 */
export const useLanguage = (): LanguageComposable => {
  const { locale, setLocale, t } = useI18n()
  
  // Read current language from i18n locale (server/client consistent)
  const currentLanguageCode = computed(() => locale.value as LanguageCode)
  
  // Computed properties
  const currentLanguage = computed(() => 
    SUPPORTED_LANGUAGES.find((lang: Language) => lang.code === currentLanguageCode.value) || SUPPORTED_LANGUAGES[0]
  )
  
  const availableLanguages = computed(() => SUPPORTED_LANGUAGES)
  
  // Language switching - Let i18n handle cookie persistence
  const switchLanguage = async (code: LanguageCode): Promise<void> => {
    if (!SUPPORTED_LANGUAGES.some((lang: Language) => lang.code === code)) {
      return
    }
    
    if (code === currentLanguageCode.value) {
      return
    }
    
    isLoading.value = true
    
    try {
      // Set locale - i18n module handles cookie persistence automatically
      await setLocale(code)
    } catch (error) {
      throw error // Re-throw to let components handle the error
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    currentLanguage,
    availableLanguages,
    switchLanguage,
    t,
    isLoading
  }
}

// Test utility functions (only for testing)
export const resetLanguageState = (): void => {
  isLoading.value = false
}

// Export internal functions for testing
export const testUtils = {
  detectBrowserLanguage
}