---
description: "Implementation plan template for feature development"
scripts:
  sh: scripts/bash/update-agent-context.sh __AGENT__
  ps: scripts/powershell/update-agent-context.ps1 -AgentType __AGENT__
---

# Implementation Plan: Daylight Saving Time Map Schedule (Evil DST)

**Branch**: `028-evil-dst` | **Date**: 2025-10-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/028-evil-dst/spec.md`

## Execution Flow (/plan command scope)

```text
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Add a new HIGH-priority scheduling rule to the existing map style scheduler (F024) that activates during the annual daylight saving time "fall back" transition in Estonia. When the hour from 3:00 AM to 4:00 AM repeats twice (last Sunday of October), the map will display "toner" (black & white) style with a red pulsating background effect at 1.0 second heartbeat rhythm. This "evil DST" feature acknowledges the temporal anomaly with dramatic visual treatment, overriding all other scheduled map styles during the 2-hour transition period.

## Technical Context

**Framework/Version**: Vue 3.4+ (Composition API) + Nuxt 3.13+  
**Language**: TypeScript 5.x (strict mode)  
**UI Framework**: Naive UI 2.x + Tailwind CSS 3.x  
**Map Library**: Leaflet 1.9+ (via leaflet.client.js plugin)  
**State Management**: Vue reactivity (ref, reactive, computed, watch)  
**API Integration**: N/A (client-side only feature)  
**Testing**: Vitest with @nuxt/test-utils, component tests with @vue/test-utils  
**Target Platform**: Web (SSR/CSR hybrid via Nuxt)  
**Project Type**: web (Nuxt 3 application)  
**Performance Goals**: <10ms rule evaluation (per F024 NFR-1), no impact to existing 5-minute scheduler interval  
**Constraints**:

- Must integrate with existing useMapStyleScheduler composable from F024
- Must use existing SunCalc library for astronomical calculations
- DST detection must be dynamic (no hardcoded dates)
- Background pulsation must be CSS-based for performance (no JS animation loops)
- Must be accessibility-safe (1.0 sec pulse avoids photosensitivity issues)

**Scale/Scope**:

- 1 new rule added to existing scheduler (4 rules → 5 rules)
- 1 new composable for background pulsation logic
- Modify 1 existing composable (useMapStyleScheduler) to add DST rule
- ~50-100 lines of new code in scheduler
- ~30-50 lines for background pulsation composable
- 3-5 test files (rule evaluation, DST detection, background effect)

**Component Architecture**: Single-file components (SFC) with \<template>, \<script setup lang="ts">, \<style scoped>  
**Composables Strategy**:

- Extend existing useMapStyleScheduler with new DST rule
- Create new useBackgroundPulse composable for red pulsation effect
- Follow existing StyleRule interface pattern from F024

**Server Routes**: N/A (client-side only)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Type Safety First ✓ PASS

- No use of `any` type anticipated
- TypeScript interfaces for DST rule structure (extends existing StyleRule interface)
- Type-safe DST date calculation functions
- Strict TypeScript mode maintained

### II. Composable-First Development ✓ PASS

- New useBackgroundPulse composable for red pulsation logic (independently testable)
- Extends existing useMapStyleScheduler composable (follows established pattern)
- Clear single responsibility: DST detection separate from background effect
- Well-documented TypeScript types

### III. Test-First Development ✓ PASS

- Unit tests for DST date calculation (last Sunday of October logic)
- Unit tests for isDSTTransition() check function
- Unit tests for background pulsation composable
- Integration test for rule priority (DST HIGH overrides Independence Day HIGH)
- Test coverage target: >80% for composables (per constitution)

### IV. Observable Development ✓ PASS

- Minimal logging per clarifications: activation/deactivation timestamps only
- Silent error logging if DST detection/style application fails (per FR-011)
- Follows existing scheduler console.log pattern from F024
- No user-facing error messages (easter egg nature)

### V. Pragmatic Simplicity ✓ PASS

- Extends existing scheduler pattern (no new architecture)
- Uses existing SunCalc library (no new dependencies)
- CSS-based pulsation (no complex JS animation)
- Simple rule check: date match + time range validation

### VI. Strategic Integration Testing ✓ PASS

- Integration test: DST rule activation during simulated transition
- Integration test: Rule priority validation (HIGH vs HIGH tie-breaking)
- No complex user journey required (easter egg discovery)

### VII. API-First Server Design ✓ N/A

- Client-side only feature (no server routes needed)

**GATE RESULT**: ✓ PASS - All applicable constitutional principles satisfied. No violations to track.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

**Nuxt 3 Application Structure** (esmuseum-map-app):

```text
app/
├── components/           # Vue components (auto-imported)
│   ├── AppHeader.vue
│   ├── TaskSidebar.vue
│   ├── TaskMapCard.vue
│   ├── InteractiveMap.vue
│   └── [feature]/       # Feature-specific components
│       └── Component.vue
├── composables/         # Composables (auto-imported)
│   ├── useLocation.ts
│   ├── useEntuApi.ts
│   ├── useTaskDetail.ts
│   └── [feature]/       # Feature-specific composables
│       └── useFeature.ts
├── pages/               # File-based routing (auto-imported)
│   ├── index.vue        # / route
│   ├── auth/            # /auth/* routes
│   │   └── callback.vue
│   └── [feature]/       # Feature-specific pages
│       └── index.vue
├── server/              # Server API routes (optional)
│   └── api/
│       └── [endpoint].ts
├── plugins/             # Nuxt plugins
│   ├── leaflet.client.js
│   └── [feature].client.ts
├── middleware/          # Route middleware
│   └── auth.ts
├── utils/               # Utility functions
│   └── helpers.ts
├── types/               # TypeScript type definitions
│   └── [feature].ts
└── assets/
    └── tailwind.css

tests/
├── component/           # Component tests (@vue/test-utils)
│   └── [Component].spec.ts
├── composable/          # Composable tests
│   └── [useComposable].spec.ts
└── integration/         # E2E/integration tests
    └── [feature].spec.ts
```

**Key Conventions**:

- **Auto-imports**: Components, composables, and utilities are auto-imported by Nuxt
- **File naming**: PascalCase for components (AppHeader.vue), camelCase for composables (useLocation.ts)
- **SFC structure**: `<template>` → `<script setup lang="ts">` → `<style scoped>`
- **Composables**: Start with `use` prefix, return reactive state and methods
- **Client-only**: Plugins with `.client.js` suffix for browser-only code (Leaflet)
- **Type safety**: TypeScript strict mode, explicit types for composable returns

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - For each NEEDS CLARIFICATION → research task
   - For each new Naive UI component → usage research
   - For each new Leaflet feature → pattern research
   - For each composable design decision → best practices task

2. **Vue 3 + Nuxt 3 specific research areas**:

   ```text
   Testing Infrastructure (REQUIRED - analyze first):
     - Check package.json for test libraries (@vue/test-utils, @nuxt/test-utils, vitest)
     - Scan tests/ directory for existing test patterns
     - Are tests mounting components or testing logic only?
     - Document actual testing approach in research.md
   
   Component Architecture:
     - Which Naive UI components needed? (n-button, n-card, n-modal, etc.)
     - Custom component complexity (presentational vs. smart components)?
     - Component composition strategy (slots, props, emits)?
   
   Composables Design:
     - State decomposition (which ref/reactive/computed needed)?
     - Side effects handling (watch, watchEffect, lifecycle hooks)?
     - Composable dependencies (which existing composables to reuse)?
   
   Reactivity Patterns:
     - ref vs reactive choice for each state piece?
     - Computed dependencies and performance implications?
     - Deep vs shallow reactivity needs?
   
   Nuxt Features:
     - SSR/CSR strategy (client-only components, asyncData, useFetch)?
     - Auto-imports scope (which utils/composables are auto-imported)?
     - Plugin requirements (client-only vs universal)?
   
   Map Integration (if applicable):
     - Leaflet layer types (tile layer, marker layer, GeoJSON)?
     - Map state management (center, zoom, markers in ref/reactive)?
     - Event handling (map clicks, marker interactions)?
   
   API Integration (if applicable):
     - useEntuApi usage patterns?
     - Server API routes vs client-side fetching?
     - Error handling and loading states?
   
   TypeScript Patterns:
     - Interface definitions needed?
     - Generic types for reusable composables?
     - Type guards for runtime validation?
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen - performance, DX, maintainability]
   - Alternatives considered: [what else evaluated]
   - Vue/Nuxt patterns: [specific implementation approach]

**Output**: research.md with all NEEDS CLARIFICATION resolved and Vue/Nuxt patterns documented

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_  

1. **Extract component structure from feature spec** → `data-model.md`:

   - **Components**: List all Vue components needed (naming, props, emits, slots)
   - **Composables**: State management composables with return types
   - **Types**: TypeScript interfaces for data structures
   - **Pages**: Nuxt pages with route params and query handling
   - **Plugins**: If client-only or universal plugins needed

   **Example data-model.md structure**:

   ```markdown
   ## Components
   ### TaskPriorityBadge
   - Props: { priority: 'low' | 'medium' | 'high' | 'urgent', size?: 'small' | 'medium' }
   - Emits: (none)
   - Slots: (none)
   
   ## Composables
   ### useTaskPriority
   - Input: taskId (Ref<string>)
   - Returns: { priority: Ref<Priority>, updatePriority: (newPriority) => Promise<void> }
   
   ## Types
   interface Priority {
     level: 'low' | 'medium' | 'high' | 'urgent'
     color: string
     icon: string
   }
   ```

2. **Generate component contracts** from functional requirements:

   - For each component → TypeScript interface for props/emits
   - For each composable → function signature with types
   - For each page → route metadata and params
   - Output contract files to `/contracts/` as TypeScript definitions

   **Example contracts/TaskPriorityBadge.contract.ts**:

   ```typescript
   export interface TaskPriorityBadgeProps {
     priority: 'low' | 'medium' | 'high' | 'urgent'
     size?: 'small' | 'medium'
   }
   
   export interface TaskPriorityBadgeEmits {
     // None for this component
   }
   ```

3. **Generate component tests** from contracts:

   - One test file per component in `tests/component/`
   - Assert prop validation, emit behavior, slot rendering
   - Tests must fail (no implementation yet) - use TDD approach
   - Use @vue/test-utils mounting patterns

   **Example test structure**:

   ```typescript
   import { mount } from '@vue/test-utils'
   import { describe, it, expect } from 'vitest'
   import TaskPriorityBadge from '~/components/TaskPriorityBadge.vue'
   
   describe('TaskPriorityBadge', () => {
     it('should render with priority prop', () => {
       const wrapper = mount(TaskPriorityBadge, {
         props: { priority: 'high' }
       })
       expect(wrapper.text()).toContain('high')
     })
   })
   ```

4. **Extract test scenarios** from user stories:

   - Each story → integration test scenario in quickstart.md
   - Manual test steps for UI interactions
   - Expected outcomes and validation criteria
   - Screenshot/video capture points if visual validation needed

5. **Update agent file incrementally** (O(1) operation):
   - Run `{SCRIPT}`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW Vue/Nuxt patterns from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md (component/composable structure), /contracts/\*.ts (TypeScript contracts), failing Vitest tests, quickstart.md (manual test scenarios), agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_  

**Task Generation Strategy** (Vue 3 + Nuxt 3 specific):

The /tasks command will generate approximately **8-12 tasks** following test-first development (TDD) principles:

### Setup Tasks (1-2 tasks)

<!-- markdownlint-disable MD029 -->

1. **Create TypeScript types** (`types/dst.ts`)
   - Define DSTTransitionInfo interface
   - No dependencies, can be done first

### Test-First Tasks (3-4 tasks, marked [P] for parallel)

2. **Create useBackgroundPulse tests** [P]
   - `tests/composable/useBackgroundPulse.spec.ts`
   - Test: activatePulse adds class
   - Test: deactivatePulse removes class
   - Test: isDSTActive ref updates
   - Tests will FAIL (no implementation yet) - TDD approach

3. **Create DST detection tests** [P]
   - `tests/composable/useMapStyleScheduler.spec.ts` (add to existing)
   - Test: getLastSundayOfOctober(2025) returns Oct 26
   - Test: isDSTTransition() with various mocked dates
   - Tests will FAIL initially

4. **Create integration test skeleton** [P]
   - `tests/integration/evil-dst-scheduler.spec.ts`
   - Test: DST rule activation scenario
   - Test: Priority override validation
   - Tests will FAIL until composables implemented

### Implementation Tasks (3-4 tasks, sequential dependencies)

5. **Implement useBackgroundPulse composable**
   - `app/composables/useBackgroundPulse.ts`
   - Make tests from Task #2 pass
   - ~40 lines of code
   - Dependency: Task #2 tests exist

6. **Add DST detection functions to useMapStyleScheduler**
   - Modify `app/composables/useMapStyleScheduler.ts`
   - Implement getLastSundayOfOctober()
   - Implement isDSTTransition()
   - Make tests from Task #3 pass
   - ~60 lines added
   - Dependency: Task #3 tests exist

7. **Add DST rule to styleRules array**
   - Same file: `app/composables/useMapStyleScheduler.ts`
   - Add DST rule object with priority 100
   - Integrate useBackgroundPulse calls in applyScheduledStyle()
   - Add timestamp logging
   - Dependency: Task #5 (useBackgroundPulse) and Task #6 (detection functions)

### Styling Tasks (1 task)

8. **Add CSS animation for red pulsation**
   - Add @keyframes to `app/assets/tailwind.css` or new `app/assets/evil-dst.css`
   - Define .evil-dst-active class
   - ~15 lines CSS
   - No dependencies (can be done anytime)

### Integration & Polish Tasks (2-3 tasks)

9. **Run and fix integration tests**
   - Execute tests from Task #4
   - Debug any failures
   - Ensure all scenarios pass
   - Dependency: Tasks #5, #6, #7 complete

10. **Manual testing & documentation** (optional)
    - Follow quickstart.md scenarios
    - Verify console commands work
    - Test accessibility (pulse timing)
    - Update any documentation gaps

**Ordering Strategy**:

```text
Parallel Phase:
  T1 (types) [P]
  T2 (useBackgroundPulse tests) [P]
  T3 (DST detection tests) [P]
  T4 (integration test skeleton) [P]
  T8 (CSS) [P]

Sequential Phase:
  T5 (useBackgroundPulse impl) ← depends on T2
  T6 (DST detection impl) ← depends on T3
  T7 (DST rule integration) ← depends on T5, T6
  T9 (integration test fix) ← depends on T7
  T10 (manual testing) ← depends on T9
```

**TDD Workflow**:

- Write tests first (Tasks #2-4)
- Tests fail initially (expected - Red phase of Red-Green-Refactor)
- Implement to make tests pass (Tasks #5-7 - Green phase)
- Refactor if needed (during implementation)

**Estimated Complexity**:

- Simple tasks: T1, T8 (~10-15 min each)
- Medium tasks: T2, T3, T5, T6 (~20-30 min each)
- Complex tasks: T7 (integration), T9 (debugging) (~30-45 min each)
- **Total**: 3-4 hours for experienced Vue/Nuxt developer

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_  

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_No constitutional violations - this section left empty_  

No deviations from constitutional principles. All requirements satisfied:

- Type safety maintained (no `any` types)
- Composable-first approach (useBackgroundPulse, extends useMapStyleScheduler)
- Test-first development workflow
- Observable (minimal logging per clarifications)
- Pragmatic simplicity (extends existing patterns)
- Strategic integration testing (DST-specific scenarios)
- No server routes needed (client-side only)

## Progress Tracking

_This checklist is updated during execution flow_  

**Phase Status**:

- [x] Phase 0: Research complete (/plan command) - research.md created
- [x] Phase 1: Design complete (/plan command) - data-model.md, contracts/, quickstart.md, CLAUDE.md created
- [x] Phase 2: Task planning complete (/plan command - approach documented)
- [x] Phase 3: Tasks generated (/tasks command) - tasks.md created with 11 tasks
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS (all principles satisfied)
- [x] Post-Design Constitution Check: PASS (no violations introduced)
- [x] All NEEDS CLARIFICATION resolved (Technical Context complete)
- [x] Complexity deviations documented (none - section empty)

**Artifacts Generated**:

- [x] `specs/028-evil-dst/plan.md` (this file)
- [x] `specs/028-evil-dst/research.md`
- [x] `specs/028-evil-dst/data-model.md`
- [x] `specs/028-evil-dst/quickstart.md`
- [x] `specs/028-evil-dst/contracts/useBackgroundPulse.contract.ts`
- [x] `specs/028-evil-dst/contracts/dstDetection.contract.ts`
- [x] `specs/028-evil-dst/contracts/dstTypes.contract.ts`
- [x] `specs/028-evil-dst/tasks.md` (11 tasks: T001-T011)
- [x] `CLAUDE.md` (agent context file updated)

---

_Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`_
