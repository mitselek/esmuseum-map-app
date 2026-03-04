# Team Prompts: ESLint Cleanup (Issue #2)

## Execution Strategy

These agents should run in worktrees (`isolation: "worktree"`) since they
may touch overlapping files. Suggested order:

1. `quick-fixes` first (fastest, clears the most errors)
2. `type-safety` + `console-migration` in parallel after merging quick-fixes

---

## Agent 1: quick-fixes

**subagent_type:** `general-purpose`
**isolation:** `worktree`

### Prompt

You are fixing mechanical ESLint errors in the esmuseum-map-app project.
This is a Nuxt 3 / Vue 3 / TypeScript SPA.

**Your scope — fix these ESLint rule violations ONLY:**

1. `@typescript-eslint/no-unused-vars` (39 errors) and `no-unused-vars` (4 errors in JS files)
   - Remove truly unused imports, variables, and functions
   - For intentionally unused function params (e.g. error handlers, callback signatures), prefix with `_`
   - For unused imports that are type-only, check if they're used as types elsewhere in the file
   - Do NOT remove variables that are used but ESLint can't detect (e.g. template refs in Vue SFCs)

2. `no-promise-executor-return` (3 errors)
   - Promise executor functions should not return values
   - Wrap the return in void or restructure the code
   - Check files: `app/components/InteractiveMap.vue`, `server/api/webhooks/student-added-to-class.post.ts`, `server/api/webhooks/task-assigned-to-class.post.ts`

3. `@typescript-eslint/no-invalid-void-type` (1 error)
   - Fix the void type usage to be valid

4. `@typescript-eslint/no-dynamic-delete` (1 error)
   - Replace `delete obj[key]` with a Map, Object.fromEntries, or destructuring approach
   - Check: `tests/unit/auth-composable.test.ts`

5. `tailwindcss/no-custom-classname` (~138 warnings)
   - Do NOT modify Vue templates
   - Fix this by configuring the tailwind ESLint plugin to recognize custom classes
   - The project uses custom Tailwind classes prefixed with `esm-` (e.g. `bg-esm-blue`, `text-esm-dark`, `hover:bg-esm-dark`, `border-esm-blue`, etc.)
   - Edit `.config/eslint.config.js` to add a whitelist pattern or configure the plugin's `whitelist` / `classRegex` setting
   - Alternatively, check if there's a `tailwind.config` that defines these — if so, ensure the eslint plugin points to the right config path

**ESLint config:** `.config/eslint.config.js`
**Run lint:** `npm run lint` (has --fix, but verify manually)
**Run tests:** `npm test` to ensure nothing breaks

**Important rules:**

- Do NOT touch `console.log` calls — another agent handles those
- Do NOT touch `any` types — another agent handles those
- Do NOT modify business logic — only fix lint errors
- Run `npm test` after all changes to verify tests still pass (14 pass, 3 skipped)
- Run `npm run lint 2>&1 | grep "error"` to verify your error count dropped

---

## Agent 2: type-safety

**subagent_type:** `general-purpose`
**isolation:** `worktree`

### Prompt

You are replacing `@typescript-eslint/no-explicit-any` violations (42 errors)
in the esmuseum-map-app project with proper TypeScript types.

**Context — Entu type system:**

The app uses Entu CMS as backend. Key type patterns in `types/entu.ts`:

- `EntuEntityId` — branded string type for entity IDs (use `toEntuEntityId()` to create)
- Entu properties are typed arrays: `entity.name = [{ string: "Name" }]`
- Property accessors: `entity.prop[0]?.string`, `entity.prop[0]?.number`, `entity.prop[0]?.reference`
- Entity types: `EntuEntity`, `EntuProperty`, `EntuSearchResult`
- Type guards available: `isEntuEntityId()`, property guard functions in `types/entu.ts`

**Your scope:**

Fix all 42 `no-explicit-any` errors across these areas:

1. **Type files** (`types/entu.ts`, `types/location.ts`, `types/workspace.ts`)
   - These define the core types — fix `any` here with the most accurate types
   - Use `unknown` + type narrowing when the actual type isn't deterministic

2. **Composables** (`app/composables/useEntuApi.ts`, `useEntuAuth.ts`, `useTaskDetail.ts`, etc.)
   - API response types — use Entu entity types or create specific response interfaces
   - Error catch blocks — use `unknown` instead of `any`, then narrow with type guards
   - Event handlers — use proper DOM event types

3. **Server code** (`server/utils/entu.ts`, `server/utils/auth.ts`, `server/utils/entu-admin.ts`)
   - API call parameters and responses — type properly or use `unknown`
   - H3 event handler types — use `H3Event` from h3

4. **Utils** (`utils/entu-query-builders.ts`, `app/utils/error-handling.ts`, `app/utils/token-validation.ts`)
   - Query builder generics — add proper type parameters
   - Error handling — use `unknown` for caught errors

5. **Vue components** (various `.vue` files)
   - Template refs — use proper component/element types
   - Event handler params — use proper event types

6. **Test support** (`tests/setup.ts` — already has eslint-disable, skip)
   - Tests are already configured with `no-explicit-any: off` in ESLint config

**Decision framework for each `any`:**

1. Can you determine the exact type? → Use it
2. Is it a generic/flexible API boundary? → Use `unknown` with type narrowing
3. Is it a third-party lib type issue? → Use the lib's types or `eslint-disable-next-line` with comment
4. Is it genuinely needed (e.g. JSON.parse output)? → Add `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- [justification]`

**Important rules:**

- Do NOT use `eslint-disable` without a written justification explaining WHY any is needed
- Do NOT touch `console.log` calls or unused variables — other agents handle those
- Do NOT change runtime behavior — only types
- Run `npm test` after all changes to verify tests still pass
- Run `npm run lint 2>&1 | grep "no-explicit-any"` to verify count dropped to 0

**ESLint config:** `.config/eslint.config.js`
**Key type files to reference:** `types/entu.ts`, `types/workspace.ts`, `types/location.ts`

---

## Agent 3: console-migration

**subagent_type:** `general-purpose`
**isolation:** `worktree`

### Prompt

You are resolving 161 `no-console` ESLint warnings in the esmuseum-map-app project.
This is a Nuxt 3 SPA (ssr: false). The ESLint rule is:
`'no-console': ['warn', { allow: ['warn', 'error'] }]`

**Strategy — three tiers:**

### Tier 1: Server fix (2 warnings)

File: `server/api/upload-proxy.post.ts`

Migrate `console.log`/`console.error` to use the existing pino logger pattern:

```typescript
import { createLogger } from "../utils/logger";
const logger = createLogger("upload-proxy");
// Replace console.log(...) → logger.info(...)
// Replace console.error(...) → logger.error(...)
```

Reference `server/utils/logger.ts` for the createLogger pattern.
All other server files already use this pattern.

### Tier 2: eslint-disable for intentional console tooling (~65 warnings)

These files exist specifically to output to the browser console. Add
`/* eslint-disable no-console */` at the top of each:

- `app/plugins/entu-console.client.js` (~19 calls) — developer console tools (`window.entu.*`)
- `app/plugins/map-console.client.ts` (~11 calls) — map debug console (`window.$map.*`)
- `app/plugins/map-scheduler.client.ts` (~10 calls) — scheduler debug console (`window.$scheduler.*`)
- `app/components/EventDebugPanel.vue` (~6 calls) — debug panel that intercepts console output

Also add per-function `// eslint-disable-next-line no-console` or block-level disable for:

- `app/composables/useMapStyles.ts` → `listStyles()` function (~7 calls) — intentional style listing output
- `app/composables/useMapStyleScheduler.ts` → `getRuleStatus()` function (~12 calls) — intentional status display

### Tier 3: Create `useClientLogger` composable and migrate remaining ~95 calls

**Create `app/composables/useClientLogger.ts`:**

```typescript
export function useClientLogger(module: string) {
  const prefix = `[${module}]`;

  return {
    debug: (...args: unknown[]) => {
      if (import.meta.dev) console.log(prefix, ...args); // eslint-disable-line no-console
    },
    info: (...args: unknown[]) => {
      if (import.meta.dev) console.log(prefix, ...args); // eslint-disable-line no-console
    },
    warn: (...args: unknown[]) => {
      console.warn(prefix, ...args);
    },
    error: (...args: unknown[]) => {
      console.error(prefix, ...args);
    },
  };
}
```

Key design:

- `debug`/`info` are dev-only (stripped in production via `import.meta.dev`)
- `warn`/`error` always emit (already allowed by ESLint rule)
- The `[module]` prefix preserves searchability
- `console.warn`/`console.error` don't need eslint-disable (they're in the allow list)
- Only 2 `eslint-disable-line` comments needed inside the composable itself

**Migration pattern for each file:**

```typescript
// BEFORE:
console.log("🔒 [EVENT] auth middleware - Started", { route: to.fullPath });

// AFTER:
const log = useClientLogger("auth-middleware");
log.info("Started", { route: to.fullPath });
```

**Files to migrate (heaviest first):**

- `app/components/InteractiveMap.vue` (~21 calls)
- `app/composables/useLocation.ts` (~20 calls)
- `app/components/TaskSidebar.vue` (~10 calls)
- `app/middleware/auth.ts` (~7 calls)
- `app/composables/useTaskWorkspace.ts` (~6 calls)
- `app/pages/index.vue` (~6 calls)
- `app/components/TaskDetailPanel.vue` (~5 calls)
- `app/plugins/auth-init.client.js` (~4 calls)
- `app/composables/useEntuAuth.ts` (~3 calls)
- `app/composables/useServerAuth.ts` (~3 calls)
- `app/composables/useTaskDetail.ts` (~3 calls)
- `app/composables/useMapStyleScheduler.ts` (remaining ~3 non-getRuleStatus calls)
- And remaining files with 1-2 calls each

**Important — EventDebugPanel compatibility:**
`app/components/EventDebugPanel.vue` monkey-patches `console.log` to intercept
messages with `[EVENT]` tags. The `useClientLogger` composable calls `console.log`
internally, so EventDebugPanel interception will continue working. The `[module]`
prefix will appear in the output which is fine.

**Important rules:**

- Do NOT touch unused variables or `any` types — other agents handle those
- Do NOT modify business logic — only replace console calls
- Preserve the semantic meaning of each log (don't lose context/data)
- For `console.log` in catch blocks logging errors, use `log.error(...)` not `log.info(...)`
- Run `npm test` after all changes
- Run `npm run lint 2>&1 | grep "no-console"` to verify count dropped to 0

**ESLint config:** `.config/eslint.config.js`
**Existing server logger:** `server/utils/logger.ts`
