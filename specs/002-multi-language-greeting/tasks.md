# Tasks: Multi-Language Greeting

**Input**: Design documents from `/specs/002-multi-language-greeting/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```text
1. Load plan.md from feature directory
   → SUCCESS: Nuxt.js 3 + Vue 3 + TypeScript + @nuxtjs/i18n
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Language, Translation, UserPreference entities
   → contracts/: Component contracts, Browser API contracts, Configuration contracts
   → research.md: @nuxtjs/i18n, localStorage, navigator.language decisions
3. Generate tasks by category:
   → Setup: @nuxtjs/i18n installation, locale files, configuration
   → Tests: component tests, E2E scenarios, accessibility validation
   → Core: composables, LanguageSwitcher component, HelloWorld enhancement
   → Integration: full i18n integration, browser detection
   → Polish: performance validation, quickstart execution
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests? YES
   → All entities have models? YES (TypeScript interfaces)
   → All components implemented? YES
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Nuxt.js full-stack**: `app/`, `tests/` at repository root
- Frontend code in `app/components/`, `app/pages/`, `app/composables/`
- Locale files in `locales/` at repository root
- Tests organized by type: `tests/components/`, `tests/e2e/`

## Phase 3.1: Setup

- [ ] T001 Install @nuxtjs/i18n module and configure in nuxt.config.ts
- [ ] T002 [P] Create Estonian locale file locales/et.json with greeting translation
- [ ] T003 [P] Create Ukrainian locale file locales/uk.json with greeting translation
- [ ] T004 [P] Create British English locale file locales/en-GB.json with greeting translation
- [ ] T005 [P] Configure Nuxt i18n module with lazy loading and browser detection in nuxt.config.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**  

- [ ] T006 [P] Component test for LanguageSwitcher in tests/components/LanguageSwitcher.test.ts
- [ ] T007 [P] Component test for enhanced HelloWorld with i18n in tests/components/HelloWorld.test.ts
- [ ] T008 [P] Unit test for useLanguage composable in tests/unit/useLanguage.test.ts
- [ ] T009 [P] E2E test for default language display in tests/e2e/language-default.spec.ts
- [ ] T010 [P] E2E test for language switching flow in tests/e2e/language-switching.spec.ts
- [ ] T011 [P] E2E test for preference persistence in tests/e2e/language-persistence.spec.ts
- [ ] T012 [P] E2E test for browser locale auto-detection in tests/e2e/language-detection.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T013 [P] Language entity types in app/types/language.ts
- [ ] T014 useLanguage composable with browser detection and persistence in app/composables/useLanguage.ts
- [ ] T015 LanguageSwitcher component with accessibility features in app/components/LanguageSwitcher.vue
- [ ] T016 Enhance HelloWorld component with i18n support in app/components/HelloWorld.vue

## Phase 3.4: Integration

- [ ] T017 Integrate LanguageSwitcher into main layout or homepage in app/pages/index.vue
- [ ] T018 Add language attributes and meta tags for SEO in app.vue

## Phase 3.5: Polish

- [ ] T019 Execute quickstart validation scenarios from specs/002-multi-language-greeting/quickstart.md
- [ ] T020 Validate performance: bundle size <10KB increase, language switching <100ms
- [ ] T021 Validate accessibility with keyboard navigation and screen reader compatibility  
- [ ] T022 Cross-browser and mobile responsiveness validation
- [ ] T023 Final integration test: run full test suite and verify 80% coverage

## Dependencies

```text
Setup (T001-T005) → Tests (T006-T012) → Implementation (T013-T016) → Integration (T017-T018) → Polish (T019-T023)

Key Dependencies:
- T001 (i18n install) blocks T005 (i18n config)
- T002-T004 (locale files) must complete before T006-T012 (tests)
- T013 (types) blocks T014 (composable)
- T014 (composable) blocks T015-T016 (components)
- T015-T016 (components) block T017 (integration)
- All implementation (T013-T016) must complete before integration (T017-T018)
```

## Parallel Example

```text
# Launch locale file creation together (T002-T004):
Task: "Create Estonian locale file locales/et.json with greeting translation"
Task: "Create Ukrainian locale file locales/uk.json with greeting translation"
Task: "Create British English locale file locales/en-GB.json with greeting translation"

# Launch test writing together (T006-T012):
Task: "Component test for LanguageSwitcher in tests/components/LanguageSwitcher.test.ts"
Task: "Component test for enhanced HelloWorld in tests/components/HelloWorld.test.ts"
Task: "Unit test for useLanguage composable in tests/unit/useLanguage.test.ts"
Task: "E2E test for default language display in tests/e2e/language-default.spec.ts"
Task: "E2E test for language switching flow in tests/e2e/language-switching.spec.ts"
Task: "E2E test for preference persistence in tests/e2e/language-persistence.spec.ts"
Task: "E2E test for browser locale auto-detection in tests/e2e/language-detection.spec.ts"
```

## Implementation Notes

### Language Storage

- Use localStorage with graceful degradation (no sessionStorage fallback)
- Key: 'esmuseum-language-preference'
- Handle storage failures silently

### Browser Detection

- Use navigator.language API with Estonian fallback
- Support: 'uk' → Ukrainian, 'en-\*' → British English, other → Estonian
- Auto-detection preference flag in storage

### Component Architecture

- LanguageSwitcher: Standalone, reusable, accessible
- HelloWorld: Enhanced with $t() for translations
- useLanguage: Global state management composable

### Testing Strategy

- Component tests: Language switching, persistence, accessibility
- E2E tests: User journeys, browser scenarios, performance
- TDD: All tests must fail before implementation

## Validation Checklist

_GATE: Checked by main() before returning_  

- [x] All contracts have corresponding tests (Component, Browser API, Configuration)
- [x] All entities have model tasks (Language, Translation, UserPreference as TypeScript interfaces)
- [x] All tests come before implementation (T006-T013 before T014-T019)
- [x] Parallel tasks truly independent (different files, no shared dependencies)
- [x] Each task specifies exact file path (all paths provided)
- [x] No task modifies same file as another [P] task (verified file separation)

## Constitutional Compliance

- **TypeScript Strict**: All new code uses strict TypeScript with proper interfaces
- **TDD Workflow**: Tests written before implementation, must fail first
- **Performance**: Bundle size <10KB increase, language switching <100ms
- **Accessibility**: WCAG 2.1 AA compliance with ARIA labels and keyboard navigation
- **Security**: HTTPS enforced, no XSS vulnerabilities with Vue template escaping
