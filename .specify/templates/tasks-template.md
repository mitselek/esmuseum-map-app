# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```text
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
   → Detect: Vue/Nuxt project or backend project
2. Load optional design documents:
   → data-model.md: Extract entities → model/type tasks
   → contracts/: Each file → contract/interface task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category (Vue/Nuxt):
   → Setup: dependencies, types, constants
   → Tests: component tests, composable tests, type tests
   → Core: types, composables, components
   → Integration: pages, server routes, middleware
   → Polish: accessibility, responsive, docs
   OR by category (Backend):
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
   → Vue: Types → Composables → Components → Pages
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → Vue: All components have tests? Props typed?
   → Backend: All contracts have tests? Entities modeled?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

**Vue 3 + Nuxt 3 Projects** (ES Museum Map App pattern):

- **Types**: `types/*.ts` (at repository root)
- **Composables**: `app/composables/*.ts`
- **Components**: `app/components/*.vue`
- **Pages**: `app/pages/*.vue`
- **Server**: `server/api/*.ts`, `server/middleware/*.ts`
- **Tests**: `tests/component/*.spec.ts`, `tests/composables/*.spec.ts`, `tests/unit/*.spec.ts`
- **Utils**: `utils/*.ts` (shared utilities)

**Backend Projects**:

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`

Paths shown below assume Vue/Nuxt structure - adjust based on plan.md structure.

---

## Phase 3A: Vue 3 + Nuxt 3 Task Examples

### Phase 3A.1: Setup

- [ ] T001 Install npm dependencies (Naive UI, Leaflet, etc.)
- [ ] T002 [P] Create TypeScript types in types/feature-name.ts
- [ ] T003 [P] Create constants in app/constants/feature-name.ts
- [ ] T004 [P] Update tsconfig.json if needed (paths, strict mode)

### Phase 3A.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**  

**Composable Tests**:

- [ ] T005 [P] Test useFeature() composable in tests/composables/useFeature.spec.ts
  - Test state initialization
  - Test method calls and state updates
  - Test cleanup (onUnmounted behavior)
  - Test error handling

**Component Tests**:

- [ ] T006 [P] Test FeatureCard.vue in tests/component/FeatureCard.spec.ts

  - Test props rendering
  - Test event emissions
  - Test user interactions (click, input)
  - Test accessibility (aria-labels)

- [ ] T007 [P] Test FeaturePanel.vue in tests/component/FeaturePanel.spec.ts
  - Test data display
  - Test conditional rendering
  - Test slot behavior

**Type Tests** (if complex types):

- [ ] T008 [P] Test type inference in tests/unit/types.spec.ts
  - Compile-time type checks
  - Runtime validation

### Phase 3A.3: Core Implementation (ONLY after tests are failing)

**Types** (if not created in Setup):

- [ ] T009 [P] Define Feature interface in types/feature.ts
- [ ] T010 [P] Define FeatureState type in types/feature.ts

**Composables**:

- [ ] T011 Create useFeature() in app/composables/useFeature.ts

  - Implement state management (ref, reactive)
  - Implement methods (async operations)
  - Add cleanup in onUnmounted
  - Type all return values explicitly
  - Follow use\* naming convention

- [ ] T012 [P] Create useFeatureValidation() in app/composables/useFeatureValidation.ts (if needed)

**Components**:

- [ ] T013 Create FeatureCard.vue in app/components/FeatureCard.vue

  - Template with accessibility (aria-labels)
  - Script setup with TypeScript
  - Explicit props/emits types
  - Scoped styles (prefer Tailwind)
  - Cleanup in onUnmounted

- [ ] T014 Create FeaturePanel.vue in app/components/FeaturePanel.vue
  - Use FeatureCard as child component
  - Implement slots for flexibility
  - Responsive design (Tailwind breakpoints)

### Phase 3A.4: Integration

**Pages**:

- [ ] T015 Create feature.vue page in app/pages/feature.vue
  - Use useFeature() composable
  - Use FeaturePanel component
  - Handle loading/error states
  - SEO meta tags (useHead)

**Server Routes** (if needed):

- [ ] T016 [P] Create GET /api/features in server/api/features/index.get.ts

  - Input validation
  - Error handling (4xx, 5xx)
  - Type-safe response

- [ ] T017 [P] Create POST /api/features in server/api/features/index.post.ts
  - Request body validation
  - Business logic
  - Proper status codes

**Middleware** (if needed):

- [ ] T018 Create feature auth middleware in server/middleware/feature-auth.ts

### Phase 3A.5: Polish

**Accessibility**:

- [ ] T019 [P] Accessibility audit for FeatureCard.vue

  - Keyboard navigation (tab, enter, escape)
  - Screen reader support (aria-labels)
  - Color contrast (WCAG AA)

- [ ] T020 [P] Accessibility audit for FeaturePanel.vue

**Responsive Design**:

- [ ] T021 [P] Responsive breakpoints for FeatureCard.vue (sm:, md:, lg:)
- [ ] T022 [P] Mobile testing for feature.vue page

**Documentation**:

- [ ] T023 [P] JSDoc comments for useFeature() composable
- [ ] T024 [P] Props documentation for FeatureCard.vue
- [ ] T025 [P] Update README or feature docs

**Performance** (if applicable):

- [ ] T026 Check for unnecessary re-renders (Vue DevTools)
- [ ] T027 Optimize computed properties (no side effects)

---

## Phase 3B: Backend Task Examples

### Phase 3B.1: Setup

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

### Phase 3B.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**  

- [ ] T004 [P] Contract test POST /api/users in tests/contract/test_users_post.py
- [ ] T005 [P] Contract test GET /api/users/{id} in tests/contract/test_users_get.py
- [ ] T006 [P] Integration test user registration in tests/integration/test_registration.py
- [ ] T007 [P] Integration test auth flow in tests/integration/test_auth.py

### Phase 3B.3: Core Implementation (ONLY after tests are failing)

- [ ] T008 [P] User model in src/models/user.py
- [ ] T009 [P] UserService CRUD in src/services/user_service.py
- [ ] T010 [P] CLI --create-user in src/cli/user_commands.py
- [ ] T011 POST /api/users endpoint
- [ ] T012 GET /api/users/{id} endpoint
- [ ] T013 Input validation
- [ ] T014 Error handling and logging

### Phase 3B.4: Integration

- [ ] T015 Connect UserService to DB
- [ ] T016 Auth middleware
- [ ] T017 Request/response logging
- [ ] T018 CORS and security headers

### Phase 3B.5: Polish

- [ ] T019 [P] Unit tests for validation in tests/unit/test_validation.py
- [ ] T020 Performance tests (<200ms)
- [ ] T021 [P] Update docs/api.md
- [ ] T022 Remove duplication
- [ ] T023 Run manual-testing.md

---

## Dependencies

**Vue/Nuxt Projects**:

- Types (T002) before composables/components
- Tests (T005-T008) before implementation (T011-T014)
- Composables (T011-T012) before components (T013-T014)
- Components (T013-T014) before pages (T015)
- Server routes (T016-T017) before middleware (T018)
- Implementation before polish (T019-T027)

**Backend Projects**:

- Tests (T004-T007) before implementation (T008-T014)
- T008 blocks T009, T015
- T016 blocks T018
- Implementation before polish (T019-T023)

## Parallel Example (Vue/Nuxt)

```text
# Launch T005-T008 together (all test files):
Task: "Test useFeature() composable in tests/composables/useFeature.spec.ts"
Task: "Test FeatureCard.vue in tests/component/FeatureCard.spec.ts"
Task: "Test FeaturePanel.vue in tests/component/FeaturePanel.spec.ts"
Task: "Test type inference in tests/unit/types.spec.ts"

# Launch T013-T014 together (different component files):
Task: "Create FeatureCard.vue in app/components/FeatureCard.vue"
Task: "Create FeaturePanel.vue in app/components/FeaturePanel.vue"

# Launch T019-T020 together (different files):
Task: "Accessibility audit for FeatureCard.vue"
Task: "Accessibility audit for FeaturePanel.vue"
```

## Parallel Example (Backend)

```text
# Launch T004-T007 together:
Task: "Contract test POST /api/users in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.py"
Task: "Integration test registration in tests/integration/test_integration.py"
Task: "Integration test auth in tests/integration/test_auth.py"
```

---

## Task Generation Rules

_Applied during main() execution_  

**Vue 3 + Nuxt 3 Projects**:

1. **From Contracts (TypeScript interfaces)**:

   - Each interface file → type definition task [P]
   - Each component contract → component test task [P]
   - Each composable contract → composable test task [P]

2. **From Data Model**:

   - Each entity → TypeScript type/interface task [P]
   - State management → composable creation task
   - UI representation → component creation task

3. **From User Stories**:

   - Each interaction → component test [P]
   - Each user flow → page integration test
   - Quickstart scenarios → E2E test tasks

4. **Ordering (Vue/Nuxt)**:
   - Setup → Types → Tests → Composables → Components → Pages → Polish
   - Dependencies block parallel execution
   - Types before anything that uses them
   - Composables before components that use them

**Backend Projects**:

1. **From Contracts**:

   - Each contract file → contract test task [P]
   - Each endpoint → implementation task

2. **From Data Model**:

   - Each entity → model creation task [P]
   - Relationships → service layer tasks

3. **From User Stories**:

   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering (Backend)**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_  

**Vue 3 + Nuxt 3 Projects**:

- [ ] All components have corresponding tests
- [ ] All composables have corresponding tests
- [ ] All tests come before implementation
- [ ] Types defined before composables/components
- [ ] Composables created before components that use them
- [ ] Components created before pages that use them
- [ ] Parallel tasks truly independent (different files)
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
- [ ] Accessibility tasks included for interactive components
- [ ] TypeScript types are explicit (no `any`)
- [ ] Cleanup tasks included for composables with side effects

**Backend Projects**:

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task

---

## Vue 3 + Nuxt 3 Specific Guidelines

### Component Task Pattern

Each component task should specify:

```markdown
- [ ] T### Create ComponentName.vue in app/components/ComponentName.vue
  - Template with semantic HTML and aria-labels
  - Script setup with TypeScript (explicit Props/Emits interfaces)
  - Reactive state using ref() or reactive()
  - Cleanup in onUnmounted if needed (event listeners, Leaflet, intervals)
  - Scoped styles (prefer Tailwind utility classes)
```

### Composable Task Pattern

Each composable task should specify:

```markdown
- [ ] T### Create useFeature() in app/composables/useFeature.ts
  - State management (ref, reactive, computed)
  - Business logic methods (async operations, data fetching)
  - Cleanup logic in onUnmounted (if side effects)
  - Type all return values explicitly
  - Follow use\* naming convention
  - Export single composable function
```

### Page Task Pattern

Each page task should specify:

```markdown
- [ ] T### Create feature.vue in app/pages/feature.vue
  - Use composables for business logic
  - Use components for UI
  - Handle loading/error/empty states
  - SEO meta tags (useHead, useSeoMeta)
  - Responsive design (mobile-first)
  - Accessibility (keyboard navigation, focus management)
```

### Test Task Pattern

Each test task should specify what to test:

```markdown
- [ ] T### Test ComponentName.vue in tests/component/ComponentName.spec.ts
  - Props rendering (all prop variations)
  - Event emissions (user interactions)
  - Conditional rendering (v-if, v-show logic)
  - Accessibility (aria attributes, keyboard navigation)
  - Edge cases (empty data, error states)
```

### Server Route Task Pattern

Each server route task should specify:

```markdown
- [ ] T### Create GET /api/resource in server/api/resource/index.get.ts
  - Input validation (query params, headers)
  - Business logic
  - Error handling (try/catch, proper status codes)
  - Type-safe response
  - Logging (structured logging with context)
```

---

## Notes

- **[P] tasks** = different files, no dependencies
- **Verify tests fail** before implementing (TDD principle)
- **Commit after each task** for clean history
- **Avoid**: vague tasks, same file conflicts, missing file paths
- **Vue/Nuxt**: Always specify TypeScript types explicitly
- **Cleanup**: Include onUnmounted for side effects (Leaflet, listeners, intervals)
- **Accessibility**: Include keyboard navigation and aria-labels
- **Responsive**: Use Tailwind breakpoints (sm:, md:, lg:, xl:)
