# Tasks: "Not in a class yet" screen

**Input**: [plan.md](./plan.md), [research.md](./research.md), [contracts/class-status.ts](./contracts/class-status.ts)
**Issue**: #61. Commits say "Refs #61"; the PR body says "Closes #61".

Order is strict where noted; [P] tasks can run alongside the task before them.

## Tests first (must fail before 3.x)

- [x] **T001** `tests/unit/class-status.test.ts`: `isClassMember`. In a class; only the
      all-users group (a `grupp` parent that is not a class); a `menu` parent only; no parents;
      a parent without `entity_type`.
- [x] **T002** [P] same file: `shouldShowNoClassNotice`. True only for: initialized, not loading,
      no error, 0 tasks, empty search, no join pending, `no-class`. One false case per input.
- [x] **T003** `tests/unit/server/onboard-endpoints.test.ts`: `GET /api/onboard/class-status` with
      MSW. `in-class`; `no-class` (only the all-users group); `no-class` (no parents); missing
      `userId` → 400 `unknown`; Entu failure → 500 `unknown`. The classes root comes from the
      mocked `grupp` type's `default_parent`.
- [x] **T004** Run the three: all fail for the missing modules.

## Core

- [ ] **T005** `app/utils/class-status.ts`: `isClassMember`, `shouldShowNoClassNotice` (types from
      the contract). T001 and T002 green.
- [ ] **T006** `server/api/onboard/class-status.get.ts`: manager-key token; read the `grupp` type's
      `default_parent`; list `grupp` with that parent; read the person; answer with
      `isClassMember`. Logs ids only. T003 green.
- [ ] **T007** `app/composables/useClassStatus.ts`: module-level `ref<ClassStatus>('unknown')` per
      user id; `ensureClassStatus(userId)` fetches once; `unknown` on any error.

## UI

- [ ] **T008** `.config/i18n.config.ts`: `tasks.noClassTitle`, `tasks.noClassDescription` in et,
      en, uk, lv (texts approved by Mihkel).
- [ ] **T009** `app/components/TaskSidebar.vue`: when the list is empty and not searching, call
      `ensureClassStatus`; render the no-class texts when `shouldShowNoClassNotice` is true,
      otherwise today's texts.

## Polish

- [ ] **T010** `npm run lint`, `npm run typecheck`, `npm test` green.
- [ ] **T011** quickstart.md scenarios: those a dev run here can reach; the rest listed in the PR
      for a check on a device.
- [ ] **T012** PR on the forge, body "Closes #61", the unverified scenarios named.
