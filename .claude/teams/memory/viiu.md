# Viiu Scratchpad

## 2026-03-08

[LEARNED] `~/` in Nuxt maps to `app/` directory, NOT project root. For imports from project root `types/` directory, use `~~/` (double tilde). InteractiveMap.vue had it correct; other components had it wrong.

[LEARNED] `useOptimisticTaskUpdate()` expects `Ref<EntuEntity | null>` but `selectedTask` from `useTaskWorkspace()` is `ComputedRef<EntuTask | undefined>` (from `.find()`). Fix: wrap with `computed(() => selectedTask.value ?? null)`.

[LEARNED] `useEntuAuth.ts` `refreshToken()` is synchronous (not async) — interface at line 72 must match implementation at line 354. Was changed from async in a previous session.

[LEARNED] Both `utils/` (entu-helpers, date-format) and `types/` are at project ROOT, not inside `app/`. All component imports to these must use `~~/` not `~/`.

[LEARNED] `vi.stubGlobal('fetch', ...)` conflicts with MSW's fetch interceptor in tests. Don't mock global fetch if MSW setup is active — use mock response objects directly instead.

[CHECKPOINT] Session work completed:

- Issue #32: Migrated 7 console calls → useClientLogger in 6 component/page files
- Issue #33: Deleted useFormPersistence.ts + useResponsiveLayout.ts, removed 3 deprecated wrappers from useTaskDetail.ts
- Issue #34: Standardized 7 relative imports → ~~/  in 4 component files
- Issue #35: Wrote 4 test files (useClientLogger 10, useNotifications 7, useClientSideFileUpload 18, useServerAuth 14 = 49 tests)
- Fixed lint errors across kaarel's and tess's test files
