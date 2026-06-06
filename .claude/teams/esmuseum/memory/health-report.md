# Team Health Report — 2026-06-05

## Summary

- **5 recommendations total**
- **2 STALE, 1 GAP, 1 PROMOTE, 1 HOUSEKEEPING**
- Of last audit's (2026-04-27) 13 recommendations: **11 fully applied, 0 partial, 2 by-design-only (issue triage)**
- **Major improvement vs. prior audits.** Commit `6ce1dd6` ("apply Tervis 2026-04-27 health audit recommendations") plus the agents' own pruning genuinely resolved the long-standing backlog. The entu.md 204-line bloat is fixed (now 36 lines). All scratchpads are under the 100-line cap.

---

## Previous Audit Follow-Up (from 2026-04-27)

Commit `6ce1dd6` (2026-06-05, "chore: apply Tervis 2026-04-27 health audit recommendations") + `e0cec22` (session-close scratchpad updates) applied the cross-cutting edits. Agents also pruned their own scratchpads. Verified each:

| # (2026-04-27) | Recommendation | Status |
|---|----------------|--------|
| STALE 1 | Finn 12h token gotcha | **FIXED** — finn.md:5 now reads `Token validity is parsed from JWT exp claim (typically 48h)`; the `[GOTCHA] 12h` line is gone. |
| STALE 2 | Finn "0% real server coverage" | **FIXED** — finn.md:25 now reads `server/ baseline as of 2026-04-20: 22 webhook handler tests + helpers ... Server coverage is no longer 0%`. |
| PROMOTE 1 | ESLint optional chaining → common-prompt | **FIXED** — common-prompt.md now has a `## Lint Notes` section (complexity threshold 15, `?.` counts as a branch, getEntityString helper). |
| PROMOTE 2 | Webhook test pattern → Tess prompt | **FIXED** — `prompts/tess.md` now has `## Server/Webhook Test Patterns`; the source PATTERN was dropped from entu.md per commit message edit #7. |
| GAP 1 | Legacy .js files | **FIXED** — CLAUDE.md "Architecture Overview" now has the `**Known-legacy JS**:` one-liner. Both files still exist on disk (expected; doc note was the ask). |
| GAP 2 | Issue #40 unowned | **NOT TRIAGED** — still OPEN, no assignee, now **89 days** old (opened 2026-03-08). See [GAP] #1 below. |
| GAP 3 | task-list-snapshot + new issues not in prompts | **FIXED** — `prompts/lead.md` step 5 now reads `Read .claude/teams/esmuseum/memory/task-list-snapshot.md if present ... and ... health-report.md`. Steps renumbered correctly (Tervis-first is now step 6). |
| COMMON 1 | Scratchpad pruning trigger | **FIXED** — common-prompt.md Shutdown Protocol now has `### Pruning trigger` (wc -l at session start, >70 / >100 line rules). |
| COMMON 2 | Scratchpad entry header format | **FIXED** — common-prompt.md now states `**Entry header format**: ## [TAG] YYYY-MM-DD — short title`. |
| CONSOLIDATE 1 | viiu "no DOM" duplicate line | **FIXED** — viiu.md no longer contains a "no DOM" entry; common-prompt.md:87 is now the single source. |
| PRUNE 1 | entu.md 204 lines | **FIXED** — entu.md is **36 lines**, with a header pointer to auto-memory `entu_admin_api.md` and git history. Verbatim REPORT dumps and one-session checkpoints removed. |
| PRUNE 2 | tess.md 93 lines | **PARTIAL** — tess.md is **98 lines** (grew, not shrank). New `[WIP]`/`[GOTCHA]` issue-#49 entries were added (2026-04-27) without collapsing the old 2026-03-08 CHECKPOINTs. Now 2 lines from the cap. See [HOUSEKEEPING] #1. |
| PRUNE 3 | finn 12h (dup of STALE 1) | **FIXED** — see STALE 1. |

**Net: 11/13 fully applied, 1 partial (tess pruning), 1 not actioned (issue #40 triage — a product decision, not a doc edit).** This is the best follow-through rate across all five audits to date.

Also closed since last audit: **#42** (Juhendid folder) and **#43** (link entity type) are both now CLOSED. The work was done in production 2026-04-21; the issues were finally closed. task-list-snapshot.md:21-22 still describes them as open/"can be closed" — minor staleness, covered in [HOUSEKEEPING] #1.

---

## Recommendations

### [STALE] #1: marcus.md — tervis "haiku model" claim

**Source**: `marcus.md:15` `[LEARNED] Designed "tervis" health checker agent ... write-restricted to report file only, haiku model.`
**Verified**: `roster.json` sets tervis `"model": "claude-opus-4-6"`. Tervis is not (or no longer) a haiku agent.
**Recommendation**: Marcus edit line 15 — drop `haiku model` (or change to "opus model"). The design rationale (6-category taxonomy, write-restriction) is still accurate and worth keeping.
**Rationale**: A model-tier claim that is wrong could mislead anyone reasoning about tervis's cost/capability. Low urgency, single-word fix.

---

### [STALE] #2: task-list-snapshot.md — #42/#43 described as open

**Source**: `task-list-snapshot.md:21-22` (`#42 ... folder created; Eli-grant follow-up still outstanding`, `#43 ... issue can be closed`) and line 28 (`#40 ... open >42 days`).
**Verified**: #42 and #43 are both CLOSED. #40 is now 89 days open, not 42.
**Recommendation**: This is a dated session snapshot (2026-04-21), so editing history is optional. Better: when the lead next exports a snapshot at session close, it overwrites this file with current state. No agent action needed beyond awareness — flagging so the lead doesn't re-read stale "outstanding" items as live commitments. The lead.md step-5 read of this file should reconcile against `gh issue list`.
**Rationale**: The file is a point-in-time snapshot; the open-issue claims in it are now stale. The #42 Eli-grant follow-up is the one item to confirm: verify whether Eli's `_expander` grant on Juhendid was completed before treating #42 as fully done.

---

### [GAP] #1: Issue #40 still unowned — now 89 days (re-flag, escalating)

**Verified**: `gh issue list` shows #40 ("Workflow improvements from Claude Code Insights analysis", `enhancement`) OPEN since 2026-03-08, no assignee, no priority label. This is the only one of the four prior-flagged OPEN issues that has neither moved nor been triaged.
**Recommendation**: Lead must make a call this session — (a) assign + schedule, (b) close as won't-fix/superseded, or (c) split into labelled sub-issues. Three audits have now flagged it; the lead.md step-5 change should surface it but nothing forces a *decision*.
**Rationale**: 89 days unowned with a vague title is dead weight. The mechanism to *see* it now exists (lead.md step 5); what's missing is the will to *act*. Recommend closing unless someone owns it — re-opening later is cheap.

---

### [PROMOTE] #1: Tess #49 middleware-mock pattern → Tess prompt

**Source**: `tess.md:94-98` `[GOTCHA] 2026-04-27 — Middleware mock pattern for Nuxt auto-imports` (stub `defineNuxtRouteMiddleware` as identity fn; `vi.stubGlobal('navigateTo')`; `vi.resetModules()` + re-stub in beforeEach).
**Verified**: `prompts/tess.md` has sections for composable singletons and server/webhook tests, but no middleware-testing guidance. This GOTCHA cost real discovery time and is stable (middleware testing recurs).
**Recommendation**: Add to `prompts/tess.md` under a new bullet in an existing or new "## Middleware Test Patterns" subsection:
```markdown
## Middleware Test Patterns
- Stub `defineNuxtRouteMiddleware` as an identity fn before import so the default export is the raw handler
- `vi.mock` composables/utils; `vi.stubGlobal('navigateTo', ...)` for navigation
- `vi.resetModules()` + re-stub in `beforeEach` (resetModules clears the vi.mock cache)
```
**Rationale**: Next middleware test sprint rediscovers this without the prompt. Low cost, and it lets tess.md drop the GOTCHA during pruning (helping [HOUSEKEEPING] #1).

---

### [HOUSEKEEPING] #1: tess.md at 98 lines — prune before next entry

**Source**: `tess.md` = 98 lines (2 from the 100 cap). The new common-prompt "Pruning trigger" (>70 lines) already applies.
**Recommendation**: Tess prune at next session start: collapse the two 2026-03-08 CHECKPOINTs (lines 45-49, 75-77) to one line each (work shipped, captured in git/issues); once [PROMOTE] #1 lands in the prompt, drop the #49 middleware GOTCHA (94-98). The #49 `[WIP]` (79-92) can collapse to one line if #49 shipped — lead should confirm #49's status (it is not in the open-issue list, suggesting it closed).
**Rationale**: The only scratchpad over the soft 70-line trigger. Will breach 100 on the next entry. Everything else is healthy.

---

## Scratchpad Health (snapshot)

| Agent  | Lines | Health | Action |
| ------ | ----- | ------ | ------ |
| entu   | 36  | Excellent — was 204, now lean with auto-memory pointer | None |
| finn   | 54  | Healthy — both stale gotchas fixed | None |
| kaarel | 76  | OK | None urgent |
| marcus | 15  | Healthy | Fix tervis "haiku" claim ([STALE] #1) |
| tess   | 98  | Near cap | Prune ([HOUSEKEEPING] #1) |
| viiu   | 39  | Healthy — "no DOM" dup removed | None |
| tervis | 48  | Healthy | (this audit appends) |

(health-report.md = 199 lines and task-list-snapshot.md = 38 are output/snapshot artifacts, not agent scratchpads — no cap.)

---

## New Since Last Audit (2026-04-27 → 2026-06-05)

- **Commit `6ce1dd6`** applied 7 cross-cutting doc edits from the 2026-04-27 audit (common-prompt Lint Notes / Pruning trigger / header format; tess webhook patterns; lead.md snapshot read; CLAUDE.md legacy-JS note; entu.md webhook-pattern drop). Verified all 7 landed.
- **Commit `e0cec22`** "session-close scratchpad updates" — agents pruned their own scratchpads (finn stale fixes, entu 204→36, viiu no-DOM removal, tess #49 WIP added).
- **PRs #50, #51** shipped (mobile keyboard fix, profile-page polish) per git log `5e6a5d5`, `61565c8`.
- **Issues #42, #43 CLOSED**; **#52** filed 2026-04-27 (uk/lv locale sentence-case, p3 follow-up to #51).
- **Open issues now**: #40 (enhancement, 89d, untriaged), #41 (p3), #45 (p1 security), #52 (p3). #45 (restrict vastus visibility) remains the highest-priority untouched item.
- Auto-memory MEMORY.md still lists #42/#43 as OPEN (lines under "GitHub Issues") — minor drift; not a team-scratchpad so out of strict audit scope, but worth a one-line fix when convenient.

## Priority Order for Lead

1. **Triage issue #40** (89 days, third flag) — assign, split, or close. Decision, not a doc edit.
2. **Confirm #45 (p1 security) ownership** — highest-priority open ticket, untouched since 2026-04-20.
3. **tess.md prune + [PROMOTE] #1** — single combined pass keeps tess under cap and captures the middleware pattern.
4. **marcus.md tervis-model fix** ([STALE] #1) — one word.
5. **Verify #42 Eli-grant follow-up** actually completed before treating Juhendid as fully done.

---

*Audit performed by Tervis at 2026-06-05. Working directory: `/home/michelek/Documents/github/esmuseum-map-app`. Verified: commit `6ce1dd6`/`e0cec22` diffs, all 7 scratchpads, `prompts/lead.md`/`tess.md`, `common-prompt.md`, `CLAUDE.md`, `roster.json`, `app/utils/distance.js` + `location-sync.js` (exist), `server/` (16 files), and `gh issue list` / `gh issue view 42,43`.*
