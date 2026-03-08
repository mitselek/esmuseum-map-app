# Viiu Scratchpad

## 2026-03-08

[LEARNED] `~/` in Nuxt maps to `app/` directory, NOT project root. For imports from project root `types/` directory, use `~~/` (double tilde). InteractiveMap.vue had it correct; other components had it wrong.

[LEARNED] `useOptimisticTaskUpdate()` expects `Ref<EntuEntity | null>` but `selectedTask` from `useTaskWorkspace()` is `ComputedRef<EntuTask | undefined>` (from `.find()`). Fix: wrap with `computed(() => selectedTask.value ?? null)`.

[LEARNED] `useEntuAuth.ts` `refreshToken()` is synchronous (not async) — interface at line 72 must match implementation at line 354. Was changed from async in a previous session.
