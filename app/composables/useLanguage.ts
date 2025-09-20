import { ref, computed, watch, onMounted } from 'vue'
import type { LanguageCode, Language, UserPreference, LanguageComposable } from '../types/language'
import { SUPPORTED_LANGUAGES } from '../types/language'

// Global state for language management
const isLoading = ref(false)
let isInitialized = false

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

// Cookie-based language storage for SSR compatibility
const COOKIE_NAME = 'esmuseum-language'

// Storage helpers - Simple language code for i18n compatibility
const savePreference = (langCode: LanguageCode): void => {
  // Save simple language code to cookie for i18n compatibility
  const languageCookie = useCookie<string>(COOKIE_NAME, {
    default: () => 'et',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax'
  })
  
  languageCookie.value = langCode
}

const loadPreference = (): LanguageCode | null => {
  // Load from cookie using Nuxt's useCookie without default to check if actually set
  const languageCookie = useCookie<string | null>(COOKIE_NAME, {
    default: () => null
  })
  
  if (!languageCookie.value) return null
  
  // Validate stored language code
  if (SUPPORTED_LANGUAGES.some((lang: Language) => lang.code === languageCookie.value)) {
    return languageCookie.value as LanguageCode
  }
  
  return null
}

/**
 * Language management composable - Cookie-based for SSR compatibility
 * No URL routing, no page reloads, seamless hydration
 */
export const useLanguage = (): LanguageComposable => {
  const { locale, setLocale, t } = useI18n()
  
  // Initialize currentLanguageCode from cookie or default to Estonian
  const savedPreference = loadPreference()
  const currentLanguageCode = ref<LanguageCode>(savedPreference || 'et')
  
  // Computed properties
  const currentLanguage = computed(() => 
    SUPPORTED_LANGUAGES.find((lang: Language) => lang.code === currentLanguageCode.value) || SUPPORTED_LANGUAGES[0]
  )
  
  const availableLanguages = computed(() => SUPPORTED_LANGUAGES)
  
  // Language switching - NO URL changes, NO page reloads
  const switchLanguage = async (code: LanguageCode): Promise<void> => {
    if (!SUPPORTED_LANGUAGES.some((lang: Language) => lang.code === code)) {
      return
    }
    
    if (code === currentLanguageCode.value) {
      return
    }
    
    isLoading.value = true
    
    try {
      // Save preference to cookie
      savePreference(code)
      
      // Update local state (single source of truth)
      currentLanguageCode.value = code
      
      // Update Nuxt i18n locale for translations (NO routing)
      await setLocale(code)
      
    } catch (error) {
      throw error // Re-throw to let components handle the error
    } finally {
      isLoading.value = false
    }
  }
  
  // Initialize language from cookie or browser detection
  const initializeLanguage = async (): Promise<void> => {
    if (isInitialized) return
    
    try {
      // Check if we already have a saved preference (loaded during initialization)
      const savedPreference = loadPreference()
      
      if (!savedPreference) {
        // No saved preference - detect browser language and save it
        const detectedLanguage = detectBrowserLanguage()
        currentLanguageCode.value = detectedLanguage
        savePreference(detectedLanguage)
      }
      
      // Set the i18n locale to match our current language
      await setLocale(currentLanguageCode.value)
      isInitialized = true
    } catch (error) {
      throw error
    }
  }
  
  // Initialize on client mount (browser only, skip in test environment)
  if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
    onMounted(() => {
      if (typeof window !== 'undefined') {
        initializeLanguage()
      }
    })
  }
  
  // Sync currentLanguageCode changes to i18n locale (one-way binding)
  watch(currentLanguageCode, async (newCode) => {
    if (isInitialized && newCode !== locale.value) {
      await setLocale(newCode)
    }
  })
  
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
  isInitialized = false
}

// Export internal functions for testing
export const testUtils = {
  detectBrowserLanguage,
  loadPreference,
  savePreference
}