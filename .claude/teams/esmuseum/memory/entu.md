# Entu Agent Scratchpad

## Session 2026-03-08

### [LEARNED] normalizeLocation wiring

- `normalizeLocation()` in `app/utils/location-transform.ts` converts Entu array format to flat `NormalizedLocation`
- When changing `loadMapLocations()` return type from `LocationEntity[]` to `NormalizedLocation[]`, downstream components break if they access raw Entu fields (`nimi`, `properties`, `distanceText`, `id`)
- `sortLocationsByDistance` (untyped JS in `app/utils/distance.js`) adds `distance` and `distanceText` at runtime — `NormalizedLocation` has `distance?` but not `distanceText`
- Components fixed: LocationPicker, InteractiveMap, TaskResponseForm

### [DECISION] Server webhook null checks

- `getEntityDetails()` returns `EntuEntity | null` — both webhook handlers now throw 404 if entity is null
- `searchEntuEntities()` query params: filter out `undefined` values before `encodeURIComponent()`

### [PATTERN] Nuxt config structure

- `typescript.typeCheck` in nuxt.config only accepts `boolean | "build"`, not objects with tsConfig
- `typescript.tsConfig` merges into `.nuxt/tsconfig.json` — useful for adding exclude patterns
- But exclude doesn't help when files are pulled in via import chains from auto-generated `.nuxt/components.d.ts`

### [LEARNED] EntityData type is array, not object (2026-03-08)

- `createEntity` and `updateEntity` receive `EntuPropertyUpdate[]` (array of `{ type, string?, number?, boolean?, reference? }`)
- NOT an object like `{ _type: 'vastus', vastus: 'answer' }` — that was the old incorrect test pattern
- `EntuEntity` index signature must stay `any` — narrower types break `as EntuTask` casts downstream

### [LEARNED] EntuEntity cannot be narrowed (2026-03-08)

- Tried `[key: string]: EntuPropertyValue[] | string | undefined` on `EntuEntity`
- Breaks: `as EntuTask` casts fail because TypeScript needs overlap between source and target
- `EntuTask` has required fields (`name`, `_type`) that don't exist on `EntuEntity` with the narrow signature
- Must keep `[key: string]: any` with eslint-disable — it's a genuine dynamic schema boundary

### [CHECKPOINT] Completed this session (2026-03-08)

- **#32**: console → useClientLogger migration (13 files, 23 calls)
- **#33**: Dead code cleanup (removed `findMatchingLocation`, `getLocationCoordinates` from useTaskDetail)
- **#34**: Import path standardization (9 files, `../` → `~/`/`~~/`)
- **#36**: Entu type safety (replaced 8 `any` signatures with concrete types)
- **#38**: Token expiry fix — parse JWT `exp` claim instead of hardcoded 12h
- **Test helpers**: created `tests/helpers/` (h3-event-mock, entu-api-mock, nuxt-runtime-mock)
- **P4 webhook tests**: 22 tests for student-added + task-assigned webhooks
- **Dependency cleanup**: pinned versions, `.npmrc`, moved orphaned types to devDeps
- **Lint fixes**: 16 test file lint errors fixed
- **#39**: Complexity refactoring — 5 server files + 1 bonus (7 warnings eliminated, lint errors 19→8)

### [LEARNED] ESLint counts optional chaining as complexity (2026-03-09)

- `?.` (optional chaining) counts as a cyclomatic complexity branch in ESLint's `complexity` rule
- 5 lines of `data.entity?.email?.[0]?.string || ''` = 15 optional chains + 5 fallbacks = 20 branches alone
- Fix: extract a helper like `getEntityString(prop)` that takes the array and returns `prop?.[0]?.string ?? ''`

## Session 2026-04-20

### [LEARNED] Admin key (ENTU_ADMIN_KEY) scope and capabilities (2026-04-20)

- Key lives in `.env.admin` as `ENTU_ADMIN_KEY` (NOT `NUXT_ENTU_ADMIN_KEY` — Eli's naming)
- Belongs to **Mihkel Putrinš** (person entity `66b6245c7efc9ac06a437b97`, account `esmuuseum`)
- JWT: has `accounts.esmuuseum` user claim — authenticated, NOT anonymous
- Same IP restriction as manager key: `aud: 82.131.122.238`, ~48h expiry
- **Write capabilities (all confirmed by test)**:
  - Create entities: YES — but `_type` must use `reference` (ID), NOT `string`
  - `folder` type reference ID: `66b624597efc9ac06a4378a6`
  - Set `_sharing` (domain/public/private): YES
  - Add `_viewer`/`_expander`/`_editor` references: YES
  - Delete entities: YES (`DELETE /api/{account}/entity/{id}` → `{"deleted":true}`)
  - Delete individual properties: YES — `DELETE /api/{account}/property/{propId}` → `{"deleted": true}` (confirmed working, removes the specific property value)
- **Important**: omitting `_id` in POST = ADD new property; include `_id` to OVERWRITE existing
- Mihkel is `_owner` on all VR entities (vr_kavaler, vr_aum2rk) → can modify their rights
- **Issue #42 (Juhendid folder)**: FULLY SCRIPTABLE — create folder, set `_sharing: "domain"`
- **Issue #41 (VR restriction)**: FULLY SCRIPTABLE — Mihkel is owner, can change `_sharing` + add `_viewer`
- Entity type IDs (for `_type` reference): folder=66b624597efc9ac06a4378a6, grupp=686914521749f351b9c82f35, ulesanne=686917231749f351b9c82f4c, vastus=686917401749f351b9c82f58, asukoht=687d27c9259fc48ba59cf726, kaart=687d27c8259fc48ba59cf71a, **link=69e6c1c690c8df7a1cc7aa8b** (recreated 2026-04-21 with ADMIN_KEY/Mihkel; all previous link types deleted)
- **entity entity type** (meta-type for defining new types): `66b624597efc9ac06a437840` — use this as `_type` reference when creating new entity type definitions. The ID `66b6245c7efc9ac06a437920` that appears in some notes returns 404 (wrong/inaccessible).
- **link type property defs (2026-04-21)**: name prop=`69e6c3da90c8df7a1cc7aa96` (string, ordinal 1, search:true), url prop=`69e6c3da90c8df7a1cc7aaa2` (url, ordinal 2). Both Mihkel-owned, parent=link type.
- **link instances in Juhendid (2026-04-21)**: "Loo uus grupp ja kutsu õpilased"=`69e6c4f990c8df7a1cc7aaad`, "KML-failide import Entusse"=`69e6c4f990c8df7a1cc7aab6`. Both `_parent: 69e64b1f2cd89347a7f382e6` (Juhendid folder). URL value stored as `{"type":"url","string":"https://..."}` — `string` field works, no `url:` field needed.
- **[GOTCHA] MANAGER_KEY vs ADMIN_KEY (2026-04-21)**: Always use `ENTU_ADMIN_KEY` from `.env.admin` for entity creation that should be Mihkel-owned. `NUXT_ENTU_MANAGER_KEY` from `.env` authenticates as Kaardirakenduse Automaat — creates Automaat-owned entities silently. Earlier scratchpad note "MANAGER_KEY is read-only/403 on write" was wrong — it CAN write, just as the wrong user.
- Property type meta-ID (for defining properties of a type): `66b6245a7efc9ac06a437a42`
- Database root entity (account parent): `66b6245c7efc9ac06a437ba0`

### [LEARNED] Entu entity type creation quirk (2026-04-20)

- Creating a type definition entity WITH `_parent: <db-root>` → `400 "User not in parent _owner, _editor nor _expander property"` even though Mihkel's `_parent_expander` includes the DB root — check is on DIRECT rights, not inherited
- Creating WITHOUT `_parent` → succeeds; Entu places entity at root level; functionally equivalent for type usage
- Subsequent POST to add `_parent` to the parentless entity → same 400 error
- `url` IS a valid Entu property type (accepted by API, even though unused in account before this)
- Property types in this account: string, text, number, boolean, reference, file, date, datetime, url

### [LEARNED] link entity type (2026-04-20)

- `link` type entity ID: `69e64a3c2cd89347a7f382af`
- `title` property def ID: `69e64a592cd89347a7f382bb` (type: string, ordinal 1, search: true)
- `url` property def ID: `69e64a592cd89347a7f382c8` (type: url, ordinal 2, search: false)
- Tested: link entity created under a folder, title + url both store correctly, `_type: link` confirmed
- Juhendid folder _id: `69e64b1f2cd89347a7f382e6` (_sharing: domain, no _parent — root level)
- Link 1 "Loo uus grupp ja kutsu õpilased" _id: `69e64b332cd89347a7f382ed`
- Link 2 "KML-failide import Entusse" _id: `69e64b332cd89347a7f382f6`
- Eli Pilve person entity: `66d97072f2daf46b3145403c` (eli.pilve@esm.ee) — needed for _expander grant on Juhendid
- Kasutusjuhendid menu _id: `69e64cae2cd89347a7f38300` (group=Kaardirakendus, query filters link+parent=Juhendid)

### [LEARNED] NUXT_ENTU_MANAGER_KEY scope (2026-04-20, revised 2026-04-21)

- Active server key is `NUXT_ENTU_MANAGER_KEY` in `.env` — NOT `NUXT_ENTU_KEY`
- JWT audience is IP-restricted to `82.131.122.238` (production server IP)
- Authenticates as **`Kaardirakenduse Automaat`** (`68e645ab655fbc0f5c1969d1`) — a service account person entity, NOT Mihkel
- Earlier 2026-04-20 note said "read-only, 403 on write" — that was wrong or outdated. On 2026-04-21, MANAGER_KEY successfully created an entity type AND added `_viewer`. Scope may have evolved or the earlier write test hit an unrelated failure.
- **[GOTCHA]** Do NOT use MANAGER_KEY for admin work — it creates entities owned by Automaat, not Mihkel. Use `ENTU_ADMIN_KEY` from `.env.admin` for all entity creation that should be Mihkel-owned.
- VR entities are `_sharing: "public"` so the key reads them as a public reader

### [GOTCHA] ENTU_ADMIN_KEY auto-assigns Mihkel as `_owner` on creation (2026-04-20)

- Entities created via ENTU_ADMIN_KEY get explicit `_owner: Mihkel` property automatically
- Historic Entu entities (pre-dating the key) have NO explicit `_owner` property — they rely on account-level inheritance; Entu UI shows Mihkel because he's account admin, not via property
- New entities (created with key): API returns full `_owner/editor/expander/viewer` derived from one `_owner` property record
- Historic entities: API returns only `_sharing`, no `_owner` in response
- **Do NOT need to manually add `_owner` on creation** — the key handles it
- Eli's UI "not owner" report (2026-04-20) was a false alarm: all 8 new entities confirmed `_owner=66b6245c7efc9ac06a437b97` via API

### [LEARNED] link `name` formula property (2026-04-20)

- Property def `_id`: `69e64de22cd89347a7f3830b`
- `_parent: 69e64a3c2cd89347a7f382af` (link type), `_type: property`
- `formula: "'[' title '](' url ')'"` — space-separated CONCAT with single-quoted literals
- `markdown: true` (`_id: 69e6501e2cd89347a7f3831c`) added separately — renders output as clickable markdown
- Both existing links verified computing correctly after entity touch
- Formula reference model: `person.name` = `forename ' ' surname`

### [REPORT] Raw ownership dump (2026-04-20)

All new entities — `_owner` verbatim (reference `66b6245c7efc9ac06a437b97` = Mihkel Putrinš, property_type `_owner`):
- link-type `69e64a3c2cd89347a7f382af`: `_owner._id=69e64a3c2cd89347a7f382b4` ✓
- prop-title `69e64a592cd89347a7f382bb`: `_owner._id=69e64a592cd89347a7f382c6` ✓
- prop-url `69e64a592cd89347a7f382c8`: `_owner._id=69e64a592cd89347a7f382d3` ✓
- prop-name-formula `69e64de22cd89347a7f3830b`: `_owner._id=69e64de22cd89347a7f38317` ✓
- juhendid-folder `69e64b1f2cd89347a7f382e6`: `_owner._id=69e64b1f2cd89347a7f382eb` ✓
- link-1 `69e64b332cd89347a7f382ed`: `_owner._id=69e64b332cd89347a7f382f4` ✓
- link-2 `69e64b332cd89347a7f382f6`: `_owner._id=69e64b332cd89347a7f382fd` ✓
- menu `69e64cae2cd89347a7f38300`: `_owner._id=69e64caf2cd89347a7f38309` ✓

Historic control (`66b6245a7efc9ac06a437920`): `_owner` KEY_MISSING — no explicit owner property.

No `inherited` flag in any entry. Behavioral test (add `_viewer: Eli` on link type) → **succeeded** (`_id: 69e654242cd89347a7f38320`, then deleted). Mihkel is confirmed effective owner via direct `_owner` property.

### [REPORT] Property diff: historic vs new link type (2026-04-20)

**Historic `66b6245a7efc9ac06a437920` keys:** `_id`, `_parent`→DB_ROOT, `_sharing:domain`, `_type:entity`, `add_from`×2, `default_parent`, `label`×2, `label_plural`×2, `name`, `plugin`×3
- NO `_owner`, `_editor`, `_expander`, `_viewer`, `_inheritrights`, `_created`

**New link type `69e64a3c2cd89347a7f382af` keys:** `_id`, `_sharing:domain`, `_type:entity`, `_owner`×2 (Mihkel+Eli), `_editor`×2 (derived+direct), `_expander`×2 (derived), `_viewer`×2 (derived), `_inheritrights:true`, `_created`, `_reference`, `add_from`, `label`×2, `label_plural`×2, `name`
- Missing vs historic: `_parent`, `plugin`, `default_parent`

**Key finding:** Historic rights come from `_parent→DB_ROOT` cascade (no explicit rights). New entity rights are explicit but `_editor`/`_expander`/`_viewer` initially showed `property_type: "_owner"` (derived), NOT `property_type: "_editor"` (direct). Added direct `_editor: Mihkel` (`_id: 69e655df2cd89347a7f38324`) — now shows `property_type: "_editor"`. Waiting for Eli to confirm if UI edit now works.

**[REPORT] _editor + _expander verbatim on link type `69e64a3c2cd89347a7f382af`:**

`_editor`:
- `{_id: "69e655df2cd89347a7f38324", reference: "66b6245c7efc9ac06a437b97", property_type: "_editor", string: "Mihkel Putrinš", entity_type: "person"}` ← DIRECT
- `{_id: "69e655062cd89347a7f38323", reference: "66d97072f2daf46b3145403c", property_type: "_owner", string: "Eli Pilve", entity_type: "person"}` ← derived from _owner

`_expander`:
- `{_id: "69e6560f2cd89347a7f38325", reference: "66b6245c7efc9ac06a437b97", property_type: "_expander", string: "Mihkel Putrinš", entity_type: "person"}` ← DIRECT
- `{_id: "69e655062cd89347a7f38323", reference: "66d97072f2daf46b3145403c", property_type: "_owner", string: "Eli Pilve", entity_type: "person"}` ← derived from _owner

Historic `66b6245a7efc9ac06a437920`: `_editor` KEY_MISSING, `_expander` KEY_MISSING — all rights inherited via `_parent → DB_ROOT`.

Both Mihkel entries: `reference: "66b6245c7efc9ac06a437b97"` (Mihkel's person ID). Entry IDs differ: `_editor._id=69e655df2cd89347a7f38324`, `_expander._id=69e6560f2cd89347a7f38325`.

**[GOTCHA] Derived vs direct rights display:** When `_editor` shows `property_type: "_owner"`, that means the edit right is derived from `_owner` status. Adding explicit `_editor` creates a separate property with `property_type: "_editor"`. Entu deduplicates — only one entry per person in each computed slot.

### [GOTCHA] `_parent: DB_ROOT` blocked by API for all users (2026-04-20)

- DB_ROOT (`66b6245c7efc9ac06a437ba0`) has NO explicit `_owner`/`_editor`/`_expander` properties
- Entu API check: "User not in parent _owner, _editor nor _expander property" → fails for every user via API
- Historic entities that ARE parented to DB_ROOT were created via superadmin/UI path that bypasses this check
- **Workaround**: Mihkel must set `_parent` via Entu UI for entities that need to be under DB_ROOT
- **Precedent**: "Kaardid" menu (`687c9fd8259fc48ba59cf2e4`) and all root folders also have no `_parent` and function fine

---

## [REPORT] Session 2026-04-20 outcomes

### Formula property on `link` type
- Property def `_id`: `69e64de22cd89347a7f3830b`
- Formula: `'[' title '](' url ')'` (CONCAT with literal brackets, modelled on `person.name`)
- `markdown: true` property `_id`: `69e6501e2cd89347a7f3831c`
- Link 1 (`69e64b332cd89347a7f382ed`) verified: `[Loo uus grupp ja kutsu õpilased](https://scribehow.com/embed-preview/ESM_Kaardirakendus_Loo_uus_grupp_ja_kutsu_opilased__KJsMWqnkT-SGhlAjqwuIdA)` ✓
- Link 2 (`69e64b332cd89347a7f382f6`) verified: `[KML-failide import Entusse](https://scribehow.com/embed-preview/KML_failide_import_Entusse__Q2sbaiS9R8eUaa-zbPQPTw)` ✓

### Ownership investigation
- All 8 new entities have explicit `_owner: Mihkel` set automatically by ENTU_ADMIN_KEY
- Link 1 + 2: `_parent = Juhendid folder` ✓ (inherit from folder's Mihkel ownership)
- Juhendid folder, link type, menu: root-level (no `_parent`) — API blocks `_parent: DB_ROOT`
- **Action needed**: Mihkel to set `_parent` via Entu UI on:
  - `link` type (`69e64a3c2cd89347a7f382af`) → DB_ROOT
  - `Kasutusjuhendid` menu (`69e64cae2cd89347a7f38300`) → DB_ROOT
  - Juhendid folder is consistent with other folders (all root-level) — may not need a parent

### [PATTERN] Webhook handler testing (2026-03-08)

- Mock `h3` with `vi.mock('h3')` — override `defineEventHandler` (passthrough) and `readBody` (return `event._body`)
- Mock `entu-admin`, `webhook-queue`, `logger` at module level
- Use `installNuxtMocks()` for `createError`, `getHeader` etc.
- Event shape: `{ _headers, _query, _body, _cookies, context: { params }, node: { req, res } }`
