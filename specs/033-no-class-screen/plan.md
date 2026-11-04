# Implementation Plan: "Not in a class yet" screen

**Branch**: `033-no-class-screen` | **Date**: 2026-11-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/033-no-class-screen/spec.md`; forge issue #61

## Summary

When a logged-in person has no tasks, the workspace asks a new server endpoint whether the person
is in a class. If the answer is "no", the task list's empty state shows the "not in a class yet"
message instead of "no tasks assigned yet". A class is a `grupp` filed under the classes root
group ("Klassid"), which is the `grupp` type's own `default_parent` in Entu. Every other answer
(in a class, unknown, join pending, still loading) keeps today's view.

## Technical Context

**Framework/Version**: Vue 3 (Composition API) + Nuxt 3, SPA (`ssr: false`)
**Language**: TypeScript (strict)
**UI Framework**: Tailwind CSS (the empty state in `TaskSidebar.vue` is plain Tailwind markup)
**State Management**: module-level refs in composables, as `useTaskWorkspace`
**API Integration**: client `useEntuApi`/`useEntuAuth`; server `server/utils/entu.ts` with the
manager key, as the `/api/onboard/*` endpoints
**Testing**: Vitest in a node environment, no component mounting (`@vue/test-utils` is not
installed; `tests/component/*` replicate logic). Server endpoints are tested with MSW in
`tests/unit/server/onboard-endpoints.test.ts`. So: decision logic in pure functions, tested
directly; the endpoint tested with MSW.
**Target Platform**: mobile-first web
**Performance Goals**: one extra request, only for a person with zero tasks; no cost for
everyone else
**Constraints**: never tell a class member they are not in a class (FR-004, FR-006)
**Scale/Scope**: 1 server route, 1 composable, 1 util, 1 component change, 4 locale blocks
**Server Routes**: `GET /api/onboard/class-status` (new)

## Constitution Check

- **I. Type Safety First**: typed response (`ClassStatusResponse`), a `ClassStatus` union, no
  `any`. PASS
- **II. Composable-First**: the check lives in `useClassStatus`; the component only renders. PASS
- **III. Test-First**: failing tests for the util and the endpoint before the code. PASS
- **IV. Observable Development**: the endpoint logs via `createLogger('onboard-class-status')`,
  the composable via `useClientLogger`; ids only, no names. PASS
- **V. Pragmatic Simplicity**: no new dependency, no new config value (the classes root comes
  from Entu's schema), one request only in the zero-task case. PASS
- **VI. Strategic Integration Testing**: MSW-backed endpoint test, as for the other onboard
  endpoints. PASS
- **VII. API-First Server Design**: the manager-key lookup stays on the server; the client gets
  a yes/no. PASS

## Project Structure

### Documentation (this feature)

```text
specs/033-no-class-screen/
├── spec.md
├── plan.md            # this file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── class-status.ts
└── checklists/requirements.md
```

### Source Code

```text
server/api/onboard/class-status.get.ts      # new: { status: 'in-class' | 'no-class' }
app/utils/class-status.ts                   # new: pure decision functions
app/composables/useClassStatus.ts           # new: fetch once per user, module-level state
app/components/TaskSidebar.vue              # empty state: no-class message when decided
.config/i18n.config.ts                      # tasks.noClassTitle / tasks.noClassDescription x4
tests/unit/class-status.test.ts             # new: decision functions
tests/unit/server/onboard-endpoints.test.ts # extended: class-status endpoint (MSW)
```

## Phase 0: Outline & Research

Done: [research.md](./research.md). Decisions: what counts as a class; where the check runs;
when the message may show; where it renders.

## Phase 1: Design & Contracts

Done: [data-model.md](./data-model.md), [contracts/class-status.ts](./contracts/class-status.ts),
[quickstart.md](./quickstart.md). The agent-context script targets Copilot files this repo no
longer uses; skipped.

**Post-design Constitution Check**: unchanged, PASS.

## Phase 2: Task Planning Approach

`/tasks` will produce, in order:

1. Failing tests: `isClassMember` and `shouldShowNoClassNotice` (tests/unit/class-status.test.ts).
2. Failing tests: `GET /api/onboard/class-status` with MSW (in class; only the all-users group;
   no parents; missing userId -> 400; Entu error -> 500).
3. `app/utils/class-status.ts` until 1 passes.
4. `server/api/onboard/class-status.get.ts` until 2 passes.
5. `useClassStatus` composable (fetch once per user id; `unknown` on any error).
6. i18n keys in et, en, uk, lv.
7. `TaskSidebar.vue` empty state uses `shouldShowNoClassNotice`.
8. Lint, typecheck, full test run; quickstart scenarios on a dev run where possible.

## Complexity Tracking

None.
