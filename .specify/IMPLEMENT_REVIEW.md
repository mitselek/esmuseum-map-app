# `/implement` Command Review

**Date**: 2025-10-06  
**Status**: Safety Analysis & Recommendations  
**Command**: `/implement` - Execute Implementation Plan

## Overview

The `/implement` command is the most **powerful and potentially risky** command in the spec-kit workflow. It executes autonomous code generation based on the task list in `tasks.md`.

## How It Works

### 1. Prerequisite Script
**Script**: `scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks`

**Validation**:
- ✅ Feature directory exists (`specs/###-feature/`)
- ✅ `plan.md` exists (implementation plan)
- ✅ `tasks.md` exists (task breakdown)
- ✅ Branch matches `###-feature-name` pattern

**Returns JSON**:
```json
{
  "FEATURE_DIR": "/absolute/path/to/specs/###-feature",
  "AVAILABLE_DOCS": [
    "research.md",
    "data-model.md",
    "contracts/",
    "quickstart.md",
    "tasks.md"
  ]
}
```

### 2. Implementation Workflow

**Phase 1: Context Loading**
1. Read `tasks.md` - Complete task list with phases and dependencies
2. Read `plan.md` - Tech stack, architecture, file structure
3. Read `data-model.md` - Component/composable structure (if exists)
4. Read `contracts/` - TypeScript interfaces (if exists)
5. Read `research.md` - Technical decisions (if exists)
6. Read `quickstart.md` - Integration test scenarios (if exists)

**Phase 2: Task Parsing**
- Extract task phases: Setup → Tests → Core → Integration → Polish
- Identify dependencies: Sequential (ordered) vs Parallel [P]
- Map file paths and parallel markers

**Phase 3: Execution**
- **TDD approach**: Write tests BEFORE implementation
- **Phase-by-phase**: Complete each phase before moving to next
- **Dependency respect**: Sequential tasks in order, parallel tasks [P] together
- **Progress tracking**: Mark completed tasks with [X] in tasks.md

**Phase 4: Validation**
- Verify all tasks completed
- Check tests pass
- Validate against original specification
- Report completion summary

### 3. Error Handling

**Halt conditions**:
- Non-parallel task fails → STOP entire workflow
- Parallel task [P] fails → Continue with others, report failure

**Progress tracking**:
- Updates tasks.md after each completed task
- Provides clear error context
- Suggests recovery steps

## Risk Assessment

### 🔴 HIGH RISK Scenarios

#### 1. **Shared Composables**
**Risk**: Breaking changes to widely-used composables
```typescript
// RISKY: useLocation.ts is used by 10+ components
// AI might refactor without understanding full impact
```

**Example**: Changing return type of `useLocation()` could break:
- `InteractiveMap.vue`
- `TaskMapCard.vue`
- `LocationPicker.vue`
- `GPSPermissionPrompt.vue`
- etc.

#### 2. **Authentication Logic**
**Risk**: Security vulnerabilities in auth composables
```typescript
// RISKY: useEntuAuth.ts, useEntuOAuth.ts
// AI might introduce auth bypasses or token leaks
```

**Example**: Incorrect OAuth flow could:
- Leak access tokens
- Allow unauthorized access
- Break session management

#### 3. **State Management**
**Risk**: Reactivity bugs in complex state
```typescript
// RISKY: useTaskWorkspace.ts with nested reactive state
// AI might break ref/reactive patterns
```

**Example**: Mixing `ref` and `reactive` incorrectly:
```typescript
// WRONG (AI might generate this)
const state = reactive({
  tasks: ref([])  // ❌ ref inside reactive
})

// CORRECT
const state = reactive({
  tasks: []  // ✅ plain array in reactive
})
```

#### 4. **Leaflet Map Integration**
**Risk**: Memory leaks or performance issues
```typescript
// RISKY: InteractiveMap.vue with Leaflet instance
// AI might forget cleanup in onUnmounted
```

**Example**: Not disposing map instance:
```typescript
// WRONG
onMounted(() => {
  map = L.map('map')
  // ❌ No cleanup
})

// CORRECT
onMounted(() => {
  map = L.map('map')
})
onUnmounted(() => {
  map?.remove()  // ✅ Cleanup
})
```

#### 5. **TypeScript Type Safety**
**Risk**: `any` type escapes strict mode
```typescript
// RISKY: AI might use 'any' to bypass type errors
const data: any = await fetchData()  // ❌
```

### 🟡 MEDIUM RISK Scenarios

#### 1. **New Components**
**Risk**: Suboptimal patterns, missing accessibility
```vue
<!-- AI might generate valid but non-optimal code -->
<template>
  <div @click="doThing">  <!-- ❌ Should be <button> -->
    Click me
  </div>
</template>
```

**Mitigation**: Code review required, accessibility audit

#### 2. **Test Scaffolding**
**Risk**: Tests that pass but don't test anything useful
```typescript
// RISKY: Shallow tests
it('should render', () => {
  const wrapper = mount(Component)
  expect(wrapper.exists()).toBe(true)  // ❌ Useless test
})
```

**Mitigation**: Review test coverage, add assertions

#### 3. **Tailwind/Naive UI Integration**
**Risk**: Inconsistent styling, not using design system
```vue
<!-- AI might generate custom styles instead of Naive UI -->
<template>
  <div class="custom-button">  <!-- ❌ Should use n-button -->
    Submit
  </div>
</template>
```

**Mitigation**: Design system audit, component library check

### 🟢 LOW RISK Scenarios

#### 1. **Isolated Presentational Components**
**Risk**: Low - no shared state, no side effects
```vue
<!-- SAFE: Simple badge component -->
<template>
  <span :class="badgeClass">{{ label }}</span>
</template>
```

**Why Safe**:
- No dependencies on other components
- Pure props → rendering
- Easy to test
- Easy to review

#### 2. **Utility Functions**
**Risk**: Low - pure functions, deterministic
```typescript
// SAFE: Date formatting utility
export function formatDate(date: Date): string {
  return date.toLocaleDateString('et-EE')
}
```

**Why Safe**:
- No side effects
- Easy to unit test
- TypeScript enforces types
- Single responsibility

#### 3. **Type Definitions**
**Risk**: Very low - compile-time only
```typescript
// SAFE: Interface definitions
export interface TaskPriority {
  level: 'low' | 'medium' | 'high' | 'urgent'
  color: string
  icon: string
}
```

**Why Safe**:
- No runtime impact
- TypeScript validates usage
- Refactoring is safe (compile errors show)

## Recommendations

### ✅ SAFE to Use `/implement` For:

1. **New Isolated Components**
   - Presentational components with no side effects
   - Single-purpose UI elements
   - Badge, label, icon components
   - **Example**: TaskPriorityBadge.vue

2. **Type Definitions**
   - TypeScript interfaces in `types/` directory
   - No runtime code
   - **Example**: `types/task-priority.ts`

3. **Test Scaffolding** (with review)
   - Component test boilerplate
   - Composable test structure
   - **Example**: `tests/component/TaskPriorityBadge.spec.ts`
   - **⚠️ Caveat**: Review test quality, add assertions

4. **Utility Functions** (pure)
   - No side effects
   - Deterministic behavior
   - **Example**: Date formatting, string helpers

5. **Documentation**
   - Component prop documentation
   - README updates
   - JSDoc comments

### ⚠️ USE WITH CAUTION For:

1. **New Composables**
   - Review reactivity patterns carefully
   - Check lifecycle hook usage
   - Verify cleanup in onUnmounted
   - **Strategy**: Let AI generate, review before commit

2. **Naive UI Integration**
   - Verify correct component usage
   - Check design system consistency
   - **Strategy**: Run, then audit against design system

3. **Pages with Routing**
   - Review route metadata
   - Check middleware application
   - Verify SSR/CSR strategy
   - **Strategy**: Test navigation flows manually

### 🔴 NEVER Use `/implement` For:

1. **Authentication/Authorization**
   - Security-critical code
   - OAuth flows
   - Token management
   - **Strategy**: Manual implementation only

2. **Shared Core Composables**
   - `useLocation.ts` - GPS, permissions
   - `useEntuApi.ts` - API integration
   - `useTaskWorkspace.ts` - Complex state
   - **Strategy**: Manual implementation + peer review

3. **Map Integration**
   - Leaflet instance management
   - Memory-critical code
   - Performance-sensitive operations
   - **Strategy**: Manual implementation + testing

4. **Data Migration**
   - Database schema changes
   - Data transformation logic
   - **Strategy**: Manual implementation + backup

5. **Production Hotfixes**
   - Critical bug fixes
   - Emergency patches
   - **Strategy**: Manual fix + thorough testing

## Recommended Workflow

### Option A: Hybrid Approach (Recommended)

```bash
# 1. Generate artifacts
/specify "Add task priority badge"
/clarify  # Answer questions
/plan     # Generate plan.md, research.md, data-model.md
/tasks    # Generate tasks.md

# 2. Review task list manually
# Open specs/###-feature/tasks.md
# Identify safe vs risky tasks

# 3. Run /implement for SAFE tasks only
# Edit tasks.md - comment out risky tasks:
# T001: Create types/task-priority.ts [P]
# T002: Create tests/component/TaskPriorityBadge.spec.ts [P]
# T003: Create app/components/TaskPriorityBadge.vue
# # T004: Update useTaskDetail.ts (MANUAL - shared composable)

/implement  # Will execute T001-T003, skip T004

# 4. Implement risky tasks manually
# Review T001-T003 code quality
# Manually implement T004 with testing

# 5. Validate
/analyze  # Check consistency
npm run test  # Run all tests
```

### Option B: Manual with AI Assistance

```bash
# 1. Generate artifacts (same as Option A)
/specify "Add task priority badge"
/clarify
/plan
/tasks

# 2. Use tasks.md as CHECKLIST
# Don't run /implement at all
# Use each task description to guide manual work

# 3. Ask AI for help per-task
# "Help me implement T001: Create types/task-priority.ts"
# Review, edit, commit

# 4. Validate
/analyze
npm run test
```

### Option C: Full Automation (High Risk)

```bash
# NOT RECOMMENDED for production code
# Use ONLY for:
# - Prototypes
# - Proof of concepts
# - Throwaway experiments

/specify "Feature description"
/plan
/tasks
/implement  # 🔴 HIGH RISK - review everything carefully
```

## Quality Gates

### After `/implement` - ALWAYS:

1. **✅ Code Review**
   ```bash
   git diff  # Review all changes
   ```

2. **✅ TypeScript Validation**
   ```bash
   npm run type-check  # Ensure strict mode passes
   ```

3. **✅ Linting**
   ```bash
   npm run lint  # ESLint + Prettier
   ```

4. **✅ Test Execution**
   ```bash
   npm run test  # Vitest unit tests
   npm run test:e2e  # Integration tests (if applicable)
   ```

5. **✅ Manual Testing**
   - Test in browser
   - Check responsive design
   - Verify accessibility (keyboard nav, screen readers)
   - Test edge cases

6. **✅ Consistency Check**
   ```bash
   /analyze  # Validate against spec
   ```

7. **✅ Performance Check** (if UI component)
   - Lighthouse audit
   - Check bundle size impact
   - Verify no memory leaks (Leaflet especially)

## Constitution Alignment

### Relevant Principles:

**Principle 2: Test-Driven Discipline**
- ✅ `/implement` follows TDD (tests before code)
- ⚠️ BUT: AI-generated tests may be shallow
- **Action**: Review test quality manually

**Principle 3: Living Documentation**
- ✅ `/implement` updates progress in tasks.md
- ✅ Generated code should have JSDoc
- **Action**: Verify documentation completeness

**Principle 5: Sustainable Velocity**
- ⚠️ `/implement` can introduce tech debt if not reviewed
- **Action**: Don't sacrifice quality for speed

## Tracking `/implement` Usage

### Success Metrics:
- % of AI-generated code requiring rework
- Test coverage of AI-generated code
- Bugs introduced per `/implement` session
- Time saved vs manual implementation

### Recommended Logging:
```markdown
## /implement Usage Log

### 2025-10-06 - Task Priority Badge
- Feature: 001-task-priority-badge
- Tasks executed: T001-T003 (3 of 4)
- Manual tasks: T004 (shared composable)
- Review time: 15 min
- Issues found: 1 (missing aria-label)
- Time saved: ~45 min
- Quality: ⭐⭐⭐⭐ (good, minor fixes)
```

## Summary

### ✅ Strengths:
- Follows TDD approach (tests before code)
- Respects task dependencies
- Progress tracking in tasks.md
- Clear error handling
- Validates against spec

### ⚠️ Weaknesses:
- No human review in the loop
- Can introduce subtle bugs (reactivity, memory leaks)
- May not follow project conventions perfectly
- Test quality varies (shallow vs comprehensive)
- Security risks in auth/sensitive code

### 🎯 Best Practice:
**Use `/implement` as a FIRST DRAFT generator, not final code.**

Treat AI-generated code like junior developer output:
1. Review carefully
2. Test thoroughly
3. Refactor as needed
4. Never trust blindly

---

**Recommendation Level**: 🟡 **CONDITIONAL USE**

**Use for**: Types, tests, isolated components, utilities  
**Avoid for**: Auth, shared composables, map integration, production hotfixes  
**Always**: Review, test, validate before commit

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-10-06  
**Author**: Safety analysis for ES Museum Map App
