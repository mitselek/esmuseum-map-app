import { ref, computed, watch, onMounted } from 'vue'
import type { LanguageCode, Language, UserPreference, LanguageComposable } from '../types/language'
import { SUPPORTED_LANGUAGES, STORAGE_KEY } from '../types/language'

// Global state for language management
const isLoading = ref(false)
const hasLocalStorageError = ref(false)
const localStorageErrorMessage = ref('')
let isInitialized = false

// Check localStorage availability on load
const checkLocalStorageAvailability = (): void => {
  if (typeof localStorage === 'undefined') {
    hasLocalStorageError.value = true
    localStorageErrorMessage.value = 'localStorage is not available. This application requires localStorage to function.'
    return
  }
  
  try {
    // Test localStorage read/write capability
    const testKey = '__esmuseum_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
  } catch (error) {
    hasLocalStorageError.value = true
    localStorageErrorMessage.value = `localStorage is not accessible: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

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

// Storage helpers - FAIL FAST if localStorage unavailable
const savePreference = (langCode: LanguageCode, autoDetected: boolean = false): void => {
  if (hasLocalStorageError.value) {
    throw new Error('Cannot save language preference: localStorage unavailable')
  }
  
  try {
    const preference: UserPreference = {
      preferredLanguage: langCode,
      autoDetected,
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference))
  } catch (error) {
    hasLocalStorageError.value = true
    localStorageErrorMessage.value = `Failed to save language preference: ${error instanceof Error ? error.message : 'Unknown error'}`
    throw error
  }
}

const loadPreference = (): UserPreference | null => {
  if (hasLocalStorageError.value) {
    throw new Error('Cannot load language preference: localStorage unavailable')
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const preference = JSON.parse(stored) as UserPreference
    
    // Validate stored preference
    if (SUPPORTED_LANGUAGES.some((lang: Language) => lang.code === preference.preferredLanguage)) {
      return preference
    }
  } catch (error) {
    hasLocalStorageError.value = true
    localStorageErrorMessage.value = `Failed to load language preference: ${error instanceof Error ? error.message : 'Unknown error'}`
    throw error
  }
  
  return null
}

/**
 * Language management composable - localStorage as single source of truth
 * No URL routing, no page reloads, fail fast on localStorage issues
 */
export const useLanguage = (): LanguageComposable & { 
  hasLocalStorageError: Ref<boolean>, 
  localStorageErrorMessage: Ref<string> 
} => {
  const { locale, setLocale, t } = useI18n()
  
  // Check localStorage on first use
  if (!isInitialized) {
    checkLocalStorageAvailability()
  }
  
  // Use localStorage as the source of truth
  const currentLanguageCode = ref<LanguageCode>('et')
  
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
  
  // Storage helpers - FAIL FAST if localStorage unavailable
  const savePreference = (langCode: LanguageCode, autoDetected: boolean = false): void => {
    if (hasLocalStorageError.value) {
      throw new Error('Cannot save language preference: localStorage unavailable')
    }
    
    try {
      const preference: UserPreference = {
        preferredLanguage: langCode,
        autoDetected,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preference))
    } catch (error) {
      hasLocalStorageError.value = true
      localStorageErrorMessage.value = `Failed to save language preference: ${error instanceof Error ? error.message : 'Unknown error'}`
      throw error
    }
  }
  
  const loadPreference = (): UserPreference | null => {
    if (hasLocalStorageError.value) {
      throw new Error('Cannot load language preference: localStorage unavailable')
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      
      const preference = JSON.parse(stored) as UserPreference
      
      // Validate stored preference
      if (SUPPORTED_LANGUAGES.some((lang: Language) => lang.code === preference.preferredLanguage)) {
        return preference
      }
    } catch (error) {
      hasLocalStorageError.value = true
      localStorageErrorMessage.value = `Failed to load language preference: ${error instanceof Error ? error.message : 'Unknown error'}`
      throw error
    }
    
    return null
  }
  
  // Language switching - NO URL changes, NO page reloads
  const switchLanguage = async (code: LanguageCode): Promise<void> => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`switchLanguage called with code: ${code}, current: ${currentLanguageCode.value}`)
    }
    
    if (!SUPPORTED_LANGUAGES.some((lang: Language) => lang.code === code)) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`Unsupported language code: ${code}`)
      }
      return
    }
    
    if (code === currentLanguageCode.value) {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`Already on requested language: ${code}`)
      }
      return
    }
    
    isLoading.value = true
    
    try {
      // Save preference FIRST - fail fast if localStorage unavailable
      savePreference(code, false)
      if (process.env.NODE_ENV !== 'test') {
        console.log(`Saved preference for: ${code}`)
      }
      
      // Update local state (single source of truth)
      currentLanguageCode.value = code
      
      // Update Nuxt i18n locale for translations (NO routing)
      await setLocale(code)
      if (process.env.NODE_ENV !== 'test') {
        console.log(`Updated i18n locale to: ${code}, no URL change`)
      }
      
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Failed to switch language:', error)
      }
      throw error // Re-throw to let components handle the error
    } finally {
      isLoading.value = false
    }
  }
  
  // Initialize language from localStorage ONLY
  const initializeLanguage = async (): Promise<void> => {
    if (isInitialized || hasLocalStorageError.value) return
    
    try {
      // Check for saved preference first
      const savedPreference = loadPreference()
      
      if (savedPreference) {
        currentLanguageCode.value = savedPreference.preferredLanguage
        await setLocale(savedPreference.preferredLanguage)
        if (process.env.NODE_ENV !== 'test') {
          console.log(`Loaded saved preference: ${savedPreference.preferredLanguage}`)
        }
      } else {
        // No saved preference - detect browser language and save it
        const detectedLanguage = detectBrowserLanguage()
        currentLanguageCode.value = detectedLanguage
        await setLocale(detectedLanguage)
        savePreference(detectedLanguage, true)
        if (process.env.NODE_ENV !== 'test') {
          console.log(`Auto-detected and saved: ${detectedLanguage}`)
        }
      }
      
      isInitialized = true
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Failed to initialize language:', error)
      }
      throw error
    }
  }
  
  // Initialize on client mount (browser only, skip in test environment)
  if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
    onMounted(() => {
      if (typeof window !== 'undefined' && !hasLocalStorageError.value) {
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
    isLoading,
    hasLocalStorageError,
    localStorageErrorMessage
  }
}

// Test utility functions (only for testing)
export const resetLanguageState = (): void => {
  isLoading.value = false
  isInitialized = false
  hasLocalStorageError.value = false
  localStorageErrorMessage.value = ''
}

// Export internal functions for testing
export const testUtils = {
  detectBrowserLanguage,
  loadPreference,
  savePreference,
  checkLocalStorageAvailability
}