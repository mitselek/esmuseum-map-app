# Viiu Scratchpad

## 2026-03-08

[LEARNED] `~/` in Nuxt maps to `app/` directory, NOT project root. For imports from project root `types/` directory, use `~~/` (double tilde). InteractiveMap.vue had it correct; other components had it wrong.

[LEARNED] `useOptimisticTaskUpdate()` expects `Ref<EntuEntity | null>` but `selectedTask` from `useTaskWorkspace()` is `ComputedRef<EntuTask | undefined>` (from `.find()`). Fix: wrap with `computed(() => selectedTask.value ?? null)`.

[LEARNED] `useEntuAuth.ts` `refreshToken()` is synchronous (not async) — interface at line 72 must match implementation at line 354. Was changed from async in a previous session.

[LEARNED] Both `utils/` (entu-helpers, date-format) and `types/` are at project ROOT, not inside `app/`. All component imports to these must use `~~/` not `~/`.

[LEARNED] `vi.stubGlobal('fetch', ...)` conflicts with MSW's fetch interceptor in tests. Don't mock global fetch if MSW setup is active — use mock response objects directly instead.

[CHECKPOINT] Previous session work:

- Issue #32: Migrated 7 console calls → useClientLogger in 6 component/page files
- Issue #33: Deleted useFormPersistence.ts + useResponsiveLayout.ts, removed 3 deprecated wrappers from useTaskDetail.ts
- Issue #34: Standardized 7 relative imports → ~~/  in 4 component files
- Issue #35: Wrote 4 test files (useClientLogger 10, useNotifications 7, useClientSideFileUpload 18, useServerAuth 14 = 49 tests)
- Fixed lint errors across kaarel's and tess's test files

[CHECKPOINT] 2026-03-08 session:

- Fixed i18n `allowedFiles` in all 4 locales — removed PDF/Word, now images-only (JPEG, PNG, GIF, WebP)
- Wrote 13 component test files (246 tests total) in `tests/component/`:
  - Round 1: TaskFileUpload(27), LocationPicker(28), TaskResponseForm(17), TaskDetailPanel(24), TaskMapCard(13), TaskSubmissionModal(14)
  - Round 2: TaskSidebar(15), AppHeader(20), TaskLocationOverride(26), GPSPermissionPrompt(26), TaskWorkspaceHeader(11), TaskInfoCard(10)
- Full suite: 891 passed, 3 skipped

[GOTCHA] 2026-03-08: No DOM testing environment available. vitest.config.ts uses `environment: 'node'`. Component tests must be logic-focused (extracted functions, prop interfaces, computed behavior). No mount/render possible without adding happy-dom + @vue/test-utils.
