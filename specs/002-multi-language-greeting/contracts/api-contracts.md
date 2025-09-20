# Language API Contracts

**Date**: 2025-09-20  
**Type**: Client-side API (No HTTP endpoints)

## Overview

This feature is purely client-side with no server API requirements. All language management is handled through browser APIs and local storage.

## Browser API Contracts

### Navigator Language Detection

**API**: `navigator.language`

**Input**: None (browser property)

**Output**:

```typescript
type BrowserLanguage = string // e.g., "uk", "en-US", "et"
```

**Contract**:

- Always returns a string
- May not match supported languages
- Used for initial language detection

### Local Storage API

**API**: `localStorage.setItem()` / `localStorage.getItem()`

**Storage Key**: `'esmuseum-language-preference'`

**Input**:

```typescript
interface StoredPreference {
  preferredLanguage: 'et' | 'uk' | 'en-GB'
  autoDetected: boolean
  timestamp: number
}
```

**Output**: JSON string or null

**Contract**:

- May throw if storage quota exceeded
- May return null if not previously set
- Must handle graceful degradation

## Component Contracts

### LanguageSwitcher Component

**Props**:

```typescript
interface LanguageSwitcherProps {
  // No props - uses global state
}
```

**Events**:

```typescript
interface LanguageSwitcherEvents {
  'language-changed': (newLanguage: LanguageCode) => void
}
```

**Slots**: None

### HelloWorld Component (Enhanced)

**Props**:

```typescript
interface HelloWorldProps {
  // Maintains existing props if any
}
```

**Dependencies**:

- Uses global i18n state
- Reactively updates on language changes

## Composable Contracts

### useLanguage Composable

**Input**: None

**Output**:

```typescript
interface UseLanguageReturn {
  currentLanguage: Ref<Language>
  availableLanguages: Ref<Language[]>
  switchLanguage: (code: LanguageCode) => Promise<void>
  t: (key: string) => string
  isLoading: Ref<boolean>
}
```

**Contract**:

- `switchLanguage()` must be idempotent
- `t()` must return fallback for missing keys
- All refs must be reactive

## Configuration Contracts

### Nuxt i18n Module Config

**File**: `nuxt.config.ts`

**Structure**:

```typescript
interface I18nConfig {
  defaultLocale: 'et'
  fallbackLocale: 'et'
  locales: [
    { code: 'et'; name: 'Eesti'; file: 'et.json' },
    { code: 'uk'; name: 'Українська'; file: 'uk.json' },
    { code: 'en-GB'; name: 'English'; file: 'en-GB.json' },
  ]
  lazy: true
  langDir: 'locales/'
  detectBrowserLanguage: {
    useCookie: false
    alwaysRedirect: false
    fallbackLocale: 'et'
  }
}
```

## Translation File Contracts

### Locale JSON Structure

**File Pattern**: `locales/{code}.json`

**Structure**:

```typescript
interface LocaleFile {
  greeting: {
    welcome: string
  }
  // Extensible for future translations
}
```

**Estonian (et.json)**:

```json
{
  "greeting": {
    "welcome": "Tere tulemast ESMuseumi kaardirakenduse"
  }
}
```

**Ukrainian (uk.json)**:

```json
{
  "greeting": {
    "welcome": "Ласкаво просимо до картографічного застосунку ESMuseum"
  }
}
```

**British English (en-GB.json)**:

```json
{
  "greeting": {
    "welcome": "Welcome to the ESMuseum Map Application"
  }
}
```

## Error Handling Contracts

### Storage Failure

**Scenario**: localStorage unavailable or quota exceeded

**Contract**:

- Must gracefully degrade to default language (Estonian)
- Must not throw unhandled exceptions
- Must log warning for debugging

### Unsupported Browser Language

**Scenario**: navigator.language returns unsupported locale

**Contract**:

- Must fall back to Estonian default
- Should log detection attempt for analytics
- Must not prevent application loading

### Translation Missing

**Scenario**: Translation key not found in locale file

**Contract**:

- Must return fallback text (Estonian version)
- Should log missing key for translation team
- Must display something rather than empty content

## Testing Contracts

### Component Test Requirements

**Coverage**: All public methods and props

**Scenarios**:

- Language switching updates display
- Persistence works correctly
- Fallback behavior handles errors
- Accessibility attributes present

### E2E Test Requirements

**Critical Paths**:

- Default language displays on first visit
- Language switcher changes content
- Preference persists across page reload
- Browser language auto-detection works

## Performance Contracts

### Bundle Size Impact

**Constraint**: <10KB gzipped increase

**Components**:

- @nuxtjs/i18n module: ~8KB
- Translation files: ~1KB total
- Component code: <1KB

### Language Switch Speed

**Constraint**: <100ms to update UI

**Implementation**: Client-side reactive updates only
