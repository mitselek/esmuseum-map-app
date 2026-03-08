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
