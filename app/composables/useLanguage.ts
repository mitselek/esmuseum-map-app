import { ref, computed, watch, onMounted } from 'vue'
import type { LanguageCode, Language, UserPreference, LanguageComposable } from '../types/language'
import { SUPPORTED_LANGUAGES, STORAGE_KEY } from '../types/language'

// Global state for language management
const isLoading = ref(false)
let isInitialized = false

/**
 * Language management composable for multi-language greeting feature
 * Integrates with Nuxt i18n routing and handles localStorage persistence
 */
export const useLanguage = (): LanguageComposable => {
  const { locale, setLocale, t } = useI18n()
  
  // Use Nuxt i18n's locale as the source of truth
  const currentLanguageCode = computed(() => locale.value as LanguageCode)
  
  // Computed properties
  const currentLanguage = computed(() => 
    SUPPORTED_LANGUAGES.find((lang: Language) => lang.code === currentLanguageCode.value) || SUPPORTED_LANGUAGES[0]
  )
  
  const availableLanguages = computed(() => SUPPORTED_LANGUAGES)
  
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
  
  // Storage helpers
  const savePreference = (langCode: LanguageCode, autoDetected: boolean = false): void => {
    if (typeof localStorage === 'undefined') return
    
    try {
      const preference: UserPreference = {
        preferredLanguage: langCode,
        autoDetected,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preference))
    } catch (error) {
      // Graceful degradation if localStorage fails
      console.warn('Failed to save language preference:', error)
    }
  }
  
  const loadPreference = (): UserPreference | null => {
    if (typeof localStorage === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      
      const preference = JSON.parse(stored) as UserPreference
      
      // Validate stored preference
      if (SUPPORTED_LANGUAGES.some((lang: Language) => lang.code === preference.preferredLanguage)) {
        return preference
      }
    } catch (error) {
      console.warn('Failed to load language preference:', error)
    }
    
    return null
  }
  
  // Language switching with Nuxt i18n routing
  const switchLanguage = async (code: LanguageCode): Promise<void> => {
    console.log(`switchLanguage called with code: ${code}, current locale: ${locale.value}`)
    
    if (!SUPPORTED_LANGUAGES.some((lang: Language) => lang.code === code)) {
      console.warn(`Unsupported language code: ${code}`)
      return
    }
    
    if (code === locale.value) {
      console.log(`Already on requested language: ${code}`)
      return
    }
    
    isLoading.value = true
    
    try {
      // Save preference before switching (manual selection)
      savePreference(code, false)
      console.log(`Saved preference for: ${code}`)
      
      // Use Nuxt i18n's setLocale which handles routing
      console.log(`Calling setLocale with: ${code}`)
      await setLocale(code)
      console.log(`setLocale completed, new locale: ${locale.value}`)
      
    } catch (error) {
      console.error('Failed to switch language:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  // Initialize language (works both client and server side)
  const initializeLanguage = async (): Promise<void> => {
    if (isInitialized) return
    
    // Check for saved preference first
    const savedPreference = loadPreference()
    
    if (savedPreference) {
      // If we have a saved preference and it's different from current locale
      if (savedPreference.preferredLanguage !== locale.value) {
        await setLocale(savedPreference.preferredLanguage)
      }
      isInitialized = true
      return
    }
    
    // No saved preference - detect browser language
    const detectedLanguage = detectBrowserLanguage()
    
    // Only switch if detected language is different from current and default
    if (detectedLanguage !== 'et' && detectedLanguage !== locale.value) {
      await setLocale(detectedLanguage)
      savePreference(detectedLanguage, true)
    }
    
    isInitialized = true
  }
  
  // Initialize on client mount (browser only)
  onMounted(() => {
    if (typeof window !== 'undefined') {
      initializeLanguage()
    }
  })
  
  // Also initialize immediately for testing (or if called during SSR)
  if (!isInitialized) {
    // For testing/SSR, run initialization synchronously if possible
    const savedPreference = loadPreference()
    
    if (savedPreference && savedPreference.preferredLanguage !== locale.value) {
      setLocale(savedPreference.preferredLanguage)
      isInitialized = true
    } else if (!savedPreference) {
      // Auto-detect browser language for new users
      const detectedLanguage = detectBrowserLanguage()
      if (detectedLanguage !== 'et' && detectedLanguage !== locale.value) {
        setLocale(detectedLanguage)
        savePreference(detectedLanguage, true)
      }
      isInitialized = true
    } else {
      isInitialized = true
    }
  }
  
  // Watch for locale changes from Nuxt i18n and save preferences
  watch(locale, (newLocale) => {
    // Save preference when locale changes (after initialization)
    if (isInitialized && typeof window !== 'undefined') {
      const currentPreference = loadPreference()
      if (!currentPreference || currentPreference.preferredLanguage !== newLocale) {
        savePreference(newLocale as LanguageCode, false)
      }
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

// Test utility function to reset state (only for testing)
export const resetLanguageState = (): void => {
  isLoading.value = false
  isInitialized = false
}