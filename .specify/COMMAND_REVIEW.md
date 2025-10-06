# Slash Command Review for ES Museum Map App

**Date**: 2025-10-06  
**Status**: Phase 3 - Review and Customization  
**Discovery**: VS Code Prompt Files (`.prompt.md`) work for slash commands!

## ✅ Working Commands

All 7 commands are now accessible via slash commands in GitHub Copilot Chat:

- `.github/prompts/*.prompt.md` → symlinked to `.specify/templates/commands/*.md`

## Command Analysis

### 1. `/specify` - Create Feature Specification ✅ READY

**Status**: **Applicable as-is**  
**Script**: `scripts/bash/create-new-feature.sh`  
**Purpose**: Creates new feature branch and spec.md from natural language description

**Review**:

- ✅ Branch naming: Uses `###-feature-name` pattern (works)
- ✅ File structure: Creates `specs/{feature}/spec.md`
- ✅ Template: Uses `templates/spec-template.md`
- ✅ Workflow: Creates branch, initializes spec, reports paths

**Customization Needed**: NONE - works perfectly for Vue/Nuxt projects

**Example Usage**: `/specify Add task priority badges with color coding to TaskMapCard`

---

### 2. `/clarify` - Interactive Ambiguity Resolution ✅ HIGHLY VALUABLE

**Status**: **Applicable with minor enhancements**  
**Script**: `scripts/bash/check-prerequisites.sh --json --paths-only`  
**Purpose**: Asks 5 targeted questions to reduce spec ambiguity before planning

**Review**:

- ✅ Taxonomy coverage: Functional, Data Model, UX, Non-functional, Security, Edge Cases
- ✅ Question constraints: Max 5, multiple-choice or <=5 word answers
- ✅ Integration: Updates spec.md with `## Clarifications` section incrementally
- ✅ Validation: Checks each answer, prevents contradictions

**Customization Opportunities**:

- 📝 Add Vue 3 Composition API specific questions (e.g., composable structure, ref vs reactive)
- 📝 Add Nuxt 3 specific questions (e.g., SSR/CSR strategy, middleware requirements)
- 📝 Add Tailwind/Naive UI design system questions (e.g., component variants, responsive breakpoints)
- 📝 Add Leaflet map questions (e.g., layer types, marker clustering, zoom levels)

**Example Usage**: `/clarify` (after `/specify`)

**Enhancement TODO**: Add project-specific taxonomy categories in future iteration

---

### 3. `/plan` - Generate Implementation Plan ✅ CRITICAL

**Status**: **Requires template customization**  
**Script**: `scripts/bash/setup-plan.sh`  
**Purpose**: Executes plan-template.md to generate architecture and design artifacts

**Review**:

- ✅ Workflow: Reads spec.md, applies plan-template.md, generates artifacts
- ✅ Constitution check: Validates against `/memory/constitution.md` principles
- ✅ Phases: Phase 0 (research), Phase 1 (data model, contracts, quickstart), Phase 2 (tasks)
- ⚠️ Template: Generic plan-template.md needs Vue/Nuxt context

**Customization REQUIRED**:

1. **Update `templates/plan-template.md`** with:

   - Vue 3 Composition API patterns (composables, provide/inject, lifecycle)
   - Nuxt 3 conventions (pages/, components/, composables/, server/, layers)
   - TypeScript strict mode patterns
   - Tailwind CSS + Naive UI component strategy
   - Leaflet integration patterns (leaflet.client.js plugin)
   - Entu API integration patterns (useEntuApi composable)
   - State management patterns (ref, reactive, computed, watch)

2. **Add project-specific Phase 0 research questions**:
   - Which Naive UI components needed?
   - Leaflet layer architecture?
   - Composable decomposition strategy?
   - Server-side API route requirements?

**Example Usage**: `/plan` (after `/clarify` or `/specify`)

**Priority**: HIGH - Template customization is Phase 3 priority

---

### 4. `/tasks` - Generate Task Breakdown ✅ APPLICABLE

**Status**: **Works well, minor template enhancements**  
**Script**: `scripts/bash/check-prerequisites.sh --json`  
**Purpose**: Generates dependency-ordered tasks.md from plan artifacts

**Review**:

- ✅ Input flexibility: Adapts to available artifacts (not all projects have contracts/)
- ✅ Task ordering: Setup → Tests [P] → Core → Integration → Polish [P]
- ✅ Parallel marking: [P] for independent tasks
- ✅ TDD approach: Tests before implementation

**Customization Opportunities**:

- 📝 Add Vue component task patterns (template, script, style sections)
- 📝 Add Nuxt page task patterns (page routing, layouts, middleware)
- 📝 Add composable task patterns (state, logic, lifecycle)
- 📝 Add Vitest test task patterns (component, composable, API tests)

**Example Usage**: `/tasks` (after `/plan`)

**Enhancement TODO**: Update `templates/tasks-template.md` with Vue/Nuxt task examples

---

### 5. `/implement` - Execute Implementation ⚠️ CONDITIONAL USE

**Status**: **Reviewed - Use as first draft generator, not final code**  
**Script**: `scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks`  
**Purpose**: Executes all tasks from tasks.md with TDD approach

**Review**: ✅ **COMPLETED** - See [IMPLEMENT_REVIEW.md](IMPLEMENT_REVIEW.md) for detailed analysis

**Strengths**:

- ✅ Follows TDD (tests before implementation)
- ✅ Respects task dependencies (sequential vs parallel [P])
- ✅ Progress tracking (marks tasks with [X])
- ✅ Error handling (halts on failure, reports context)
- ✅ Validates against specification

**Risks**:

- ⚠️ Autonomous execution without human review
- ⚠️ May introduce subtle bugs (reactivity, memory leaks, type safety)
- ⚠️ Security vulnerabilities in auth/sensitive code
- ⚠️ Breaking changes to shared composables
- ⚠️ Shallow tests that pass but don't validate behavior

**Recommendation**: **HYBRID APPROACH** (See IMPLEMENT_REVIEW.md)

**✅ SAFE to use for**:

- Isolated presentational components (TaskPriorityBadge.vue)
- TypeScript type definitions (types/\*.ts)
- Test scaffolding (review test quality after)
- Pure utility functions (date formatting, helpers)
- Documentation (README, JSDoc comments)

**⚠️ USE WITH CAUTION for**:

- New composables (review reactivity patterns)
- Naive UI integration (verify design system consistency)
- Pages with routing (check middleware, SSR/CSR)

**🔴 NEVER use for**:

- Authentication/OAuth logic (security-critical)
- Shared core composables (useLocation, useEntuApi, useTaskWorkspace)
- Leaflet map integration (memory management)
- Production hotfixes (critical bugs)
- Data migration (schema changes)

**Workflow**: Generate with `/implement` → Review → Test → Refactor → Commit

**Quality Gates** (after `/implement`):

1. Code review (`git diff`)
2. TypeScript validation (`npm run type-check`)
3. Linting (`npm run lint`)
4. Test execution (`npm run test`)
5. Manual testing (browser, accessibility)
6. Consistency check (`/analyze`)

**Example Usage**: `/implement` (after `/tasks` - edit tasks.md to comment out risky tasks first)

**Strategy**: Treat AI output like junior developer code - review everything before commit

---

### 6. `/analyze` - Cross-Artifact Consistency Check ✅ EXCELLENT

**Status**: **Highly applicable, read-only safety**  
**Script**: `scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks`  
**Purpose**: Validates consistency across spec.md, plan.md, tasks.md before implementation

**Review**:

- ✅ **READ-ONLY**: Never modifies files (safe to run anytime)
- ✅ Constitution authority: Flags violations of `/memory/constitution.md` as CRITICAL
- ✅ Detection passes: Duplication, Ambiguity, Underspecification, Coverage gaps, Inconsistency
- ✅ Severity levels: CRITICAL → HIGH → MEDIUM → LOW
- ✅ Coverage metrics: Requirements with tasks, unmapped tasks
- ✅ Actionable: Suggests remediation commands

**Use Cases**:

- After `/tasks` before `/implement` (quality gate)
- After manual spec edits (catch regressions)
- Before PR submission (final validation)

**Example Usage**: `/analyze` (after `/tasks`)

**Recommendation**: **USE REGULARLY** - excellent safety mechanism

---

### 7. `/constitution` - Manage Project Principles ✅ SPECIALIZED

**Status**: **Applicable for governance work**  
**Script**: None (template-based)  
**Purpose**: Update `/memory/constitution.md` with versioning and propagation

**Review**:

- ✅ Template-based: Replaces `[PLACEHOLDERS]` with concrete values
- ✅ Versioning: Semantic versioning (MAJOR.MINOR.PATCH) for governance
- ✅ Propagation: Updates plan-template, spec-template, tasks-template
- ✅ Sync Impact Report: Tracks template updates needed

**Use Cases**:

- Initial constitution setup (already done - v1.0.0 exists)
- Adding new principles (e.g., "Accessibility First")
- Governance changes (e.g., review process updates)

**Example Usage**: `/constitution` (when principles need updating)

**Recommendation**: Use sparingly - constitution changes ripple across templates

---

## Summary Matrix

| Command         | Status           | Priority     | Customization Needed      | Use Frequency          |
| --------------- | ---------------- | ------------ | ------------------------- | ---------------------- |
| `/specify`      | ✅ Ready         | HIGH         | None                      | Every feature          |
| `/clarify`      | ✅ Ready         | HIGH         | Minor (Vue/Nuxt taxonomy) | Most features          |
| `/plan`         | ⚠️ Needs Work    | **CRITICAL** | **Major (template)**      | Every feature          |
| `/tasks`        | ✅ Ready         | HIGH         | Minor (template examples) | Every feature          |
| `/implement`    | ⚠️ Use Carefully | MEDIUM       | None (validation needed)  | Simple features        |
| `/analyze`      | ✅ Excellent     | HIGH         | None                      | Before implementation  |
| `/constitution` | ✅ Ready         | LOW          | None                      | Rare (governance only) |

## Next Steps (Phase 3)

### Immediate (This Session)

1. ✅ Command discovery validated (`.prompt.md` works!)
2. ✅ Review completed (this document)
3. 📝 **UPDATE `templates/plan-template.md`** for Vue 3 + Nuxt 3 (CRITICAL)
4. 📝 **UPDATE `templates/tasks-template.md`** with Vue/Nuxt task patterns
5. 📝 Test `/specify` → `/clarify` → `/plan` → `/tasks` workflow on real feature
6. 📝 Validate generated artifacts quality

### Phase 3 Completion Goals

- [ ] Plan template customized for esmuseum-map-app tech stack
- [ ] Tasks template enhanced with Vue/Nuxt examples
- [ ] Full workflow tested on 1-2 real features
- [ ] Quality validation passed
- [ ] Script paths updated if needed (currently use `.specify/` paths correctly)

### Future Enhancements

- [ ] Add Vue 3 Composition API specific clarification taxonomy
- [ ] Add Leaflet map-specific questions to `/clarify`
- [ ] Create custom contract templates for Entu API patterns
- [ ] Add Vitest test scaffolding patterns to tasks template

## Lessons Learned

### What Worked ✅

- **Symlinks**: Maintain single source of truth in `.specify/templates/commands/`
- **Prompt files**: `.prompt.md` extension enables slash commands in VS Code
- **Spec-kit structure**: 100% adoption strategy validates - scripts work perfectly
- **Read-only `/analyze`**: Safe to run frequently, excellent quality gate

### What Needs Attention ⚠️

- **Template customization**: Generic templates need project-specific context
- **`/implement` validation**: Test on isolated features before trusting on core code
- **Constitution principles**: Need to reflect Vue 3 + Nuxt 3 best practices (future)

### What Didn't Work ❌

- `.github/chatmodes/*.chatmode.md` - Wrong VS Code feature (chat modes, not prompts)
- GitHub Copilot Workspace - Product sunset May 30, 2025
- Initial assumption: Slash commands would work in Copilot Workspace (deprecated)

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-10-06  
**Author**: Spec-kit integration (Phase 3 review)
