# esmuseum-map-app — AI Coding Instructions

**Estonian War Museum** (Eesti sõjamuuseum) map app. "ES" = "Eesti Sõja" (Estonian **War**), NOT "Estonian Sports".

## Architecture

Nuxt 3 **client-side SPA** (`ssr: false`) — a UI layer over the **Entu CMS** backend. No Pinia/Vuex; global state lives in **module-level `ref()`s** inside composables (singleton pattern). OAuth-only auth via OAuth.ee with 12-hour JWT tokens. Node 22.x required.

**Key directories:** `app/composables/` (business logic, 19 `use*.ts` files), `app/components/` (Vue, `Task*` prefix pattern), `server/api/` (Nuxt server routes named `action.method.ts`), `types/entu.ts` (branded `EntuEntityId` type), `app/constants/entu.ts` (Estonian property name mappings).

## Entu Data Model — Estonian Names Everywhere

Entity types and properties use **Estonian names** in the API. Key mappings:

- Entity types: `ülesanne` (task), `vastus` (response), `asukoht` (location), `kaart` (map), `grupp` (group), `person`
- Properties: `kirjeldus` (description), `tähtaeg` (deadline), `vastuste_arv` (response count), `valitud_asukoht` (selected location), `seadme_gps` (device GPS), `rühmajuht` (teacher/group leader)

All Entu properties are **typed arrays**: `entity.name = [{ string: "Name" }]`. Access with `entity.name[0]?.string`. Use type guards from `types/entu.ts` (`isEntuTask`, `isStringProperty`, etc.) — never raw casts.

## Critical Patterns

- **Branded IDs**: `EntuEntityId` (validated MongoDB ObjectId). Convert with `toEntuEntityId()`, check with `isEntuEntityId()`. Never use plain strings for entity IDs.
- **Constitutional `any` comments**: Every `as any` must cite a constitution principle: `// Principle I: Type Safety First – [justification]`. See `.specify/memory/constitution.md`.
- **localStorage keys**: Prefixed `esm_` (`esm_token`, `esm_token_expiry`, `esm_user`). Client-only code guards: `if (import.meta.client)`.
- **File uploads**: CORS proxy at `server/api/upload-proxy.post.ts` — client never uploads directly to S3.
- **Webhooks**: `server/api/webhooks/` with per-entity debounce queue (`server/utils/webhook-queue.ts`).
- **Logging**: Pino structured logging on server (`server/utils/logger.ts`). Client uses emoji-prefixed console: `📋 [EVENT]`, `🔒 [AUTH]`.

## Commands

```bash
npm run dev              # Dev server (HTTPS with local certs for OAuth)
npm test                 # All tests (Vitest + MSW mocking, node environment)
npm test:composables     # After composable changes
npm test:api             # After server API changes
npm test:auth            # After auth flow changes
npm run lint             # ESLint (config in .config/)
npm run analyze-translations:report  # i18n coverage (et, en, uk, lv)
```

## Adding Features

1. Types in `types/entu.ts` → constants in `app/constants/entu.ts`
2. Composable in `app/composables/use*.ts` (single responsibility, return `readonly()` refs)
3. Component in `app/components/` (use `Task*` prefix for task-related)
4. Tests alongside in `tests/` (match source structure; use MSW handlers from `tests/mocks/`)
5. Check constitution compliance: `.specify/memory/constitution.md` (>80% composable coverage, >90% API coverage)

## Spec-Kit Workflow

Slash commands in `.github/prompts/`: `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`, `/speckit-checklist`, `/speckit-analyze`, `/speckit-constitution`, `/speckit-clarify`. Also: `/bugfix`, `/reverse-aii`.

## Non-Obvious Details

- Nuxt config at `app/nuxt.config.ts` (not root) with `future.compatibilityVersion: 4`
- Some plugins/utils still `.js` — migrate to `.ts` when touching them
- Feature flags in runtime config: `F015_CLIENT_SIDE_*` for phased rollout
- Auth middleware (`app/middleware/auth.ts`) checks expiry with 60s buffer
- i18n default locale is Estonian (`et`); locale persists in localStorage
- Dev server requires HTTPS (OAuth.ee callback requirement) — certs at `cert/`
