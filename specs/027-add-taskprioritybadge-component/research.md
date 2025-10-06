# Research: TaskPriorityBadge Component

**Feature**: 027-add-taskprioritybadge-component  
**Date**: October 7, 2025

## Research Questions from Spec

### 1. Edge Case: Missing Priority Value

**Question**: What happens when a task has no priority value?

**Decision**: Display nothing (return null from component)

**Rationale**:
- Cleaner UI - avoid cluttering with "None" or "Unknown" badges
- Follows principle of showing only meaningful information
- Parent components can handle missing priority in their own way

**Alternatives Considered**:
- Show "None" badge in gray → Rejected: adds visual noise
- Show default "Low" → Rejected: misleading, assumes priority when none set
- Throw error → Rejected: too strict for optional display component

### 2. Edge Case: Invalid Priority Value

**Question**: What happens when an invalid priority value is provided?

**Decision**: Use TypeScript strict typing + console.warn in development, display nothing in production

**Rationale**:
- TypeScript prevents invalid values at compile time
- Runtime validation provides helpful dev feedback
- Production gracefully handles edge case without breaking UI

**Alternatives Considered**:
- Throw error → Rejected: too strict, breaks parent component
- Show error badge → Rejected: confuses users with technical details
- Fallback to "Low" → Rejected: misleading data representation

### 3. Edge Case: Size Variants

**Question**: How does the badge appear in different contexts (compact lists vs. detail views)?

**Decision**: Single default size using Naive UI's `size="small"` prop, add optional `size` prop for future extensibility

**Rationale**:
- YAGNI principle: Start with one size, add variants only when needed
- Naive UI n-tag supports size="small|medium|large" out of the box
- Easy to extend later without breaking changes

**Alternatives Considered**:
- Multiple size variants immediately → Rejected: premature optimization
- Context-aware automatic sizing → Rejected: too complex, violates simplicity

## Naive UI Component Research

### n-tag Component

**Documentation**: https://www.naiveui.com/en-US/os-theme/components/tag

**Relevant Props**:
- `type`: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
- `size`: 'small' | 'medium' | 'large'
- `round`: boolean (rounded corners)
- `bordered`: boolean (add border)

**Decision**: Use `type` prop for priority mapping:
- `priority="high"` → `type="error"` (red)
- `priority="medium"` → `type="warning"` (yellow/orange)
- `priority="low"` → `type="success"` (green)

**Rationale**:
- Built-in Naive UI theming handles colors consistently
- No custom CSS needed
- Respects user's theme preferences (light/dark mode)

## Component Architecture Decisions

### Props Interface

```typescript
interface TaskPriorityBadgeProps {
  priority: 'low' | 'medium' | 'high'
  size?: 'small' | 'medium' | 'large'
}
```

**Decision**: Required `priority` prop, optional `size` prop with default 'small'

**Rationale**:
- Simple API - one required prop
- Type-safe with literal types
- Future-proof with optional size

### Component Structure

**Decision**: Minimal SFC with Composition API

```vue
<template>
  <n-tag v-if="priority" :type="tagType" :size="size">
    {{ displayText }}
  </n-tag>
</template>

<script setup lang="ts">
// Computed properties for type and text mapping
</script>
```

**Rationale**:
- Single responsibility: display priority badge
- No styles needed (Naive UI handles it)
- Computed properties for reactive type/text mapping

### No Composable Needed

**Decision**: Keep logic in component (no `usePriorityBadge` composable)

**Rationale**:
- Logic is trivial (map priority string to type/text)
- No state management or side effects
- No reuse across multiple components (badge is the component)
- Follows "Pragmatic Simplicity" - don't extract until needed

## TypeScript Patterns

### Type Definition

```typescript
// types/priority.ts
export type TaskPriority = 'low' | 'medium' | 'high'
export type PriorityBadgeSize = 'small' | 'medium' | 'large'
```

**Decision**: Create shared type definition in `types/priority.ts`

**Rationale**:
- Reusable across task-related components
- Single source of truth for priority values
- Easy to extend with additional priorities (e.g., 'urgent')

## Testing Strategy

### Test Cases

1. **Props validation**: Accepts valid priority values
2. **Rendering**: Displays correct text for each priority
3. **Type mapping**: Maps priority to correct Naive UI tag type
4. **Edge case**: Handles missing priority (renders nothing)
5. **Size prop**: Respects optional size prop

### Test Tools

- **Framework**: Vitest
- **Utils**: @vue/test-utils for mounting
- **Assertions**: expect() matchers for DOM validation

## Vue 3 / Nuxt 3 Patterns

### Auto-import

**Pattern**: Component will be auto-imported by Nuxt from `app/components/`

**Usage**:
```vue
<template>
  <TaskPriorityBadge :priority="task.priority" />
</template>
```

No explicit import needed in parent components.

### Composition API

**Pattern**: Use `<script setup>` with TypeScript

**Rationale**:
- Cleaner syntax
- Better type inference
- Auto-registered props and emits

## Performance Considerations

### Rendering Performance

**Expectation**: <50ms render time

**Approach**:
- No async operations
- Simple computed properties (O(1) lookup)
- Leverages Naive UI's optimized n-tag component
- No watchers or side effects

### Bundle Size

**Impact**: Minimal (uses existing Naive UI dependency)

## Accessibility

### ARIA Attributes

**Decision**: Add aria-label for screen readers

**Example**:
```vue
<n-tag :aria-label="`Priority: ${priority}`">
  {{ displayText }}
</n-tag>
```

**Rationale**: Ensures screen readers announce priority level clearly

## Resolution Summary

✅ All NEEDS CLARIFICATION from spec resolved:
- ✅ Missing priority → render nothing
- ✅ Invalid priority → TypeScript prevents, console.warn fallback
- ✅ Size variants → default 'small', optional size prop

✅ All research questions answered
✅ Naive UI n-tag integration researched
✅ Vue 3 patterns documented
✅ TypeScript strategy defined
✅ Testing approach planned

**Status**: Ready for Phase 1 (Design & Contracts)
