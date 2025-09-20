# Research: Multi-Language Greeting

**Date**: 2025-09-20  
**Status**: Complete

## Technology Decisions

### Internationalization Framework

**Decision**: @nuxtjs/i18n module with Vue I18n

**Rationale**:

- Official Nuxt.js module with excellent TypeScript support
- Proven performance with lazy loading and tree-shaking
- Built-in support for browser locale detection
- Seamless integration with existing Vue 3 Composition API setup
- Minimal bundle size impact with on-demand loading

**Alternatives considered**:

- Custom i18n implementation: Rejected due to reinventing wheel and maintenance burden
- React-intl: Not applicable for Vue.js ecosystem
- Vue-i18n directly: @nuxtjs/i18n provides better Nuxt.js integration

### Language Storage Strategy

**Decision**: localStorage with graceful degradation (no fallback storage)

**Rationale**:

- Persists across browser sessions as required by specification
- Fast client-side access for instant language switching
- Graceful degradation: if localStorage unavailable, language selection still works during session but doesn't persist
- Simpler implementation with predictable behavior

**Fallback behavior**:

- If localStorage unavailable: Language switching works but resets to default on page reload
- User gets consistent behavior (either persistence works or it doesn't)
- No mixed storage strategies with different expiration behaviors

**Alternatives considered**:

- sessionStorage fallback: Rejected due to different expiration behavior (tab-scoped vs persistent)
- Cookies: Rejected due to unnecessary server overhead and size limits
- IndexedDB: Overkill for simple preference storage
- URL parameters: Poor UX and SEO implications

### Browser Locale Detection

**Decision**: navigator.language API with configurable fallback

**Rationale**:

- Standard web API with excellent browser support
- Automatic Ukrainian detection as specified
- Graceful fallback to Estonian default
- No external dependencies required

**Alternatives considered**:

- IP-based geolocation: Privacy concerns and inaccuracy
- Accept-Language header: Requires server-side processing
- Third-party detection libraries: Unnecessary complexity

## Language Content Strategy

### Text Management

**Decision**: JSON files per locale with TypeScript interfaces

**Rationale**:

- Type-safe translation keys with autocomplete
- Easy content management for translators
- Tree-shaking support for unused translations
- Standard i18n file format

**File structure**:

```text
locales/
├── et.json    # Estonian (default)
├── uk.json    # Ukrainian  
└── en-GB.json # British English
```

### Language Codes

**Decision**: IETF BCP 47 language tags

**Rationale**:

- et: Estonian (primary official language)
- uk: Ukrainian (specific Cyrillic script requirement)
- en-GB: British English (specified variant)
- Standard format supported by browsers and i18n libraries

## Component Architecture

### Language Switcher Component

**Decision**: Standalone LanguageSwitcher.vue component

**Rationale**:

- Single responsibility principle compliance
- Reusable across application
- Testable in isolation
- Clear separation of concerns

### State Management

**Decision**: Vue 3 Composition API with composables

**Rationale**:

- Consistent with existing codebase patterns
- Reactive language switching
- Shared state management without additional dependencies
- TypeScript-friendly

## Performance Considerations

### Bundle Size Impact

**Research**: @nuxtjs/i18n with lazy loading adds ~8KB gzipped

**Mitigation**:

- Lazy load language files
- Tree-shake unused features
- Use minimal configuration

### Language Switching Speed

**Target**: <100ms switching time  
**Implementation**: Client-side reactive state changes with cached translations

## Accessibility Research

### Screen Reader Support

**Requirements**:

- ARIA labels for language switcher
- Language attributes on text content
- Keyboard navigation support

### Visual Design

**Considerations**:

- Language names in native scripts (українська, English)
- Clear visual feedback for active language
- Mobile-friendly touch targets

## Testing Strategy

### Component Testing

**Approach**:

- Test language switching functionality
- Verify persistence behavior
- Validate accessibility attributes

### E2E Testing

**Scenarios**:

- Default language display
- Language switching flow
- Persistence across page reloads
- Browser locale detection

## Browser Compatibility

**Target browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)

**APIs used**:

- localStorage (supported since IE8)
- navigator.language (supported in all modern browsers)
- CSS Grid/Flexbox (existing support confirmed)

## Security Considerations

**No sensitive data**: Language preference is not sensitive information  
**XSS protection**: Vue.js template system provides automatic escaping  
**No authentication required**: Feature works for anonymous users

## Migration Strategy

**From current HelloWorld**:

1. Extract existing HelloWorld component
2. Add i18n wrapper around greeting text
3. Add LanguageSwitcher component
4. Maintain existing styling and responsive behavior

**Backward compatibility**: Existing functionality preserved, only additions made
