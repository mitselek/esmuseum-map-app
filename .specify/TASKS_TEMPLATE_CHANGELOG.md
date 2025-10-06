# Tasks Template Enhancement Changelog

**Template**: `.specify/templates/tasks-template.md`  
**Date**: 2025-10-06  
**Status**: Enhanced for Vue 3 + Nuxt 3 projects

## Overview

Enhanced the generic tasks template to support **both Vue 3 + Nuxt 3 frontend projects AND traditional backend projects**, with comprehensive task patterns, dependency management, and quality guidelines for each stack.

**File Size**: ~170 lines → 455 lines (+285 lines, 268% increase)

**Phase Numbering Structure**:

- **Phase 3**: Task Examples (overall phase from spec-kit workflow)
  - **Phase 3A**: Vue 3 + Nuxt 3 Task Examples (sub-phases 3A.1-3A.5)
  - **Phase 3B**: Backend Task Examples (sub-phases 3B.1-3B.5)

This structure clarifies that 3A and 3B are alternative implementations within Phase 3, not separate sequential phases.

---

## Major Enhancements

### 1. Dual-Stack Support (Vue/Nuxt + Backend)

**BEFORE**: Generic backend-only task examples
**AFTER**: Separate, comprehensive task examples for both stacks

**Execution Flow** now detects project type:

```text
→ Detect: Vue/Nuxt project or backend project
→ Generate tasks by category (Vue/Nuxt):
  → Setup: dependencies, types, constants
  → Tests: component tests, composable tests, type tests
  → Core: types, composables, components
  → Integration: pages, server routes, middleware
  → Polish: accessibility, responsive, docs
OR by category (Backend):
  → Setup, Tests, Core, Integration, Polish
```

---

### 2. Vue 3 + Nuxt 3 Path Conventions (NEW)

Added project-specific path structure:

```markdown
**Vue 3 + Nuxt 3 Projects** (ES Museum Map App pattern):

- **Types**: types/\*.ts (at repository root)
- **Composables**: app/composables/\*.ts
- **Components**: app/components/\*.vue
- **Pages**: app/pages/\*.vue
- **Server**: server/api/_.ts, server/middleware/_.ts
- **Tests**: tests/component/_.spec.ts, tests/composables/_.spec.ts
- **Utils**: utils/\*.ts (shared utilities)
```

**Purpose**: Clear file organization matching Nuxt 3 conventions

---

### 3. Comprehensive Vue/Nuxt Task Examples (NEW)

Added **27 Vue-specific task examples** across 5 phases:

#### Phase 3.1: Setup (4 tasks)

- Install npm dependencies (Naive UI, Leaflet, etc.)
- Create TypeScript types
- Create constants
- Update tsconfig.json

#### Phase 3.2: Tests First - TDD (4 tasks)

- **Composable Tests** (T005):

  - Test state initialization
  - Test method calls and state updates
  - Test cleanup (onUnmounted behavior)
  - Test error handling

- **Component Tests** (T006-T007):

  - Test props rendering
  - Test event emissions
  - Test user interactions (click, input)
  - Test accessibility (aria-labels)
  - Test conditional rendering
  - Test slot behavior

- **Type Tests** (T008):
  - Compile-time type checks
  - Runtime validation

#### Phase 3.3: Core Implementation (6 tasks)

**Types** (T009-T010):

```markdown
- [ ] T009 [P] Define Feature interface in types/feature.ts
- [ ] T010 [P] Define FeatureState type in types/feature.ts
```

**Composables** (T011-T012):

```markdown
- [ ] T011 Create useFeature() in app/composables/useFeature.ts
  - Implement state management (ref, reactive)
  - Implement methods (async operations)
  - Add cleanup in onUnmounted
  - Type all return values explicitly
  - Follow use\* naming convention
```

**Components** (T013-T014):

```markdown
- [ ] T013 Create FeatureCard.vue in app/components/FeatureCard.vue
  - Template with accessibility (aria-labels)
  - Script setup with TypeScript
  - Explicit props/emits types
  - Scoped styles (prefer Tailwind)
  - Cleanup in onUnmounted
```

#### Phase 3.4: Integration (4 tasks)

**Pages** (T015):

```markdown
- [ ] T015 Create feature.vue page in app/pages/feature.vue
  - Use useFeature() composable
  - Use FeaturePanel component
  - Handle loading/error states
  - SEO meta tags (useHead)
```

**Server Routes** (T016-T017):

```markdown
- [ ] T016 [P] Create GET /api/features in server/api/features/index.get.ts
  - Input validation
  - Error handling (4xx, 5xx)
  - Type-safe response
```

**Middleware** (T018):

```markdown
- [ ] T018 Create feature auth middleware in server/middleware/feature-auth.ts
```

#### Phase 3.5: Polish (9 tasks)

**Accessibility** (T019-T020):

- Keyboard navigation (tab, enter, escape)
- Screen reader support (aria-labels)
- Color contrast (WCAG AA)

**Responsive Design** (T021-T022):

- Breakpoints (sm:, md:, lg:)
- Mobile testing

**Documentation** (T023-T025):

- JSDoc comments for composables
- Props documentation for components
- Update README

**Performance** (T026-T027):

- Check unnecessary re-renders (Vue DevTools)
- Optimize computed properties

**Purpose**: Complete Vue 3 + Nuxt 3 development lifecycle

---

### 4. Vue/Nuxt Dependency Management (NEW)

Added Vue-specific dependency rules:

```markdown
**Vue/Nuxt Projects**:

- Types (T002) before composables/components
- Tests (T005-T008) before implementation (T011-T014)
- Composables (T011-T012) before components (T013-T014)
- Components (T013-T014) before pages (T015)
- Server routes (T016-T017) before middleware (T018)
- Implementation before polish (T019-T027)
```

**Purpose**: Enforce correct build order for Vue/Nuxt architecture

---

### 5. Vue/Nuxt Parallel Execution Examples (NEW)

Added project-specific parallel task examples:

```text
# Launch T005-T008 together (all test files):
Task: "Test useFeature() composable in tests/composables/useFeature.spec.ts"
Task: "Test FeatureCard.vue in tests/component/FeatureCard.spec.ts"
Task: "Test FeaturePanel.vue in tests/component/FeaturePanel.spec.ts"
Task: "Test type inference in tests/unit/types.spec.ts"

# Launch T013-T014 together (different component files):
Task: "Create FeatureCard.vue in app/components/FeatureCard.vue"
Task: "Create FeaturePanel.vue in app/components/FeaturePanel.vue"
```

**Purpose**: Maximize parallelization while respecting dependencies

---

### 6. Task Generation Rules - Dual Stack (ENHANCED)

**Vue 3 + Nuxt 3 Projects**:

1. **From Contracts (TypeScript interfaces)**:

   - Each interface file → type definition task [P]
   - Each component contract → component test task [P]
   - Each composable contract → composable test task [P]

2. **From Data Model**:

   - Each entity → TypeScript type/interface task [P]
   - State management → composable creation task
   - UI representation → component creation task

3. **From User Stories**:

   - Each interaction → component test [P]
   - Each user flow → page integration test
   - Quickstart scenarios → E2E test tasks

4. **Ordering (Vue/Nuxt)**:
   - Setup → Types → Tests → Composables → Components → Pages → Polish
   - Types before anything that uses them
   - Composables before components that use them

**Backend Projects**: (Original rules preserved)

**Purpose**: Automated task generation based on project type and design documents

---

### 7. Validation Checklist - Dual Stack (ENHANCED)

**Vue 3 + Nuxt 3 Projects**:

- [ ] All components have corresponding tests
- [ ] All composables have corresponding tests
- [ ] Types defined before composables/components
- [ ] Composables created before components that use them
- [ ] Components created before pages that use them
- [ ] Accessibility tasks included for interactive components
- [ ] TypeScript types are explicit (no `any`)
- [ ] Cleanup tasks included for composables with side effects

**Backend Projects**: (Original checklist preserved)

**Purpose**: Project-specific quality gates

---

### 8. Vue 3 + Nuxt 3 Specific Guidelines (NEW - 5 Patterns)

#### Component Task Pattern

```markdown
- [ ] T### Create ComponentName.vue in app/components/ComponentName.vue
  - Template with semantic HTML and aria-labels
  - Script setup with TypeScript (explicit Props/Emits interfaces)
  - Reactive state using ref() or reactive()
  - Cleanup in onUnmounted if needed (event listeners, Leaflet, intervals)
  - Scoped styles (prefer Tailwind utility classes)
```

#### Composable Task Pattern

```markdown
- [ ] T### Create useFeature() in app/composables/useFeature.ts
  - State management (ref, reactive, computed)
  - Business logic methods (async operations, data fetching)
  - Cleanup logic in onUnmounted (if side effects)
  - Type all return values explicitly
  - Follow use\* naming convention
  - Export single composable function
```

#### Page Task Pattern

```markdown
- [ ] T### Create feature.vue in app/pages/feature.vue
  - Use composables for business logic
  - Use components for UI
  - Handle loading/error/empty states
  - SEO meta tags (useHead, useSeoMeta)
  - Responsive design (mobile-first)
  - Accessibility (keyboard navigation, focus management)
```

#### Test Task Pattern

```markdown
- [ ] T### Test ComponentName.vue in tests/component/ComponentName.spec.ts
  - Props rendering (all prop variations)
  - Event emissions (user interactions)
  - Conditional rendering (v-if, v-show logic)
  - Accessibility (aria attributes, keyboard navigation)
  - Edge cases (empty data, error states)
```

#### Server Route Task Pattern

```markdown
- [ ] T### Create GET /api/resource in server/api/resource/index.get.ts
  - Input validation (query params, headers)
  - Business logic
  - Error handling (try/catch, proper status codes)
  - Type-safe response
  - Logging (structured logging with context)
```

**Purpose**: Standardized task descriptions that AI can follow consistently

---

### 9. Enhanced Notes Section (UPDATED)

Added Vue/Nuxt specific reminders:

```markdown
- **Vue/Nuxt**: Always specify TypeScript types explicitly
- **Cleanup**: Include onUnmounted for side effects (Leaflet, listeners, intervals)
- **Accessibility**: Include keyboard navigation and aria-labels
- **Responsive**: Use Tailwind breakpoints (sm:, md:, lg:, xl:)
```

**Purpose**: Quick reference for Vue/Nuxt best practices

---

## What Was Added ✅

### Structure

- Dual-stack execution flow (Vue/Nuxt OR Backend)
- Vue 3 + Nuxt 3 path conventions
- 27 Vue-specific task examples (5 phases)
- Vue/Nuxt dependency rules
- Vue/Nuxt parallel execution examples
- 5 task pattern templates (Component, Composable, Page, Test, Server Route)

### Quality Guidelines

- Vue/Nuxt validation checklist (12 checks)
- Accessibility requirements (WCAG AA)
- Responsive design guidelines (Tailwind breakpoints)
- TypeScript strict mode enforcement
- Cleanup requirements (onUnmounted patterns)

### Task Generation

- Vue/Nuxt contract → task rules
- Vue/Nuxt data model → task rules
- Vue/Nuxt user story → task rules
- Correct ordering rules (Types → Composables → Components → Pages)

---

## What Was Preserved ✅

### Backend Examples

- All original backend task examples intact
- Backend dependency rules preserved
- Backend validation checklist preserved
- Backend parallel execution examples preserved

**Purpose**: Template supports BOTH Vue/Nuxt AND backend projects

---

## What Was Enhanced ✅

### Execution Flow

- Added project type detection
- Added Vue-specific task categories
- Preserved backend flow

### Task Generation Rules

- Split into Vue/Nuxt + Backend sections
- Added TypeScript interface handling
- Added component/composable patterns

### Validation Checklist

- Split into Vue/Nuxt + Backend sections
- Added Vue-specific quality checks

---

## Impact on Workflow

### Before Enhancement

```bash
/tasks  # 🟡 Generic backend examples only
# Manual translation needed for Vue/Nuxt projects
# No guidance on component/composable task structure
```

### After Enhancement

```bash
/tasks  # 🟢 Detects project type (Vue/Nuxt OR Backend)
# Generates appropriate task structure automatically
# Vue: Types → Composables → Components → Pages → Polish
# Backend: Setup → Tests → Models → Services → Endpoints → Polish
# Comprehensive task patterns for each artifact type
```

---

## Testing Plan

**Validation Steps**:

1. **Test Vue/Nuxt task generation**:

   - Create spec with Vue components → Should generate component tasks
   - Create spec with composables → Should generate composable tasks
   - Create spec with pages → Should generate page tasks
   - Verify dependency order: Types → Composables → Components → Pages

2. **Test Backend task generation**:

   - Create spec with API endpoints → Should generate backend tasks
   - Verify dependency order: Setup → Tests → Models → Services → Endpoints

3. **Test parallel detection**:

   - Multiple components → Should mark [P]
   - Multiple composables → Should mark [P]
   - Same file modifications → Should NOT mark [P]

4. **Test quality checks**:
   - Generated tasks include accessibility requirements
   - Generated tasks include TypeScript type specifications
   - Generated tasks include cleanup requirements (onUnmounted)

**Success Criteria**:

- Tasks template generates Vue/Nuxt tasks with correct structure
- Dependency order enforced (Types before Composables before Components)
- Parallel tasks correctly identified
- Quality requirements embedded in task descriptions
- Backend task generation still works correctly

---

## Constitution Alignment

### Principle I: Type Safety First

- ✅ TypeScript types defined before implementation
- ✅ Explicit type specifications in task descriptions
- ✅ No `any` type enforcement

### Principle II: Composable-First Development

- ✅ Composable tasks created before component tasks
- ✅ Clear composable patterns (state, methods, cleanup)
- ✅ use\* naming convention enforced

### Principle III: Test-First Development

- ✅ Test tasks MUST complete before implementation
- ✅ Component tests include behavior validation
- ✅ Composable tests include state and cleanup validation

### Principle IV: Observable Development

- ✅ Server route tasks include structured logging
- ✅ Error handling requirements specified

### Principle V: Pragmatic Simplicity

- ✅ Task patterns prevent over-engineering
- ✅ Clear, actionable task descriptions

### Principle VI: Strategic Integration Testing

- ✅ Integration test tasks included (T015 page integration)
- ✅ E2E test tasks from user stories

### Principle VII: API-First Server Design

- ✅ Server route task pattern includes validation, error handling
- ✅ Type-safe response requirements

---

## Summary

**Transformation**: Generic backend template → Dual-stack (Vue/Nuxt + Backend) comprehensive task generator

**Key Improvements**:

1. **Dual-Stack Support**: Detects and generates appropriate tasks for Vue/Nuxt OR Backend
2. **Vue/Nuxt Patterns**: 27 comprehensive task examples following Vue 3 Composition API
3. **Task Templates**: 5 standardized patterns (Component, Composable, Page, Test, Server Route)
4. **Quality Embedded**: Accessibility, TypeScript, cleanup requirements in task descriptions
5. **Dependency Management**: Correct build order (Types → Composables → Components → Pages)

**Project Awareness**: ES Museum Map App specific

- Nuxt 3 file structure
- Naive UI integration
- Tailwind CSS patterns
- Leaflet cleanup requirements
- TypeScript strict mode
- Vitest + @vue/test-utils patterns

**Backward Compatible**: ✅ All backend examples preserved

**Use confidently for**: Vue 3 + Nuxt 3 projects AND backend projects  
**Always**: Verify generated tasks match actual implementation plan structure

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-10-06  
**Author**: Enhanced for ES Museum Map App Vue 3 + Nuxt 3 development
