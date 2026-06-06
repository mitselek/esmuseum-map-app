# Task list snapshot — 2026-06-06 (end of session)

No formal TaskCreate tasks this session. One issue picked and fully completed: **#41**.

## Shipped this session

### Issue #41 — Restrict VR (Vabadusristi) entity types to Eli + Mihkel — CLOSED ✅
Pure Entu admin operation (no repo code changed). Entity types `vr_aum2rk` (3,236) and `vr_kavaler` (3,116) = **6,352 instances**.

- **Phase 1:** parent folder "Vabaduse risti kavalerid" (`66b625df7efc9ac06a437bec`) + both type defs (`66b625807efc9ac06a437be3`, `66d56de42acf2af0bc794b9d`) → `_sharing: private`; Eli Pilve (`66d97072f2daf46b3145403c`) added as `_viewer`.
- **Phase 2:** deleted explicit `_sharing: public` from all 6,352 instances → each falls back to Entu default `private`. **0 errors**, checkpointed/resumable (resume actually exercised — a stdout-buffering quirk masked first process exit at 4,008 done; checkpoint finished remaining 2,344 with 0 dupes).
- **Verified:** anonymous GET on sampled instances (both types, across range) → 403; Eli + Mihkel retain access.
- **Decisions (PO):** Eli = read-only (`_viewer`), not edit (issue text said "read+edit" — intentionally scoped down). "API privileged" left as `_owner` on vr_aum2rk type def (harmless once private). Importer regression N/A (one-time/manual import).
- **GitHub:** completion comment + closed; consultant thank-you comment with `(*ESM:Lead*)` attribution.
- **Stakeholder:** Estonian-language email draft to Eli (eli.pilve@esm.ee) — sent by Mihkel.

### Cross-team consult
- Ran the Phase 2 plan past the **mvox-dev** Entu-expert team via a comment on issue #41 before executing. They verified against live Entu + OpenAPI. Key correction adopted: `_sharing` is NOT inherited via `_inheritrights`; absent `_sharing` = default `private`. Confirmed no bulk API; plain DELETE (not DELETE+POST); GET-before-DELETE for idempotency (repeat DELETE → 404).

## Knowledge persisted
- Auto-memory `entu_admin_api.md` — new "Sharing / rights model" section (the expensive, verified facts).
- Auto-memory `MEMORY.md` — #41 marked CLOSED 2026-06-06.
- `entu.md` scratchpad — pruned 120 → 65 lines; #41 recon + execution recorded.

## Open items for next session (none started — awaiting PO)
- **#45** — Restrict `vastus` (response) visibility to task creator only (p1, **security**) — highest-priority untouched ticket.
- **#40** — Workflow improvements from Insights analysis — unowned ~90 days; needs a decide/split/close call (Tervis flagged across 3 audits).
- **#42** — Juhendid folder — OPEN; prerequisite #43 (link type) exists in Entu. entu notes it's fully scriptable when PO is ready. (NOTE: 2026-04-27 Tervis audit suggested #42/#43 may already be CLOSED — verify actual GitHub state before acting.)
- **#41** — DONE this session.

## Operational reminders (from entu's closing notes)
- `.env.admin` `ENTU_ADMIN_KEY` is an opaque token with no visible expiry, but the JWT it exchanges for (`GET /auth`) expires ~12h after exchange. Re-exchange at session start; don't cache JWT across sessions.
- `POST /entity/{id}` property overwrite needs `"type"` field alongside `"_id"`, else "Property type not set".

## Team health (Tervis 2026-06-05/06 audit)
Best of 5 audits — 11/13 prior recs applied (commit `6ce1dd6`). Minor remaining: marcus.md stale "haiku" line, tess prompt #49 middleware-mock promote, tess.md prune. None blocking.
