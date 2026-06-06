# Entu Agent Scratchpad

> Pruned by Lead 2026-04-27 per Tervis health audit. Stable cross-session facts (admin key scope, type IDs, person IDs, API format gotchas, formula syntax) live in auto-memory `entu_admin_api.md`. Pre-prune content available in git history.

## [LEARNED] Admin key (ENTU_ADMIN_KEY) scope and capabilities (2026-04-20, revised 2026-04-21)

- Key lives in `.env.admin` as `ENTU_ADMIN_KEY` (NOT `NUXT_ENTU_ADMIN_KEY` — Eli's naming).
- Belongs to **Mihkel Putrinš** (person entity `66b6245c7efc9ac06a437b97`, account `esmuuseum`).
- JWT: has `accounts.esmuuseum` user claim — authenticated, NOT anonymous.
- Same IP restriction as manager key: `aud: 82.131.122.238`, ~48h expiry.
- **Write capabilities (all confirmed by test)**:
  - Create entities: YES — but `_type` must use `reference` (ID), NOT `string`.
  - `folder` type reference ID: `66b624597efc9ac06a4378a6`.
  - Set `_sharing` (domain/public/private): YES.
  - Add `_viewer`/`_expander`/`_editor` references: YES.
  - Delete entities: YES (`DELETE /api/{account}/entity/{id}` → `{"deleted":true}`).
  - Delete individual properties: YES — `DELETE /api/{account}/property/{propId}` → `{"deleted": true}` (confirmed; removes the specific property value).
- **Important**: omitting `_id` in POST = ADD new property; include `_id` to OVERWRITE existing.
- Mihkel is `_owner` on all VR entities (vr_kavaler, vr_aum2rk) → can modify their rights.
- **Issue #42 (Juhendid folder)**: FULLY SCRIPTABLE — create folder, set `_sharing: "domain"`.
- Entity type IDs (for `_type` reference): folder=66b624597efc9ac06a4378a6, grupp=686914521749f351b9c82f35, ulesanne=686917231749f351b9c82f4c, vastus=686917401749f351b9c82f58, asukoht=687d27c9259fc48ba59cf726, kaart=687d27c8259fc48ba59cf71a, **link=69e6c1c690c8df7a1cc7aa8b** (recreated 2026-04-21 with ADMIN_KEY/Mihkel).
- **entity entity type** (meta-type for defining new types): `66b624597efc9ac06a437840`. The ID `66b6245c7efc9ac06a437920` from some notes returns 404 (wrong/inaccessible).
- **link type property defs (2026-04-21)**: name prop=`69e6c3da90c8df7a1cc7aa96` (string, ordinal 1, search:true), url prop=`69e6c3da90c8df7a1cc7aaa2` (url, ordinal 2). Both Mihkel-owned, parent=link type.
- **link instances in Juhendid (2026-04-21)**: "Loo uus grupp ja kutsu õpilased"=`69e6c4f990c8df7a1cc7aaad`, "KML-failide import Entusse"=`69e6c4f990c8df7a1cc7aab6`. Both `_parent: 69e64b1f2cd89347a7f382e6` (Juhendid folder). URL value stored as `{"type":"url","string":"https://..."}` — `string` field works, no `url:` field needed.
- **[GOTCHA] MANAGER_KEY vs ADMIN_KEY (2026-04-21)**: Always use `ENTU_ADMIN_KEY` from `.env.admin` for entity creation that should be Mihkel-owned. `NUXT_ENTU_MANAGER_KEY` from `.env` authenticates as `Kaardirakenduse Automaat` — creates Automaat-owned entities silently. Earlier note "MANAGER_KEY is read-only/403 on write" was wrong — it CAN write, just as the wrong user.
- Property type meta-ID (for defining properties of a type): `66b6245a7efc9ac06a437a42`.
- Database root entity (account parent): `66b6245c7efc9ac06a437ba0`.

## [LEARNED] 2026-06-06 — Entu _sharing cascade behavior (empirically verified)

**Key finding**: A child entity's OWN explicit `_sharing: public` overrides parent `_sharing: private`. Parent restriction does NOT cascade through to a child that carries its own `_sharing` value. Deleting the child's `_sharing` makes it resolve to Entu default `private` (NOT "inherited via `_inheritrights`" — `_sharing` is not part of the inheritrights chain).

| Config | Anonymous GET result |
|---|---|
| parent=public, child=public | 200 visible |
| parent=**private**, child=public (own _sharing) | 200 **still visible** |
| parent=private, child=**private** (own _sharing) | 403 hidden |
| parent=private, child=**_sharing deleted** | 403 hidden |

**Anonymous query method**: `GET https://api.entu.app/esmuuseum/entity/{id}` with no Authorization header → 200 or 403 "No accessible properties".

**Property update format gotcha (2026-06-06)**: Overwriting existing property via `POST /entity/{id}` MUST include `type` field: `[{"_id": "<prop_id>", "type": "<prop_name>", "string": "<value>"}]`. Omitting `type` → "Property type not set" error.

**Entity creation format**: `POST /entity` body is array of `{type, string|reference|boolean}` objects. `type` = property name (e.g. `"_type"`, `"name"`, `"_sharing"`).

**limit=1000 pagination**: tested and confirmed safe on this account (mvox-dev had only tested to 500).

## [CHECKPOINT] 2026-06-06 — Issue #41 CLOSED (fully complete)

**Issue #41 (VR restriction) DONE** — all 6,352 vr_kavaler + vr_aum2rk instances restricted. Anonymous GET → 403. Eli `_viewer`, Mihkel `_owner`. 0 errors.

- Parent folder `66b625df7efc9ac06a437bec` → `_sharing: private` (prop `6a23e1196aef2ebcaf48b5d4`)
- vr_aum2rk type `66b625807efc9ac06a437be3` → `_sharing: private`, Eli `_viewer` (prop `6a23e1346aef2ebcaf48b5d7`)
- vr_kavaler type `66d56de42acf2af0bc794b9d` → `_sharing: private`, Eli `_viewer` (prop `6a23e1356aef2ebcaf48b5d8`)
- Phase 2: `DELETE /property/{_sharing}` on all 6,352 instances — checkpoint at `/tmp/vr-phase2-done.txt`
- "API privileged" (`66d4b8c62acf2af0bc794ac7`) left as `_owner` on vr_aum2rk type (PO decision)
- Eli person ID: `66d97072f2daf46b3145403c`

## [LEARNED] Entu entity type creation quirk (2026-04-20)

- Creating a type definition entity WITH `_parent: <db-root>` → `400 "User not in parent _owner, _editor nor _expander property"` even though Mihkel's `_parent_expander` includes the DB root — check is on DIRECT rights, not inherited.
- Creating WITHOUT `_parent` → succeeds; Entu places entity at root level; functionally equivalent for type usage.
- Subsequent POST to add `_parent` to the parentless entity → same 400 error.
- `url` IS a valid Entu property type (accepted by API, even though unused in account before this).
- Property types in this account: string, text, number, boolean, reference, file, date, datetime, url.
