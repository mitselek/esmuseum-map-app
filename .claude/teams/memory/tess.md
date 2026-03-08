# Tess Scratchpad

## [PATTERN] 2026-03-05 — Vitest env is `node`, not `jsdom`

AppLogo tests can't use `@vue/test-utils` (no jsdom, no happy-dom installed).
Strategy: test pure logic exported from the SFC as named exports (`resolveLogoSrc`, `DEFAULT_CLASS`).
The implementer (viiu) must export these from `<script setup>` using `defineExpose` or module-level exports.
This is the established pattern in the project — see auth-utils.test.ts, auth-composable.test.ts.

## [LEARNED] 2026-03-05 → 2026-03-08 — AppLogo tests GREEN

Tests at: `tests/unit/AppLogo.test.ts`
9 tests, all passing (GREEN phase).

Contract the tests enforce:

- `resolveLogoSrc(locale: string): string` — named export
  - 'et' → '/esm-logo-et.svg'
  - 'en' → '/esm-logo-en.svg'
  - anything else (uk, lv, '', unknown) → '/esm_logo.png'
- `DEFAULT_CLASS` — named export, value `'h-20 w-auto'`
- Default export = Vue component object (has setup/render)

Note: login page currently only distinguishes et vs everything else (no fallback PNG).
The AppLogo spec adds the fallback PNG for uk/lv — implementer must handle this.

## [GOTCHA] 2026-03-05 — MSW `onUnhandledRequest: 'error'` in setup.ts

Tests that don't make HTTP requests are fine. But if component logic triggers
any fetch (e.g. auto-import of useEntuApi), MSW will throw.
AppLogo is purely presentational — no API calls expected, no issue here.

## [LEARNED] 2026-03-08 — Test imports must use relative paths, not ~/

`nuxi typecheck` uses `vue-tsc` which natively resolves `.vue` files — no `shims-vue.d.ts` needed.
But test files must use relative paths (`../../app/components/Foo.vue`) not `~/components/Foo.vue`,
because `~/` maps to `app/` which works in vitest (via resolve.alias) but caused TS2307 in earlier runs.
Project convention: all imports from `types/` and `app/` use relative paths in test files.

## [GOTCHA] 2026-03-08 — require() can't import Vue SFC in vitest

`require('../../app/components/Foo.vue')` fails in vitest node env.
Use `await import()` instead (and make the test callback `async`).

## [CHECKPOINT] 2026-03-08 — Quality gates all green

- `npx nuxi typecheck`: 0 project errors
- `npm test`: 30 suites passed, 388 tests passed
- `npm run lint`: clean

## [LEARNED] 2026-03-08 — Issue #35 composable test coverage

Wrote 95 new tests across 6 files:

- `useEntuApi.test.ts` (20) — uses MSW handlers from setup, not vi.stubGlobal('fetch')
- `useTaskWorkspace.test.ts` (17) — needs vi.resetModules() per test for singleton state reset
- `useTaskDetail.test.ts` (28) — parseCoordinates, checkTaskPermissions, initializeTask
- `useCompletedTasks.test.ts` (16) — needs `vi.stubGlobal('readonly', readonly)` + resetModules
- `useTaskResponseCreation.test.ts` (10) — needs `readonly` stub too
- `useOptimisticTaskUpdate.test.ts` (4)

## [GOTCHA] 2026-03-08 — MSW intercepts fetch globally

`vi.stubGlobal('fetch', mockFn)` does NOT work when MSW is active (setup.ts has `onUnhandledRequest: 'error'`).
Must use `server.use(http.get(...))` for custom handlers, or use existing MSW mock tokens (`mockTokens.valid`).

## [GOTCHA] 2026-03-08 — `readonly` not in global setup

setup.ts stubs `ref`, `computed`, `watch` but NOT `readonly`. Composables using `readonly()` (useCompletedTasks, useTaskResponseCreation) need `vi.stubGlobal('readonly', readonly)` in test file AND after `vi.resetModules()`.

## [PATTERN] 2026-03-08 — no-dynamic-delete lint rule

Use `Reflect.deleteProperty(obj, key)` instead of `delete obj[key]` in test mocks.

## [LEARNED] 2026-03-08 — import.meta.client/dev in vitest

`import.meta.client` and `import.meta.dev` are Nuxt compile-time constants. In vitest node env they are `undefined` (falsy), so client-only code paths (guarded by `if (import.meta.client)`) never execute. Fix: add `define: { 'import.meta.client': true, 'import.meta.dev': true }` to vitest.config.ts. This requires a `window` stub in setup-globals.ts since client code paths may reference `window`.

## [CHECKPOINT] 2026-03-08 — Coverage sprint 66% → 74%

- token-validation: 19% → 97% (29 tests)
- auth-check.client: 16% → 92% (14 tests)
- useClientSideFileUpload: 0% → covered (31 tests, rewritten from scratch)
- useNotifications: 55% → 100% (6 new debounce tests)
- useCompletedTasks/useTaskScoring: 75% → extended (7 new tests)
- distance.js: 40 regression tests (Infinity bug)
- Total: 1006 tests pass, lint clean, pushed as `567a5d7`

## [CHECKPOINT] 2026-03-08 — Post-#39 complexity refactor verification

- 1006 tests pass (61 suites, 2 skipped)
- Coverage stable: 74.88% stmts, 84.6% branches, 87.6% funcs, 74.88% lines
- ESLint: 0 errors, 3 warnings (useEntuAuth complexity 24, task-assigned-to-class complexity 17+cognitive 16)
