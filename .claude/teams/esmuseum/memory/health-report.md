# Team Health Report — 2026-04-27

## Summary

- **13 recommendations total**
- **2 STALE, 2 PROMOTE, 0 CROSSPOLL, 3 GAP, 2 COMMON, 1 CONSOLIDATE, 3 PRUNE/HOUSEKEEPING**
- Of last audit's 12 recommendations: **1 fully applied, 1 partially, 10 still outstanding**

## Previous Audit Follow-Up (from 2026-04-20)

| # | Recommendation | Status |
|---|----------------|--------|
| STALE 1 | MEMORY.md "all closed" claim | **FIXED** — auto-memory MEMORY.md now lists each issue (#40 OPEN, #41/#42/#43/#45 OPEN, #44/#47 CLOSED) |
| STALE 2 | Finn 12h token gotcha | **NOT APPLIED** — finn.md:19 still says `Our code sets 12h token expiry but Entu docs say 48h`. Source: useEntuAuth.ts uses `decodeJWT(...).exp * 1000` since #38; no 12h literal exists. |
| STALE 3 | Finn "0% real server coverage" | **NOT APPLIED** — finn.md:26 still says `server/ has 15 files, 3149 lines total. 0% real coverage`. Source: 22 webhook tests + others now exist; coverage metric is not zero. |
| PROMOTE 1 | ESLint optional chaining → common-prompt | **NOT APPLIED** — common-prompt has no "Lint Notes"; entu.md:49-53 still the only place this exists. |
| PROMOTE 2 | Webhook test pattern → Tess prompt | **NOT APPLIED** — tess prompt has no webhook section; entu.md:199-204 still the only place. |
| CROSSPOLL 1 | Kaarel Infinity-km boundary awareness | N/A — noted only |
| CROSSPOLL 2 | Viiu refreshToken sync → Entu | Already in Entu prompt line 31 ✓ |
| GAP 1 | Legacy .js files (distance.js, location-sync.js) | **NOT APPLIED** — both files unchanged on disk; CLAUDE.md still silent. |
| GAP 2 | Issue #40 unowned (was 42 days) | **NOT APPLIED** — now **50 days** open (opened 2026-03-08), still no assignee. |
| COMMON 1 | Pruning trigger in Shutdown Protocol | **NOT APPLIED** — common-prompt:40 still only says "under 100 lines; prune stale entries". |
| COMMON 2 | Standardize scratchpad entry header format | **NOT APPLIED** — formats still inconsistent across agents. |
| CONSOLIDATE 1 | "No DOM testing" duplication | **PARTIALLY** — only viiu.md:31 still has the entry; kaarel/tess no longer duplicate it. The remaining viiu entry can also go (already in common-prompt:85). |

**Net: 1/12 fully applied + 1/12 partially. 10 still outstanding.** Likely cause: 2026-04-20 session pivoted entirely into Entu admin-key / Juhendid work; documentation maintenance was deferred. Lead's MAINTAIN step (lead.md:54) didn't trigger because the 2026-04-21 session closed PRs but didn't re-open the audit's recommendations.

---

## Recommendations

### [STALE] #1: Finn scratchpad — "12h token expiry" gotcha (re-flag)

**Source**: `finn.md:19` `[GOTCHA] Our code sets 12h token expiry but Entu docs say 48h` (and the matching `[LEARNED]` on line 5)
**Verified**: useEntuAuth.ts line 316-318 parses JWT `exp`, no 12h literal exists. CLAUDE.md says "App token validity: 48h (parsed from JWT `exp` claim)".
**Recommendation**: Remove `finn.md:19` and reword line 5 to `Token validity is parsed from JWT exp claim (typically 48h)`.
**Rationale**: Re-flagged from 2026-04-20 audit. Describes a non-existent bug — actively misleading.

---

### [STALE] #2: Finn scratchpad — "0% real server coverage" (re-flag)

**Source**: `finn.md:26` `[LEARNED] server/ has 15 files, 3149 lines total. 0% real coverage`
**Verified**: entu.md:43-44 records 22 webhook tests written; tess.md `[CHECKPOINT] 1006 tests pass`. The "0%" claim was a 2026-03-08 baseline that is no longer accurate.
**Recommendation**: Replace with: `Server initial coverage was 0% on 2026-03-08; baseline is now ~22 webhook tests + helpers. Re-audit coverage if a new sprint targets server`.
**Rationale**: Re-flagged from 2026-04-20 audit. Agents prioritising work on this would waste tokens re-confirming.

---

### [PROMOTE] #1: Entu → common-prompt — ESLint optional chaining complexity (re-flag)

**Source**: `entu.md:49-53` `[LEARNED] ESLint counts optional chaining as complexity`
**Verified**: `.config/eslint.config.js:35` sets `complexity: ['warn', 15]` and `sonarjs/cognitive-complexity: ['warn', 15]`. useEntuAuth.ts still has remaining complexity warnings (per finn.md:51-53). The next refactor will rediscover this without prompting.
**Recommendation**: Append to `common-prompt.md` (new "## Lint Notes" section):
```markdown
## Lint Notes
- `complexity` and `sonarjs/cognitive-complexity` thresholds: 15
- `?.` (optional chaining) counts as a cyclomatic branch in ESLint's `complexity` rule
- Extract helpers like `getEntityString(prop)` to reduce branch counts in Entu property access
```
**Rationale**: Re-flagged from 2026-04-20. Affects every agent who refactors for complexity — currently only Entu knows.

---

### [PROMOTE] #2: Entu → Tess prompt — Webhook handler testing pattern (re-flag)

**Source**: `entu.md:199-204` `[PATTERN] Webhook handler testing (2026-03-08)`
**Verified**: tess prompt has no server/webhook section. Tess prompt's "Test categories" lists `tests/api/` but provides no h3/event-shape guidance.
**Recommendation**: Add to `prompts/tess.md` under a new section "## Server/Webhook Test Patterns":
```markdown
- Mock `h3` with `vi.mock('h3')` — override `defineEventHandler` (passthrough) and `readBody` (return `event._body`)
- Mock `entu-admin`, `webhook-queue`, `logger` at module level
- Use `installNuxtMocks()` for `createError`, `getHeader`
- Event shape: `{ _headers, _query, _body, _cookies, context: { params }, node: { req, res } }`
```
**Rationale**: Re-flagged. Entu's pattern saves Tess significant rediscovery cost on the next webhook test sprint.

---

### [GAP] #1: Issue #40 still unowned — now 50 days (re-flag, escalating)

**Verified**: `gh issue list` shows #40 OPEN since 2026-03-08, no assignee. Auto-memory MEMORY.md:94 confirms "unowned as of 2026-04-20".
**Recommendation**: Lead must triage this session: (a) assign + schedule, (b) close as won't-fix, or (c) split into actionable sub-issues. The "Workflow improvements from Insights analysis" title alone won't survive much longer as a useful tracker.
**Rationale**: 50 days unowned is a real signal that nobody believes this matters. Either prove that wrong by acting, or close it. Drift grows worse the longer it sits.

---

### [GAP] #2: Legacy .js files in app/utils/ (re-flag)

**Verified**: `app/utils/distance.js` and `app/utils/location-sync.js` both still exist as plain JavaScript. CLAUDE.md still silent.
**Recommendation**: Either (a) add a one-liner to CLAUDE.md "Architecture Overview" noting these as known-legacy JS pending migration, or (b) open a tracked issue for the conversion.
**Rationale**: Re-flagged. distance.js was directly involved in the Infinity-km bug (kaarel.md:54-58) — its untyped status increases bug surface for geo work.

---

### [GAP] #3: Backlog of new OPEN issues (#41, #42, #43, #45) — none referenced from any prompt

**Verified**: `gh issue list` shows #41 (p3), #42 (p2), #43 (p2), #45 (p1, security) all OPEN. Task-list-snapshot.md:21-25 records them as filed 2026-04-21. None appear in any prompt or scratchpad as ongoing work.
**Recommendation**: Add a single line to `lead.md` "Before Starting Work" step list: `Read .claude/teams/esmuseum/memory/task-list-snapshot.md if present — picks up commitments from previous session.` — or have lead spawn finn at session start to summarise OPEN issues and unowned tickets.
**Rationale**: Without an entry-point reminder, these issues will drift exactly like #40. The snapshot file already exists (task-list-snapshot.md:18-25) and is the right artifact — but nothing in the prompts tells lead to read it.

---

### [COMMON] #1: Scratchpad pruning trigger (re-flag)

**Source**: common-prompt.md:40 says only "Keep it under 100 lines; prune stale entries."
**Verified**: This audit found `entu.md` at **204 lines** (over 2× the limit). No automatic trigger forced pruning.
**Recommendation**: Add to `common-prompt.md` Shutdown Protocol section:
```markdown
### Pruning trigger

Run `wc -l <your-scratchpad>` at session start. If >70 lines: before adding new entries, remove resolved [GOTCHA]s, collapse old [CHECKPOINT]s into one-line summaries, and delete anything now in your prompt or common-prompt. If >100 lines: prune is mandatory before shutdown.
```
**Rationale**: Re-flagged. The 100-line cap is regularly overrun without an actionable trigger.

---

### [COMMON] #2: Scratchpad entry header format (re-flag)

**Verified**: Still inconsistent — finn uses `## Heading (date)` with inline `[TAG]`, others use `## [TAG] date — title`, marcus uses `## date` with bullet list.
**Recommendation**: Add to common-prompt.md memory tag table (right above the table at line 42):
```markdown
**Entry header format**: `## [TAG] YYYY-MM-DD — short title` (one heading per discrete entry)
```
**Rationale**: Re-flagged. Consistent format makes auditing and staleness detection cheaper.

---

### [CONSOLIDATE] #1: viiu.md "no DOM" entry — now redundant (downgrade from previous audit)

**Source**: viiu.md:31
**Verified**: Common-prompt.md:85 says `Vitest env is node — no DOM, no document, no window (except stubs in setup-globals.ts)`. Viiu's entry adds no information beyond the common-prompt rule.
**Recommendation**: Viiu can prune line 31 during her next pruning cycle.
**Rationale**: Single source of truth already exists. Last remnant of the original 3-way duplication.

---

### [PRUNE] #1: Entu scratchpad — 204 lines (BLOAT, urgent)

**Source**: `entu.md` (204 lines vs 100-line cap, 2× over)
**Findings**:
- Lines 36-47 `[CHECKPOINT] Completed this session (2026-03-08)` — list of closed issues #32-#39, completed weeks ago. Belongs in PR/issue history.
- Lines 129-167 `[REPORT] Raw ownership dump` and `[REPORT] _editor + _expander verbatim` — verbatim API dumps from one debugging session, unique IDs, will never be re-read.
- Lines 145-167 — duplicates information already at lines 60-78 in compressed form.
- Lines 181-197 `[REPORT] Session 2026-04-20 outcomes` — duplicates the same information that's in `[LEARNED] link entity type` (lines 90-100) and the compressed admin-key block (60-78).
**Recommendation**: Entu should prune: keep 60-78 (admin-key facts), 79-80 (meta-IDs), 82-88 (entity-type creation quirk), 199-204 (webhook pattern, until promoted to Tess prompt). Move stable cross-session facts to auto-memory `entu_admin_api.md` (already referenced from MEMORY.md:11). Delete the verbatim dumps and one-session checkpoints.
**Rationale**: Largest single hygiene problem in the team. Reading 204 lines on every Entu session start is a real token cost.

---

### [PRUNE] #2: Tess scratchpad — 93 lines (still near limit, re-flag)

**Source**: `tess.md` (93 lines, unchanged from 2026-04-20 audit)
**Recommendation**: Tess should compress at next session: line 67-69 (struck-through resolved GOTCHA — delete), lines 79-94 (two CHECKPOINTS from 2026-03-08 — collapse to one line each since the work is shipped).
**Rationale**: Re-flagged. Will hit 100 immediately on first new entry.

---

### [PRUNE] #3: Finn scratchpad — both `[LEARNED] 12h` and `[GOTCHA] 12h` are stale (re-flag with bigger picture)

Already covered in [STALE] #1 above. Listing here so the lead has a single "scratchpads to prune" list.

---

## Scratchpad Health (snapshot)

| Agent | Lines | Health | Action |
| ----- | ----- | ------ | ------ |
| entu | **204** | **CRITICAL** — 2× over cap | Prune verbatim API dumps + 2026-04-20 duplicate REPORTs; promote webhook pattern to Tess prompt then drop |
| tess | 93 | Near limit (unchanged) | Drop resolved GOTCHA + collapse 2026-03-08 CHECKPOINTs |
| kaarel | 76 | OK | No urgent action |
| entu (post-prune target) | <100 | — | — |
| viiu | 41 | Healthy | Drop "no DOM" line 31 |
| finn | 55 | 2 stale gotchas | Re-flag from last audit — prune lines 19, 26 |
| marcus | 15 | Healthy | No action |
| tervis | 32 | Healthy | (this audit will append) |

---

## New Since Last Audit (2026-04-20 → 2026-04-27)

- **PR #46** (closes #44): Entu API URL migration to `api.entu.app/{db}/`. Marcus GREEN, shipped.
- **PR #48** (closes #47): Follow-up cleanup of dead `entuApiUrl` config + script defaults + 10+ doc updates. Marcus GREEN, shipped.
- **Entu scratchpad** doubled in size with admin-key / Juhendid investigation — stable facts likely belong in auto-memory `entu_admin_api.md` (referenced from MEMORY.md:11), not the scratchpad.
- Issue #40 ageing — 42 → 50 days unowned.
- New issues #41, #42, #43, #45 filed 2026-04-21, none yet started.
- Auto-memory MEMORY.md is up-to-date as of 2026-04-20 (lists each issue's status correctly). No staleness detected there.

## Priority Order for Lead

1. **Prune entu.md (204 lines)** — biggest token waste; Entu can do this in 5 minutes
2. **Apply re-flagged STALE fixes to finn.md** — 2-line edit, prevents misleading 12h gotcha
3. **Promote ESLint chaining + webhook test pattern** — single edit each to common-prompt.md and tess prompt
4. **Triage issue #40** — 50 days unowned, decide and act
5. **Add pruning trigger + entry-format rule to common-prompt.md** — small edits with high downstream value

---

*Audit performed by Tervis at 2026-04-27 18:29. Working directory: `/home/michelek/Documents/github/esmuseum-map-app`. Source files verified: `app/composables/useEntuAuth.ts`, `app/utils/distance.js`, `app/utils/location-sync.js`, `.config/eslint.config.js`, `.claude/teams/esmuseum/common-prompt.md`, all team prompts and scratchpads, auto-memory MEMORY.md, and `gh issue list` output.*
