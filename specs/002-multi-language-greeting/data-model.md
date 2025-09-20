# Data Model: Multi-Language Greeting

**Date**: 2025-09-20  
**Status**: Complete

## Core Entities

### Language

Represents available languages in the application.

**Properties**:

- `code: string` - IETF BCP 47 language tag (et, uk, en-GB)
- `name: string` - Native language name (Eesti, Українська, English)
- `displayName: string` - Display name in current language context
- `isDefault: boolean` - Whether this is the default language (Estonian)

**Example**:

```typescript
interface Language {
  code: 'et' | 'uk' | 'en-GB'
  name: string
  displayName: string
  isDefault: boolean
}

const languages: Language[] = [
  { code: 'et', name: 'Eesti', displayName: 'Estonian', isDefault: true },
  {
    code: 'uk',
    name: 'Українська',
    displayName: 'Ukrainian',
    isDefault: false,
  },
  {
    code: 'en-GB',
    name: 'English',
    displayName: 'British English',
    isDefault: false,
  },
]
```

### Translation

Represents translated content for the greeting message.

**Properties**:

- `key: string` - Translation key identifier
- `value: string` - Translated text content
- `locale: string` - Language code this translation belongs to

**Example**:

```typescript
interface Translation {
  key: string
  value: string
  locale: string
}

// Estonian (default)
const etTranslations: Translation[] = [
  {
    key: 'greeting.welcome',
    value: 'Tere tulemast ESMuseumi kaardirakenduse',
    locale: 'et',
  },
]

// Ukrainian
const ukTranslations: Translation[] = [
  {
    key: 'greeting.welcome',
    value: 'Ласкаво просимо до картографічного застосунку ESMuseum',
    locale: 'uk',
  },
]

// British English
const enGBTranslations: Translation[] = [
  {
    key: 'greeting.welcome',
    value: 'Welcome to the ESMuseum Map Application',
    locale: 'en-GB',
  },
]
```

### UserPreference

Represents user's language preference stored in browser.

**Properties**:

- `preferredLanguage: string` - User's selected language code
- `autoDetected: boolean` - Whether language was auto-detected from browser
- `timestamp: number` - When preference was last updated

**Storage**:

- Location: `localStorage['esmuseum-language-preference']`
- Format: JSON serialized object
- Fallback: Estonian (et) if no preference or storage unavailable

**Example**:

```typescript
interface UserPreference {
  preferredLanguage: 'et' | 'uk' | 'en-GB'
  autoDetected: boolean
  timestamp: number
}

// Stored in localStorage
const preference: UserPreference = {
  preferredLanguage: 'uk',
  autoDetected: true,
  timestamp: Date.now(),
}
```

## State Management

### Language State

Global reactive state managing current language selection.

**Properties**:

- `currentLanguage: Language` - Currently active language
- `availableLanguages: Language[]` - All supported languages
- `isLoading: boolean` - Whether language switching is in progress

### Browser Detection State

State for handling browser locale detection.

**Properties**:

- `browserLocale: string` - Detected browser language
- `isSupported: boolean` - Whether browser locale is supported
- `fallbackUsed: boolean` - Whether falling back to default

## Validation Rules

### Language Code Validation

- Must be one of: 'et', 'uk', 'en-GB'
- Cannot be null or undefined
- Must match IETF BCP 47 format

### Translation Validation

- Key must follow dot notation (e.g., 'greeting.welcome')
- Value cannot be empty string
- Locale must match supported language codes

### Preference Validation

- Preferred language must be valid language code
- Timestamp must be valid Unix timestamp
- Auto-detected flag must be boolean

## Relationships

```text
Language (1) ←→ (many) Translation
  ↑
  └── UserPreference (references Language.code)

LanguageState (contains)
  ├── currentLanguage: Language
  └── availableLanguages: Language[]
```

## Data Flow

1. **Initialization**:
   - Load available languages
   - Check localStorage for user preference
   - Detect browser locale if no preference
   - Set current language based on priority

2. **Language Selection**:
   - User selects from available languages
   - Update current language state
   - Save preference to localStorage
   - Apply translations immediately

3. **Persistence**:
   - Save on every language change
   - Load on application startup
   - Graceful degradation if storage fails

## Type Definitions

```typescript
// Core types
type LanguageCode = 'et' | 'uk' | 'en-GB'
type TranslationKey = 'greeting.welcome' // Extensible for future keys

// Composable return type
interface LanguageComposable {
  currentLanguage: Ref<Language>
  availableLanguages: Ref<Language[]>
  switchLanguage: (code: LanguageCode) => Promise<void>
  t: (key: TranslationKey) => string
  isLoading: Ref<boolean>
}

// Configuration type
interface I18nConfig {
  defaultLocale: LanguageCode
  fallbackLocale: LanguageCode
  availableLocales: LanguageCode[]
  detectBrowserLanguage: boolean
  persistLanguage: boolean
}
```
