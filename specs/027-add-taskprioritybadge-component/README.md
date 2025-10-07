# TaskPriorityBadge Component

## Overview

Reusable Vue 3 component for displaying color-coded task priority badges using Naive UI's n-tag component.

**Feature**: 027-add-taskprioritybadge-component  
**Status**: ✅ Complete  
**Branch**: `027-add-taskprioritybadge-component`

## Purpose

Provides a consistent visual indicator for task priority levels across the application. Helps users quickly identify high-priority tasks that need immediate attention.

## Usage

The component is auto-imported by Nuxt - no explicit import needed.

```vue
<template>
  <TaskPriorityBadge :priority="task.priority" />
</template>
```

## Props

| Prop       | Type                             | Required | Default   | Description                        |
|------------|----------------------------------|----------|-----------|------------------------------------|
| `priority` | `'low' \| 'medium' \| 'high'`    | Yes      | -         | Priority level to display          |
| `size`     | `'small' \| 'medium' \| 'large'` | No       | `'small'` | Badge size (Naive UI n-tag sizes)  |

## Color Mapping

The component maps priority levels to Naive UI theme colors:

- **Low**: Green (success type) - `type="success"`
- **Medium**: Yellow/Orange (warning type) - `type="warning"`
- **High**: Red (error type) - `type="error"`

Colors automatically adapt to light/dark theme settings.

## Examples

### Basic Usage
```vue
<template>
  <TaskPriorityBadge priority="high" />
</template>
```

### Custom Size
```vue
<template>
  <TaskPriorityBadge priority="medium" size="large" />
</template>
```

### In Task List
```vue
<template>
  <div v-for="task in tasks" :key="task.id" class="task-item">
    <span>{{ task.title }}</span>
    <TaskPriorityBadge :priority="task.priority" />
  </div>
</template>
```

### With Conditional Rendering
```vue
<template>
  <div class="task-card">
    <h3>{{ task.title }}</h3>
    <TaskPriorityBadge 
      v-if="task.priority" 
      :priority="task.priority"
      size="medium"
    />
  </div>
</template>
```

## Type Definitions

```typescript
// types/priority.ts
export type TaskPriority = 'low' | 'medium' | 'high'
export type PriorityBadgeSize = 'small' | 'medium' | 'large'
```

## Component Structure

```
app/components/TaskPriorityBadge.vue
├── Template: Naive UI n-tag with conditional rendering
├── Script: Composition API with TypeScript
│   ├── Props interface (priority, size?)
│   ├── tagType computed (priority → Naive UI type)
│   └── displayText computed (priority → text label)
└── No styles (uses Naive UI theming)
```

## Accessibility

- ✅ **aria-label**: Each badge has descriptive aria-label for screen readers
- ✅ **Color + Text**: Uses both color and text labels (not color-only)
- ✅ **Non-interactive**: Component is purely visual, no keyboard navigation needed
- ✅ **Theme-aware**: Works with light/dark modes via Naive UI theming

## Testing

Run component tests:
```bash
npm run test tests/component/TaskPriorityBadge.spec.ts
```

Tests cover:
- Priority-to-type mapping (low/medium/high → success/warning/error)
- Display text mapping (low/medium/high → Low/Medium/High)
- Type safety validation
- Props interface verification

## Implementation Details

### No Composable Needed

This is a pure presentational component with no business logic. All state is derived from props via computed properties. No separate composable was extracted following the "Pragmatic Simplicity" principle.

### Memory Management

No cleanup needed - component has no:
- Event listeners
- Intervals/timers
- External subscriptions
- Reactive watchers

### Performance

- **Render time**: <50ms (simple template, two computed properties)
- **Re-renders**: Only when props change (Vue reactivity optimization)
- **Bundle impact**: Minimal (uses existing Naive UI dependency)

## Integration Points

### Current Usage

*To be updated as the component is integrated into task views*

Potential integration locations:
- Task list views (`pages/tasks/`)
- Task detail panels
- Dashboard widgets
- Admin task management

### Future Enhancements

Possible extensions without breaking changes:
- Add 'urgent' priority level (requires type update + color mapping)
- Support custom colors via props (override theme defaults)
- Add tooltip on hover with priority description
- Animate priority changes (transition between states)

## Files Created

```
types/priority.ts                                  # Type definitions
app/components/TaskPriorityBadge.vue               # Component implementation
tests/component/TaskPriorityBadge.spec.ts          # Component tests
specs/027-add-taskprioritybadge-component/         # Feature documentation
├── spec.md                                        # Feature specification
├── plan.md                                        # Implementation plan
├── research.md                                    # Technical decisions
├── data-model.md                                  # Component structure
├── contracts/TaskPriorityBadge.contract.ts        # TypeScript contracts
├── quickstart.md                                  # Manual test scenarios
├── tasks.md                                       # Task breakdown
└── README.md                                      # This file
```

## Constitutional Compliance

✅ **Type Safety First**: Strict TypeScript with literal types, no `any`  
✅ **Test-First Development**: Tests written before implementation (TDD)  
✅ **Pragmatic Simplicity**: Single-file component, minimal complexity  
✅ **Observable Development**: N/A (no side effects or logging needed)

## Maintenance

- **Owner**: ES Museum Map App team
- **Dependencies**: Naive UI (existing project dependency)
- **Breaking Changes**: None expected (props are additive)
- **Documentation**: Keep README in sync with props/behavior changes

---

**Last Updated**: October 7, 2025  
**Status**: ✅ Implementation complete, tests passing
