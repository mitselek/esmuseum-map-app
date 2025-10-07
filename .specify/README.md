# Spec-Kit Workflow Integration

**ES Museum Map App** uses a **hybrid spec-kit integration** combining 100% upstream structure with Vue 3 + Nuxt 3 customized content.

## Quick Start

### Available Slash Commands

All commands work directly in VS Code chat via `.github/prompts/*.prompt.md` symlinks:

| Command         | Purpose                     | Example                                |
| --------------- | --------------------------- | -------------------------------------- |
| `/specify`      | Define feature requirements | `/specify "Add task priority badges"`  |
| `/plan`         | Create implementation plan  | `/plan` (after /specify)               |
| `/tasks`        | Generate task breakdown     | `/tasks` (after /plan)                 |
| `/implement`    | Execute implementation      | `/implement "Execute safe tasks only"` |
| `/clarify`      | Ask clarifying questions    | `/clarify` (during any phase)          |
| `/analyze`      | Analyze codebase patterns   | `/analyze` (research phase)            |
| `/constitution` | Review project principles   | `/constitution`                        |

### Typical Workflow

```bash
# 1. Define feature
/specify "Add user profile page with avatar upload"

# 2. Create plan (generates .specify/memory/plan.md)
/plan

# 3. Generate tasks (generates .specify/memory/tasks.md)
/tasks

# 4. Execute implementation
/implement "Execute all tasks"

# Optional: Ask questions anytime
/clarify "Should we use Naive UI's NUpload or custom component?"
```

## Architecture

### Hybrid Integration Strategy

**100% Upstream Structure:**

```text
.specify/
├── scripts/                   # Auto-sync from upstream
├── templates/
│   ├── commands/
│   │   ├── specify.md         # Auto-sync (generic)
│   │   ├── clarify.md         # Auto-sync (generic)
│   │   ├── analyze.md         # Auto-sync (generic)
│   │   ├── constitution.md    # Auto-sync (generic)
│   │   ├── tasks.md           # Minor customization
│   │   └── implement.md       # Heavy customization (Vue/Nuxt)
│   ├── plan-template.md       # Heavy customization (Vue/Nuxt)
│   └── tasks-template.md      # Heavy customization (Vue/Nuxt)
└── memory/
    ├── constitution.md        # Custom (ES Museum principles)
    └── opportunities.md       # Custom (technical debt)
```

**Customization Levels:**

- ✅ **Upstream**: Direct copy, auto-sync safe
- ⚠️ **Minor**: Small tweaks, manual review on sync
- 🔴 **Heavy**: Extensive customizations, manual merge only
- 🔴 **Custom**: Entirely our content, never sync

See [CUSTOMIZATIONS.md](./CUSTOMIZATIONS.md) for detailed tracking.

### Vue 3 + Nuxt 3 Specializations

Our heavily customized templates include:

**1. implement.md** (346 lines, 294% growth)

- Safety framework: User confirmation, risk assessment
- Vue patterns: Component/composable/test creation
- Quality checks: TypeScript strict, reactivity, memory, a11y
- Error recovery: Type-specific fixes

**2. plan-template.md**  

- Tech stack: Vue 3.4+, Nuxt 3.13+, Naive UI, Leaflet
- Project structure: Nuxt 3 layout (app/, server/, tests/)
- Vue-specific research and implementation patterns

**3. tasks-template.md** (455 lines, 268% growth)

- **Phase 3A**: Vue/Nuxt tasks (components, composables, pages, tests)
- **Phase 3B**: Backend tasks (server routes, API, database)
- Dependency tracking: Types → Composables → Components → Pages
- Vue-specific quality guidelines

## Slash Command Details

### `/specify` - Feature Specification

**Purpose**: Define clear, testable feature requirements

**Usage**:

```text
/specify "Add task priority system with High/Medium/Low badges"
```

**Output**: `.specify/memory/spec.md` with:

- Feature description
- User stories
- Acceptance criteria
- Technical constraints
- Out of scope items

**Next step**: `/plan`

---

### `/plan` - Implementation Planning

**Purpose**: Create comprehensive implementation plan

**Usage**:

```text
/plan
```

**Requires**: Must run after `/specify`

**Output**: `.specify/memory/plan.md` with:

- **Phase 1**: Research & Analysis
  - Vue/Nuxt patterns investigation
  - Component library research (Naive UI)
  - Similar feature analysis
- **Phase 2**: Design & Architecture
  - Component hierarchy
  - Data flow (props, emits, composables)
  - Type definitions
  - API design
- **Phase 3**: Implementation Tasks
  - Detailed task breakdown (ready for `/tasks`)

**Next step**: `/tasks`

---

### `/tasks` - Task Breakdown

**Purpose**: Generate detailed, executable task list

**Usage**:

```text
/tasks
```

**Requires**: Must run after `/plan`

**Output**: `.specify/memory/tasks.md` with:

- **Phase 3A** (Vue/Nuxt): Component/composable/page creation
- **Phase 3B** (Backend): Server routes, API, database
- Task format: `[T001]`, `[T002]`, etc.
- Dependencies clearly marked
- Risk levels: LOW/MEDIUM/HIGH
- Validation checklists per task

**Next step**: `/implement`

---

### `/implement` - Execute Implementation

**Purpose**: Execute tasks with safety checks and quality validation

**Usage**:

```text
/implement "Execute all tasks"
/implement "Execute tasks T001-T005"
/implement "Execute safe tasks only"  # Skips HIGH risk tasks
```

**Requires**: Must run after `/tasks`

**Safety Features**:

1. **User confirmation** required before execution
2. **Risk assessment** for auth/maps/shared composables
3. **Quality checks**:
   - TypeScript strict mode compliance
   - Vue 3 Composition API patterns
   - Reactivity rules (ref, reactive, computed)
   - Memory management (lifecycle cleanup)
   - Accessibility (ARIA, keyboard nav)
4. **Completion checklist** (7 steps)
5. **Error recovery** with type-specific fixes

**Output**: Implemented code + optimization opportunities logged

---

### `/clarify` - Ask Questions

**Purpose**: Get clarifying information during any workflow phase

**Usage**:

```text
/clarify
/clarify "Should we use NTable or custom component?"
```

**Use when**:

- Requirements unclear
- Multiple implementation approaches
- Technical decisions needed
- Architecture questions

---

### `/analyze` - Codebase Analysis

**Purpose**: Analyze existing patterns, conventions, and architecture

**Usage**:

```text
/analyze
/analyze "How do we handle authentication?"
/analyze "What's our composable pattern?"
```

**Use during**:

- Research phase (before /specify)
- Architecture decisions
- Pattern discovery
- Migration planning

---

### `/constitution` - Project Principles

**Purpose**: Review ES Museum project principles and guidelines

**Usage**:

```text
/constitution
```

**Our 7 Principles** (see [constitution.md](./memory/constitution.md)):

1. **User-Centric Design**
2. **Mobile-First Development**
3. **Performance & Offline Support**
4. **Accessibility**
5. **Clean Architecture**
6. **Type Safety**
7. **Progressive Enhancement**

## Workflow Examples

### Example 1: New Component

```bash
# 1. Specify
/specify "Create TaskPriorityBadge component showing High/Medium/Low priority with colors"

# 2. Plan
/plan
# Output: .specify/memory/plan.md
# - Research: Naive UI NBadge patterns
# - Design: Props interface, color variants
# - Tasks: Type definition, component, tests, integration

# 3. Tasks
/tasks
# Output: .specify/memory/tasks.md
# [T001] Create TaskPriority type (Low risk)
# [T002] Create TaskPriorityBadge component (Low risk)
# [T003] Add tests (Low risk)
# [T004] Integrate into TaskCard (Medium risk - shared component)

# 4. Implement
/implement "Execute safe tasks only"
# Executes T001-T003, asks about T004
```

### Example 2: New Composable

```bash
# 1. Specify
/specify "Create useTaskFiltering composable for filtering tasks by priority, status, and assignee"

# 2. Plan
/plan
# Research: Vue 3 computed patterns, filter composition
# Design: Input refs, computed filters, TypeScript generics

# 3. Tasks
/tasks
# [T001] Define filter types (Low risk)
# [T002] Create useTaskFiltering composable (Low risk)
# [T003] Add unit tests (Low risk)
# [T004] Integrate into TaskWorkspace (High risk - core component)

# 4. Implement
/implement "Execute tasks T001-T003"
# Manual review for T004 integration
```

### Example 3: Full Feature

```bash
# 1. Specify
/specify "Add task export feature: export tasks to PDF with map snapshots"

# 2. Plan
/plan
# Research: PDF libraries (jsPDF, pdfmake), Leaflet static maps
# Design: Export service, UI trigger, progress indicator
# Architecture: Server-side rendering vs client-side

# 3. Tasks
/tasks
# Phase 3A (Frontend):
# [T001-T005] Types, composable, UI components, tests
# Phase 3B (Backend):
# [T006-T008] Server endpoint, PDF generation, map rendering

# 4. Implement (iterative)
/implement "Execute tasks T001-T002"  # Types and composable
# Test, validate
/implement "Execute tasks T003-T005"  # UI and tests
# Test, validate
/implement "Execute tasks T006-T008"  # Backend
# Full integration test
```

## Maintenance

### Syncing from Upstream

We maintain sync with spec-kit upstream while preserving customizations.

**Quick sync**:

```bash
# 1. Check for updates
.specify/scripts/sync-from-upstream.sh --dry-run

# 2. Review changes
# Check CUSTOMIZATIONS.md for affected files

# 3. Apply sync
.specify/scripts/sync-from-upstream.sh

# 4. Test
/specify "test feature"
/plan
/tasks
/implement "Execute safe tasks only"

# 5. Commit
git commit -m "chore: sync spec-kit updates from upstream"
```

**Schedule**:

- **Weekly/Biweekly**: Quick check (5 min dry-run)
- **Monthly**: Full sync with testing
- **Quarterly**: Deep audit, consider upstream improvements

**What gets synced**:

- ✅ Scripts (bash/powershell)
- ✅ Generic commands (specify, clarify, analyze, constitution)

**What gets preserved**:

- 🔒 Customized templates (plan, tasks, implement)
- 🔒 Memory (constitution.md, opportunities.md)
- 🔒 Documentation (changelogs, this README)

See [SYNC.md](./SYNC.md) for detailed sync workflow and conflict resolution.

### Updating Customizations

When making changes to templates:

1. **Document** in [CUSTOMIZATIONS.md](./CUSTOMIZATIONS.md)
2. **Update changelog** (e.g., `IMPLEMENT_ENHANCEMENT_CHANGELOG.md`)
3. **Test workflow** with `/specify → /plan → /tasks → /implement`
4. **Note sync strategy** (auto-sync vs manual merge vs never)

## Troubleshooting

### Slash Commands Not Working

**Problem**: `/specify` or other commands not recognized

**Solutions**:

1. Check symlinks exist: `ls -la .github/prompts/`
2. Verify targets: `ls -la .specify/templates/commands/`
3. Restart VS Code
4. Check GitHub Copilot Chat extension enabled

### Generated Content Not Vue-Specific

**Problem**: `/plan` or `/tasks` generates generic content

**Solutions**:

1. Check template customization: `cat .specify/templates/plan-template.md | grep "Vue 3"`
2. Verify constitution loaded: `/constitution`
3. Provide context in `/specify`: mention "Vue 3 component", "Nuxt 3 composable"

### /implement Skips Tasks

**Problem**: `/implement "Execute all tasks"` doesn't execute some tasks

**Possible causes**:

1. **Risk assessment**: HIGH risk tasks require manual confirmation
2. **Safety framework**: Auth/maps/shared composables flagged
3. **Missing dependencies**: Earlier tasks failed

**Solutions**:

1. Use `/implement "Execute safe tasks only"` first
2. Review flagged tasks manually
3. Execute risky tasks individually: `/implement "Execute task T004"`

### Sync Conflicts

**Problem**: Upstream sync breaks customized templates

**Solutions**:

1. **Rollback**: `git checkout HEAD~1 -- .specify/`
2. **Review**: Check [SYNC.md](./SYNC.md) conflict resolution scenarios
3. **Manual merge**: Use merge examples in [CUSTOMIZATIONS.md](./CUSTOMIZATIONS.md)
4. **Test thoroughly**: Full workflow validation after merge

## Documentation

- **[CUSTOMIZATIONS.md](./CUSTOMIZATIONS.md)**: Track all esmuseum-specific modifications
- **[SYNC.md](./SYNC.md)**: Upstream sync workflow and conflict resolution
- **[constitution.md](./memory/constitution.md)**: ES Museum project principles
- **[opportunities.md](./memory/opportunities.md)**: Technical debt and optimization opportunities
- **Changelogs**:
  - `PLAN_TEMPLATE_CHANGELOG.md`
  - `TASKS_TEMPLATE_CHANGELOG.md`
  - `IMPLEMENT_ENHANCEMENT_CHANGELOG.md`

## Tech Stack Integration

Our templates are optimized for:

**Frontend**:

- Vue 3.4+ (Composition API, `<script setup>`)
- Nuxt 3.13+ (auto-imports, file-based routing)
- TypeScript 5.x (strict mode)
- Naive UI (component library)
- Tailwind CSS (utility classes)
- Leaflet (maps)

**Testing**:

- Vitest (unit tests)
- @vue/test-utils (component tests)
- TypeScript strict type checking

**Backend**:

- Nuxt server routes (`server/api/`)
- H3 framework
- Entu API integration

**Development**:

- VS Code + GitHub Copilot
- Git workflow (feature branches)
- Spec-kit slash commands

## Contributing

When adding new workflows or templates:

1. **Follow hybrid strategy**: Keep upstream structure, customize content
2. **Document changes**: Update CUSTOMIZATIONS.md
3. **Update changelogs**: Track all modifications
4. **Test workflow**: Validate `/specify → /plan → /tasks → /implement`
5. **Update this README**: Add examples and troubleshooting

## License

This integration inherits spec-kit's license. See upstream repository for details.

---

**Spec-Kit Upstream**: <https://github.com/codeium/spec-kit>  
**Integration Date**: October 6, 2025  
**Customization Level**: Heavy (Vue 3 + Nuxt 3 specialization)  
**Maintenance**: Weekly sync checks, monthly full sync, quarterly audit
