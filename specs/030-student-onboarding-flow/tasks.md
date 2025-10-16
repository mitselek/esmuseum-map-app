# Tasks: FEAT-001 Student Onboarding Flow

**Input**: Design documents from `/specs/030-student-onboarding-flow/`
**Prerequisites**: plan.md (required), spec.md (required)

## Overview

This task breakdown implements FEAT-001: Student Onboarding Flow using Test-First Development (TDD) approach. Tasks are organized by user story to enable independent implementation and testing.

**Tech Stack** (from plan.md):

- Vue 3 + Nuxt 3 + TypeScript strict mode
- Naive UI components
- Vitest + Testing Library
- i18n (4 languages: et, en, uk, lv)
- Existing OAuth system (useEntuOAuth, useEntuAuth)
- Existing Entu API utilities (server/utils/entu.ts)

**User Stories** (from spec.md):

- **US-001** (P1): Student Signup via Link
- **US-002** (P1): Automated Group Assignment
- **US-003** (P1): Waiting Screen Feedback
- **US-004** (P1): Error Handling
- **US-005** (P1): Successful Onboarding

**Note**: All user stories are P1 (high priority) and interdependent - they form a single complete flow.

## Execution Flow

1. **Phase 1**: Setup - Project structure and dependencies
2. **Phase 2**: Foundational - Research existing patterns (blocking)
3. **Phase 3**: User Story 1-5 Implementation - Core onboarding flow (single increment)
4. **Phase 4**: Polish & Integration - i18n, accessibility, documentation

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1-US5)
- File paths are absolute from repository root

---

## Phase 1: Setup

**Goal**: Initialize project structure and verify environment

**Duration**: 0.5 hours

- [ ] **T001** Verify environment variables in `.env`
  - Confirm `NUXT_WEBHOOK_KEY` is set
  - Confirm `TEST_ENTU_GROUP_ID = 686a6c011749f351b9c83124`
  - Confirm `TEST_ENTU_PERSON_ID = 66b6245c7efc9ac06a437b97`
  - Confirm `NUXT_PUBLIC_ENTU_URL` and `NUXT_PUBLIC_ENTU_ACCOUNT`

- [ ] **T002** Create TypeScript types in `types/onboarding.ts`
  - Define `OnboardingState` interface (isWaiting, error, hasTimedOut)
  - Define `GroupAssignmentRequest` interface (groupId, userId)
  - Define `GroupAssignmentResponse` interface (success, message, error)
  - All types explicitly typed (no `any`)

**Checkpoint**: Environment configured, types defined

---

## Phase 2: Foundational (Research & Analysis)

**Goal**: Understand existing OAuth patterns and Entu API integration (BLOCKING)

**Duration**: 0.5 days

**CRITICAL**: These tasks MUST complete before Phase 3. Understanding existing patterns prevents breaking changes.

- [ ] **T003** Research existing OAuth flow patterns
  - Read `app/composables/useEntuOAuth.ts` - document OAuth redirect logic
  - Read `app/composables/useEntuAuth.ts` - document auth state management
  - Read `app/pages/auth/callback.vue` - document callback handling pattern
  - Document: How is state preserved during OAuth redirect?
  - Document: How are OAuth tokens stored/retrieved?

- [ ] **T004** Research Entu API group assignment
  - Read `server/utils/entu.ts` - document existing Entu API utilities
  - Research Entu API endpoint for adding user as child of group entity
  - Document required request format (headers, body, auth)
  - Document expected response format
  - Verify `NUXT_WEBHOOK_KEY` privilege requirements
  - Test group membership query endpoint format

- [ ] **T005** Document FEAT-002 testing patterns
  - Review FEAT-002 (PR #12) test structure
  - Document test file organization
  - Document mocking patterns for Entu API
  - Document test data usage patterns
  - Create testing strategy document for reference

**Deliverables**:

- Research notes document
- API endpoint documentation
- Reusable pattern inventory

**Checkpoint**: All existing patterns documented, API requirements verified

---

## Phase 3: Core Onboarding Flow (US-001 to US-005)

**Goal**: Implement complete student onboarding flow from link click to task page

**User Stories Covered**: US-001 (Signup via Link), US-002 (Group Assignment), US-003 (Waiting Screen), US-004 (Error Handling), US-005 (Success)

**Duration**: 3 days

**Test Criteria**: Student clicks signup link → authenticates → sees waiting screen → assigned to group → redirected to tasks (< 60 seconds)

### Phase 3.1: Composable Tests (TDD - Write Tests First)

**CRITICAL**: These tests MUST be written and MUST FAIL before ANY implementation in Phase 3.2

- [ ] **T006** [P] [US-002, US-003] Test `useOnboarding()` composable in `tests/composables/useOnboarding.test.ts`
  - Test state initialization (isWaiting: false, error: null, hasTimedOut: false)
  - Test `joinGroup(groupId)` calls `/api/onboard/join-group` endpoint
  - Test `pollGroupMembership(groupId)` checks membership every 2 seconds
  - Test polling stops after 30 seconds (timeout scenario)
  - Test polling stops on success (membership confirmed)
  - Test error handling (API failure, network error)
  - Test cleanup (intervals cleared on unmount)
  - Mock `$fetch` for API calls
  - Use test data: `TEST_ENTU_GROUP_ID`, `TEST_ENTU_PERSON_ID`

### Phase 3.2: Server Endpoint Tests (TDD - Write Tests First)

**CRITICAL**: These tests MUST be written and MUST FAIL before implementation in Phase 3.3

- [ ] **T007** [P] [US-002] Test server endpoint in `tests/api/onboard-join-group.test.ts`
  - Test successful group assignment (200 response)
  - Test missing webhook key validation (401 response)
  - Test invalid groupId parameter (400 response)
  - Test invalid userId parameter (400 response)
  - Test Entu API failure (500 response)
  - Test idempotent behavior (already member returns success)
  - Mock Entu API calls with MSW (Mock Service Worker)
  - Verify proper error messages and status codes

### Phase 3.3: Component Tests (TDD - Write Tests First)

**CRITICAL**: These tests MUST be written and MUST FAIL before implementation in Phase 3.4

- [ ] **T008** [P] [US-001, US-003, US-004, US-005] Test signup page in `tests/component/signup-groupId.test.ts`
  - Test route param extraction (groupId from URL)
  - Test localStorage persistence of groupId
  - Test OAuth redirect when not authenticated
  - Test waiting screen display (message + spinner)
  - Test timeout error message after 30 seconds
  - Test already member scenario (immediate redirect)
  - Test technical error display
  - Test success redirect to `/tasks`
  - Test accessibility (aria-labels, keyboard navigation)
  - Mock `useEntuAuth()`, `useEntuOAuth()`, `useOnboarding()` composables

### Phase 3.4: Composable Implementation (ONLY after tests failing)

- [ ] **T009** [US-002, US-003] Create `useOnboarding()` composable in `app/composables/useOnboarding.ts`
  - State management: `isWaiting`, `error`, `hasTimedOut` (refs)
  - Implement `joinGroup(groupId)` - calls `/api/onboard/join-group`
  - Implement `pollGroupMembership(groupId)` - polls every 2 seconds
  - Implement timeout logic (30 seconds maximum)
  - Implement error handling (API failures, timeouts)
  - Cleanup intervals in `onUnmounted`
  - Type all return values explicitly (no `any`)
  - Follow Vue 3 composition API patterns
  - Reuse existing `useEntuAuth()` for userId

**Expected Result**: All tests in T006 pass (green)

### Phase 3.5: Server Endpoint Implementation (ONLY after tests failing)

- [ ] **T010** [US-002] Create server endpoint in `server/api/onboard/join-group.post.ts`
  - Validate `NUXT_WEBHOOK_KEY` from environment (401 if missing/invalid)
  - Parse request body: `groupId`, `userId`
  - Validate parameters (400 if missing/invalid)
  - Check if user already member of group (early return if true)
  - Call Entu API to add user as child of group entity
  - Handle Entu API errors (500 with error details)
  - Return success/error response
  - Add structured logging (request, response, errors)
  - Type-safe request/response using `types/onboarding.ts`

**Expected Result**: All tests in T007 pass (green)

### Phase 3.6: Component Implementation (ONLY after tests failing)

- [ ] **T011** [US-001, US-003, US-004, US-005] Create signup page in `app/pages/signup/[groupId].vue`
  - Extract `groupId` from route params (`useRoute()`)
  - Store `groupId` in localStorage with key `onboarding_groupId`
  - Check authentication state using `useEntuAuth()`
  - If not authenticated: Store groupId → redirect to OAuth
  - If authenticated: Load groupId from localStorage
  - Check if already member using `useOnboarding().pollGroupMembership()`
  - If already member: Redirect to `/tasks` immediately
  - If not member: Call `useOnboarding().joinGroup(groupId)`
  - Display waiting screen with message and three-dot spinner
  - Start polling with `useOnboarding().pollGroupMembership()`
  - Handle timeout: Show error message with retry link
  - Handle technical errors: Display error with details
  - On success: Clear localStorage → redirect to `/tasks`
  - Accessibility: Semantic HTML, aria-labels, keyboard navigation
  - Responsive: Mobile-first design with Tailwind
  - Cleanup: Clear intervals on unmount

**Expected Result**: All tests in T008 pass (green)

### Phase 3.7: Integration Testing

- [ ] **T012** [US-001 to US-005] Manual integration test of complete flow
  - Test link click: `https://localhost:3000/signup/686a6c011749f351b9c83124`
  - Verify OAuth redirect (if not authenticated)
  - Verify waiting screen display
  - Verify polling behavior (check network tab for 2s intervals)
  - Verify timeout after 30 seconds
  - Verify success redirect to `/tasks`
  - Verify already member scenario (click link twice)
  - Test on mobile device (iOS/Android)
  - Test with screen reader (accessibility)

**Checkpoint**: Complete onboarding flow working end-to-end, all tests passing

---

## Phase 4: Polish & Integration

**Goal**: Add i18n translations, accessibility improvements, and documentation

**Duration**: 1 day

### Phase 4.1: i18n Translations

- [ ] **T013** [P] [US-003, US-004, US-005] Add Estonian translations to `app/locales/et.json`
  - `onboarding.waiting.title`: "Palun oota, kuni me seadistame sinu kontot..."
  - `onboarding.waiting.description`: "See võtab ainult hetke."
  - `onboarding.error.timeout`: "Seadistamine aegus. Palun proovi uuesti."
  - `onboarding.error.tryAgain`: "Proovi uuesti"
  - `onboarding.error.technical`: "Tehniline viga: {error}"
  - `onboarding.error.alreadyMember`: "Sa oled juba selle klassi liige."
  - `onboarding.success.redirect`: "Suuname sind oma ülesannete juurde..."

- [ ] **T014** [P] [US-003, US-004, US-005] Add English translations to `app/locales/en.json`
  - `onboarding.waiting.title`: "Please wait while we set up your account..."
  - `onboarding.waiting.description`: "This will only take a moment."
  - `onboarding.error.timeout`: "Setup timed out. Please try again."
  - `onboarding.error.tryAgain`: "Try again"
  - `onboarding.error.technical`: "Technical error: {error}"
  - `onboarding.error.alreadyMember`: "You are already a member of this class."
  - `onboarding.success.redirect`: "Redirecting to your tasks..."

- [ ] **T015** [P] [US-003, US-004, US-005] Add Ukrainian translations to `app/locales/uk.json`
  - `onboarding.waiting.title`: "Будь ласка, зачекайте, поки ми налаштовуємо ваш обліковий запис..."
  - `onboarding.waiting.description`: "Це займе лише мить."
  - `onboarding.error.timeout`: "Час налаштування вичерпано. Спробуйте ще раз."
  - `onboarding.error.tryAgain`: "Спробуйте ще раз"
  - `onboarding.error.technical`: "Технічна помилка: {error}"
  - `onboarding.error.alreadyMember`: "Ви вже є членом цього класу."
  - `onboarding.success.redirect`: "Перенаправлення до ваших завдань..."

- [ ] **T016** [P] [US-003, US-004, US-005] Add Latvian translations to `app/locales/lv.json`
  - `onboarding.waiting.title`: "Lūdzu, uzgaidiet, kamēr iestatām jūsu kontu..."
  - `onboarding.waiting.description`: "Tas aizņems tikai mirkli."
  - `onboarding.error.timeout`: "Iestatīšanas laiks beidzies. Lūdzu, mēģiniet vēlreiz."
  - `onboarding.error.tryAgain`: "Mēģiniet vēlreiz"
  - `onboarding.error.technical`: "Tehniska kļūda: {error}"
  - `onboarding.error.alreadyMember`: "Jūs jau esat šīs klases dalībnieks."
  - `onboarding.success.redirect`: "Novirzīšana uz jūsu uzdevumiem..."

### Phase 4.2: Accessibility Audit

- [ ] **T017** [US-003, US-004] Accessibility audit for signup page
  - Keyboard navigation: Tab → Enter → Escape work correctly
  - Screen reader: Aria-labels describe all interactive elements
  - Focus management: Focus moves to error message on timeout
  - Color contrast: WCAG AA compliance (4.5:1 ratio)
  - Loading state: Aria-live region announces polling status
  - Error state: Aria-live region announces errors

### Phase 4.3: Responsive Design Validation

- [ ] **T018** [US-001, US-003] Responsive design validation
  - Mobile (320px-640px): Waiting screen readable, buttons touch-friendly (min 44px)
  - Tablet (640px-1024px): Layout adapts correctly
  - Desktop (1024px+): Centered layout, readable text
  - Test on iOS Safari, Android Chrome
  - Test portrait and landscape orientations

### Phase 4.4: Documentation

- [ ] **T019** [P] Add JSDoc comments to `useOnboarding()` composable
  - Document composable purpose
  - Document all exported functions (params, return types)
  - Document state properties
  - Include usage examples

- [ ] **T020** [P] Document server endpoint in `docs/api/onboard-join-group.md`
  - Endpoint: `POST /api/onboard/join-group`
  - Authentication: Requires `NUXT_WEBHOOK_KEY`
  - Request body schema
  - Response schema
  - Error codes (401, 400, 500)
  - Usage examples

- [ ] **T021** Update README with onboarding flow section
  - Describe student onboarding feature
  - Link to Entu signup link format
  - Document environment variables
  - Reference FEAT-001 spec

### Phase 4.5: Performance Optimization

- [ ] **T022** Performance audit for signup page
  - Page load time < 3 seconds
  - API response time < 500ms for `/api/onboard/join-group`
  - Polling doesn't block UI (async/await properly used)
  - No unnecessary re-renders (check Vue DevTools)
  - Cleanup intervals on unmount (no memory leaks)

### Phase 4.6: Constitutional Compliance Verification

- [ ] **T023** Constitutional compliance audit
  - **Type Safety First**: All types explicit, no undocumented `any`
  - **Composable-First**: Logic extracted to `useOnboarding()`
  - **Test-First**: All tests written before implementation
  - **Observable Development**: Structured logging in server endpoint
  - **Mobile-First**: Responsive design verified
  - **Accessibility**: WCAG 2.1 AA compliance verified
  - **Pragmatic Simplicity**: Code review for unnecessary complexity

**Checkpoint**: All polish tasks complete, feature ready for PR

---

## Dependencies

### Sequential Dependencies

1. **T001-T002** (Setup) → MUST complete before all other tasks
2. **T003-T005** (Research) → MUST complete before Phase 3 (blocking)
3. **T006-T008** (Tests) → MUST complete before T009-T011 (TDD)
4. **T009** (Composable) → Required by T011 (Component uses composable)
5. **T010** (Server Endpoint) → Required by T009 (Composable calls endpoint)
6. **T011** (Component) → Required by T012 (Integration test)
7. **T012** (Integration) → MUST pass before Phase 4 (Polish)
8. **Phase 3** (Core) → MUST complete before Phase 4 (Polish)

### Parallel Opportunities

**Phase 1**: T001-T002 can run sequentially (fast tasks)

**Phase 2**: T003, T004, T005 are independent research tasks (can parallelize)

**Phase 3.1**: T006 (composable tests) is independent

**Phase 3.2**: T007 (server tests) is independent (can parallel with T006 if different people)

**Phase 3.3**: T008 (component tests) depends on understanding T006-T007 patterns

**Phase 4.1**: T013, T014, T015, T016 (i18n) are fully independent [P]

**Phase 4.2-4.6**: T017, T018, T019, T020, T021, T022 can run in parallel [P]

## Parallel Execution Examples

### Launch Tests Together (Phase 3.1-3.3)

```bash
# Write all tests in parallel (different files):
Task T006: "Test useOnboarding() in tests/composables/useOnboarding.test.ts"
Task T007: "Test server endpoint in tests/api/onboard-join-group.test.ts"
Task T008: "Test signup page in tests/component/signup-groupId.test.ts"
```

### Launch i18n Translations Together (Phase 4.1)

```bash
# Add translations in parallel (different files):
Task T013: "Add Estonian translations to app/locales/et.json"
Task T014: "Add English translations to app/locales/en.json"
Task T015: "Add Ukrainian translations to app/locales/uk.json"
Task T016: "Add Latvian translations to app/locales/lv.json"
```

### Launch Documentation Together (Phase 4.4)

```bash
# Write documentation in parallel (different files):
Task T019: "JSDoc comments for useOnboarding()"
Task T020: "Document endpoint in docs/api/onboard-join-group.md"
Task T021: "Update README with onboarding section"
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Goal**: Get basic signup flow working end-to-end

**Includes**:

- T001-T005 (Setup + Research)
- T006-T011 (Tests + Core Implementation)
- T012 (Integration test)
- T013-T014 (Estonian + English translations only)

**Timeline**: 3 days

**Test Criteria**: Student can click link → authenticate → join group → see tasks

### Full Feature Scope

**Includes**: All tasks (T001-T023)

**Timeline**: 5.5 days

**Test Criteria**: All acceptance criteria met, all constitutional principles verified

### Incremental Delivery Plan

1. **Day 1**: T001-T005 (Setup + Research)
2. **Day 2**: T006-T008 (Write Tests - TDD Red Phase)
3. **Day 3**: T009-T011 (Implementation - TDD Green Phase)
4. **Day 4**: T012-T016 (Integration + i18n)
5. **Day 5**: T017-T023 (Polish + Compliance)

Each day delivers a testable increment.

---

## Validation Checklist

**GATE: Checked before marking feature complete**  

### Vue 3 + Nuxt 3 Requirements

- [x] All composables have corresponding tests (T006 → T009)
- [x] All components have corresponding tests (T008 → T011)
- [x] All server endpoints have corresponding tests (T007 → T010)
- [x] All tests written before implementation (TDD order)
- [x] Types defined before composables/components (T002 → T009-T011)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Accessibility tasks included (T017)
- [x] TypeScript types are explicit (no `any`)
- [x] Cleanup tasks included (intervals cleared in onUnmounted)
- [x] i18n translations for all 4 languages (T013-T016)
- [x] Constitutional compliance verified (T023)

### Feature-Specific Requirements

- [ ] Student can complete signup in < 60 seconds (T012)
- [ ] Waiting screen shows clear feedback (T011)
- [ ] Timeout after 30 seconds with retry option (T011)
- [ ] Already member scenario handled gracefully (T011)
- [ ] All error messages translated (T013-T016)
- [ ] Mobile-responsive design verified (T018)
- [ ] Accessibility WCAG AA compliance (T017)
- [ ] Documentation complete and lint-free (T019-T021)
- [ ] Performance criteria met (T022)

---

## Success Metrics

**Measure after implementation**:

1. **Test Pass Rate**: 100% (all tests in T006-T008 pass)
2. **User Experience**: < 60 seconds from link click to tasks page
3. **Type Safety**: Zero TypeScript errors in strict mode
4. **Mobile Responsive**: Works on 320px+ screen widths
5. **Accessibility**: WCAG 2.1 Level AA compliance
6. **i18n Support**: All 4 languages working (et, en, uk, lv)
7. **Performance**: Polling completes within 30 seconds
8. **Error Handling**: All 3 error scenarios tested and working
9. **Documentation**: Markdown lint-free (no trailing spaces)
10. **Constitutional Compliance**: All 7 principles verified

---

## Notes

**TDD Reminder**: Tests MUST be written first and MUST FAIL before implementation. This ensures tests actually test the code.

**Parallel Execution**: Tasks marked [P] can run in parallel because they modify different files and have no dependencies.

**Commit Strategy**: Commit after each task for clean history. Suggested format: `feat(onboarding): [T###] Task description`

**File Paths**: All paths are absolute from repository root (`/home/michelek/Documents/github/esmuseum-map-app/`)

**Constitutional Compliance**: Every task must follow the 7 principles from `.specify/memory/constitution.md`

**Cleanup Reminder**: Include `onUnmounted` hooks for intervals, event listeners, and any side effects.

**Accessibility Reminder**: All interactive elements need aria-labels and keyboard navigation support.

**Responsive Reminder**: Use Tailwind breakpoints (sm:, md:, lg:) for responsive design.

**No Emoji**: Avoid emoji in code comments, console logs, and formal documentation.

---

## Task Summary

**Total Tasks**: 23

**By Phase**:

- Phase 1 (Setup): 2 tasks
- Phase 2 (Research): 3 tasks
- Phase 3 (Core Implementation): 7 tasks (3 test tasks, 3 implementation tasks, 1 integration)
- Phase 4 (Polish): 11 tasks

**By User Story**:

- US-001 (Signup via Link): T003, T008, T011
- US-002 (Group Assignment): T004, T006, T007, T009, T010
- US-003 (Waiting Screen): T006, T008, T009, T011, T013-T016, T017, T018
- US-004 (Error Handling): T006, T008, T009, T011, T013-T016, T017
- US-005 (Successful Onboarding): T008, T011, T013-T016

**Parallel Opportunities**: 15 tasks can run in parallel (marked with [P])

**Independent Test Criteria**: Complete onboarding flow from link click to tasks page in < 60 seconds

**Suggested MVP Scope**: T001-T014 (Setup + Research + Core + Basic i18n) = 3 days

---

## Report

**Generated**: October 16, 2025
**Feature Directory**: `/home/michelek/Documents/github/esmuseum-map-app/specs/030-student-onboarding-flow/`
**Task File**: `tasks.md`

**Summary**:

- Total tasks: 23
- Test tasks: 3 (TDD approach)
- Implementation tasks: 11
- Polish tasks: 9
- Parallel opportunities: 15 tasks
- Estimated duration: 5.5 days
- MVP duration: 3 days (T001-T014)

**Next Steps**:

1. Review tasks with team
2. Assign tasks to developers
3. Start with Phase 1 (Setup)
4. Follow TDD approach strictly (tests before implementation)
5. Commit after each task
6. Run integration test (T012) before moving to Polish phase
