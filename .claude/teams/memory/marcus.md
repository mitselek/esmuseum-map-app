# Marcus — Code Review Scratchpad

## 2026-03-08

[LEARNED] In Nuxt projects, `vue-tsc` (used by `nuxi typecheck`) handles `.vue` imports natively. No `shims-vue.d.ts` needed. Plain `tsc --noEmit` will fail on `.vue` imports but that's expected — always use `nuxi typecheck` or `vue-tsc` for typechecking Nuxt projects.

[DECISION] Issue #30 review: GREEN after confirming vue-tsc handles .vue shims. normalizeLocation wiring is clean, component cleanup removes all raw Entu fallbacks.
