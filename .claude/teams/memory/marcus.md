# Marcus — Code Review Scratchpad

## 2026-03-08

[LEARNED] In Nuxt projects, `vue-tsc` (used by `nuxi typecheck`) handles `.vue` imports natively. No `shims-vue.d.ts` needed. Plain `tsc --noEmit` will fail on `.vue` imports but that's expected — always use `nuxi typecheck` or `vue-tsc` for typechecking Nuxt projects.

[DECISION] Issue #30 review: GREEN after confirming vue-tsc handles .vue shims. normalizeLocation wiring is clean, component cleanup removes all raw Entu fallbacks.

[LEARNED] `skipLibCheck: true` does NOT prevent vue-tsc from checking `.vue` files in node_modules from Nuxt modules. Only `.d.ts` files are skipped. (General principle — nuxt-icons removed, but applies to any module.)

[DECISION] Issue #39 complexity refactoring review: GREEN. 19 files, net -174 lines. All extract-function/extract-constant pattern, no logic changes. Lint: 0 errors, 32 warnings removed (35→3). Tests: 1006/1006 passed. Notable: TaskSidebar.vue had duplicate `isTaskSelected` watcher (copy-paste bug) fixed in this refactoring.

[LEARNED] Complexity refactoring review technique: `git stash && lint && stash pop` to compare warning counts before/after. Confirms which warnings are pre-existing vs introduced.

[LEARNED] Designed "tervis" health checker agent for team roster. Key design: 6-category taxonomy (PROMOTE, CONSOLIDATE, CROSSPOLL, STALE, GAP, COMMON), write-restricted to report file only, haiku model.
