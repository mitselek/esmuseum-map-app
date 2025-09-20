# Tasks: Simple Hello World

**Input**: Design documents from `/home/michelek/Documents/github/esmuseum-map-app/specs/001-a-simple-hello/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```text
1. Load plan.md from feature directory
   → SUCCESS: Nuxt.js 3 + TypeScript + Tailwind CSS stack identified
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: No entities (static component)
   → contracts/: HelloWorld.vue component contract
   → research.md: Dependencies and setup decisions
3. Generate tasks by category:
   → Setup: Nuxt.js 3 init, TypeScript, Tailwind CSS
   → Tests: component tests, E2E tests
   → Core: HelloWorld component, home page integration
   → Integration: HTTPS configuration
   → Polish: accessibility, performance validation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → HelloWorld contract has tests ✓
   → Component implementation follows TDD ✓
   → Mobile-first responsive design ✓
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Nuxt.js full-stack**: `app/`, `tests/` at repository root
- Frontend code in `app/components/`, `app/pages/`, `app/composables/`
- API endpoints in `app/server/api/`
- Tests organized by type: `tests/components/`, `tests/integration/`, `tests/e2e/`, `tests/unit/`

## Phase 3.1: Setup

- [ ] T001 Create Nuxt.js 3 project structure with TypeScript in repository root
- [ ] T002 Initialize package.json with Nuxt.js 3, TypeScript, and Tailwind CSS dependencies
- [ ] T003 [P] Configure ESLint and Prettier in .eslintrc.js and .prettierrc
- [ ] T004 [P] Configure TypeScript strict mode in nuxt.config.ts
- [ ] T005 [P] Configure Tailwind CSS in tailwind.config.js and app/assets/css/main.css
- [ ] T006 [P] Set up Vitest configuration in vitest.config.ts
- [ ] T007 [P] Set up Playwright for E2E testing in playwright.config.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**  

- [ ] T008 [P] Component test for HelloWorld.vue in tests/components/HelloWorld.test.ts
- [ ] T009 [P] E2E test for home page greeting display in tests/e2e/hello-world.spec.ts
- [ ] T010 [P] Integration test for mobile responsive behavior in tests/e2e/mobile-responsive.spec.ts
- [ ] T011 [P] Accessibility test for heading structure in tests/e2e/accessibility.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T012 HelloWorld.vue component in app/components/HelloWorld.vue
- [ ] T013 Home page integration in app/pages/index.vue
- [ ] T014 Mobile-first responsive styling with Tailwind CSS classes
- [ ] T015 TypeScript component props and interface definitions

## Phase 3.4: Integration

- [ ] T016 HTTPS configuration in nuxt.config.ts
- [ ] T017 Security headers and CORS configuration
- [ ] T018 Performance optimization settings in Nuxt.js config
- [ ] T019 Build and deployment configuration

## Phase 3.5: Polish

- [ ] T020 [P] Accessibility validation (WCAG 2.1 AA compliance)
- [ ] T021 [P] Performance testing (Core Web Vitals, bundle size)
- [ ] T022 [P] Cross-browser compatibility testing
- [ ] T023 [P] Mobile device testing across screen sizes
- [ ] T024 [P] Manual quickstart.md validation
- [ ] T025 Code review and cleanup
- [ ] T026 Coverage verification (≥80% target)

## Dependencies

- Setup (T001-T007) before tests (T008-T011)
- Tests (T008-T011) before implementation (T012-T015)
- Core implementation (T012-T015) before integration (T016-T019)
- Integration (T016-T019) before polish (T020-T026)
- T012 blocks T013 (component before page)
- T013 blocks T014 (page before styling)

## Parallel Example

```text
# Phase 3.1 - Setup tasks that can run together:
Task: "Configure ESLint and Prettier in .eslintrc.js and .prettierrc"
Task: "Configure TypeScript strict mode in nuxt.config.ts" 
Task: "Configure Tailwind CSS in tailwind.config.js and app/assets/css/main.css"
Task: "Set up Vitest configuration in vitest.config.ts"
Task: "Set up Playwright for E2E testing in playwright.config.ts"

# Phase 3.2 - Test tasks that can run together:
Task: "Component test for HelloWorld.vue in tests/components/HelloWorld.test.ts"
Task: "E2E test for home page greeting display in tests/e2e/hello-world.spec.ts"
Task: "Integration test for mobile responsive behavior in tests/e2e/mobile-responsive.spec.ts"
Task: "Accessibility test for heading structure in tests/e2e/accessibility.spec.ts"

# Phase 3.5 - Polish tasks that can run together:
Task: "Accessibility validation (WCAG 2.1 AA compliance)"
Task: "Performance testing (Core Web Vitals, bundle size)"
Task: "Cross-browser compatibility testing"
Task: "Mobile device testing across screen sizes"
Task: "Manual quickstart.md validation"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing (TDD principle)
- Commit after each task
- This is a foundational feature - sets up entire Nuxt.js workspace
- Focus on constitutional compliance: mobile-first, TypeScript strict, HTTPS

## Task Generation Rules

_Applied during main() execution_  

1. **From Contracts**:
   - HelloWorld.vue contract → component test task [P]
   - Component contract → implementation task
2. **From Data Model**:
   - No entities (static component) → no model tasks
3. **From User Stories**:
   - Greeting display → E2E test [P]
   - Mobile responsiveness → mobile test [P]
   - Accessibility → accessibility test [P]
4. **From Research**:
   - Nuxt.js 3 + TypeScript + Tailwind → setup tasks
   - Testing strategy → Vitest + Playwright setup

## Validation Checklist

_GATE: Checked by main() before returning_  

- [x] HelloWorld contract has corresponding test (T008)
- [x] No entities require model tasks (static component)
- [x] All tests come before implementation (T008-T011 before T012-T015)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Setup tasks establish complete Nuxt.js workspace
- [x] Constitutional requirements covered (mobile-first, TypeScript, HTTPS)