# Data Model: TaskPriorityBadge Component

**Feature**: 027-add-taskprioritybadge-component  
**Date**: October 7, 2025

## Components

### TaskPriorityBadge

**Location**: `app/components/TaskPriorityBadge.vue`

**Purpose**: Display color-coded priority badge using Naive UI n-tag

**Props**:
```typescript
{
  priority: 'low' | 'medium' | 'high'  // Required: priority level to display
  size?: 'small' | 'medium' | 'large'  // Optional: badge size (default: 'small')
}
```

**Emits**: None (pure presentational component)

**Slots**: None (displays text only)

**Computed Properties**:
- `tagType`: Maps priority to Naive UI tag type ('success' | 'warning' | 'error')
- `displayText`: Maps priority to display text ('Low' | 'Medium' | 'High')

**Template Structure**:
```vue
<template>
  <n-tag v-if="priority" :type="tagType" :size="size" :aria-label="`Priority: ${priority}`">
    {{ displayText }}
  </n-tag>
</template>
```

## Composables

None required - component logic is self-contained.

## Types

### Priority Types

**Location**: `types/priority.ts`

```typescript
/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high'

/**
 * Priority badge size variants
 */
export type PriorityBadgeSize = 'small' | 'medium' | 'large'

/**
 * Naive UI tag types for priority mapping
 */
export type PriorityTagType = 'success' | 'warning' | 'error'
```

### Component Props Interface

**Location**: `types/components.ts` (or inline in component)

```typescript
export interface TaskPriorityBadgeProps {
  priority: TaskPriority
  size?: PriorityBadgeSize
}
```

## Pages

None - this is a reusable component used within existing pages.

## Plugins

None - no client-only or universal plugin initialization needed.

## Data Flow

```text
Parent Component
    ↓ (prop: priority)
TaskPriorityBadge
    ↓ (computed: tagType, displayText)
Naive UI n-tag
    ↓ (render)
Colored Badge Display
```

## Priority Mapping Table

| Priority | Tag Type  | Color (Naive UI Theme) | Display Text |
|----------|-----------|------------------------|--------------|
| 'low'    | 'success' | Green                  | 'Low'        |
| 'medium' | 'warning' | Yellow/Orange          | 'Medium'     |
| 'high'   | 'error'   | Red                    | 'High'       |

## Edge Cases Handling

| Scenario              | Behavior                                      |
|-----------------------|-----------------------------------------------|
| Missing priority      | Component returns null (renders nothing)      |
| Invalid priority (TS) | Type error at compile time                    |
| Invalid priority (JS) | Console.warn in dev, render nothing in prod   |
| No size specified     | Defaults to 'small'                           |

## Component Dependencies

**External**:
- Naive UI (`n-tag` component)

**Internal**:
- None (standalone presentational component)

## Usage Examples

### Basic Usage
```vue
<template>
  <TaskPriorityBadge :priority="task.priority" />
</template>
```

### With Custom Size
```vue
<template>
  <TaskPriorityBadge :priority="task.priority" size="medium" />
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

## Testing Requirements

### Unit Tests (Component)

**Test File**: `tests/component/TaskPriorityBadge.spec.ts`

**Test Cases**:
1. Should render with 'low' priority (green success tag)
2. Should render with 'medium' priority (yellow warning tag)
3. Should render with 'high' priority (red error tag)
4. Should display correct text for each priority
5. Should render nothing when priority is missing
6. Should respect size prop
7. Should have aria-label for accessibility

### Integration Tests

Not required - component is tested via parent component integration tests.

## File Locations Summary

```
app/
├── components/
│   └── TaskPriorityBadge.vue          # Component implementation
types/
└── priority.ts                         # Type definitions
tests/
└── component/
    └── TaskPriorityBadge.spec.ts      # Component tests
```
