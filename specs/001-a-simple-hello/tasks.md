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

- [x] T001 Create Nuxt.js 3 project structure with TypeScript in repository root
- [x] T002 Initialize package.json with Nuxt.js 3, TypeScript, and Tailwind CSS dependencies
- [x] T003 [P] Configure ESLint and Prettier in .eslintrc.js and .prettierrc
- [x] T004 [P] Configure TypeScript strict mode in nuxt.config.ts
- [x] T005 [P] Configure Tailwind CSS in tailwind.config.js and app/assets/css/main.css
- [x] T006 [P] Set up Vitest configuration in vitest.config.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**  

- [x] T007 [P] Component test for HelloWorld.vue in tests/components/HelloWorld.test.ts
- [x] T008 [P] Basic E2E test for home page greeting display in tests/e2e/hello-world.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [x] T009 HelloWorld.vue component in app/components/HelloWorld.vue
- [x] T010 Home page integration in app/pages/index.vue
- [x] T011 Mobile-first responsive styling with Tailwind CSS classes

## Phase 3.4: Integration

- [x] T012 HTTPS configuration in nuxt.config.ts

## Phase 3.5: Polish

- [x] T013 [P] Manual quickstart.md validation
- [x] T014 [P] Basic accessibility check (heading structure)
- [x] T015 Code review and cleanup

## Dependencies

- Setup (T001-T006) before tests (T007-T008)
- Tests (T007-T008) before implementation (T009-T011)
- Core implementation (T009-T011) before integration (T012)
- Integration (T012) before polish (T013-T015)
- T009 blocks T010 (component before page)
- T010 blocks T011 (page before styling)

## Parallel Example

```text
# Phase 3.1 - Setup tasks that can run together:
Task: "Configure ESLint and Prettier in .eslintrc.js and .prettierrc"
Task: "Configure TypeScript strict mode in nuxt.config.ts" 
Task: "Configure Tailwind CSS in tailwind.config.js and app/assets/css/main.css"
Task: "Set up Vitest configuration in vitest.config.ts"

# Phase 3.2 - Test tasks that can run together:
Task: "Component test for HelloWorld.vue in tests/components/HelloWorld.test.ts"
Task: "Basic E2E test for home page greeting display in tests/e2e/hello-world.spec.ts"

# Phase 3.5 - Polish tasks that can run together:
Task: "Manual quickstart.md validation"
Task: "Basic accessibility check (heading structure)"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing (TDD principle)
- Commit after each task
- Streamlined for Hello World scope - focus on essentials
- Constitutional compliance: mobile-first, TypeScript strict, HTTPS

## Removed Bloat

**Removed tasks that were overkill for Hello World:**

- Playwright setup (too heavy for simple greeting)
- Complex E2E testing (mobile responsive, accessibility automation)
- TypeScript interfaces (no props needed for static component)
- Security headers/CORS (unnecessary for hello world)
- Performance optimization (premature for simple component)
- Build/deployment config (can be addressed later)
- Extensive validation testing (manual checks sufficient)

**Result**: 15 focused tasks instead of 26 bloated ones.

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

- [x] HelloWorld contract has corresponding test (T007)
- [x] No entities require model tasks (static component)
- [x] All tests come before implementation (T007-T008 before T009-T011)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Setup tasks establish complete Nuxt.js workspace
- [x] Constitutional requirements covered (mobile-first, TypeScript, HTTPS)
- [x] Streamlined to essential 15 tasks for Hello World scope
