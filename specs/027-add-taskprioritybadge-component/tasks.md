# Tasks: TaskPriorityBadge Component

**Input**: Design documents from `/specs/027-add-taskprioritybadge-component/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Feature**: Display color-coded task priority badges (high/medium/low) using Naive UI
**Scope**: Single Vue 3 component with TypeScript types and comprehensive tests
**Complexity**: Minimal (pure presentational component, no business logic)

---

## Execution Flow Summary

```text
✅ Loaded plan.md - Tech stack: Vue 3.4+, Nuxt 3.13+, TypeScript 5.x, Naive UI 2.x
✅ Loaded data-model.md - Component: TaskPriorityBadge.vue with typed props
✅ Loaded contracts/ - TaskPriorityBadge.contract.ts with priority types
✅ Loaded research.md - Decisions: Naive UI n-tag, no composable needed
✅ Loaded quickstart.md - Manual test scenarios defined

Task Generation:
- Setup: Type definitions (1 task)
- Tests: Component tests (1 task) - TDD approach
- Core: Component implementation (1 task)
- Polish: Accessibility, documentation (2 tasks)
- Total: 5 tasks (4 can run in parallel)
```

---

## Phase 3A.1: Setup

### T001 [P] Create TypeScript type definitions

**File**: `types/priority.ts`

**Description**: Create shared TypeScript types for task priority based on contracts/TaskPriorityBadge.contract.ts

**Requirements**:
- Export `TaskPriority` type: `'low' | 'medium' | 'high'`
- Export `PriorityBadgeSize` type: `'small' | 'medium' | 'large'`
- Export `PriorityTagType` type: `'success' | 'warning' | 'error'`
- Add JSDoc comments for each type

**Acceptance**:
- File exists at `types/priority.ts`
- All types are exported and documented
- TypeScript compilation passes

**Code Template**:
```typescript
/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high'

/**
 * Priority badge size variants for Naive UI n-tag
 */
export type PriorityBadgeSize = 'small' | 'medium' | 'large'

/**
 * Naive UI tag types for priority color mapping
 */
export type PriorityTagType = 'success' | 'warning' | 'error'
```

---

## Phase 3A.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: This test MUST be written and MUST FAIL before implementation (T003)**

### T002 [P] Component test for TaskPriorityBadge.vue

**File**: `tests/component/TaskPriorityBadge.spec.ts`

**Description**: Create comprehensive component tests following TDD approach. Tests will initially fail since component doesn't exist yet.

**Requirements** (from data-model.md and quickstart.md):

1. **Priority rendering tests**:
   - Test 'low' priority renders green badge with text "Low"
   - Test 'medium' priority renders yellow badge with text "Medium"
   - Test 'high' priority renders red badge with text "High"

2. **Naive UI integration tests**:
   - Verify n-tag component is used
   - Verify correct type prop: low→'success', medium→'warning', high→'error'

3. **Size prop tests**:
   - Test default size is 'small'
   - Test custom size prop is respected

4. **Edge case tests**:
   - Test component renders nothing when priority is undefined
   - Test TypeScript prevents invalid priority values

5. **Accessibility tests**:
   - Test aria-label is present: "Priority: {level}"

**Test Structure**:
```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TaskPriorityBadge from '~/app/components/TaskPriorityBadge.vue'

describe('TaskPriorityBadge', () => {
  describe('Priority Rendering', () => {
    it('should render low priority with green badge and "Low" text', () => {
      const wrapper = mount(TaskPriorityBadge, {
        props: { priority: 'low' }
      })
      // Assert n-tag with type="success" and text "Low"
    })
    
    it('should render medium priority with yellow badge and "Medium" text', () => {
      // ...
    })
    
    it('should render high priority with red badge and "High" text', () => {
      // ...
    })
  })
  
  describe('Size Variants', () => {
    it('should use small size by default', () => {
      // ...
    })
    
    it('should respect custom size prop', () => {
      // ...
    })
  })
  
  describe('Edge Cases', () => {
    it('should render nothing when priority is undefined', () => {
      // ...
    })
  })
  
  describe('Accessibility', () => {
    it('should have aria-label for screen readers', () => {
      // ...
    })
  })
})
```

**Acceptance**:
- Test file exists at `tests/component/TaskPriorityBadge.spec.ts`
- All 7+ test cases implemented
- Tests FAIL (component not implemented yet)
- `npm run test tests/component/TaskPriorityBadge.spec.ts` shows failing tests

**Dependencies**: T001 (needs type definitions)

---

## Phase 3A.3: Core Implementation (ONLY after T002 tests are failing)

### T003 Create TaskPriorityBadge.vue component

**File**: `app/components/TaskPriorityBadge.vue`

**Description**: Implement single-file Vue component to make T002 tests pass

**Requirements** (from data-model.md and contracts/):

1. **Template**:
   - Use Naive UI `<n-tag>` component
   - Conditional rendering with `v-if="priority"`
   - Dynamic `:type` binding for color
   - Dynamic `:size` binding
   - Aria-label for accessibility

2. **Script Setup**:
   - Use `<script setup lang="ts">`
   - Import types from `types/priority.ts`
   - Define props with TypeScript interface
   - Create computed property for tag type mapping
   - Create computed property for display text

3. **Props Interface**:
   ```typescript
   interface Props {
     priority: TaskPriority
     size?: PriorityBadgeSize
   }
   ```

4. **Priority Mapping Logic**:
   - low → type="success", text="Low"
   - medium → type="warning", text="Medium"
   - high → type="error", text="High"

**Component Template**:
```vue
<template>
  <n-tag 
    v-if="priority" 
    :type="tagType" 
    :size="size || 'small'"
    :aria-label="`Priority: ${priority}`"
  >
    {{ displayText }}
  </n-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TaskPriority, PriorityBadgeSize, PriorityTagType } from '~/types/priority'

interface Props {
  priority: TaskPriority
  size?: PriorityBadgeSize
}

const props = defineProps<Props>()

const tagType = computed<PriorityTagType>(() => {
  const typeMap: Record<TaskPriority, PriorityTagType> = {
    low: 'success',
    medium: 'warning',
    high: 'error',
  }
  return typeMap[props.priority]
})

const displayText = computed<string>(() => {
  const textMap: Record<TaskPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  }
  return textMap[props.priority]
})
</script>
```

**Acceptance**:
- Component file exists at `app/components/TaskPriorityBadge.vue`
- Uses `<script setup lang="ts">`
- Props are strictly typed
- All T002 tests now PASS
- `npm run test tests/component/TaskPriorityBadge.spec.ts` shows all green
- TypeScript compilation passes with no errors

**Dependencies**: T002 (tests must exist and be failing)

**Validation**:
- Run tests: `npm run test tests/component/TaskPriorityBadge.spec.ts`
- Check TypeScript: `npx nuxi typecheck`
- Manual test: Follow quickstart.md test page

---

## Phase 3A.5: Polish

### T004 [P] Accessibility and documentation audit

**Files**: `app/components/TaskPriorityBadge.vue`

**Description**: Final accessibility verification and JSDoc documentation

**Requirements**:

1. **Accessibility Checklist**:
   - ✅ Aria-label present and descriptive
   - ✅ No color-only information (text label included)
   - ✅ Component is keyboard-navigation friendly (non-interactive, no focus needed)
   - ✅ Screen reader announces priority level

2. **Documentation**:
   - Add JSDoc comment block above component
   - Document props with descriptions
   - Add usage examples in comment

**Documentation Template**:
```vue
<script setup lang="ts">
/**
 * TaskPriorityBadge Component
 * 
 * Displays a color-coded badge representing task priority level.
 * Uses Naive UI's n-tag component for consistent theming.
 * 
 * @example
 * ```vue
 * <TaskPriorityBadge priority="high" />
 * <TaskPriorityBadge priority="medium" size="large" />
 * ```
 * 
 * Color Mapping:
 * - low: Green (success)
 * - medium: Yellow (warning)
 * - high: Red (error)
 */
</script>
```

**Acceptance**:
- JSDoc comments added
- Accessibility checklist verified
- Component ready for production use

**Dependencies**: T003 (component must be implemented)

---

### T005 [P] Update project documentation

**Files**: `specs/027-add-taskprioritybadge-component/README.md` (create new)

**Description**: Create feature README documenting the component

**Requirements**:

1. **Feature Overview**:
   - Purpose and use cases
   - Screenshot or visual example

2. **Usage Guide**:
   - Installation (already part of project)
   - Import (auto-imported by Nuxt)
   - Props reference
   - Examples

3. **Integration Notes**:
   - Where component is used (list current usage)
   - Future extension ideas (e.g., 'urgent' priority)

**Template**:
```markdown
# TaskPriorityBadge Component

## Overview

Reusable Vue 3 component for displaying color-coded task priority badges.

## Usage

```vue
<template>
  <TaskPriorityBadge :priority="task.priority" />
</template>
```

Component is auto-imported by Nuxt - no explicit import needed.

## Props

| Prop       | Type                            | Required | Default   | Description                        |
|------------|---------------------------------|----------|-----------|------------------------------------|
| `priority` | `'low' \| 'medium' \| 'high'`   | Yes      | -         | Priority level to display          |
| `size`     | `'small' \| 'medium' \| 'large'`| No       | `'small'` | Badge size (Naive UI n-tag sizes)  |

## Color Mapping

- **Low**: Green (success)
- **Medium**: Yellow/Orange (warning)
- **High**: Red (error)

## Examples

### Basic Usage
```vue
<TaskPriorityBadge priority="high" />
```

### Custom Size
```vue
<TaskPriorityBadge priority="medium" size="large" />
```

### In Task List
```vue
<div v-for="task in tasks" :key="task.id">
  <span>{{ task.title }}</span>
  <TaskPriorityBadge :priority="task.priority" />
</div>
```

## Testing

Run component tests:
```bash
npm run test tests/component/TaskPriorityBadge.spec.ts
```

## Accessibility

- Includes aria-label for screen reader support
- Uses semantic color + text (not color-only)
- Non-interactive (no keyboard navigation needed)
```

**Acceptance**:
- README.md created in feature directory
- All sections completed
- Examples are accurate and tested

**Dependencies**: T003 (component must be implemented)

---

## Dependencies Graph

```text
T001 (Types)
  ↓
T002 (Tests) ──→ T003 (Component)
                    ↓
              ┌─────┴─────┐
              ↓           ↓
         T004 (Polish)  T005 (Docs)
```

**Parallel Execution Opportunities**:
- T001, T002 can start together (T002 depends on T001 but can be written in parallel)
- T004, T005 can run together (different concerns, no file conflicts)

---

## Parallel Execution Examples

### Phase 1: Setup & Tests (Parallel)
```bash
# Can be executed together (different files):
Task T001: "Create TypeScript type definitions in types/priority.ts"
Task T002: "Component test for TaskPriorityBadge.vue in tests/component/TaskPriorityBadge.spec.ts"
```

### Phase 2: Implementation (Sequential)
```bash
# Must wait for T002 to complete and be failing:
Task T003: "Create TaskPriorityBadge.vue component in app/components/TaskPriorityBadge.vue"
```

### Phase 3: Polish (Parallel)
```bash
# Can be executed together (different concerns):
Task T004: "Accessibility and documentation audit for TaskPriorityBadge.vue"
Task T005: "Update project documentation with README.md"
```

---

## Validation Checklist

After completing all tasks:

- [ ] All tests pass: `npm run test tests/component/TaskPriorityBadge.spec.ts`
- [ ] TypeScript compilation passes: `npx nuxi typecheck`
- [ ] Component auto-imports in parent components (Nuxt convention)
- [ ] Manual testing passed (quickstart.md scenarios)
- [ ] Accessibility verified (aria-labels present)
- [ ] Documentation complete (JSDoc + README.md)
- [ ] No TypeScript `any` types used
- [ ] Code follows Vue 3 Composition API patterns
- [ ] Ready for integration into task list views

---

## Constitutional Compliance

**Review against ES Museum Map App Constitution**:

- ✅ **Type Safety First**: Strict TypeScript with literal types, no `any`
- ✅ **Composable-First Development**: N/A (pure presentational component, no business logic)
- ✅ **Test-First Development**: T002 written before T003 implementation
- ✅ **Observable Development**: N/A (no side effects, no logging needed)
- ✅ **Pragmatic Simplicity**: Single-file component, minimal complexity
- ✅ **Strategic Integration Testing**: Component tests sufficient (no integration needed)
- ✅ **API-First Server Design**: N/A (client-side component only)

**No constitutional violations detected.**

---

## Task Summary

| Phase           | Tasks | Parallel | Sequential | Time Estimate |
|-----------------|-------|----------|------------|---------------|
| Setup           | 1     | 1        | 0          | ~10 min       |
| Tests (TDD)     | 1     | 1        | 0          | ~20 min       |
| Implementation  | 1     | 0        | 1          | ~15 min       |
| Polish          | 2     | 2        | 0          | ~15 min       |
| **Total**       | **5** | **4**    | **1**      | **~60 min**   |

**Estimated Total Time**: ~60 minutes for full implementation
**Critical Path**: T001 → T002 → T003 → (T004 + T005)

---

_Generated from plan.md, data-model.md, contracts/, research.md, quickstart.md_  
_Based on Constitution v0.0.0 - See `.specify/memory/constitution.md`_
