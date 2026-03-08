# Team Health Report — 2026-03-08

## Summary

- **18 recommendations** total
- 3 PROMOTE, 3 CONSOLIDATE, 2 CROSSPOLL, 4 STALE, 3 GAP, 3 COMMON

---

## Recommendations

### [STALE] Finn: 12h token expiry gotcha — FIXED

**Source**: `finn.md` line 19: `[GOTCHA] Our code sets 12h token expiry but Entu docs say 48h`

**Evidence**: `useEntuAuth.ts:300` now reads `const DEFAULT_EXPIRY_MS = 48 * 60 * 60 * 1000` and parses JWT `exp` claim. Issue #38 resolved by Entu agent.

**Recommendation**: Remove or update the `[GOTCHA]` in finn.md. The finding itself (`[LEARNED] Token expiry is 48h`) is still valid, but the gotcha about mismatch is resolved.

---

### [STALE] Marcus: nuxt-icons WIP — RESOLVED

**Source**: `marcus.md` line 9: `[WIP] Commit d9a186f ... pre-push hook fails on nuxt-icons@3.2.1 typecheck error`

**Evidence**: nuxt-icons was removed entirely (issue #37 CLOSED). Only references remain in archive docs and scratchpads.

**Recommendation**: Remove the `[WIP]` entry from marcus.md. Also remove `[GOTCHA]` about skipLibCheck on line 11 — the root cause (nuxt-icons .vue import chain) no longer exists.

---

### [STALE] Entu: nuxt-icons typecheck fix — RESOLVED

**Source**: `entu.md` lines 6-10: `[LEARNED] nuxt-icons typecheck fix`

**Evidence**: nuxt-icons removed. The general learning about `skipLibCheck` vs `.vue` is still useful but the specific context is gone.

**Recommendation**: Trim to a single generic line: "skipLibCheck only skips .d.ts, not .vue from node_modules" — or remove entirely since this is also in MEMORY.md.

---

### [STALE] Viiu: `useEntuAuth.ts refreshToken() is synchronous`

**Source**: `viiu.md` line 9: `[LEARNED] useEntuAuth.ts refreshToken() is synchronous (not async)`

**Status**: Uncertain — this was noted during a specific refactor. The auth code has been further modified (issue #38). Should be reverified. If the interface still matches, keep; if not, remove.

**Recommendation**: Lead should ask Finn to verify current `refreshToken()` signature against viiu's claim.

---

### [CONSOLIDATE] `~~/` import convention — 3 agents noted independently

**Sources**:

- `viiu.md` lines 5, 11: `~/` vs `~~/` explanation
- `kaarel.md` line 22: `[LEARNED] types/ import alias — use ~~/types/`
- `entu.md` line 47: `import path standardization (9 files, ../ → ~/  / ~~/)`

**Not in**: common-prompt.md or any agent prompt

**Recommendation**: Add to `common-prompt.md` under Standards:

```
## Import Paths
- `~/` = `app/` directory (Nuxt standard)
- `~~/` = project root — use for `types/`, root `utils/`
- In test files: use relative paths (`../../app/...`) not `~/`
```

---

### [CONSOLIDATE] `vi.resetModules()` for singleton composables — 2 agents noted

**Sources**:

- `kaarel.md` lines 41-48: `[PATTERN] Testing composables with singleton state`
- `tess.md` line 57: `needs vi.resetModules() per test for singleton state reset`

**Recommendation**: Add to Tess's prompt as an established pattern, OR add to common-prompt testing section. This is the #1 pattern any test writer needs for this project.

---

### [CONSOLIDATE] Node env has no DOM — 2 agents noted

**Sources**:

- `viiu.md` line 31: `[GOTCHA] No DOM testing environment available`
- `kaarel.md` lines 49-52: `[GOTCHA] Node test env has no document`

**Recommendation**: Include in common-prompt or Tess's prompt: "vitest env is `node` — no DOM, no `document`, no `window` (except stub in setup-globals). Component tests are logic-only."

---

### [CROSSPOLL] Kaarel's testing composables pattern → Tess's prompt

**Source**: `kaarel.md` lines 41-48: detailed `[PATTERN]` about singleton testing with `vi.resetModules()`, dynamic `await import()`, `globalThis` re-mock after reset.

**Recommendation**: This pattern belongs in Tess's prompt, not Kaarel's scratchpad. Kaarel is the map dev, not the testing expert. Add to Tess's prompt:

```
## Singleton Composable Testing
- `vi.resetModules()` in `beforeEach` to clear module cache
- Re-setup globalThis mocks after reset (they get cleared)
- Dynamic `await import()` to get fresh composable instance
```

---

### [CROSSPOLL] Entu's nuxt-icons typecheck analysis → Marcus's domain

**Source**: `entu.md` lines 6-10: deep analysis of `skipLibCheck` vs `.vue` files, nuxt.config `typescript.tsConfig`, import chain from `.nuxt/components.d.ts`

**Status**: MOOT because nuxt-icons is removed. However, the _general_ knowledge about vue-tsc/skipLibCheck belongs in Marcus's domain (he's the code reviewer who caught the typecheck issue).

**Recommendation**: If keeping a trimmed version, move to `marcus.md`. Currently Marcus already has it at line 11. No action needed unless we want to preserve Entu's deeper analysis.

---

### [PROMOTE] Tess: `import.meta.client/dev` in vitest → Tess's prompt

**Source**: `tess.md` lines 76-77: `import.meta.client` and `import.meta.dev` are undefined in vitest node env. Fix: `define` block in vitest.config.ts. Also requires `window` stub in setup-globals.ts.

**Evidence**: Verified — `vitest.config.ts:49-50` has `'import.meta.client': true, 'import.meta.dev': true`. `setup-globals.ts:27-34` has the window stub.

**Recommendation**: Add to Tess's prompt:

```
## Nuxt Compile-Time Constants in Tests
`import.meta.client` and `import.meta.dev` are defined as `true` in vitest.config.ts.
This requires the `window` stub in setup-globals.ts. If client code paths break in tests, check these.
```

---

### [PROMOTE] Tess: MSW + `vi.stubGlobal('fetch')` conflict → Tess's prompt

**Source**: `tess.md` lines 62-65: MSW intercepts fetch globally; `vi.stubGlobal('fetch')` does NOT work when MSW is active.

**Recommendation**: Add to Tess's prompt:

```
## MSW Constraint
Do NOT use `vi.stubGlobal('fetch', ...)` — MSW intercepts fetch globally.
Use `server.use(http.get(...))` for custom handlers instead.
```

---

### [PROMOTE] Finn: Entu API key facts → Finn's prompt or common-prompt

**Source**: `finn.md` lines 5-18: token expiry (48h), webhook token (1min), signed URL expiry (15min), download URL (60s), default query limit (100), property update requires `_id` to overwrite.

**Recommendation**: The most impactful items for daily work should go to common-prompt or CLAUDE.md:

- Webhook token: 1-minute lifetime
- Signed upload URLs: 15-minute expiry
- Default query limit: 100 (we set 1000)
- Property update: `_id` field = overwrite, without = add new

These save real debugging time. Lower priority items (history endpoint, aggregate endpoint, counter type) can stay in finn.md.

---

### [GAP] MSW constraints — repeated gotchas across agents

**Sources**:

- `tess.md` line 27: `[GOTCHA] MSW onUnhandledRequest: 'error'`
- `tess.md` line 62: `[GOTCHA] MSW intercepts fetch globally`
- `tess.md` line 67: `[GOTCHA] readonly not in global setup`
- `viiu.md` line 13: `[LEARNED] vi.stubGlobal('fetch') conflicts with MSW`

**Pattern**: Multiple agents hit MSW-related issues. The test setup has non-obvious constraints that aren't documented in prompts.

**Recommendation**: Add MSW section to Tess's prompt (and reference from common-prompt):

```
## MSW Test Setup Constraints
- `setup-globals.ts` runs BEFORE `setup.ts` (localStorage mock before MSW import)
- `onUnhandledRequest: 'error'` — any unmocked fetch will throw
- Do NOT use `vi.stubGlobal('fetch')` — use `server.use()` for custom handlers
- After `vi.resetModules()`: re-stub Vue globals (ref, computed, watch, readonly)
- `readonly` is NOT in global setup — stub it yourself if composable uses it
```

---

### [GAP] Vitest env is `node` — impacts all test writers

**Sources**:

- `tess.md` line 3: `[PATTERN] Vitest env is node, not jsdom`
- `viiu.md` line 31: `[GOTCHA] No DOM testing environment`
- `kaarel.md` line 49: `[GOTCHA] Node test env has no document`

**Recommendation**: Already noted under [CONSOLIDATE] above. Should be in Tess's prompt AND common-prompt.

---

### [GAP] `readonly` not stubbed globally — hit by 2 agents

**Sources**:

- `tess.md` lines 67-69: `readonly` not in global setup; needs manual stub
- Verified: `setup-globals.ts` does NOT stub `readonly`

**Recommendation**: Either (a) add `readonly` to setup-globals.ts (source fix), or (b) document in Tess's prompt. Option (a) is better — prevents future agents from hitting it.

---

### [COMMON] Finn's supplementary research files — naming convention

**Observation**: Finn has 4 files: `finn.md`, `finn-analysis-12-warnings.md`, `finn-file-upload-ux.md`, `finn-rate-limits-research.md`. The supplementary files are detailed research reports (100-400 lines each).

**Recommendation**: This is good practice — the main scratchpad stays lean while detailed reports are in separate files. Document this pattern in common-prompt:

```
## Research Reports
Finn stores detailed reports as `finn-<topic>.md` in the memory directory.
Main scratchpad stays under 100 lines; link to reports for details.
```

---

### [COMMON] Test file import convention — not documented

**Source**: `tess.md` line 33-38: test files must use relative paths, not `~/`

**Verification**: This is the project convention (confirmed by Tess and verified in practice).

**Recommendation**: Add to common-prompt:

```
## Test File Imports
Test files use relative paths (`../../app/composables/...`), not `~/` or `~~/`.
The vitest alias works but caused TS2307 in earlier configs.
```

---

### [COMMON] Scratchpad line count enforcement

**Observation**: Common-prompt says "Keep it under 100 lines; prune stale entries." Current line counts:

- finn.md: 40 lines (OK)
- marcus.md: 12 lines (OK)
- viiu.md: 32 lines (OK)
- kaarel.md: 61 lines (OK)
- entu.md: 61 lines (OK)
- tess.md: 88 lines (approaching limit)

**Recommendation**: Tess is approaching 100 lines. After applying STALE removals and PROMOTE moves, it should shrink. No action needed now, but worth watching.

---

## Priority Actions (Lead)

1. **Quick wins**: Apply [STALE] removals (finn gotcha, marcus WIP, entu nuxt-icons)
2. **High impact**: Add [CONSOLIDATE] items to common-prompt (`~~/` paths, singleton testing, node env)
3. **Prompt updates**: Apply [PROMOTE] items to Tess's prompt (import.meta, MSW, readonly)
4. **Source fix**: Consider adding `readonly` to setup-globals.ts to prevent recurring gotcha
5. **CLAUDE.md update**: Add key Entu API facts (webhook token 1min, upload URL 15min, query limit 100)
