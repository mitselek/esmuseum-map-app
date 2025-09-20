# Implementation Plan: Multi-Language Greeting

**Branch**: `002-multi-language-greeting` | **Date**: 2025-09-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-multi-language-greeting/spec.md`

## Execution Flow (/plan command scope)

```texttext
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Multi-language greeting component supporting Estonian (default), Ukrainian, and British English with persistent language preference and browser locale auto-detection. Implementation extends existing HelloWorld component with i18n capabilities following constitutional TDD principles.

## Technical Context

**Language/Version**: TypeScript 5.x with Nuxt.js 3 and Vue 3 Composition API  
**Primary Dependencies**: @nuxtjs/i18n, localStorage for persistence, browser navigator.language API  
**Storage**: Client-side localStorage for language preference persistence  
**Testing**: Vitest for component tests, Playwright for E2E language switching scenarios  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) with responsive design
**Project Type**: web - Nuxt.js frontend-heavy full-stack application  
**Performance Goals**: Language switching <100ms, bundle size increase <10KB, LCP maintained <2.5s  
**Constraints**: No server-side language detection, client-side preference storage, instant switching required  
**Scale/Scope**: 3 languages initially, extensible architecture for future language additions

**Arguments**: multi-language greeting feature with Estonian default, Ukrainian and British English support, following constitutional TDD principles

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Code Quality**: ✅ TypeScript strict mode already enabled in existing codebase. ESLint/Prettier configured and working. No `any` types planned - will use proper i18n types. Component architecture will extend existing HelloWorld with single responsibility for language management.

**Test-First Development**: ✅ TDD cycle planned following proven Hello World pattern. Will write failing tests before implementation. Coverage target ≥80% achievable with component + E2E tests. Unit tests for i18n logic, component tests for language switching UI, integration tests for persistence, E2E tests for user language switching journey.

**User Experience Consistency**: ✅ Will follow established Tailwind CSS design system patterns from HelloWorld. Loading states for language switching already fast (<100ms). Performance budgets maintained - minimal bundle increase. Accessibility maintained with proper ARIA labels for language switcher. Cross-browser compatibility ensured through existing Playwright setup.

**Performance Standards**: ✅ Core Web Vitals targets maintained - language switching is instant client-side operation. Bundle size increase minimal (<10KB for i18n). No API response time impact - purely client-side feature. No additional images required. Memory leak prevention through proper Vue component lifecycle management.

**Security & Data Protection**: ✅ No authentication required for this feature. Client-side language preference storage only - no sensitive data. HTTPS already enforced in existing setup. No XSS risk with proper Vue template handling. No error message exposure risk. No new third-party dependencies beyond @nuxtjs/i18n (well-established).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```text
# Nuxt.js full-stack structure (frontend-heavy with minimal backend API)
app/
├── components/
├── pages/
├── composables/
├── plugins/
└── server/
    └── api/

tests/
├── components/
├── integration/
├── e2e/
└── unit/
```

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```text
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_  

1. **Extract entities from feature spec** → `data-model.md`:

   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:

   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:

   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:

   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_  

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract requirement → test task [P]
- Each data model entity → implementation task [P]  
- Each quickstart scenario → validation task
- Implementation tasks to make tests pass following TDD

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Locales → Composables → Components → Integration
- Mark [P] for parallel execution (independent files)
- Critical path: i18n setup → language detection → UI components

**Estimated Output**: 20-25 numbered, ordered tasks covering:

1. **Setup Tasks (3-4)**: Install @nuxtjs/i18n, configure Nuxt, create locale files
2. **Core Logic Tasks (5-6)**: Language detection, preference storage, composable implementation  
3. **Component Tasks (4-5)**: LanguageSwitcher component, HelloWorld enhancement
4. **Testing Tasks (6-8)**: Component tests, E2E scenarios, accessibility validation
5. **Integration Tasks (2-3)**: Full integration, performance validation, quickstart execution

**Key Dependencies**:

- i18n module must be configured before component development
- Composable must be implemented before components can use it
- Component tests depend on component implementation
- E2E tests require full feature integration

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_  

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_  

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_  

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach described (/plan command)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented (none required)

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
