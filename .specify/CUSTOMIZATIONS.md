# ES Museum Map App Customizations vs Spec-Kit Upstream

**Purpose**: Track all esmuseum-specific modifications from spec-kit baseline to ensure proper sync and conflict resolution.

**Last Updated**: 2025-10-06  
**Upstream Baseline**: spec-kit (initial clone, October 2025)

---

## Customization Summary

| File                                 | Status      | Customization Level | Sync Strategy     |
| ------------------------------------ | ----------- | ------------------- | ----------------- |
| `scripts/bash/*.sh`                  | ✅ Upstream | None                | Auto-sync         |
| `scripts/powershell/*.ps1`           | ✅ Upstream | None                | Auto-sync         |
| `templates/commands/specify.md`      | ✅ Upstream | None                | Auto-sync         |
| `templates/commands/clarify.md`      | ✅ Upstream | None                | Auto-sync         |
| `templates/commands/analyze.md`      | ✅ Upstream | None                | Auto-sync         |
| `templates/commands/constitution.md` | ✅ Upstream | None                | Auto-sync         |
| `templates/commands/tasks.md`        | ⚠️ Minor    | Path references     | Manual review     |
| `templates/commands/implement.md`    | 🔴 Heavy    | Vue/Nuxt patterns   | Manual merge only |
| `templates/plan-template.md`         | 🔴 Heavy    | Vue/Nuxt patterns   | Manual merge only |
| `templates/tasks-template.md`        | 🔴 Heavy    | Dual-stack support  | Manual merge only |
| `memory/constitution.md`             | 🔴 Custom   | ES Museum project   | Never sync        |
| `memory/opportunities.md`            | 🔴 Custom   | ES Museum project   | Never sync        |
| All `*_CHANGELOG.md` files           | 🔴 Custom   | Our documentation   | Never sync        |
| `.github/prompts/*.prompt.md`        | 🔴 Custom   | VS Code symlinks    | Never sync        |

**Legend**:

- ✅ **Upstream**: Direct copy, auto-sync safe
- ⚠️ **Minor**: Small project-specific tweaks, review upstream changes
- 🔴 **Heavy**: Extensive customizations, manual merge required
- 🔴 **Custom**: Entirely our content, never sync

---

## Detailed Customizations

### 1. Templates → Commands → `implement.md`

**Upstream Baseline**: Generic implementation executor (~88 lines)

**Our Version**: Vue 3 + Nuxt 3 aware implementation engine (346 lines, 294% growth)

**Customizations**:

#### Safety Framework

- **Added**: User confirmation requirement (Step 0)
  - "Execute all tasks" / "Execute tasks T001-T005" / "Execute safe tasks only"
  - Prevents accidental full automation
- **Added**: Risk assessment system (Step 3)
  - Scans for high-risk patterns: `useEntuAuth`, `useLocation`, `InteractiveMap.vue`
  - Flags auth composables, shared composables, Leaflet code
  - PAUSE and request override for risky tasks

#### Vue 3 + Nuxt 3 Implementation Standards

- **Added**: Component creation patterns (Step 6)

  - SFC structure (`<template>`, `<script setup lang="ts">`, `<style scoped>`)
  - Composition API patterns (ref, reactive, computed)
  - Prop/emit type definitions
  - Cleanup in onUnmounted (Leaflet, listeners)

- **Added**: Composable creation patterns

  - `use*` prefix naming convention
  - Return object structure
  - Lifecycle cleanup awareness

- **Added**: Test creation patterns
  - Vitest + @vue/test-utils
  - Behavior-focused testing (no shallow tests)
  - Accessibility testing requirements

#### Quality Checks

- **Added**: Per-task validation (Step 8)
  - TypeScript strict mode enforcement (no `any` types)
  - Vue/Nuxt pattern validation
  - Reactivity validation (no ref in reactive)
  - Memory management (Leaflet cleanup)
  - Accessibility checks (WCAG AA)
  - Constitution compliance

#### Constitution Integration

- **Added**: Optimization opportunity logging (Step 9)
  - Logs improvements without derailing implementation
  - Template for `.specify/memory/opportunities.md`
  - Aligns with Constitution Principle V: Pragmatic Simplicity

#### Completion & Error Handling

- **Added**: Comprehensive completion checklist (Step 11)

  - 7-step quality gate
  - High-risk area highlighting
  - Manual review requirements

- **Added**: Graceful error recovery (Step 12)
  - Task-specific error reporting
  - Type-specific fix suggestions
  - Recovery options (retry, skip, abort)

**Sync Strategy**:

- **NEVER auto-sync** - Manual merge only
- If upstream improves error handling, adopt pattern manually
- If upstream adds new features, evaluate for Vue/Nuxt adaptation
- Always preserve our safety guards and quality checks

**Documentation**: See `IMPLEMENT_ENHANCEMENT_CHANGELOG.md` for complete change log

---

### 2. Templates → `plan-template.md`

**Upstream Baseline**: Generic backend-focused plan template

**Our Version**: Vue 3 + Nuxt 3 specialized plan template

**Customizations**:

#### Technical Context

- **Changed**: Tech stack section → Vue 3.4+, Nuxt 3.13+, TypeScript strict mode
- **Added**: Naive UI 2.x component library
- **Added**: Leaflet 1.9+ map integration
- **Added**: Vitest testing framework
- **Changed**: Build tools → Vite (Nuxt default)

#### Project Structure

- **Changed**: Directory layout → Nuxt 3 structure
  - `app/components/*.vue` (not `src/components/`)
  - `app/composables/*.ts` (auto-imported)
  - `app/pages/*.vue` (file-based routing)
  - `server/api/*.ts` (Nuxt server routes)
  - `tests/component/*.spec.ts`, `tests/composables/*.spec.ts`

#### Implementation Phases

- **Changed**: Phase 0 → "Vue 3 + Nuxt 3 Research"

  - Composition API patterns
  - Nuxt auto-imports
  - Naive UI component usage

- **Changed**: Phase 1 → "Component Contracts & Types"

  - TypeScript interfaces (not classes)
  - Props/Emits definitions
  - Composable return types

- **Changed**: Phase 2 → "Task Breakdown"
  - Vue component task patterns
  - Composable task patterns
  - TDD with Vitest

#### Task Patterns

- **Added**: Component creation tasks (SFC structure)
- **Added**: Composable creation tasks (use\* prefix)
- **Added**: Page creation tasks (file-based routing)
- **Added**: Test patterns (behavior-focused)

**Sync Strategy**:

- **NEVER auto-sync** - Manual merge only
- Review upstream structural improvements
- Adapt to Vue/Nuxt context if valuable
- Always preserve Vue 3 + Nuxt 3 patterns

**Documentation**: See `PLAN_TEMPLATE_CHANGELOG.md` for complete change log

---

### 3. Templates → `tasks-template.md`

**Upstream Baseline**: Generic backend task examples (~170 lines)

**Our Version**: Dual-stack (Vue/Nuxt + Backend) task template (455 lines, 268% growth)

**Customizations**:

#### Dual-Stack Support

- **Changed**: Single backend example → Two parallel tracks
  - **Phase 3A**: Vue 3 + Nuxt 3 Task Examples (3A.1-3A.5)
  - **Phase 3B**: Backend Task Examples (3B.1-3B.5)
- **Added**: Project type detection in execution flow
- **Added**: Separate path conventions per project type

#### Vue 3 + Nuxt 3 Task Patterns

- **Added**: Component task examples (FeatureCard.vue, FeaturePanel.vue)

  - Template with accessibility
  - Script setup with TypeScript
  - Scoped styles (Tailwind)
  - Cleanup in onUnmounted

- **Added**: Composable task examples (useFeature(), useFeatureValidation())

  - State management patterns
  - Method signatures
  - Cleanup awareness

- **Added**: Page task examples (feature.vue)

  - useHead for SEO
  - Composable integration
  - Responsive design

- **Added**: Test task examples

  - Component tests (props, events, accessibility)
  - Composable tests (state, methods, cleanup)
  - Type tests (compile-time validation)

- **Added**: Server route task examples
  - Input validation
  - Error handling
  - Type-safe responses

#### Task Dependencies

- **Changed**: Dependency flow → Vue-specific order
  - Types → Composables → Components → Pages
  - Tests before implementation (TDD)
  - Different files = parallel [P]

#### Quality Guidelines

- **Added**: Vue 3 + Nuxt 3 Specific Guidelines section
  - Component task pattern template
  - Composable task pattern template
  - Page task pattern template
  - Test task pattern template
  - Server route task pattern template

#### Validation

- **Added**: Vue/Nuxt validation checklist
  - All components have tests
  - All composables have tests
  - Types defined before usage
  - Composables before components
  - Accessibility tasks included
  - TypeScript strict mode (no `any`)
  - Cleanup tasks for side effects

**Sync Strategy**:

- **NEVER auto-sync** - Manual merge only
- Review upstream task generation logic
- Adapt improvements to Phase 3A (Vue/Nuxt)
- Always preserve dual-stack structure and Vue patterns

**Documentation**: See `TASKS_TEMPLATE_CHANGELOG.md` for complete change log

---

### 4. Templates → Commands → `tasks.md`

**Upstream Baseline**: Generic task generation command

**Our Version**: References tasks-template.md (minimal changes)

**Customizations**:

- **Changed**: Line 29 → References `/templates/tasks-template.md` (uses our dual-stack version)
- **No other changes** → Command logic unchanged

**Sync Strategy**:

- ⚠️ **Review upstream changes** before syncing
- If upstream changes path references, update to match our structure
- If upstream improves task generation logic, auto-sync is safe

---

### 5. Memory → `constitution.md`

**Upstream Baseline**: Generic spec-kit principles

**Our Version**: ES Museum Map App specific constitution

**Customizations**:

- **Completely rewritten** for ES Museum Map App
- **Added**: 7 project-specific principles

  - Type Safety First (avoid `any`, strict TypeScript)
  - Composable-First Development (Vue 3 patterns)
  - Test-First Development (Vitest, TDD)
  - Observable Development (pino logging, error boundaries)
  - Pragmatic Simplicity (YAGNI, optimization opportunity logging)
  - Strategic Integration Testing (critical paths only)
  - API-First Server Design (Nuxt server utilities)

- **Added**: Development workflow (spec-kit driven)
- **Added**: Code review requirements
- **Added**: Tech stack governance (approved dependencies)
- **Added**: Entu integration patterns (our backend API)
- **Added**: Spec-kit integration sovereignty section

**Sync Strategy**:

- 🔴 **NEVER sync** - This is our project's constitution
- Upstream constitution.md is unrelated to our content
- Keep as separate living document

---

### 6. Memory → `opportunities.md`

**Upstream Baseline**: None (spec-kit may not have this)

**Our Version**: ES Museum Map App technical debt tracking

**Customizations**:

- **Entirely our content** for tracking optimization opportunities
- Aligns with Constitution Principle V: Pragmatic Simplicity
- Format: Date, title, context, observation, impact, suggested action, priority

**Sync Strategy**:

- 🔴 **NEVER sync** - Project-specific technical debt log
- If upstream adds similar concept, review and possibly adopt format

---

### 7. Documentation → `*_CHANGELOG.md` Files

**Upstream Baseline**: None

**Our Version**: Comprehensive changelogs for each template customization

**Files**:

- `IMPLEMENT_ENHANCEMENT_CHANGELOG.md` (547 lines)
- `TASKS_TEMPLATE_CHANGELOG.md` (541 lines)
- `PLAN_TEMPLATE_CHANGELOG.md` (Not yet created, TODO)

**Customizations**:

- **Entirely our content** documenting customization rationale
- Before/after comparisons
- Constitution alignment
- Testing plans

**Sync Strategy**:

- 🔴 **NEVER sync** - These document OUR changes
- If upstream adds changelog format we like, adopt format for future changes

---

### 8. Integration → `.github/prompts/*.prompt.md` Symlinks

**Upstream Baseline**: None (VS Code specific)

**Our Version**: Symlinks to enable slash commands

**Customizations**:

- **Entirely our integration layer** for VS Code
- Symlinks: `.github/prompts/*.prompt.md` → `.specify/templates/commands/*.md`
- Enables `/specify`, `/clarify`, `/plan`, `/tasks`, `/implement`, `/analyze`, `/constitution`

**Sync Strategy**:

- 🔴 **NEVER sync** - VS Code specific integration
- Maintain symlinks independently of upstream

---

## Upstream Baseline Reference

**Initial Integration**: October 6, 2025
**Spec-Kit Commit**: Latest main branch (no specific SHA tracked initially)
**Repository**: <https://github.com/github/spec-kit>

**Files Copied As-Is** (No Modifications):

- `.specify/scripts/bash/check-prerequisites.sh`
- `.specify/scripts/bash/create-new-feature.sh`
- `.specify/scripts/powershell/check-prerequisites.ps1`
- `.specify/scripts/powershell/create-new-feature.ps1`
- `.specify/templates/commands/specify.md`
- `.specify/templates/commands/clarify.md`
- `.specify/templates/commands/analyze.md`
- `.specify/templates/commands/constitution.md`
- `.specify/templates/spec-template.md`
- `.specify/templates/contracts-template.md`
- `.specify/templates/quickstart-template.md`
- `.specify/templates/research-template.md`
- `.specify/templates/data-model-template.md`

---

## Merge Conflict Resolution Guide

### If Upstream Improves `plan-template.md`

```bash
# 1. Review upstream version
cat /tmp/spec-kit-sync-*/.specify/templates/plan-template.md

# 2. Identify new features
# Example: New "Security Considerations" section

# 3. Adapt to our Vue/Nuxt version
# Add section with Vue-specific security patterns:
#   - XSS prevention (v-html escaping)
#   - CSRF protection (Nuxt server middleware)
#   - Auth token handling (useEntuAuth composable)

# 4. Update PLAN_TEMPLATE_CHANGELOG.md
# Note: "Adopted 'Security Considerations' section from upstream v2.1.0"

# 5. Update this file
# Change baseline reference, add note about manual merge
```

### If Upstream Improves `tasks-template.md`

```bash
# 1. Review upstream version
cat /tmp/spec-kit-sync-*/.specify/templates/tasks-template.md

# 2. Identify improvements
# Example: Better parallel execution examples

# 3. Apply to BOTH Phase 3A and 3B
# Ensure consistency between Vue/Nuxt and Backend tracks

# 4. Update TASKS_TEMPLATE_CHANGELOG.md
# Note: "Improved parallel execution examples (from upstream v2.2.0)"

# 5. Test with /tasks command
# Verify both project types generate correct tasks
```

### If Upstream Improves `implement.md`

```bash
# 1. Review upstream version
cat /tmp/spec-kit-sync-*/.specify/templates/commands/implement.md

# 2. Identify improvements
# Example: Better error recovery workflow

# 3. Adapt to our safety framework
# Integrate with our risk assessment and quality checks

# 4. Test risky scenario
# /implement on feature modifying useEntuAuth
# Verify risk assessment still triggers

# 5. Update IMPLEMENT_ENHANCEMENT_CHANGELOG.md
# Note: "Improved error recovery workflow (adapted from upstream v2.3.0)"
```

---

## Future Customizations Tracker

**Planned Enhancements**:

- [ ] Add `spec-template.md` customization for Vue component specs
- [ ] Add `data-model-template.md` with Vue store patterns
- [ ] Add `research-template.md` with Vue/Nuxt ecosystem research format

**Evaluation Queue** (from upstream):

- [ ] Check if upstream adds TypeScript-specific templates
- [ ] Check if upstream adds component testing guidelines
- [ ] Check if upstream improves parallel task execution

---

## Version History

| Date       | Event                        | Files Affected                 | Upstream Version |
| ---------- | ---------------------------- | ------------------------------ | ---------------- |
| 2025-10-06 | Initial integration          | All                            | main (Oct 2025)  |
| 2025-10-06 | Customized plan-template.md  | plan-template.md               | -                |
| 2025-10-06 | Customized implement.md      | implement.md                   | -                |
| 2025-10-06 | Customized tasks-template.md | tasks-template.md              | -                |
| 2025-10-06 | Created constitution.md      | constitution.md                | -                |
| 2025-10-06 | Created sync infrastructure  | SYNC.md, sync-from-upstream.sh | -                |

---

## Maintenance Notes

### When to Update This File

- After every sync operation (document what merged manually)
- After every customization (document what changed from upstream)
- After every upstream adoption (note version and feature)
- Weekly/monthly review (check if customizations still needed)

### Review Checklist

- [ ] Are all heavy customizations still documented?
- [ ] Are sync strategies still appropriate?
- [ ] Has upstream structure changed significantly?
- [ ] Can any customizations be simplified?
- [ ] Are changelog references still accurate?

### Sync Schedule

**Frequency**: Every 1-2 weeks for quick updates, monthly for full review

**Process**:

1. Weekly/Biweekly: Run `sync-from-upstream.sh --dry-run` (5 min check)
2. Monthly: Full sync with testing
3. Quarterly: Deep audit, consider adopting upstream template improvements

---

**Document Version**: 1.0.0  
**Next Review**: 2026-01-06 (quarterly)  
**Maintained By**: Project team
