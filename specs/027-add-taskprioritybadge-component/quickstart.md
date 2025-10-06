# Quickstart: TaskPriorityBadge Component Testing

**Feature**: 027-add-taskprioritybadge-component  
**Date**: October 7, 2025  
**Branch**: `027-add-taskprioritybadge-component`

## Prerequisites

- ✅ Feature branch checked out
- ✅ Dependencies installed (`npm install`)
- ✅ Dev server running (`npm run dev`)
- ✅ Component implemented in `app/components/TaskPriorityBadge.vue`

## Quick Visual Test

### Create Test Page

Create a temporary test page at `app/pages/test-priority-badge.vue`:

```vue
<template>
  <div class="p-8 space-y-4">
    <h1 class="text-2xl font-bold mb-4">TaskPriorityBadge Component Test</h1>
    
    <section class="space-y-2">
      <h2 class="text-xl font-semibold">Priority Levels</h2>
      <div class="flex gap-4">
        <TaskPriorityBadge priority="low" />
        <TaskPriorityBadge priority="medium" />
        <TaskPriorityBadge priority="high" />
      </div>
    </section>
    
    <section class="space-y-2">
      <h2 class="text-xl font-semibold">Size Variants</h2>
      <div class="flex gap-4 items-center">
        <TaskPriorityBadge priority="high" size="small" />
        <TaskPriorityBadge priority="high" size="medium" />
        <TaskPriorityBadge priority="high" size="large" />
      </div>
    </section>
    
    <section class="space-y-2">
      <h2 class="text-xl font-semibold">In Task List Context</h2>
      <div class="space-y-2">
        <div v-for="task in mockTasks" :key="task.id" class="flex items-center justify-between p-2 border rounded">
          <span>{{ task.title }}</span>
          <TaskPriorityBadge :priority="task.priority" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const mockTasks = [
  { id: 1, title: 'Critical bug fix', priority: 'high' as const },
  { id: 2, title: 'Feature request', priority: 'medium' as const },
  { id: 3, title: 'Documentation update', priority: 'low' as const },
]
</script>
```

### Manual Test Steps

1. **Navigate to test page**
   ```
   http://localhost:3000/test-priority-badge
   ```

2. **Visual Verification**
   - ✅ Low priority badge is **green** with text "Low"
   - ✅ Medium priority badge is **yellow/orange** with text "Medium"
   - ✅ High priority badge is **red** with text "High"

3. **Size Variant Check**
   - ✅ Small badge is noticeably smaller than medium
   - ✅ Large badge is noticeably larger than medium
   - ✅ All badges maintain proper text readability

4. **Context Integration Check**
   - ✅ Badges align properly in task list rows
   - ✅ Badges are visually distinct from task title text
   - ✅ Badges maintain consistent spacing

5. **Responsive Check**
   - Resize browser to mobile width (< 640px)
   - ✅ Badges scale appropriately
   - ✅ Text remains readable

6. **Theme Check** (if dark mode implemented)
   - Toggle dark/light mode
   - ✅ Badge colors adapt to theme
   - ✅ Contrast remains accessible

## Acceptance Scenario Tests

### Scenario 1: Display High Priority Task

**Given**: A task with priority "high"  
**When**: TaskPriorityBadge is rendered with `priority="high"`  
**Then**: 
- ✅ Badge displays with red background
- ✅ Badge shows text "High"
- ✅ Badge has aria-label "Priority: high"

**Manual Test**:
```vue
<TaskPriorityBadge priority="high" />
```
Check: Red badge with "High" text appears

---

### Scenario 2: Display Medium Priority Task

**Given**: A task with priority "medium"  
**When**: TaskPriorityBadge is rendered with `priority="medium"`  
**Then**:
- ✅ Badge displays with yellow/orange background
- ✅ Badge shows text "Medium"
- ✅ Badge has aria-label "Priority: medium"

**Manual Test**:
```vue
<TaskPriorityBadge priority="medium" />
```
Check: Yellow/orange badge with "Medium" text appears

---

### Scenario 3: Display Low Priority Task

**Given**: A task with priority "low"  
**When**: TaskPriorityBadge is rendered with `priority="low"`  
**Then**:
- ✅ Badge displays with green background
- ✅ Badge shows text "Low"
- ✅ Badge has aria-label "Priority: low"

**Manual Test**:
```vue
<TaskPriorityBadge priority="low" />
```
Check: Green badge with "Low" text appears

---

### Scenario 4: Multiple Badges in List

**Given**: Multiple tasks with different priorities  
**When**: TaskPriorityBadge components are rendered for each task  
**Then**:
- ✅ Each badge displays correct color for its priority
- ✅ Badges are visually distinct from each other
- ✅ All badges align consistently

**Manual Test**: Check "In Task List Context" section on test page

---

## Edge Case Tests

### Edge Case 1: Missing Priority

**Test**:
```vue
<TaskPriorityBadge />
<!-- TypeScript error: Property 'priority' is missing -->
```

**Expected**: TypeScript compilation error prevents this

**Fallback Test** (JavaScript context):
```vue
<TaskPriorityBadge :priority="undefined" />
```
**Expected**: Component renders nothing (no badge displayed)

---

### Edge Case 2: Invalid Priority (Runtime)

**Test** (requires bypassing TypeScript):
```vue
<TaskPriorityBadge :priority="'invalid' as any" />
```

**Expected**: 
- Dev mode: Console warning logged
- Production: Component renders nothing

---

### Edge Case 3: Custom Size

**Test**:
```vue
<TaskPriorityBadge priority="high" size="large" />
```

**Expected**: Badge displays at larger size while maintaining readability

---

## Accessibility Tests

### Screen Reader Test

1. Enable screen reader (macOS: VoiceOver, Windows: NVDA)
2. Navigate to test page
3. Tab through badges

**Expected**:
- ✅ Each badge is announced as "Priority: [level]"
- ✅ Badge type and text are both conveyed

### Keyboard Navigation

1. Tab through page elements
2. ✅ Badges do not interfere with tab order (non-interactive)

### Color Contrast

1. Use browser DevTools accessibility checker
2. ✅ All badge colors meet WCAG AA contrast ratios

---

## Performance Verification

### Render Time Check

1. Open browser DevTools → Performance tab
2. Record page load
3. Check TaskPriorityBadge render time

**Expected**: <50ms render time per badge

### Re-render Performance

1. Change priority prop dynamically
2. Observe re-render time

**Expected**: Immediate (<16ms for 60fps)

---

## Cleanup

After testing, delete test page:
```bash
rm app/pages/test-priority-badge.vue
```

---

## Automated Test Verification

Run automated tests to verify all scenarios:

```bash
npm run test tests/component/TaskPriorityBadge.spec.ts
```

**Expected**: All tests pass ✅

---

## Sign-off Checklist

- [ ] All priority levels render correctly
- [ ] Color coding matches spec (red/yellow/green)
- [ ] Size variants work as expected
- [ ] Edge cases handled gracefully
- [ ] Accessibility requirements met
- [ ] Performance goals achieved (<50ms)
- [ ] Automated tests pass
- [ ] Component ready for use in production

**Tester**: _______________  
**Date**: _______________  
**Status**: [ ] PASS  [ ] FAIL
