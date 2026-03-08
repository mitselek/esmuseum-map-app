# Kaarel Scratchpad

## [LEARNED] 2026-03-04 — useMapStyleScheduler no-await-in-loop fix

**File**: `app/composables/useMapStyleScheduler.ts`

Two `no-await-in-loop` warnings fixed:

1. **`evaluateRules` (was line 171)** — Replaced sequential `for...of` with `Promise.all` + `.map()`.
   Rules are independent, results sorted by priority after collection. Type guard `(r): r is NonNullable<typeof r>` used to filter nulls.

2. **`getRuleStatus` (line 333)** — Added `// eslint-disable-next-line no-await-in-loop -- debug-only function, single manual execution via console`.
   This is a debug-only function called manually from browser console; sequential logging is intentional.

Both changes verified: file-level lint clean (`npx eslint ... --max-warnings 0`), 148/148 tests pass.

## [CHECKPOINT] 2026-03-05 — Issue #3 sessiooni lõpp

Kõik 12 `no-await-in-loop` hoiatust lahendatud. Commit `e73a1ae` tehtud, Marcus andis GREEN review.

## [LEARNED] 2026-03-08 — types/ import alias

`types/` directory is at project root, not under `app/`. Use `~~/types/location` (double tilde = project root), NOT `~/types/location` (single tilde = `app/`).

## [CHECKPOINT] 2026-03-08 — Issue #32 + #35 session

**Issue #32 — console→logger migration (DONE):**

- `useMapStyles.ts` — 7 replacements, logger at module level as `useClientLogger('MapStyles')`
- `useMapStyleScheduler.ts` — 9 replacements, logger as `useClientLogger('MapStyleScheduler')`

**Issue #35 — composable tests (DONE):**

- `tests/composables/useMapStyles.test.ts` — 14 tests
- `tests/composables/useMapStyleScheduler.test.ts` — 12 tests (SunCalc mocked, fake timers)
- `tests/composables/useMapFullscreen.test.ts` — 10 tests (mock HTMLElement stub for Node env)
- `tests/composables/useLocation.test.ts` — 38 tests (vi.resetModules per test to clear singleton)
- `tests/composables/useTaskGeolocation.test.ts` — 13 tests
- Total: 87 new tests, all passing, lint clean

## [PATTERN] 2026-03-08 — Testing composables with singleton state

`useLocation.ts` uses module-level refs (singleton). To reset between tests:

- `vi.resetModules()` in `beforeEach` clears module cache
- Must re-setup `globalThis` mocks after `resetModules` (they get cleared)
- Dynamic `await import()` to re-import the composable fresh

## [GOTCHA] 2026-03-08 — Node test env has no `document`

`useMapFullscreen` uses `document.createElement` in real code but tests run in Node env.
Solution: create a plain object stub instead of real DOM element. The `@vueuse/core` `useFullscreen` is mocked anyway so it doesn't need a real element.

## [LEARNED] 2026-03-08 — Infinity km bug root cause

`distance.js:getLocationCoordinates()` only checked Entu raw format (`location.lat[0].number`) but after location normalization (#30), locations use `location.coordinates.lat`. Added NormalizedLocation check first. Also fixed unit mismatch: `calculateDistance()` returns km but `LocationPicker.vue:formatDistance()` treated as meters.

## [DECISION] 2026-03-08 — Null coordinates instead of (0,0) default

`extractCoordinates()` returns `null` when Entu entity lacks lat/lng. `NormalizedLocation.coordinates` type is `Coordinates | null`. Downstream: no map marker, "Koordinaadid puuduvad" in LocationPicker, console.warn for admin visibility.
