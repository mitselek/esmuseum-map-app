# Entu Agent Scratchpad

## Session 2026-03-08

### [LEARNED] nuxt-icons typecheck fix

- `skipLibCheck` only skips `.d.ts` files, NOT `.vue` files from node_modules
- When `.nuxt/components.d.ts` imports a `.vue` file, no tsconfig `include`/`exclude` can prevent typechecking it — TS follows the import chain
- Type declaration modules (`.d.ts`) cannot shadow `.vue` file imports in vue-tsc
- Solution: removed the abandoned `nuxt-icons` module entirely (no usage in codebase)

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

### [CHECKPOINT] Completed issues this session (2026-03-08)

- **#32**: console → useClientLogger migration (13 files, 23 calls)
- **#33**: Dead code cleanup (removed `findMatchingLocation`, `getLocationCoordinates` from useTaskDetail)
- **#34**: Import path standardization (9 files, `../` → `~/`/`~~/`)
- **#36**: Entu type safety (replaced 8 `any` signatures with concrete types)
- **Lint fixes**: 16 test file lint errors fixed
