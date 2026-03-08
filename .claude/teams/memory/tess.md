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

- `npx nuxi typecheck`: 0 project errors (2 nuxt-icons third-party errors, ignorable)
- `npm test`: 15 suites passed, 157 tests passed
- `npm run lint`: clean
