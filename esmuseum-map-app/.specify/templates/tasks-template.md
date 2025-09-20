# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```text
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Nuxt.js full-stack**: `app/`, `tests/` at repository root
- Frontend code in `app/components/`, `app/pages/`, `app/composables/`
- API endpoints in `app/server/api/`
- Tests organized by type: `tests/components/`, `tests/integration/`, `tests/e2e/`, `tests/unit/`

## Phase 3.1: Setup

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools (ESLint, Prettier)
- [ ] T004 [P] Configure TypeScript strict mode
- [ ] T005 [P] Set up pre-commit hooks for quality gates

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**  

- [ ] T006 [P] Contract test POST /api/[endpoint] in tests/integration/test_[endpoint]_post.spec.ts
- [ ] T007 [P] Contract test GET /api/[endpoint]/{id} in tests/integration/test_[endpoint]_get.spec.ts
- [ ] T008 [P] Integration test [feature workflow] in tests/integration/test_[feature].spec.ts
- [ ] T009 [P] Integration test auth flow in tests/integration/test_auth.spec.ts
- [ ] T010 [P] Component tests for Vue components in tests/components/
- [ ] T011 [P] E2E tests for critical user journeys in tests/e2e/

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T012 [P] [Entity] model in app/composables/use[Entity].ts
- [ ] T013 [P] [Entity]Service CRUD in app/composables/use[Entity]Service.ts
- [ ] T014 [P] [Feature] management composable in app/composables/use[Feature]Management.ts
- [ ] T015 POST /api/[endpoint] endpoint in app/server/api/[endpoint]/index.post.ts
- [ ] T016 GET /api/[endpoint]/{id} endpoint in app/server/api/[endpoint]/[id].get.ts
- [ ] T017 Input validation (client and server-side)
- [ ] T018 Error handling and logging
- [ ] T019 OAuth 2.0 secure token handling

## Phase 3.4: Integration

- [ ] T020 Connect [Entity]Service to database/storage
- [ ] T021 Auth middleware with secure OAuth flow in app/middleware/
- [ ] T022 Request/response logging
- [ ] T023 CORS and security headers (HTTPS enforcement, XSS/CSRF protection)
- [ ] T024 Dependency vulnerability audit

## Phase 3.5: Polish

- [ ] T025 [P] Unit tests for validation in tests/unit/validation.spec.ts
- [ ] T026 Performance tests (Core Web Vitals, API < 500ms, bundle size limits)
- [ ] T027 Accessibility tests (WCAG 2.1 AA compliance)
- [ ] T028 Cross-browser compatibility testing
- [ ] T029 [P] Update docs/api.md
- [ ] T030 Remove duplication and code review
- [ ] T031 Coverage verification (≥80% target)
- [ ] T032 Run manual-testing.md

## Dependencies

- Tests (T006-T011) before implementation (T012-T019)
- T012 blocks T013, T020
- T021 blocks T023
- Implementation before polish (T025-T032)

## Parallel Example

```text
# Launch T006-T011 together:
Task: "Contract test POST /api/[endpoint] in tests/integration/test_[endpoint]_post.spec.ts"
Task: "Contract test GET /api/[endpoint]/{id} in tests/integration/test_[endpoint]_get.spec.ts"
Task: "Integration test [feature] in tests/integration/test_[feature].spec.ts"
Task: "Integration test auth in tests/integration/test_auth.spec.ts"
Task: "Component tests for Vue components in tests/components/"
Task: "E2E tests for critical user journeys in tests/e2e/"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules

_Applied during main() execution_  

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
3. **From User Stories**:

   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_  

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
