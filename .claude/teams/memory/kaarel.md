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

Files changed:

- `app/composables/useMapStyleScheduler.ts` — Promise.all + eslint-disable
- `app/composables/useClientSideFileUpload.ts` — eslint-disable (sequential progress)
- `server/api/webhooks/student-added-to-class.post.ts` — eslint-disable (rate limit + while-loop)
- `server/api/webhooks/task-assigned-to-class.post.ts` — eslint-disable (while-loop)
- `server/utils/entu-admin.ts` — eslint-disable / sync fix
