# Tervis Scratchpad

## [CHECKPOINT] 2026-03-08 — First audit completed

Audited 6 scratchpads (finn, marcus, viiu, kaarel, entu, tess) + 3 supplementary finn reports.
Cross-referenced against roster prompts, common-prompt, CLAUDE.md, and source code.

18 recommendations: 3 PROMOTE, 3 CONSOLIDATE, 2 CROSSPOLL, 4 STALE, 3 GAP, 3 COMMON.

Key findings:

- `~~/` import convention noted by 3 agents independently — not in any shared doc
- MSW constraints hit 3+ agents — biggest gap in test prompts
- nuxt-icons removal made 3 scratchpad entries stale
- Token expiry fix (#38) resolved finn's gotcha
- `readonly` global stub missing — recurring issue

Report: `.claude/teams/esmuseum/memory/health-report.md`

## [CHECKPOINT] 2026-03-08 — Second audit (lead/MEMORY/common focus)

Audited lead prompt, MEMORY.md, common-prompt.md, and all scratchpads against current project state.

19 recommendations: 4 STALE, 4 PROMOTE, 3 GAP, 3 COMMON, 3 CONSOLIDATE, 2 CROSSPOLL.

Top findings:

- **MEMORY.md GitHub Issues section fully stale** — 6 issues listed OPEN are CLOSED, 2 new issues missing
- **CLAUDE.md token expiry wrong in 3 places** — still says "12h" after #38 fixed it to JWT `exp` (48h)
- **Tess `readonly` gotcha resolved** — setup-globals.ts now has it, scratchpad still warns
- **Lead prompt missing maintenance duties** — no guidance on keeping CLAUDE.md/MEMORY.md current
- **Roster model inconsistency** — finn uses "haiku" while others use full model IDs

Report: `.claude/teams/esmuseum/memory/health-report.md`

## [PATTERN] 2026-03-08 — Audit timing

Enne auditit peab ülejäänud tiimile shutdown tegema, et scratchpad'id oleksid värskelt salvestatud ja audit kajastaks viimast seisu. Audit peaks olema viimane tegevus enne sessiooni lõppu.

## [PATTERN] 2026-03-08 — Staleness sources

Biggest staleness sources in priority order:

1. MEMORY.md GitHub Issues — no owner, no update trigger
2. CLAUDE.md behavioral claims — updated code but not docs
3. Scratchpad gotchas — resolved issues not pruned
