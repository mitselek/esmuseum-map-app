---
description: "Implementation plan template for feature development"
scripts:
  sh: scripts/bash/update-agent-context.sh __AGENT__
  ps: scripts/powershell/update-agent-context.ps1 -AgentType __AGENT__
---

# Implementation Plan: Email Authentication

**Branch**: `029-add-email-authentication` | **Date**: October 14, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/029-add-email-authentication/spec.md`

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

Add email authentication provider to login page by integrating with existing OAuth.ee email provider. Users without Google/Apple/Estonian ID can authenticate using email address + verification code. Implementation involves adding single "Email" button to login UI and extending existing OAuth flow to handle `e-mail` provider. Minimal changes required (~2-4 hours) as OAuth.ee already implements email authentication with AWS SES verification codes.

## Technical Context

**Framework/Version**: Vue 3.4+ (Composition API) + Nuxt 3.17.6  
**Language**: TypeScript 5.x (strict mode)  
**UI Framework**: Naive UI 2.42.0 + Tailwind CSS 6.14.0  
**Map Library**: Leaflet 1.9.4 (via leaflet.client.js plugin)  
**State Management**: Vue reactivity (ref, reactive, computed, watch)  
**API Integration**: Entu API (via useEntuApi, useEntuAuth, useEntuOAuth composables)  
**Testing**: Vitest 3.2.4 + @nuxt/test-utils 3.19.2 (unit + integration tests, coverage with @vitest/coverage-v8)  
**Target Platform**: Web (SSR/CSR hybrid via Nuxt)  
**Project Type**: web (Nuxt 3 application)  
**Performance Goals**: <100ms button interaction, <2s OAuth redirect, existing providers' performance baseline  
**Constraints**: External dependency on Entu administrator enabling `e-mail` provider in OAuth.ee configuration  
**Scale/Scope**: 1 new provider button, extend existing OAuth composable type, no new pages/composables needed  
**Component Architecture**: Single-file components (SFC) with \<template>, \<script setup>, \<style scoped>  
**Composables Strategy**: Extend existing `useEntuOAuth` composable with `e-mail` provider constant  
**Server Routes**: N/A (OAuth flow handled by existing `/auth/callback` page)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Type Safety First

- [x] No new `any` types required - using existing OAuthProvider type
- [x] Extend existing `OAUTH_PROVIDERS` constant with `EMAIL: 'e-mail'`
- [x] Type definition already exists: `type OAuthProvider = typeof OAUTH_PROVIDERS[keyof typeof OAUTH_PROVIDERS]`
- [x] No type casts or guards needed

**Status**: PASS - Leverages existing type-safe OAuth infrastructure

### II. Composable-First Development

- [x] No new composable required - extends existing `useEntuOAuth`
- [x] Single responsibility maintained - OAuth provider management
- [x] Existing composable already tested and documented
- [x] Change is additive (new constant + button), not modifying core logic

**Status**: PASS - Minimal extension to well-tested composable

### III. Test-First Development

- [x] Write test for new provider constant in `useEntuOAuth`
- [x] Write component test for email button in login page
- [x] Write integration test for email OAuth flow
- [x] All tests must fail before implementation

**Status**: PASS - TDD approach for all changes

### IV. Observable Development

- [x] Existing structured logging in `useEntuOAuth` covers new provider
- [x] Console.log already present: `Starting OAuth flow with ${provider}`
- [x] Error handling already implemented in `startOAuthFlow`
- [x] No additional logging needed

**Status**: PASS - Existing observability sufficient

### V. Pragmatic Simplicity

- [x] Simplest possible implementation - 1 constant + 1 button
- [x] No new complexity introduced
- [x] Reuses existing OAuth architecture 100%
- [x] No optimization needed (performance already validated)

**Status**: PASS - Textbook simple extension

### VI. Strategic Integration Testing

- [x] Integration test for email OAuth flow (happy path)
- [x] Edge case: email provider not enabled (error handling)
- [x] Edge case: verification code timeout (user retry flow)
- [x] Reuse existing OAuth callback tests

**Status**: PASS - Integration tests follow critical path

### VII. API-First Server Design

- [x] N/A - No server routes required
- [x] OAuth.ee handles all server-side logic
- [x] Existing `/auth/callback` page handles token exchange

**Status**: N/A - Client-only changes

**Overall Constitution Status**: ✅ PASS - Feature aligns perfectly with all principles

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

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- **Component tasks**: Each component → test + implementation task
- **Composable tasks**: Each composable → test + implementation task [P if independent]
- **Page tasks**: Each page → component + route test
- **Integration tasks**: User story → integration test
- **Type tasks**: TypeScript interfaces in types/ directory

**Vue/Nuxt Task Patterns**:

```text
Component Task:
  - Create tests/component/ComponentName.spec.ts [P]
  - Create app/components/ComponentName.vue
  - Files: ComponentName.vue has <template>, <script setup>, <style scoped>

Composable Task:
  - Create tests/composable/useFeature.spec.ts [P]
  - Create app/composables/useFeature.ts
  - Pattern: export function useFeature() { ... return { state, methods } }

Page Task:
  - Create app/pages/feature/index.vue
  - Configure route metadata (middleware, layout)
  - Import required components (auto-imported by Nuxt)

Plugin Task (if needed):
  - Create app/plugins/feature.client.ts
  - Export default defineNuxtPlugin(nuxtApp => { ... })
```

**Ordering Strategy**:

- **TDD order**: Tests before implementation for all components/composables
- **Dependency order**:
  1. Types (TypeScript interfaces in types/)
  2. Composables (state management, logic)
  3. Components (UI using composables)
  4. Pages (layouts using components)
  5. Plugins (if feature-specific initialization needed)
- **Parallel execution**: Mark [P] for:
  - Independent component tests
  - Independent composable tests
  - Different file paths that don't share state
- **Sequential execution** (no [P]):
  - Tasks modifying same component
  - Tasks with composable dependencies
  - Integration tests requiring multiple features

**Estimated Output**: 15-25 numbered, ordered tasks in tasks.md (varies by feature complexity)

**Example Task Breakdown**:

```text
Setup:
  T001: Install dependencies (if new Naive UI components needed)
  T002: Create TypeScript types in types/feature.ts

Tests (TDD):
  T003: Create tests/component/FeatureComponent.spec.ts [P]
  T004: Create tests/composable/useFeature.spec.ts [P]

Core:
  T005: Create app/composables/useFeature.ts (make tests pass)
  T006: Create app/components/FeatureComponent.vue (make tests pass)
  T007: Create app/pages/feature/index.vue

Integration:
  T008: Integration test for user story scenario
  
Polish:
  T009: Add accessibility attributes (aria-labels)
  T010: Add responsive breakpoints (Tailwind classes)
  T011: Update documentation
```

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_  

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_  

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_  

**Phase Status**:

- [x] Phase 0: Research complete (/plan command) - research.md created
- [x] Phase 1: Design complete (/plan command) - data-model.md, contracts/, quickstart.md, .github/copilot-instructions.md
- [x] Phase 2: Task planning complete (/plan command - described approach below)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS (all principles satisfied)
- [x] Post-Design Constitution Check: PASS (no violations introduced)
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented: NONE (feature aligns perfectly with constitution)

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
