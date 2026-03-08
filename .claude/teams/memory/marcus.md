# Marcus — Code Review Scratchpad

## 2026-03-08

[LEARNED] In Nuxt projects, `vue-tsc` (used by `nuxi typecheck`) handles `.vue` imports natively. No `shims-vue.d.ts` needed. Plain `tsc --noEmit` will fail on `.vue` imports but that's expected — always use `nuxi typecheck` or `vue-tsc` for typechecking Nuxt projects.

[DECISION] Issue #30 review: GREEN after confirming vue-tsc handles .vue shims. normalizeLocation wiring is clean, component cleanup removes all raw Entu fallbacks.

[LEARNED] `skipLibCheck: true` does NOT prevent vue-tsc from checking `.vue` files in node_modules from Nuxt modules. Only `.d.ts` files are skipped. (General principle — nuxt-icons removed, but applies to any module.)
