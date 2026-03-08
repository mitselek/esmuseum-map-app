# Team Health Report — 2026-03-08

## Summary

- 19 recommendations total
- 4 STALE, 4 PROMOTE, 3 GAP, 3 COMMON, 3 CONSOLIDATE, 2 CROSSPOLL

## Recommendations

---

### [STALE] MEMORY.md: GitHub Issues section — 6 issues listed as OPEN are now CLOSED

**Source**: MEMORY.md lines 79-88

**Finding**: Issues #31, #32, #33, #34, #35, #36 are all listed as OPEN but GitHub shows them CLOSED. Issue #31 says "1/6 done" but all 6 sub-issues are resolved. Issue #35 says "25% → 60%" but coverage is now 74%+. Issue #38 (token expiry fix) and #39 (complexity) are not listed at all.

**Recommendation**: Update the GitHub Issues section. Mark #31-#36 as CLOSED. Add #38 (CLOSED) and #39 (OPEN). Update #35 description to reflect actual coverage reached (74%).

**Rationale**: Stale issue status causes wasted time checking GitHub to verify current state.

---

### [STALE] CLAUDE.md: Token expiry still says "12-hour" in 3 places

**Source**: CLAUDE.md lines 94, 164, 250

**Finding**: Issue #38 fixed token expiry to parse JWT `exp` claim instead of hardcoded 12h. Entu issues 48h tokens. But CLAUDE.md still says "12-hour expiry", "12h validity" in Authentication section.

**Recommendation**: Update CLAUDE.md to say "token validity parsed from JWT `exp` claim (typically 48h)" instead of "12-hour expiry".

**Rationale**: Misleading documentation causes debugging confusion. This was finn's `[GOTCHA]` — now fixed in code but not in docs.

---

### [STALE] Tess scratchpad: `readonly` not in global setup

**Source**: tess.md lines 67-69

**Finding**: Tess's `[GOTCHA]` says `readonly` is NOT in setup-globals.ts. But it HAS been added (setup-globals.ts line 37-39: `globalThis.readonly = readonly`). The gotcha is now resolved.

**Recommendation**: Remove or mark as resolved in tess.md. Also update tess.md line 56 ("needs `vi.stubGlobal('readonly', readonly)` + resetModules") since it's now globally available.

**Rationale**: Stale gotcha wastes agent time adding redundant stubs.

---

### [STALE] Common-prompt: "Finn stores detailed reports as `finn-<topic>.md`"

**Source**: common-prompt.md line 88

**Finding**: The old `finn-*.md` report files were in `.claude/teams/memory/` which was deleted during team directory restructuring. No `finn-*.md` files exist in the current `.claude/teams/esmuseum/memory/` directory.

**Recommendation**: Either remove this line, or if the pattern should continue, note that reports are transient (session-scoped) and won't persist across team recreations.

**Rationale**: References to non-existent files confuse agents looking for prior research.

---

### [PROMOTE] Tess scratchpad → Tess prompt: MSW + resetModules pattern

**Source**: tess.md lines 62-69, lines 75-77

**Finding**: Tess's prompt already covers MSW constraints well (lines 48-53). However, the `import.meta.client`/`import.meta.dev` gotcha (line 75-77 in scratchpad) is important for future test writing and is NOT in the prompt.

**Recommendation**: Add to tess.md prompt under "Nuxt Compile-Time Constants": note that `define` in vitest.config.ts sets these to `true`, and that after `vi.resetModules()`, globalThis mocks (including readonly) get cleared and need re-stubbing.

**Rationale**: This was a repeated discovery — already partially promoted but the resetModules interaction was missed.

---

### [PROMOTE] Kaarel scratchpad → Kaarel prompt: NormalizedLocation format

**Source**: kaarel.md lines 54-60

**Finding**: Kaarel's `[LEARNED]` about `getLocationCoordinates()` needing to check `location.coordinates` format (not just Entu raw) and the `[DECISION]` about null coordinates instead of (0,0) are important for future geo work. Kaarel's prompt mentions `location-transform.ts` but doesn't mention the NormalizedLocation format or the null-coordinates convention.

**Recommendation**: Add to kaarel.md prompt under "Key Patterns": `NormalizedLocation.coordinates` can be `null` (no map marker shown). Distance calculations handle this gracefully.

**Rationale**: Prevents re-introducing the Infinity km bug pattern.

---

### [PROMOTE] Entu scratchpad → Entu prompt: EntityData is array, not object

**Source**: entu.md lines 23-27

**Finding**: Entu learned that `createEntity`/`updateEntity` receive `EntuPropertyUpdate[]` (array), NOT an object. This is a non-obvious API detail that's easy to get wrong. Not in the prompt.

**Recommendation**: Add to entu.md prompt under "Key Patterns": `createEntity`/`updateEntity` take `EntuPropertyUpdate[]` array format, not object format.

**Rationale**: Both entu and test writers hit this — saves re-discovery time.

---

### [PROMOTE] Marcus scratchpad → Marcus prompt: Review technique for lint comparison

**Source**: marcus.md line 13

**Finding**: `git stash && lint && stash pop` technique for comparing warning counts before/after is a reusable review strategy. Not in the prompt.

**Recommendation**: Add to marcus.md prompt under "Review Process": use `git stash && npm run lint && git stash pop` to compare pre-existing warnings vs introduced.

**Rationale**: Actionable technique that improves review quality.

---

### [GAP] Lead prompt: No guidance on CLAUDE.md maintenance

**Source**: Lead prompt (lead.md)

**Finding**: Lead is the natural owner of CLAUDE.md accuracy. The prompt has no mention of verifying/updating CLAUDE.md when issues are resolved (e.g., token expiry fix in #38 didn't update CLAUDE.md). The lead should ensure CLAUDE.md stays current after significant changes.

**Recommendation**: Add to lead.md: "After closing significant issues, verify CLAUDE.md is still accurate. Delegate to Finn to check if documentation references are stale."

**Rationale**: CLAUDE.md is the project's primary knowledge source. Stale entries multiply confusion.

---

### [GAP] Lead prompt: No MEMORY.md maintenance guidance

**Source**: Lead prompt (lead.md)

**Finding**: Lead's prompt says nothing about maintaining MEMORY.md (the auto-memory file). MEMORY.md has a GitHub Issues section that went stale because nobody owns updating it. The lead should update MEMORY.md issue status when closing issues.

**Recommendation**: Add to lead.md: "After closing GitHub issues, update MEMORY.md's GitHub Issues section."

**Rationale**: MEMORY.md is loaded into every conversation. Stale issue status wastes context tokens and causes confusion.

---

### [GAP] Common-prompt: No guidance on test file location conventions

**Source**: Multiple scratchpads

**Finding**: Common-prompt has "Import Paths" section with `~/` and `~~/` conventions, and "Testing Notes" section. But there's no mention of WHERE test files go relative to what they test. The directory structure is `tests/unit/`, `tests/composables/`, `tests/component/`, `tests/api/`, `tests/integration/` — this is only documented in CLAUDE.md, not common-prompt. Agents creating test files need to know which directory to use.

**Recommendation**: Add a brief note to common-prompt Testing Notes: test file location conventions (unit/ for utils, composables/ for composables, component/ for component logic, api/ for server endpoints).

**Rationale**: Tess and other agents creating tests need this; currently they must check CLAUDE.md.

---

### [CONSOLIDATE] `~~/` import convention — noted by 3+ agents independently

**Source**: kaarel.md line 21, viiu.md lines 5, 11, entu.md (implicit in import fixes), tess.md line 33

**Finding**: The double-tilde `~~/` convention for project root imports was independently discovered by Kaarel, Viiu, and Tess. It IS documented in common-prompt.md (line 77-79). However, the specific case of `types/` being at project root (requiring `~~/types/`) keeps getting re-discovered.

**Recommendation**: Strengthen common-prompt.md Import Paths section: explicitly list `types/` and root `utils/` as requiring `~~/`. Example: `import { NormalizedLocation } from '~~/types/location'`.

**Rationale**: Despite being documented, the current wording isn't prominent enough to prevent re-discovery.

---

### [CONSOLIDATE] Node test environment has no DOM — repeated across agents

**Source**: kaarel.md line 49, viiu.md line 31, tess.md lines 3-6

**Finding**: Three agents independently discovered that vitest runs in `node` env (no DOM, no document, no window). Each found workarounds. This IS in common-prompt (line 83) but terse: "Vitest env is `node` — no DOM, no `document`, no `window`".

**Recommendation**: Expand common-prompt Testing Notes to add: "Component tests must be logic-focused (exported functions, computed behavior). Use plain object stubs for DOM elements. No mount/render without adding happy-dom."

**Rationale**: The current one-liner doesn't convey the practical implications that agents keep re-discovering.

---

### [CONSOLIDATE] Singleton composable testing pattern — discovered by Kaarel and Tess

**Source**: kaarel.md lines 41-47, tess.md lines 56-58

**Finding**: Both Kaarel and Tess documented the `vi.resetModules()` + re-import pattern for singleton composables. This IS in common-prompt (lines 85-87) but should be strengthened.

**Recommendation**: Common-prompt already covers this adequately. No change needed — this is a false consolidation candidate.

**Rationale**: N/A (withdrawn after review).

---

### [COMMON] CLAUDE.md references need cross-checking after issue closure

**Source**: CLAUDE.md token expiry stale entries

**Finding**: When issues resolve code changes, nobody updates CLAUDE.md. This is a process gap, not a knowledge gap. The team needs a convention: "when closing an issue that changes documented behavior, check CLAUDE.md."

**Recommendation**: Add to common-prompt: "After closing issues that change documented behavior, verify CLAUDE.md references are still accurate. Report stale entries to lead."

**Rationale**: Prevents documentation rot. CLAUDE.md is the project's single source of truth.

---

### [COMMON] Roster model field: "haiku" vs full model ID

**Source**: roster.json line 49

**Finding**: Finn's model is listed as `"haiku"` while all other agents use full model IDs (`"claude-sonnet-4-6"`, `"claude-opus-4-6"`). This inconsistency could cause spawning issues if the Agent tool requires the full model ID.

**Recommendation**: Standardize to `"claude-haiku-4-5-20251001"` or verify that `"haiku"` is accepted by the Agent tool.

**Rationale**: Prevents spawning failures due to model ID resolution.

---

### [COMMON] Lead prompt: session startup procedure references old directory structure

**Source**: lead.md lines 9-10

**Finding**: Lead prompt says "Create a fresh team: `TeamCreate(team_name="esmuseum")`" without the full backup/restore procedure. The detailed procedure IS in MEMORY.md (lines 38-43) and global CLAUDE.md. But the lead prompt itself is terse — it should at least reference where the full procedure lives.

**Recommendation**: Add to lead.md step 2: "(see global CLAUDE.md for full backup/restore procedure)" or inline the critical steps.

**Rationale**: Lead following only their prompt might skip the inbox backup/restore step.

---

### [CROSSPOLL] Viiu's `useEntuAuth.refreshToken()` is synchronous — affects Entu's domain

**Source**: viiu.md line 9

**Finding**: Viiu discovered that `refreshToken()` is synchronous (not async). This is relevant for Entu agent who owns auth logic in `server/utils/auth.ts` and might assume it's async.

**Recommendation**: Add note to entu.md prompt or scratchpad: "Note: `useEntuAuth.refreshToken()` is synchronous — interface must match."

**Rationale**: Cross-domain knowledge that could cause bugs if Entu modifies auth code.

---

### [CROSSPOLL] Finn's Entu API research — partially in CLAUDE.md but some gaps

**Source**: finn.md lines 3-22

**Finding**: Finn gathered comprehensive Entu API facts. Most were added to CLAUDE.md (token expiry, webhook token, signed URLs, default limit, property update). But some aren't: entity history endpoint (`GET /entity/{id}/history`), aggregate endpoint, `counter` property type, `_sharing` replacing `_public`, passkey/WebAuthn auth, property deletion being per-value-_id.

**Recommendation**: Promote the most useful ones to CLAUDE.md "Entu API Key Facts" section: property deletion per-value-_id, entity history endpoint.

**Rationale**: These are non-obvious API behaviors that could save debugging time.

---

## Meta-Observations

1. **MEMORY.md is the biggest staleness risk** — it's loaded into every conversation but has no maintenance owner. The GitHub Issues section is fully out of date.

2. **CLAUDE.md has 3 stale token expiry references** — this is the most impactful fix since CLAUDE.md is the primary project reference.

3. **Scratchpads are generally healthy** — most entries are dated, tagged, and relevant. The main issue is completed gotchas that should be pruned.

4. **Common-prompt is solid** — minor strengthening of Import Paths and Testing Notes sections would prevent recurring re-discoveries.

5. **Lead prompt is minimal but functional** — the two gaps (CLAUDE.md maintenance, MEMORY.md maintenance) are process issues that could be addressed with 2-3 lines.
