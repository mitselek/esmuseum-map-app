# Quickstart: Multi-Language Greeting

**Date**: 2025-09-20  
**Purpose**: Validate implementation meets user requirements

## Overview

This quickstart validates the multi-language greeting feature by testing the core user scenarios from the specification.

## Prerequisites

- Development server running on HTTPS
- HelloWorld component currently displaying
- Browser with developer tools access

## Test Scenarios

### Scenario 1: Default Language Display

**Goal**: Verify Estonian appears by default

**Steps**:

1. Open browser in incognito/private mode
2. Navigate to application homepage
3. Observe greeting text

**Expected Result**:

- Greeting displays in Estonian: "Tere tulemast ESMuseumi kaardirakenduse"
- No language preference stored in localStorage
- Page loads without errors

**Validation**:

```javascript
// Check in browser console
localStorage.getItem('esmuseum-language-preference') === null
document.querySelector('[data-testid="greeting"]').textContent.includes('Tere')
```

### Scenario 2: Language Switching

**Goal**: Verify language switcher works

**Steps**:

1. Locate language switcher component
2. Click on "Українська" option
3. Observe greeting text change
4. Click on "English" option
5. Observe greeting text change again

**Expected Result**:

- Ukrainian text: "Ласкаво просимо до картографічного застосунку ESMuseum"
- English text: "Welcome to the ESMuseum Map Application"
- Changes happen instantly (<100ms)
- No page reload occurs

**Validation**:

```javascript
// After switching to Ukrainian
document
  .querySelector('[data-testid="greeting"]')
  .textContent.includes('Ласкаво')

// After switching to English
document
  .querySelector('[data-testid="greeting"]')
  .textContent.includes('Welcome')
```

### Scenario 3: Preference Persistence

**Goal**: Verify language choice persists

**Steps**:

1. Select Ukrainian from language switcher
2. Refresh the page (F5)
3. Observe greeting text on reload

**Expected Result**:

- Ukrainian greeting displays immediately
- No flash of default language
- localStorage contains preference

**Validation**:

```javascript
// Check localStorage after language selection
const pref = JSON.parse(localStorage.getItem('esmuseum-language-preference'))
pref.preferredLanguage === 'uk'
pref.autoDetected === false
```

### Scenario 4: Browser Language Auto-detection

**Goal**: Verify Ukrainian browser language auto-detection

**Steps**:

1. Clear localStorage: `localStorage.clear()`
2. Set browser language to Ukrainian in dev tools:
   - Open Developer Tools → Console
   - Run: `Object.defineProperty(navigator, 'language', { value: 'uk', configurable: true })`
3. Refresh page
4. Observe greeting text

**Expected Result**:

- Ukrainian greeting displays automatically
- localStorage shows auto-detected preference

**Validation**:

```javascript
const pref = JSON.parse(localStorage.getItem('esmuseum-language-preference'))
pref.preferredLanguage === 'uk'
pref.autoDetected === true
```

### Scenario 5: Unsupported Language Fallback

**Goal**: Verify fallback to Estonian for unsupported languages

**Steps**:

1. Clear localStorage: `localStorage.clear()`
2. Set browser language to unsupported locale:
   - Run: `Object.defineProperty(navigator, 'language', { value: 'fr-FR', configurable: true })`
3. Refresh page
4. Observe greeting text

**Expected Result**:

- Estonian greeting displays (fallback)
- No errors in console
- Graceful degradation

### Scenario 6: Accessibility Validation

**Goal**: Verify accessibility compliance

**Steps**:

1. Open accessibility dev tools
2. Navigate using keyboard only (Tab key)
3. Use screen reader (if available)
4. Check language attributes

**Expected Result**:

- Language switcher accessible via keyboard
- Proper ARIA labels present
- Text has correct `lang` attributes
- No accessibility violations

### Scenario 7: Mobile Responsiveness

**Goal**: Verify mobile-friendly design

**Steps**:

1. Open browser dev tools
2. Switch to mobile device simulation
3. Test language switcher on small screen
4. Verify text wrapping and layout

**Expected Result**:

- Language switcher remains usable
- Text doesn't overflow container
- Touch targets are adequate size
- Layout maintains visual hierarchy

### Scenario 8: Performance Validation

**Goal**: Verify performance standards

**Steps**:

1. Open Performance tab in dev tools
2. Record page load with language switching
3. Measure bundle size impact
4. Check Core Web Vitals

**Expected Result**:

- Language switching completes <100ms
- Bundle size increase <10KB
- LCP remains <2.5s
- No memory leaks detected

## Acceptance Criteria Checklist

**Language Support**:

- [ ] Estonian displays by default
- [ ] Ukrainian option available and functional
- [ ] British English option available and functional
- [ ] All three languages display proper native text

**Language Switching**:

- [ ] Visible language switcher component present
- [ ] Instant text changes without page reload
- [ ] Smooth user experience during switching
- [ ] No loading states or delays

**Persistence**:

- [ ] Language preference saved to localStorage
- [ ] Preference restored on page reload
- [ ] Preference survives browser restart
- [ ] Graceful handling if storage unavailable

**Auto-detection**:

- [ ] Ukrainian browser locale auto-detected
- [ ] Unsupported locales fall back to Estonian
- [ ] No errors when detection fails
- [ ] User can override auto-detection

**Quality Standards**:

- [ ] Responsive design maintained
- [ ] Accessibility standards met
- [ ] HTTPS delivery confirmed
- [ ] Mobile-first design preserved
- [ ] Performance budgets respected

## Troubleshooting

### Common Issues

**Language not switching**:

- Check console for JavaScript errors
- Verify i18n module loaded correctly
- Confirm translation files accessible

**Persistence not working**:

- Check localStorage availability
- Verify no browser privacy restrictions
- Confirm JSON parsing not failing

**Auto-detection failing**:

- Check navigator.language API availability
- Verify language matching logic
- Confirm fallback behavior

### Debug Commands

```javascript
// Check current language state
console.log('Current language:', document.documentElement.lang)

// Inspect localStorage
console.log(
  'Stored preference:',
  localStorage.getItem('esmuseum-language-preference')
)

// Check browser language
console.log('Browser language:', navigator.language)

// Force language change (for testing)
localStorage.setItem(
  'esmuseum-language-preference',
  JSON.stringify({
    preferredLanguage: 'uk',
    autoDetected: false,
    timestamp: Date.now(),
  })
)
```

## Success Metrics

**Functional Success**:

- All 8 test scenarios pass
- Zero console errors during testing
- All acceptance criteria checked

**Performance Success**:

- Language switching <100ms
- Bundle increase <10KB
- Core Web Vitals maintained

**User Experience Success**:

- Intuitive language selection
- Immediate visual feedback
- Consistent behavior across browsers
