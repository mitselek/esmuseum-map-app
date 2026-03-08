# Tess Scratchpad

## [PATTERN] 2026-03-05 — Vitest env is `node`, not `jsdom`

AppLogo tests can't use `@vue/test-utils` (no jsdom, no happy-dom installed).
Strategy: test pure logic exported from the SFC as named exports (`resolveLogoSrc`, `DEFAULT_CLASS`).
The implementer (viiu) must export these from `<script setup>` using `defineExpose` or module-level exports.
This is the established pattern in the project — see auth-utils.test.ts, auth-composable.test.ts.

## [LEARNED] 2026-03-05 — AppLogo RED tests written

Tests at: `tests/unit/AppLogo.test.ts`
9 tests, all failing (RED phase confirmed).

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
