# Tervis Scratchpad

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
