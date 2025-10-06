# Plan Template Customization Changelog

**Template**: `.specify/templates/plan-template.md`  
**Date**: 2025-10-06  
**Status**: Customized for ES Museum Map App (Vue 3 + Nuxt 3)

## Changes Made

### 1. Technical Context Section ✅

**Changed From**: Generic language/framework placeholders
**Changed To**: Vue 3 + Nuxt 3 specific context

**New Fields**:

- Framework/Version: Vue 3.4+ (Composition API) + Nuxt 3.13+
- Language: TypeScript 5.x (strict mode)
- UI Framework: Naive UI 2.x + Tailwind CSS 3.x
- Map Library: Leaflet 1.9+ (via leaflet.client.js plugin)
- State Management: Vue reactivity (ref, reactive, computed, watch)
- API Integration: Entu API (via useEntuApi, useEntuAuth composables)
- Testing: Vitest + @vue/test-utils
- Project Type: web (Nuxt 3 application)
- Component Architecture: SFC with \<template>, \<script setup>, \<style scoped>
- Composables Strategy: Logic decomposition approach
- Server Routes: Optional API routes in server/ directory

**Removed Fields**:

- Generic "Language/Version" (replaced with specific framework stack)
- Generic "Primary Dependencies" (integrated into framework fields)
- Generic "Storage" (not primary focus for frontend app)

---

### 2. Project Structure Section ✅

**Changed From**: Multi-option placeholders (single/web/mobile)
**Changed To**: Concrete Nuxt 3 application structure

**New Structure**:

```text
app/
├── components/          # Auto-imported Vue components
├── composables/         # Auto-imported composables
├── pages/               # File-based routing
├── server/api/          # Server API routes (optional)
├── plugins/             # Nuxt plugins
├── middleware/          # Route middleware
├── utils/               # Utility functions
├── types/               # TypeScript definitions
└── assets/

tests/
├── component/           # Component tests
├── composable/          # Composable tests
└── integration/         # E2E tests
```

**Added Conventions**:

- Auto-imports for components, composables, utilities
- File naming: PascalCase for components, camelCase for composables
- SFC structure order: template → script setup → style scoped
- Composable pattern: `use` prefix, return reactive state + methods
- Client-only plugins: `.client.js` suffix for browser-only code
- Type safety: TypeScript strict mode, explicit return types

---

### 3. Phase 0: Research Section ✅

**Changed From**: Generic research task generation
**Changed To**: Vue 3 + Nuxt 3 specific research areas

**New Research Categories**:

1. **Component Architecture**:

   - Naive UI component selection
   - Component complexity assessment
   - Composition strategy (slots, props, emits)

2. **Composables Design**:

   - State decomposition (ref/reactive/computed choices)
   - Side effects handling (watch, lifecycle hooks)
   - Composable dependencies and reuse

3. **Reactivity Patterns**:

   - ref vs reactive decisions
   - Computed dependencies and performance
   - Deep vs shallow reactivity needs

4. **Nuxt Features**:

   - SSR/CSR strategy
   - Auto-imports scope
   - Plugin requirements (client vs universal)

5. **Map Integration** (Leaflet):

   - Layer types (tile, marker, GeoJSON)
   - Map state management in reactivity system
   - Event handling patterns

6. **API Integration** (Entu):

   - useEntuApi usage patterns
   - Server routes vs client fetching
   - Error and loading state handling

7. **TypeScript Patterns**:
   - Interface definitions
   - Generic types for composables
   - Runtime type guards

**Output Enhancement**: research.md now includes Vue/Nuxt patterns documentation

---

### 4. Phase 1: Design & Contracts Section ✅

**Changed From**: Generic entity/API contract generation
**Changed To**: Vue component and composable contract generation

**New Contract Structure**:

1. **data-model.md Format**:

   ```markdown
   ## Components

   ### ComponentName

   - Props: { prop: Type }
   - Emits: event names
   - Slots: slot names

   ## Composables

   ### useFeature

   - Input: parameters with types
   - Returns: { state: Ref<T>, methods: ... }

   ## Types

   interface definitions
   ```

2. **Contract Files** (`/contracts/*.ts`):

   - TypeScript interfaces for props/emits
   - Composable function signatures with types
   - Page route metadata

3. **Test Generation**:
   - Component tests with @vue/test-utils mounting
   - Composable tests with Vitest
   - TDD approach (tests fail initially)

**Example Patterns Added**:

```typescript
// Component contract
export interface ComponentProps {
  prop: Type;
}

// Component test
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
```

---

### 5. Phase 2: Task Planning Section ✅

**Changed From**: Generic model/service/endpoint task patterns
**Changed To**: Vue component/composable/page task patterns

**New Task Patterns**:

1. **Component Task**:

   - Test file: `tests/component/ComponentName.spec.ts` [P]
   - Implementation: `app/components/ComponentName.vue`
   - Structure: `<template>` → `<script setup>` → `<style scoped>`

2. **Composable Task**:

   - Test file: `tests/composable/useFeature.spec.ts` [P]
   - Implementation: `app/composables/useFeature.ts`
   - Pattern: `export function useFeature() { return { state, methods } }`

3. **Page Task**:

   - Implementation: `app/pages/feature/index.vue`
   - Route metadata configuration
   - Auto-imported component usage

4. **Plugin Task** (if needed):
   - Implementation: `app/plugins/feature.client.ts`
   - Pattern: `export default defineNuxtPlugin(nuxtApp => { ... })`

**Ordering Strategy Updated**:

```text
1. Types (TypeScript interfaces)
2. Composables (state management)
3. Components (UI using composables)
4. Pages (layouts using components)
5. Plugins (feature initialization)
```

**Parallel Execution Rules**:

- Independent component tests [P]
- Independent composable tests [P]
- Different file paths [P]
- Same component (sequential, no [P])
- Composable dependencies (sequential)

**Example Task Breakdown**:

```text
T001: Install dependencies [if new Naive UI components]
T002: Create TypeScript types in types/feature.ts
T003: Create tests/component/FeatureComponent.spec.ts [P]
T004: Create tests/composable/useFeature.spec.ts [P]
T005: Create app/composables/useFeature.ts
T006: Create app/components/FeatureComponent.vue
T007: Create app/pages/feature/index.vue
T008: Integration test for user story
T009-T011: Polish (accessibility, responsive, docs)
```

---

## Customization Summary

### What Was Added ✅

- Vue 3 Composition API specific context
- Nuxt 3 application structure and conventions
- Component/composable/page research categories
- TypeScript contract patterns for Vue components
- Vitest + @vue/test-utils test patterns
- TDD workflow for component development
- Nuxt auto-import awareness
- Leaflet and Entu API integration patterns

### What Was Removed ❌

- Generic backend/API patterns (not primary focus)
- Multi-option structure placeholders (concrete Nuxt structure)
- Generic entity/service/endpoint terminology (replaced with component/composable/page)

### What Was Preserved ✅

- Constitution check gates (unchanged)
- Phase execution flow (0 → 1 → 2 → tasks command)
- Progress tracking checklist
- Complexity tracking for violations
- Agent file update mechanism
- TDD philosophy (tests before implementation)

---

## Impact on Downstream Templates

### templates/tasks-template.md

**Status**: Needs update (Todo #10)
**Required Changes**:

- Add Vue component task examples
- Add composable task examples
- Add Vitest test patterns
- Update task ordering for component dependencies

### templates/spec-template.md

**Status**: May need review
**Potential Changes**:

- Add component requirements section?
- Add UX interaction patterns?
- Ensure user stories map to components

### Constitution principles

**Status**: Future enhancement
**Potential Additions**:

- Composition API best practices
- Accessibility requirements
- Performance budgets for components

---

## Testing Plan

**Next Steps** (Todo #11):

1. Run `/specify` with simple feature description
2. Run `/clarify` to test Vue-specific questions
3. Run `/plan` to test updated template
4. Validate generated artifacts:
   - research.md includes Vue patterns
   - data-model.md has component/composable structure
   - contracts/ has TypeScript definitions
   - Tests use Vitest + @vue/test-utils
5. Identify gaps and iterate

**Success Criteria**:

- research.md answers Vue/Nuxt specific questions
- data-model.md clearly defines component architecture
- Generated contracts are valid TypeScript
- Test files use correct Vitest patterns
- Task breakdown follows Vue dependency order

---

**Version**: 1.0.0  
**Author**: Phase 3 customization  
**Last Updated**: 2025-10-06
