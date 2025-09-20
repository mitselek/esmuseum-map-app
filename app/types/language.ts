/**
 * Language types for multi-language greeting feature
 * Defines core language entities and interfaces
 */

export type LanguageCode = 'et' | 'uk' | 'en-GB'

export interface Language {
  code: LanguageCode
  name: string
  displayName: string
  isDefault: boolean
}

export interface Translation {
  key: string
  value: string
  locale: string
}

export interface UserPreference {
  preferredLanguage: LanguageCode
  autoDetected: boolean
  timestamp: number
}

export interface LanguageComposable {
  currentLanguage: Ref<Language>
  availableLanguages: Ref<Language[]>
  switchLanguage: (code: LanguageCode) => Promise<void>
  t: (key: string) => string
  isLoading: Ref<boolean>
}

export interface I18nConfig {
  defaultLocale: LanguageCode
  fallbackLocale: LanguageCode
  availableLocales: LanguageCode[]
  detectBrowserLanguage: boolean
  persistLanguage: boolean
}

export type TranslationKey = 'greeting.welcome' // Extensible for future keys

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'et', name: 'Eesti', displayName: 'Estonian', isDefault: true },
  { code: 'uk', name: 'Українська', displayName: 'Ukrainian', isDefault: false },
  { code: 'en-GB', name: 'English', displayName: 'British English', isDefault: false }
]

export const STORAGE_KEY = 'esmuseum-language-preference'