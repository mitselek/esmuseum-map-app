# Tasks: Evil DST Map Schedule (F028)

**Input**: Design documents from `/specs/028-evil-dst/`  
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow Summary

This task list follows Test-Driven Development (TDD) principles:

1. **Setup Phase**: Create TypeScript types and CSS animations (can be done in parallel)
2. **Test-First Phase**: Write all tests that MUST FAIL before implementation
3. **Implementation Phase**: Write code to make tests pass (Red → Green)
4. **Integration Phase**: Run integration tests and fix any failures
5. **Polish Phase**: Manual testing and documentation

**CRITICAL TDD Rule**: Tasks T002-T004 (tests) MUST be completed and MUST show failing tests before starting T005-T007 (implementation).

---

## Phase 3A.1: Setup Tasks

- [ ] **T001 [P]** Create DST TypeScript types in `types/dst.ts`
  - Define `DSTTransitionInfo` interface per contract
  - Export interface for use in composables
  - No dependencies, can be done first
  - ~10 lines of code
  - File: `/home/michelek/Documents/github/esmuseum-map-app/types/dst.ts`

- [ ] **T002 [P]** Add CSS animation for red pulsation in `app/assets/tailwind.css`
  - Add `@keyframes evil-dst-pulse` with 1.0s cycle
  - Dark base: `rgb(15, 15, 15)`, red tint: `rgb(60, 15, 15)`
  - Define `.evil-dst-active` class with animation
  - ~15 lines CSS
  - File: `/home/michelek/Documents/github/esmuseum-map-app/app/assets/tailwind.css`

---

## Phase 3A.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE IMPLEMENTATION

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation in Phase 3A.3**  

### Composable Tests

- [ ] **T003 [P]** Test useBackgroundPulse() composable in `tests/composable/useBackgroundPulse.spec.ts`
  - Test: `activatePulse()` adds 'evil-dst-active' class to document.body
  - Test: `deactivatePulse()` removes class from document.body
  - Test: `isDSTActive` ref updates to true when activated
  - Test: `isDSTActive` ref updates to false when deactivated
  - Use `@vue/test-utils` and vitest mocking for document.body
  - Tests WILL FAIL (no implementation yet) - TDD Red phase
  - ~60 lines of test code
  - File: `/home/michelek/Documents/github/esmuseum-map-app/tests/composable/useBackgroundPulse.spec.ts`

- [ ] **T004 [P]** Test DST detection functions in `tests/composable/useMapStyleScheduler.spec.ts`
  - Test: `getLastSundayOfOctober(2025)` returns October 26, 2025
  - Test: `getLastSundayOfOctober(2024)` returns October 27, 2024
  - Test: `isDSTTransition()` returns true when mocked to Oct 26, 2025 at 3:30 AM
  - Test: `isDSTTransition()` returns false on normal nights (Oct 15, 3:30 AM)
  - Test: `isDSTTransition()` returns false on spring DST (March 30, 3:30 AM)
  - Test: `isDSTTransition()` returns false after 4:00 AM on transition day
  - Use `vi.useFakeTimers()` and `vi.setSystemTime()` for date mocking
  - Tests WILL FAIL initially - TDD Red phase
  - Add to existing test file (if exists) or create new
  - ~80 lines of test code
  - File: `/home/michelek/Documents/github/esmuseum-map-app/tests/composable/useMapStyleScheduler.spec.ts`

- [ ] **T005 [P]** Create integration test for DST scheduler behavior in `tests/integration/evil-dst-scheduler.spec.ts`
  - Test: DST rule activation during mocked transition (Oct 26, 3:30 AM)
    - Assert: scheduler applies 'toner' style
    - Assert: body has 'evil-dst-active' class
    - Assert: console logs activation timestamp
  - Test: Priority override - DST rule (priority 100) wins over other rules
    - Mock multiple rules with priority 100
    - Assert: DST rule selected first (array order tie-breaking)
  - Test: Clean deactivation when DST period ends (4:01 AM)
    - Assert: background class removed
    - Assert: console logs deactivation timestamp
  - Use `vi.useFakeTimers()` for time control
  - Use `vi.spyOn(console, 'log')` for logging assertions
  - Tests WILL FAIL until composables implemented - TDD Red phase
  - ~120 lines of test code
  - File: `/home/michelek/Documents/github/esmuseum-map-app/tests/integration/evil-dst-scheduler.spec.ts`

---

## Phase 3A.3: Core Implementation (ONLY after tests are failing)

**Dependency**: All tests (T003-T005) must be written and failing before starting this phase.

### Composables

- [ ] **T006** Implement useBackgroundPulse() composable in `app/composables/useBackgroundPulse.ts`
  - Create `isDSTActive` ref initialized to `false`
  - Implement `activatePulse()`:
    - Set `isDSTActive.value = true`
    - Add 'evil-dst-active' class to `document.body.classList`
  - Implement `deactivatePulse()`:
    - Set `isDSTActive.value = false`
    - Remove 'evil-dst-active' class from `document.body.classList`
  - Return `{ isDSTActive, activatePulse, deactivatePulse }`
  - Follow UseBackgroundPulseReturn contract interface
  - Make tests from T003 pass (TDD Green phase)
  - ~40 lines of code
  - **Dependency**: T003 tests must exist and be failing
  - File: `/home/michelek/Documents/github/esmuseum-map-app/app/composables/useBackgroundPulse.ts`

- [ ] **T007** Add DST detection functions to useMapStyleScheduler in `app/composables/useMapStyleScheduler.ts`
  - Implement `getLastSundayOfOctober(year: number): Date`
    - Start at October 31 of given year
    - Walk backwards until Sunday (day 0)
    - Return Date object at midnight
  - Implement `isDSTTransition(): boolean`
    - Get current date/time
    - Calculate last Sunday of October for current year
    - Check if today matches transition date
    - Check if current hour is 3 (both occurrences of 3-4 AM)
    - Return boolean
  - Follow GetLastSundayOfOctober and IsDSTTransition contract types
  - Make tests from T004 pass (TDD Green phase)
  - ~60 lines added to existing file
  - **Dependency**: T004 tests must exist and be failing
  - File: `/home/michelek/Documents/github/esmuseum-map-app/app/composables/useMapStyleScheduler.ts`

- [ ] **T008** Add DST rule to styleRules array in `app/composables/useMapStyleScheduler.ts`
  - Import `useBackgroundPulse` composable
  - Add DST rule object at START of styleRules array (priority tie-breaking):

    ```typescript
    {
      id: 'dst-transition',
      name: 'Evil DST Transition',
      description: 'Black & white toner + red pulse during fall DST transition (3-4 AM repeated hour)',
      styleId: 'toner',
      priority: 100,  // HIGH priority
      check: isDSTTransition
    }
    ```

  - Modify `applyScheduledStyle()` to integrate background pulsation:
    - If DST rule is active: call `activatePulse()`
    - If DST rule was active but now inactive: call `deactivatePulse()`
  - Add timestamp logging per FR-008:
    - On activation: `console.log(\`[${timestamp}] DST activated\`)`
    - On deactivation: `console.log(\`[${timestamp}] DST deactivated\`)`
  - Follow DSTStyleRule contract interface
  - Make integration tests from T005 pass (TDD Green phase)
  - ~30 lines added to existing file
  - **Dependencies**: T006 (useBackgroundPulse exists), T007 (detection functions exist), T005 (tests exist)
  - File: `/home/michelek/Documents/github/esmuseum-map-app/app/composables/useMapStyleScheduler.ts`

---

## Phase 3A.4: Integration & Validation

- [ ] **T009** Run and fix integration tests
  - Execute: `npm run test -- evil-dst-scheduler`
  - Execute: `npm run test:unit -- useBackgroundPulse`
  - Execute: `npm run test:unit -- useMapStyleScheduler`
  - Debug any test failures
  - Ensure all scenarios pass (Green checkmarks)
  - Verify test coverage >80% for composables
  - **Dependencies**: T006, T007, T008 (all implementation complete)
  - Files tested: All files from T003-T005

---

## Phase 3A.5: Polish & Manual Testing

- [ ] **T010 [P]** Manual testing following quickstart.md scenarios
  - Scenario 1: DST rule detection with time mock (verify toner style + red pulse)
  - Scenario 2: Priority override test (DST wins over other priority 100 rules)
  - Scenario 3: Normal night validation (no activation at 3 AM on regular nights)
  - Scenario 4: Manual style override during DST (verify background continues pulsating)
  - Scenario 5: DST deactivation test (verify clean removal at 4:01 AM)
  - Scenario 6: Spring DST validation (verify no activation in March)
  - Accessibility check: Measure pulse cycle time (target: 1.0 second)
  - Console debugging commands: Test all commands in quickstart.md
  - Document any issues or edge cases discovered
  - **Dependency**: T009 (all tests passing)
  - Reference: `/home/michelek/Documents/github/esmuseum-map-app/specs/028-evil-dst/quickstart.md`

- [ ] **T011 [P]** Update documentation
  - Add JSDoc comments to `useBackgroundPulse()` composable
  - Add JSDoc comments to `getLastSundayOfOctober()` function
  - Add JSDoc comments to `isDSTTransition()` function
  - Update CLAUDE.md agent context file (if not auto-updated)
  - Verify README.md doesn't need updates (easter egg - no user-facing docs)
  - **Dependency**: T008 (implementation complete)

---

## Dependencies Summary

```text
Setup Phase (Parallel):
  T001 (types) [P]
  T002 (CSS) [P]

Test-First Phase (Parallel - MUST complete before implementation):
  T003 (useBackgroundPulse tests) [P]
  T004 (DST detection tests) [P]
  T005 (integration test skeleton) [P]

Implementation Phase (Sequential):
  T006 (useBackgroundPulse impl) ← depends on T003
  T007 (DST detection impl) ← depends on T004
  T008 (DST rule integration) ← depends on T005, T006, T007

Integration Phase (Sequential):
  T009 (run tests) ← depends on T006, T007, T008

Polish Phase (Parallel):
  T010 (manual testing) ← depends on T009
  T011 (documentation) ← depends on T008
```

## Parallel Execution Examples

### Parallel Batch 1: Setup Tasks

```bash
# Can all run simultaneously (different files, no dependencies)
Task T001: "Create DST TypeScript types in types/dst.ts"
Task T002: "Add CSS animation in app/assets/tailwind.css"
```

### Parallel Batch 2: Test-First Tasks

```bash
# Can all run simultaneously (different test files, TDD Red phase)
Task T003: "Test useBackgroundPulse() in tests/composable/useBackgroundPulse.spec.ts"
Task T004: "Test DST detection in tests/composable/useMapStyleScheduler.spec.ts"
Task T005: "Create integration test in tests/integration/evil-dst-scheduler.spec.ts"
```

### Sequential Implementation (Must wait for tests to exist and fail)

```bash
# T006 can only start after T003 exists and fails
Task T006: "Implement useBackgroundPulse() in app/composables/useBackgroundPulse.ts"

# T007 can only start after T004 exists and fails
Task T007: "Add DST detection functions to app/composables/useMapStyleScheduler.ts"

# T008 can only start after T005, T006, T007 complete
Task T008: "Add DST rule to styleRules array in app/composables/useMapStyleScheduler.ts"

# T009 can only start after all implementation complete
Task T009: "Run and fix integration tests"
```

### Parallel Batch 3: Polish Tasks

```bash
# Can run simultaneously after T009 passes
Task T010: "Manual testing following quickstart.md"
Task T011: "Update documentation and JSDoc comments"
```

---

## Task Validation Checklist

- [x] All composables have corresponding tests (T003, T004 for T006, T007)
- [x] Integration test covers full feature (T005)
- [x] All tests come before implementation (T003-T005 before T006-T008)
- [x] Types defined before composables (T001 before T006-T008)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Accessibility considerations included (T010 - 1.0s pulse validation)
- [x] TypeScript types are explicit (no `any` - per contracts)
- [x] Cleanup tasks included (useBackgroundPulse removes class on deactivate)
- [x] TDD workflow enforced (Red → Green → Refactor)
- [x] Manual testing scenarios documented (T010 references quickstart.md)

---

## Estimated Complexity

- **Simple tasks**: T001, T002 (~10-15 min each)
- **Medium tasks**: T003, T004, T006, T007 (~20-30 min each)
- **Complex tasks**: T005 (integration test setup), T008 (rule integration), T009 (debugging) (~30-45 min each)
- **Manual tasks**: T010 (manual testing - ~30-45 min), T011 (documentation - ~15 min)
- **Total estimated time**: 3-4 hours for experienced Vue/Nuxt developer

---

## Notes

- **[P] tasks** = different files, no dependencies, safe to parallelize
- **TDD Critical Rule**: Verify T003-T005 tests fail before implementing T006-T008
- **Commit strategy**: Commit after each task for clean Git history
- **Test execution**: Run `npm run test` frequently during implementation
- **Console debugging**: Use commands from quickstart.md to manually trigger DST behavior
- **Constitution compliance**: All tasks follow Type Safety, Composable-First, Test-First principles
- **Performance**: CSS animations are GPU-accelerated, DST check adds <1ms to scheduler
- **Accessibility**: 1.0 second pulse cycle is WCAG compliant (<3 Hz threshold)

---

_Based on plan.md Phase 2 task strategy and TDD workflow requirements_  
