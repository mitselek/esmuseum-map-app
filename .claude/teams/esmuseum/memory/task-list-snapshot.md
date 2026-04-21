# Task list snapshot — 2026-04-21 (end of session)

No open tasks at session close. Two tasks tracked during the session:
- **#1** — Audit Entu API access scope (completed by Entu; findings drove every downstream action).
- **#2** — Define `link` entity type in Entu (GitHub-tracked as #43; completed via UI-assisted third attempt).

## Session highlights

### Shipped to main
- **PR #46** (commit `372f35a`) — closes #44 — Entu API URL migration: `entu.app/api/{db}/` → `api.entu.app/{db}/`. Verified with live curl (old shape returns 404).
- **PR #48** (commit `7d6f2cf`) — closes #47 — follow-up cleanup: dead `entuApiUrl` config key, `scripts/fetch-entu-model.js` default, and 10+ docs swept to match. Marcus GREEN.

### Entu admin operations (direct, no code)
- `link` entity type recreated cleanly on third try (id `69e6c1c690c8df7a1cc7aa8b`). First two attempts deleted — first orphaned without `_parent`, second owned by `Automaat` due to wrong-key mix-up.
- `link` schema: `name` string + `url` url. No title, no formula (simplified from original).
- Juhendid folder populated with 2 Scribe-guide link instances.
- Kasutusjuhendid menu unchanged from earlier — its query now returns the new links.

### Issues filed today (all still OPEN unless noted)
- #41 — Restrict VR (Vabadusristi) entity types to Eli + Mihkel (p3, deferred)
- #42 — Juhendid folder with logged-in visibility (p2, folder created; Eli-grant follow-up still outstanding)
- #43 — Define `link` entity type (p2, completed in production; issue can be closed)
- #44 — Liitumislink API address → CLOSED via PR #46
- #45 — Restrict `vastus` visibility to task creator (p1, security)
- #47 — Follow-up cleanup after #44 → CLOSED via PR #48

### Remaining watch items
- **#40** — Workflow improvements from Insights analysis (open >42 days, unowned — Tervis's audit flagged for triage).
- **Marcus's DEFERRED** at shutdown: `docs/api-requests/entity-types-creation.http:4` — was actually fixed in PR #48's last commit, his note is stale.
- **.gitignore** — Eli reverted `.env*` back to literal `.env`. Intentional, left uncommitted.
- **.env.admin** — Mihkel's admin key, gitignored by `.env` pattern (since the `*` was reverted, it currently shows as untracked; harmless because it's not added).

### Key learnings persisted to scratchpads + auto-memory
- Two Entu keys exist and behave differently — `ENTU_ADMIN_KEY` = Mihkel-owned operations; `NUXT_ENTU_MANAGER_KEY` = Automaat service account. Don't confuse them.
- `_parent: DB_ROOT` is API-blocked for all users. Only fix is Entu UI. Historic entities got there via superadmin path.
- Formula property syntax: `'literal' bare_identifier` with space-concat; `markdown: true` makes output clickable.
- Property entry `_id` ≠ referenced person ID — each property record has its own generated ID.
- 2026-04-21 retest: MANAGER_KEY can write (earlier "read-only" audit was wrong or outdated).
