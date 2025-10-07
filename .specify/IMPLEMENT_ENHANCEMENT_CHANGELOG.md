# `/implement` Command Enhancement Changelog

**Template**: `.specify/templates/commands/implement.md`  
**Date**: 2025-10-06  
**Status**: Enhanced for Vue 3 + Nuxt 3 with safety guardrails

## Overview

Transformed the generic `/implement` command into a **safety-first, Vue/Nuxt-aware** implementation engine with built-in risk assessment, quality checks, and project-specific patterns.

**File Size**: 70 lines → 346 lines (+276 lines, 394% increase)

## Major Enhancements

### 1. Safety Guardrails ⚠️

**NEW: Critical Safety Check (Step 0)**  

```markdown
**CRITICAL SAFETY CHECK**: Before execution, the user MUST acknowledge risks by confirming one of:

- "Execute all tasks" - Full automation (review required after)
- "Execute tasks T001-T005" - Partial automation (specify range)
- "Execute safe tasks only" - Skip tasks marked with ⚠️ in tasks.md
```

**Purpose**: Prevent accidental full automation on sensitive code

**NEW: Risk Assessment System (Step 3)**  

- Scans tasks.md for high-risk patterns:
  - ⚠️ Auth composables (`useEntuAuth`, `useEntuOAuth`, `useServerAuth`)
  - ⚠️ Shared composables (`useLocation`, `useEntuApi`, `useTaskWorkspace`)
  - ⚠️ Map integration (`InteractiveMap.vue`, `leaflet.client.js`)
  - ⚠️ Server routes (`server/api/`, `middleware/auth.ts`)
  - ⚠️ Data operations (database, localStorage, IndexedDB)

**Behavior**:

- If risky tasks detected → PAUSE, request explicit override
- User can skip risky tasks → Marks them `[ ]⚠️ MANUAL` in tasks.md
- User can proceed → Adds warning comments in code: `// ⚠️ AI-GENERATED - REVIEW CAREFULLY`

---

### 2. Vue 3 + Nuxt 3 Implementation Standards (Step 6)

**NEW: Component Creation Template**  

```vue
<template>
  <!-- Accessibility: Always include aria-labels for interactive elements -->
  <!-- Responsive: Use Tailwind breakpoints (sm:, md:, lg:) -->
  <!-- Naive UI: Use n-* components from design system -->
</template>

<script setup lang="ts">
// ✅ TypeScript strict mode - explicit types for all props/emits
// ✅ Composition API - use composables, no Options API
// ✅ Auto-imports - rely on Nuxt auto-import

interface Props {
  // Explicit prop types
}

const props = defineProps<Props>();
const emit = defineEmits<{ eventName: [payload: Type] }>();

// Reactivity: Prefer ref() for primitives, reactive() for objects
const count = ref(0);
const state = reactive({ data: [] });

// Lifecycle: Cleanup in onUnmounted for memory management
onMounted(() => {
  /* Setup */
});
onUnmounted(() => {
  /* ⚠️ CRITICAL: Always cleanup */
});
</script>

<style scoped>
/* Prefer Tailwind utility classes over custom CSS */
</style>
```

**Purpose**: Enforces project patterns for consistent, high-quality components

**NEW: Composable Creation Template**  

```typescript
// ✅ Naming: use* prefix (useFeature, useTaskDetail)
// ✅ Return object with reactive state + methods
// ✅ Type all return values explicitly

export function useFeature() {
  const state = ref<Type>(initialValue);

  const method = async () => {
    /* Implementation */
  };

  onUnmounted(() => {
    /* Cleanup logic */
  });

  return { state, method };
}
```

**Purpose**: Standardizes composable patterns with cleanup awareness

**NEW: Test Creation Template**  

```typescript
import { mount } from "@vue/test-utils";
import { describe, it, expect, beforeEach } from "vitest";

describe("ComponentName", () => {
  it("should render with props", () => {
    const wrapper = mount(ComponentName, {
      props: {
        /* props */
      },
    });

    // ⚠️ AVOID SHALLOW TESTS - test behavior, not existence
    expect(wrapper.text()).toContain("expected text");
    expect(wrapper.find("button").exists()).toBe(true);
  });

  it("should emit events on interaction", async () => {
    const wrapper = mount(ComponentName);
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted()).toHaveProperty("eventName");
  });
});
```

**Purpose**: Prevents shallow, meaningless tests; encourages behavior testing

**NEW: Type Definitions Template**  

```typescript
// ✅ Explicit interfaces, no 'any' types
// ✅ Use union types for state (type-safe enums)

export interface Feature {
  id: string;
  status: "idle" | "loading" | "success" | "error";
  data?: DataType;
}
```

**Purpose**: Enforces TypeScript strict mode, no `any` escapes

---

### 3. Quality Checks (Step 8 - NEW)

**Automated validation after EACH task**:

**TypeScript Validation**  

- ✅ Verify no `any` types used (strict mode requirement)
- ✅ Ensure all props/emits have explicit types
- ✅ Check computed/ref return types are inferred correctly

**Vue/Nuxt Patterns**  

- ✅ Components use `<script setup lang="ts">` (not Options API)
- ✅ Composables follow `use*` naming convention
- ✅ No direct DOM manipulation (use template refs if needed)
- ✅ Lifecycle hooks used correctly (setup, onMounted, onUnmounted)

**Reactivity Validation**  

- ✅ No `ref` inside `reactive` objects
- ✅ Computed properties have no side effects
- ✅ `watch` used appropriately (not overused)

**Memory Management**  

- ✅ Leaflet maps cleaned up in onUnmounted
- ✅ Event listeners removed in cleanup
- ✅ Intervals/timeouts cleared
- ✅ No circular references in reactive state

**Accessibility**  

- ✅ Interactive elements have aria-labels
- ✅ Keyboard navigation works (tab, enter, escape)
- ✅ Color contrast meets WCAG AA standards (if applicable)

**Constitution Compliance**  

- ✅ Check against `.specify/memory/constitution.md` principles
- ✅ Ensure test coverage (Principle 2: Test-Driven Discipline)
- ✅ Validate documentation exists (Principle 3: Living Documentation)

**Purpose**: Catch common Vue/Nuxt bugs immediately, not in code review

---

### 4. Optimization Opportunity Logging (Step 9 - NEW)

**Integration with Constitution Principle V: Pragmatic Simplicity**  

During implementation, the AI will log optimization opportunities without losing focus:

**Template for logging**:

```markdown
## [YYYY-MM-DD] Optimization Opportunity: Brief Title

**Context**: Discovered during implementation of [Feature Name]

**Observation**: Describe what you noticed

**Potential Impact**: Performance, maintainability, code duplication, etc.

**Suggested Action**: What could be done to improve

**Priority**: Low/Medium/High (based on impact)
```

**Examples logged**:

- Duplicate composable logic across components
- Inefficient data fetching patterns
- Missing TypeScript types (spreading `any`)
- Potential performance bottlenecks (unnecessary re-renders)
- Code that violates constitution principles

**Behavior**:

- DON'T stop to fix immediately
- DO log in `.specify/memory/opportunities.md`
- Continue with current task
- User reviews opportunities regularly and prioritizes deliberately

**Purpose**: Capture improvement ideas without derailing implementation flow

---

### 5. Completion Validation & Handoff (Step 11 - ENHANCED)

**Automated Checks**:

```bash
npm run type-check  # TypeScript validation
npm run lint        # ESLint + Prettier
npm run test        # Vitest tests
```

**Manual Review Checklist** (output for user):

```markdown
## Implementation Complete - Review Required

### Tasks Executed:

- [x] T001: Create types/feature.ts
- [x] T002: Create tests/component/Feature.spec.ts
- [x] T003: Create app/components/Feature.vue
- [ ]⚠️ T004: Update useLocation.ts (MANUAL - shared composable)

### Files Created/Modified:

- types/feature.ts (new, 45 lines)
- tests/component/Feature.spec.ts (new, 78 lines)
- app/components/Feature.vue (new, 120 lines)

### Quality Gates:

- [ ] Code review (`git diff`)
- [ ] TypeScript validation (`npm run type-check`)
- [ ] Linting (`npm run lint`)
- [ ] Tests pass (`npm run test`)
- [ ] Manual browser testing
- [ ] Accessibility audit (keyboard nav, aria-labels)
- [ ] Responsive design check (mobile, tablet, desktop)
- [ ] Constitution compliance (`/analyze`)

### High-Risk Areas (Extra Scrutiny):

- None in this implementation ✅

### Next Steps:

1. Review all generated code carefully
2. Complete manual tasks (T004)
3. Run quality gates
4. Test in browser
5. Run `/analyze` to validate consistency
6. Commit if all checks pass
```

**Purpose**: Provides clear handoff checklist, ensures nothing missed

---

### 6. Error Recovery Guidance (Step 12 - NEW)

**If implementation fails**:

- Report exact task ID (e.g., "T005 failed")
- Include error message and stack trace
- Suggest fixes based on error type:
  - TypeScript errors → Check types in contracts/
  - Test failures → Review test assertions
  - Import errors → Verify auto-import paths
  - Reactivity issues → Check ref/reactive usage

**Offers options**:

- Fix and retry failed task only
- Skip failed task and continue
- Abort and request manual intervention

**Purpose**: Graceful degradation, not catastrophic failure

---

## What Was Added ✅

**Safety Features**  

- Critical safety check with explicit user confirmation
- Risk assessment system for auth/shared/map code
- Warning markers for risky tasks (⚠️ MANUAL)
- AI-generated code warnings in comments

**Vue/Nuxt Patterns**  

- Component creation template with TypeScript + Composition API
- Composable creation template with cleanup awareness
- Test creation template with behavior-focused assertions
- Type definition template with strict mode enforcement

**Quality Gates**  

- TypeScript validation (no `any` types)
- Vue/Nuxt pattern validation (Composition API, naming)
- Reactivity validation (ref/reactive patterns)
- Memory management checks (cleanup in onUnmounted)
- Accessibility validation (aria-labels, keyboard nav)
- Constitution compliance checks
- **Optimization opportunity logging** (Principle V)

**Completion Handoff**  

- Automated check execution (type-check, lint, test)
- Manual review checklist (7-step quality gate)
- File modification summary
- High-risk area highlighting
- Next steps guidance

**Error Recovery**  

- Detailed error reporting with task IDs
- Type-specific fix suggestions
- Recovery options (retry, skip, abort)

## What Was Removed ❌

None - all original functionality preserved, only enhanced.

## What Was Enhanced ✅

**Step 2: Context Loading**  

- Added `.specify/memory/constitution.md` as REQUIRED
- Changed "entities" → "component/composable structure" (Vue terminology)
- Changed "API specifications" → "TypeScript interface specifications"
- Changed "research.md" → "research.md for Vue/Nuxt patterns"

**Step 4: Task Parsing**  

- Added risk marker detection (⚠️, #MANUAL)

**Step 5: Execution**  

- Added manual task skipping rule

**Step 7: Implementation Rules**  

- Reorganized for Vue workflow: Types → Composables → Components → Pages
- Changed "models, services" → "composables, components" (Vue terminology)

**Step 9: Progress Tracking**  

- Enhanced task marking syntax: `- [X] T001: Task description`
- Added warning marker: `- [ ]⚠️ T005: Task (MANUAL REVIEW REQUIRED)`

---

## Impact on Workflow

**Before Enhancement**  

```bash
/implement  # 🔴 Runs all tasks blindly, no safety checks
# User discovers issues in code review (too late)
```

**After Enhancement**  

```bash
/implement "Execute safe tasks only"  # 🟢 Explicit safety mode
# Risk assessment runs
# High-risk tasks flagged → User confirms skip
# Safe tasks execute with quality checks
# Completion checklist provided
# User reviews with guidance
```

---

## Testing Plan

**Validation Steps**:

1. Test safety check: Run `/implement` without confirmation → Should request explicit mode
2. Test risk assessment: Create task modifying `useEntuAuth` → Should flag as risky
3. Test Vue patterns: Generate component → Verify `<script setup lang="ts">` used
4. Test quality checks: Generate code with `any` type → Should flag violation
5. Test completion checklist: Complete implementation → Verify 7-step checklist output
6. Test error recovery: Cause TypeScript error → Verify helpful suggestion provided

**Success Criteria**:

- Safety check prevents blind execution
- Risk assessment flags auth/shared/map tasks correctly
- Generated code follows Vue 3 Composition API patterns
- Quality checks catch common mistakes
- Completion checklist is comprehensive
- Error recovery provides actionable guidance

---

## Constitution Alignment

### Principle 1: Simplicity First

- ✅ Risk assessment prevents over-engineering
- ✅ Quality checks enforce simple, standard patterns

### Principle 2: Test-Driven Discipline

- ✅ TDD workflow preserved (tests before code)
- ✅ Test quality validation (no shallow tests)

### Principle 3: Living Documentation

- ✅ JSDoc enforcement in quality checks
- ✅ Completion checklist includes documentation step

### Principle 4: Minimal Dependencies

- ✅ Uses existing tech stack (Vue, Nuxt, Vitest)
- ✅ No new dependencies introduced

### Principle 5: Sustainable Velocity

- ✅ Quality gates prevent tech debt
- ✅ Code review required (not bypassed)

### Principle 7: Evolutionary Architecture

- ✅ Constitution compliance check in quality gates
- ✅ Allows safe iteration on greenfield features

---

## Summary

**Transformation**: Generic automation → Safety-first Vue/Nuxt implementation engine

**Key Improvements**:

1. **Safety-first**: Explicit confirmation, risk assessment, warning markers
2. **Project-aware**: Vue 3 + Nuxt 3 patterns baked in
3. **Quality-focused**: 6 validation categories after each task
4. **Handoff-ready**: 7-step completion checklist
5. **Recoverable**: Helpful error messages, recovery options

**Risk Reduction**:

- BEFORE: 🔴 High risk - blind automation
- AFTER: 🟢 Controlled risk - safety guardrails + human oversight

**Recommendation Level**: 🟡 **CONDITIONAL USE** → 🟢 **RECOMMENDED** (with safety mode)

**Use confidently for**: Types, tests, isolated components (with quality checks)  
**Still avoid for**: Auth, shared composables, map integration (flagged automatically)  
**Always**: Review output with provided checklist

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-10-06  
**Author**: Fine-tuning for ES Museum Map App safety and quality
