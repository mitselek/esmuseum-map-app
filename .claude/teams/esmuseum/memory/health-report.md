# Team Health Report — 2026-04-20

## Summary

- 12 recommendations total
- 3 STALE, 2 PROMOTE, 2 CROSSPOLL, 2 GAP, 2 COMMON, 1 CONSOLIDATE

## Previous Audit Follow-Up (from 2026-03-08)

| Issue | Status |
| ----- | ------ |
| CLAUDE.md token-expiry "12h" → "48h" | **FIXED** ✓ — All 5 references now say "48h" / "JWT `exp` claim" |
| MEMORY.md GitHub Issues section stale | **PARTIALLY FIXED** — Issues #31/#38/#39 listed correctly as CLOSED, but new problem below |
| `~~/` import convention not in shared docs | **FIXED** ✓ — Now in common-prompt.md lines 77-80 |
| MSW constraints not documented | **FIXED** ✓ — Now in common-prompt.md lines 85-91 AND Tess prompt lines 49-55 |
| Roster model inconsistency (finn="haiku") | **FIXED** ✓ — Now uses full ID `claude-haiku-4-5-20251001` |
| `readonly` global stub missing | **FIXED** ✓ — In setup-globals.ts, Tess scratchpad marked RESOLVED |
| Tess `import.meta.client/dev` not in prompt | **FIXED** ✓ — Tess prompt lines 43-44 |
| Lead prompt missing maintenance duties | **FIXED** ✓ — Lead prompt step 9 (MAINTAIN) now included |
| Common-prompt `finn-*.md` stale reference | **FIXED** ✓ — Removed; finn reports are session-scoped |

**9/9 flagged items from last audit were addressed.** Excellent maintenance.

---

## Recommendations

### [STALE] #1: MEMORY.md — "Kõik issue'd suletud" claim is false

**Source**: MEMORY.md line 82
**Finding**: Claims "Kõik issue'd suletud (seisuga 2026-03-09)" but **issue #40** (Workflow improvements from Claude Code Insights analysis) has been OPEN since 2026-03-08 — 42 days with no progress.
**Recommendation**: Update the line to: `- **#40**: Workflow improvements from Insights analysis — OPEN`; remove the "all closed" claim.
**Rationale**: Misleading for any agent or session checking project status.

---

### [STALE] #2: Finn scratchpad — token expiry gotcha resolved

**Source**: finn.md line 19: `[GOTCHA] Our code sets 12h token expiry but Entu docs say 48h`
**Finding**: Issue #38 fixed this 6 weeks ago. Code now parses JWT `exp` claim. The gotcha describes a bug that no longer exists.
**Recommendation**: Remove this line from finn.md.
**Rationale**: Actively misleading — suggests a live bug.

---

### [STALE] #3: Finn scratchpad — "0% real server coverage" outdated

**Source**: finn.md line 26: `[LEARNED] server/ has 15 files, 3149 lines total. 0% real coverage`
**Finding**: Entu wrote 22 webhook handler tests (per entu.md checkpoint). Server coverage is no longer 0%.
**Recommendation**: Remove or update this entry. The "best first targets" list (line 27) may still be partially useful but the "0%" claim is false.
**Rationale**: Agents making prioritization decisions based on this will waste effort re-auditing.

---

### [PROMOTE] #1: Entu → common-prompt — ESLint optional chaining complexity

**Source**: entu.md lines 49-52: `[LEARNED] ESLint counts optional chaining as complexity`
**Finding**: `?.` counts as a cyclomatic complexity branch in ESLint. 5 lines of chaining = 20 branches. Non-obvious, affects ANY agent refactoring for complexity.
**Recommendation**: Add to common-prompt.md (new "## Lint Notes" section or append to existing standards):
```markdown
- `?.` (optional chaining) counts as a cyclomatic branch in ESLint's `complexity` rule
- Extract helpers like `getEntityString(prop)` to reduce branch counts in Entu property access
```
**Rationale**: useEntuAuth.ts still has complexity 24 (remaining from #39). Next refactoring attempt needs this knowledge. Currently only Entu knows it.

---

### [PROMOTE] #2: Entu → Tess prompt — Webhook handler testing pattern

**Source**: entu.md lines 56-60: `[PATTERN] Webhook handler testing`
**Finding**: Detailed mock pattern for h3, entu-admin, webhook-queue. Tess is the test engineer but this pattern exists only in Entu's scratchpad.
**Recommendation**: Add to Tess prompt under a new section "## Server/Webhook Test Patterns":
```markdown
- Mock `h3` with `vi.mock('h3')` — override `defineEventHandler` (passthrough) and `readBody` (return `event._body`)
- Mock `entu-admin`, `webhook-queue`, `logger` at module level
- Use `installNuxtMocks()` for createError, getHeader
- Event shape: `{ _headers, _query, _body, _cookies, context: { params }, node: { req, res } }`
```
**Rationale**: Next time Tess writes webhook tests, she won't need to ask Entu or rediscover this.

---

### [CROSSPOLL] #1: Kaarel's Infinity km bug — shared boundary awareness

**Source**: kaarel.md lines 56-58
**Finding**: The fix touched `distance.js` which sits at the boundary between Kaarel's domain (geo/coordinates) and the general data pipeline. `distance.js` is also still plain JavaScript (not TypeScript).
**Recommendation**: Note for lead awareness only — no prompt change needed. If location data model changes, coordinate between Kaarel and Entu. Consider converting `distance.js` → `distance.ts` (see [GAP] #1).

---

### [CROSSPOLL] #2: Viiu's refreshToken sync discovery → already in Entu prompt ✓

**Source**: viiu.md line 9
**Finding**: Already cross-pollinated — Entu prompt line 31 says `useEntuAuth.refreshToken() is synchronous — not async`. No action needed.
**Status**: Resolved since last audit.

---

### [GAP] #1: No guidance on legacy .js files

**Finding**: `app/utils/distance.js` and `app/utils/location-sync.js` remain as plain JavaScript. No documentation or prompt mentions these as known legacy or migration targets.
**Recommendation**: Either (a) add a note to CLAUDE.md architecture section acknowledging these as known legacy JS, or (b) create a task to convert them to TypeScript with proper types.
**Rationale**: Any agent encountering these may waste tokens deciding whether to convert them or not.

---

### [GAP] #2: Issue #40 stale — no ownership

**Finding**: Issue #40 (Workflow improvements from Claude Code Insights analysis) opened 2026-03-08, still OPEN after 42 days. Not referenced in any scratchpad. No assignee.
**Recommendation**: Lead should triage: assign, schedule, or close as won't-fix.
**Rationale**: Unowned open issues create ambiguity about project priorities.

---

### [COMMON] #1: Scratchpad pruning trigger

**Finding**: Tess scratchpad = 93 lines (limit = 100). Contains a resolved `[GOTCHA]` that's already been struck through and old checkpoints that could be condensed.
**Recommendation**: Add to common-prompt Shutdown Protocol:
```markdown
### Pruning
If your scratchpad exceeds 70 lines before shutdown: remove resolved [GOTCHA] entries,
collapse old [CHECKPOINT]s into a one-line summary, delete anything now in common-prompt or your prompt.
```
**Rationale**: Proactive pruning prevents hitting the 100-line limit mid-session.

---

### [COMMON] #2: Scratchpad date format not standardized

**Finding**: Inconsistent formats:
- Finn: `## Heading (YYYY-MM-DD)` with `[TAG]` inline
- Tess/Kaarel: `## [TAG] YYYY-MM-DD — title`
- Marcus: `## YYYY-MM-DD` (section heading, entries below)

Common-prompt says "date every entry" but doesn't specify format.
**Recommendation**: Add to common-prompt memory tags table header:
```markdown
Entry format: `## [TAG] YYYY-MM-DD — short title`
```
**Rationale**: Consistent format makes auditing and staleness detection easier.

---

### [CONSOLIDATE] #1: "No DOM testing" — duplicated in 3 scratchpads

**Source**: viiu.md line 31, kaarel.md line 49, tess.md lines 3-6
**Finding**: All three independently note "vitest env = node, no DOM". This is already in common-prompt line 85. Scratchpad entries add nothing beyond what's documented.
**Recommendation**: Viiu and Kaarel can prune their "no DOM" entries during next pruning cycle. Only Kaarel's specific HTMLElement stub workaround adds unique value.
**Rationale**: Saves scratchpad space. Single source of truth exists in common-prompt.

---

## Scratchpad Health

| Agent | Lines | Health | Action |
| ----- | ----- | ------ | ------ |
| finn | 55 | 2 stale entries | Prune lines 19, 26 |
| tess | 93 | **Near limit** | Prune resolved GOTCHA, condense old checkpoints |
| kaarel | 76 | OK | Minor: remove "no DOM" duplication |
| entu | 60 | Healthy | Promote webhook pattern, then can prune it |
| viiu | 41 | Healthy | Minor: remove "no DOM" note |
| marcus | 15 | Healthy | No action |

## Priority Order for Lead

1. **MEMORY.md #40 claim** — 30-second fix, currently false statement about project state
2. **Finn stale token gotcha** — actively misleading, describes a non-existent bug
3. **Promote ESLint chaining to common-prompt** — prevents wasted tokens on next complexity refactor
4. **Promote webhook test pattern to Tess prompt** — saves significant rediscovery cost
5. **Triage issue #40** — 42 days unowned, decide: do it, assign it, or close it
