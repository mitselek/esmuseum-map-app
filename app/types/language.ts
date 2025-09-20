/**
 * Language types for multi-language greeting feature
 * Defines core language entities and interfaces
 */

export type LanguageCode = 'et' | 'uk' | 'en-GB'

export interface Language {
  code: LanguageCode
  name: string
  displayName: string
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

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'et', name: 'Eesti', displayName: 'Estonian' },
  { code: 'uk', name: 'Українська', displayName: 'Ukrainian' },
  { code: 'en-GB', name: 'English', displayName: 'British English' }
]

export const STORAGE_KEY = 'esmuseum-language-preference'