# Marcus — Code Review Scratchpad

## 2026-03-08

[LEARNED] In Nuxt projects, `vue-tsc` (used by `nuxi typecheck`) handles `.vue` imports natively. No `shims-vue.d.ts` needed. Plain `tsc --noEmit` will fail on `.vue` imports but that's expected — always use `nuxi typecheck` or `vue-tsc` for typechecking Nuxt projects.

[DECISION] Issue #30 review: GREEN after confirming vue-tsc handles .vue shims. normalizeLocation wiring is clean, component cleanup removes all raw Entu fallbacks.

[WIP] Commit `d9a186f` created but NOT pushed — pre-push hook fails on `nuxt-icons@3.2.1` typecheck error (`nuxt-icon.vue:27` TS2532/TS2722). This is a third-party bug, not our code. Options presented to lead: (1) exclude in nuxt.config typecheck.include, (2) upgrade nuxt-icons, (3) --no-verify. Awaiting decision.

[GOTCHA] `skipLibCheck: true` does NOT prevent vue-tsc from checking `.vue` files in node_modules from Nuxt modules. Only `.d.ts` files are skipped.
