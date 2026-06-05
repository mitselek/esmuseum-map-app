# Tervis Scratchpad

## [CHECKPOINT] 2026-04-27 — Fourth audit completed

Re-audit of 2026-04-20 report. 12 prior recommendations — only 1 fully applied (MEMORY.md "all closed" claim now correctly enumerates per-issue status), 1 partially (no-DOM dedup), 10 outstanding.

13 recommendations this round: 2 STALE (re-flag), 2 PROMOTE (re-flag), 3 GAP (1 escalating), 2 COMMON (re-flag), 1 CONSOLIDATE (downgrade), 3 PRUNE.

Biggest finding this round: **entu.md ballooned to 204 lines** (2× cap). Stable admin-key facts probably belong in auto-memory `entu_admin_api.md`, not the scratchpad. Verbatim REPORT dumps and old session CHECKPOINTs are pure bloat.

#40 now 50 days unowned (was 42). Lead's MAINTAIN step (lead.md:54) didn't trigger between 2026-04-20 and 2026-04-27 — likely because the 2026-04-21 session shipped PRs but didn't re-open the audit's recs. Suggested adding "read task-list-snapshot.md if present" to lead.md startup steps as [GAP] #3.

Report: `.claude/teams/esmuseum/memory/health-report.md`

## [PATTERN] 2026-04-27 — Re-audit signal

When the previous audit's recommendations are mostly NOT applied, the issue is often that the audit fired at session start but no follow-up loop checks "did lead actually action these?". Consider proposing that the lead's startup step 5 (Spawn Tervis FIRST) explicitly reads the previous health-report.md as part of its plan, not just runs a fresh audit.

## [CHECKPOINT] 2026-04-20 — Third audit completed

Audited 6 scratchpads + lead prompt + common-prompt + CLAUDE.md + MEMORY.md.
Cross-referenced against source code (useEntuAuth.ts, setup-globals.ts, distance.js, vitest.config.ts) and GitHub issues.

12 recommendations: 3 STALE, 2 PROMOTE, 2 CROSSPOLL, 2 GAP, 2 COMMON, 1 CONSOLIDATE.

Key findings:
- Previous audit's 9 flagged items ALL fixed — excellent maintenance
- MEMORY.md has new false claim (#40 is OPEN, not "all closed")
- Finn's token-expiry gotcha still lingers (describes fixed bug)
- Finn's "0% server coverage" also outdated (entu wrote 22 tests)
- Tess scratchpad at 93/100 lines — needs pruning
- ESLint optional-chaining complexity pattern deserves promotion to common-prompt
- Webhook test pattern (entu) should be in Tess's prompt
- Two legacy .js files (distance.js, location-sync.js) undocumented

Report: `.claude/teams/esmuseum/memory/health-report.md`

## [PATTERN] 2026-03-08 — Audit timing

Enne auditit peab ülejäänud tiimile shutdown tegema, et scratchpad'id oleksid värskelt salvestatud ja audit kajastaks viimast seisu. Audit peaks olema viimane tegevus enne sessiooni lõppu.

## [PATTERN] 2026-03-08 — Staleness sources

Biggest staleness sources in priority order:

1. MEMORY.md GitHub Issues — no owner, no update trigger
2. CLAUDE.md behavioral claims — updated code but not docs
3. Scratchpad gotchas — resolved issues not pruned
