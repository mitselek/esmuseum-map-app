# AI Assistant Guide

This file provides guidance to AI assistants (Claude, Gemini, Copilot, etc.) when working with code in this repository.

## Project Overview

**Estonian War Museum (Eesti sõjamuuseum) Map Application** - A mobile-first educational task management application built with Nuxt 3 and Vue 3. Students complete location-based learning assignments using an interactive map interface.

**IMPORTANT**: "ES" stands for "Eesti Sõja" (Estonian War), NOT "Estonian Sports". See `docs/PROJECT-NAMING.md` for context.

## Development Commands

### Running the Application

```bash
# Install dependencies
npm install

# Development server (localhost)
npm run dev

# Development with mobile network access
npm run dev:mobile

# Build for production
npm run build

# Production server
npm run start
npm run start:mobile  # with network access
```

### Testing

```bash
# Run all tests
npm test

# Watch mode for development
npm test:watch

# Specific test suites
npm test:unit           # Unit tests only
npm test:api            # API endpoint tests
npm test:composables    # Composable tests
npm test:auth           # All auth-related tests

# Coverage report
npm test:coverage
```

### Code Quality

```bash
# Lint and auto-fix
npm run lint

# Translation management
npm run analyze-translations         # Analyze usage
npm run analyze-translations:report  # Generate report
npm run analyze-translations:cleanup # Remove unused keys
```

## Architecture Overview

### SPA Design with Entu CMS Integration

This is a **client-side only SPA** (SSR disabled) that uses **Entu CMS** as its backend. All data flows through the Entu API - this app is essentially a specialized UI layer.

**Key architectural characteristics:**

- Global state management via module-level refs in composables (no Pinia/Vuex)
- OAuth-only authentication (no password storage) via OAuth.ee
- Heavy use of Vue 3 Composition API patterns
- LocalStorage-based client state persistence
- Webhook-driven permission automation for student/task assignments

### Directory Structure

```text
app/
├── components/        # Vue components (Task*, Interactive*, etc.)
├── composables/       # Business logic (use*.ts files - 20+ composables)
├── pages/            # Route pages (index, login, signup, auth)
├── middleware/       # Route guards (auth.ts)
├── plugins/          # Vue plugins and initialization
├── constants/        # Entu type definitions and property names
└── utils/            # Helper functions

server/
├── api/
│   ├── onboard/      # User onboarding endpoints
│   ├── webhooks/     # Entu webhook handlers
│   └── upload-proxy.post.ts  # CORS workaround for file uploads
└── utils/            # Server utilities (auth, Entu API, logging)

types/                # Global TypeScript definitions
├── entu.ts          # Entu entity types with branded IDs
└── workspace.ts     # Task workspace types

tests/
├── unit/            # Unit tests
├── api/             # API endpoint tests
├── composables/     # Composable tests
└── integration/     # Integration tests
```

### Core Composables (Business Logic Layer)

**Authentication:**

- `useEntuAuth.ts` - Token management, 12-hour expiry, auto-refresh
- `useEntuOAuth.ts` - OAuth.ee integration (Google, Apple, Smart-ID, etc.)
- `useServerAuth.ts` - Alternative server-side auth (see SERVER_AUTH_IMPLEMENTATION.md)

**Task Management:**

- `useTaskWorkspace.ts` - Global task state (singleton pattern)
- `useTaskDetail.ts` - Single task detail logic
- `useTaskResponseCreation.ts` - Student response submission
- `useCompletedTasks.ts` - Completion tracking

**Geolocation:**

- `useLocation.ts` - GPS permission handling, position tracking, distance calculations
- `useTaskGeolocation.ts` - Task-specific location features

**File Uploads:**

- `useClientSideFileUpload.ts` - Client-side file handling with CORS proxy

**Map Features:**

- `useMapStyles.ts` - Map styling
- `useMapStyleScheduler.ts` - Day/night cycle based styling
- `useMapFullscreen.ts` - Fullscreen map mode

**API Integration:**

- `useEntuApi.ts` - Core Entu API client with auto-retry on 401

### Entu Data Model

The application works with these Entu entity types (Estonian names used in API):

| Type     | Estonian   | Purpose                                                        |
| -------- | ---------- | -------------------------------------------------------------- |
| Task     | `ülesanne` | Learning assignments with map references and group assignments |
| Response | `vastus`   | Student submissions with GPS data and file attachments         |
| Location | `asukoht`  | Map markers (name, coordinates, description, photos)           |
| Map      | `kaart`    | Map definitions (styling, center point, zoom)                  |
| Group    | `grupp`    | Classes/cohorts with teacher references                        |
| Person   | `person`   | Users (students and teachers)                                  |

**Property Pattern**: All Entu properties are typed arrays:

```typescript
entity.name = [{ string: "Location Name" }];
entity.lat = [{ number: 59.437 }];
entity.reference = [{ reference: "other_entity_id" }];
```

**Type Safety**: `EntuEntityId` branded type prevents mixing entity IDs with strings at compile time.

### Authentication Flow

1. User clicks OAuth provider → `useEntuOAuth.ts` redirects to OAuth.ee
2. OAuth callback returns JWT → stored in localStorage + sessionStorage
3. `useEntuAuth.ts` exchanges OAuth token for Entu app token (12h validity)
4. `useEntuApi.ts` includes token in every request
5. Auto-retry on 401: refreshes token and retries failed requests
6. Middleware (`app/middleware/auth.ts`) protects routes by checking token expiry

**Note**: See `SERVER_AUTH_IMPLEMENTATION.md` for alternative server-side session approach that solves JWT audience mismatch issues.

### Webhook System

Teachers assign tasks to classes → Entu fires webhooks → Server auto-grants student access:

- `server/api/webhooks/student-added-to-class.post.ts`
- `server/api/webhooks/task-assigned-to-class.post.ts`

**Key feature**: Webhooks include user JWT tokens for proper audit trails (no privileged admin keys for automated permissions).

**Queue system** (`server/utils/webhook-queue.ts`): Per-entity debouncing prevents duplicate processing when multiple webhooks fire simultaneously.

### CORS Workaround for File Uploads

**Problem**: Direct file upload to DigitalOcean (S3-like) fails due to CORS restrictions.

**Solution**: Hybrid proxy approach (Phase 3.2b):

1. Client gets signed upload URL from Entu
2. Client sends file + URL to `/api/upload-proxy` (same-origin)
3. Server proxies file to DigitalOcean using signed URL
4. No CORS issues since server-to-server communication

Files: `useClientSideFileUpload.ts` + `server/api/upload-proxy.post.ts`

### Map & Geolocation

**Stack**: Leaflet + OpenStreetMap + SunCalc (day/night cycles)

**Key component**: `InteractiveMap.vue` - Main Leaflet component with markers and popups

**Geolocation features**:

- Real-time GPS tracking with accuracy display
- Permission state management (prompt/granted/denied/unknown)
- Distance-based location sorting using Haversine formula
- 5-10 second GPS update intervals with caching
- Student GPS coordinates logged in task responses (`seadme_gps` property)

## Development Guidelines

### Constitution

This project follows strict development principles defined in `.specify/memory/constitution.md`:

1. **Type Safety First** - Avoid `any`, document exceptions, use type guards
2. **Composable-First Development** - Reusable, testable, single-responsibility composables
3. **Test-First Development** - Write tests before implementation (>80% coverage for composables, >90% for API)
4. **Observable Development** - Structured logging (pino), proper error boundaries
5. **Pragmatic Simplicity** - YAGNI, optimize after measuring, boring technology over cleverness
6. **Strategic Integration Testing** - Focus on critical paths (auth, Entu API, user journeys)
7. **API-First Server Design** - Clean validation, structured responses, proper error codes

### Spec-Kit Workflow

Available slash commands (see `.specify/` folder):

- `/speckit.specify` - Write feature specifications
- `/speckit.plan` - Create implementation plans
- `/speckit.tasks` - Break down into tasks
- `/speckit.implement` - Execute implementation
- `/speckit.analyze` - Analyze specs for completeness
- `/speckit.checklist` - Generate requirements quality checklist
- `/speckit.clarify` - Clarify requirements
- `/speckit.constitution` - Check constitutional compliance

### Feature Flags

Runtime feature flags for gradual rollout:

- `F015_CLIENT_SIDE_RESPONSE_CREATION` - Phase 3.1 (COMPLETED)
- `F015_CLIENT_DAILY_FILE_UPLOAD` - Phase 3.2b (COMPLETED - hybrid proxy)
- `F015_CLIENT_SIDE_AUTH` - Phase 3.3 (TESTING NOW)

### Testing Strategy

**Framework**: Vitest with MSW for API mocking

**Test categories**:

- Unit tests - Utility functions, type guards
- API tests - Server endpoints, Entu integration
- Composables tests - Auth, task management, location
- Integration tests - End-to-end workflows

**When to run specific test suites**:

- After auth changes: `npm test:auth`
- After composable changes: `npm test:composables`
- After API changes: `npm test:api`

### Common Development Tasks

**Adding a new task feature:**

1. Update types in `types/entu.ts` if new properties needed
2. Create composable in `app/composables/use*.ts` with tests
3. Update `useTaskWorkspace.ts` if global state affected
4. Add component in `app/components/Task*.vue`
5. Run `npm test` to verify no regressions

**Adding a new Entu entity type:**

1. Document in `docs/model/model.md`
2. Add TypeScript types to `types/entu.ts`
3. Add property constants to `app/constants/entu.ts`
4. Update `useEntuApi.ts` if new query patterns needed

**Working with geolocation:**

- Check `useLocation.ts` for centralized GPS management
- Use `getCurrentPosition()` for one-time reads
- Use `startGPSUpdates()` for continuous tracking
- Distance calculations available via `calculateDistance()` utility

**Debugging authentication issues:**

1. Check browser localStorage for `entu_token`
2. Verify token not expired (12-hour validity)
3. Check Network tab for 401 responses
4. See `docs/authentication/entu-authentication.md` for flow details
5. Consider server-side auth approach (SERVER_AUTH_IMPLEMENTATION.md)

## Important Documentation

- `README.md` - Quick start and spec-kit workflow
- `.specify/memory/constitution.md` - Development principles (authoritative)
- `docs/model/model.md` - Complete Entu data model
- `docs/authentication/entu-authentication.md` - Auth implementation details
- `SERVER_AUTH_IMPLEMENTATION.md` - Alternative server-side auth approach
- `DEPLOYMENT.md` - JWT audience configuration for production
- `docs/api/` - API endpoint documentation
- `docs/guides/student-task-access-flow.md` - Student onboarding flow

## Configuration

### Environment Variables

Required in `.env`:

```bash
# Entu API Configuration
NUXT_ENTU_KEY=your_server_side_api_key
NUXT_PUBLIC_ENTU_URL=https://entu.app
NUXT_PUBLIC_ENTU_ACCOUNT=esmuuseum
NUXT_PUBLIC_ENTU_CLIENT_ID=your_oauth_client_id

# Webhook Configuration
NUXT_WEBHOOK_SECRET=your_webhook_secret

# OAuth Configuration
NUXT_PUBLIC_CALLBACK_ORIGIN=https://your-domain.com
```

See `.env.example` for complete list.

### Nuxt Configuration

Key settings in `nuxt.config.ts`:

- SPA mode: `ssr: false` (required for localStorage)
- i18n: 4 locales (et, en, uk, lv)
- Tailwind CSS + Naive UI components
- Vite devtools disabled (mobile compatibility)

## Tech Stack

- **Framework**: Nuxt.js 3.17+ (Vue.js 3)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3
- **UI Components**: Naive UI
- **Internationalization**: @nuxtjs/i18n (4 languages)
- **Mapping**: Leaflet 1.9 + @vue-leaflet/vue-leaflet
- **Testing**: Vitest 3.2+ with @nuxt/test-utils
- **Logging**: Pino (server-side structured logging)
- **Node Version**: 22.x

## Common Patterns

### Creating a New Composable

```typescript
// app/composables/useMyFeature.ts
import { ref, computed } from "vue";

export const useMyFeature = () => {
  const state = ref<string>("");

  const derivedValue = computed(() => {
    return state.value.toUpperCase();
  });

  const doSomething = async () => {
    // Implementation
  };

  return {
    state: readonly(state),
    derivedValue,
    doSomething,
  };
};
```

### Making Entu API Calls

```typescript
const { searchEntities, createEntity } = useEntuApi();

// Fetch tasks for a group
const tasks = await searchEntities({
  _type: "ülesanne",
  grupp: groupId,
});

// Create a response
const response = await createEntity({
  _type: "vastus",
  _parent: taskId,
  vastus: [{ string: "My answer" }],
  seadme_gps: [{ string: `${lat},${lon}` }],
});
```

### Using Branded Entity IDs

```typescript
import { toEntuEntityId, isEntuEntityId } from "~/types/entu";

// Convert string to branded ID
const taskId = toEntuEntityId("507f1f77bcf86cd799439011");

// Type guard
if (isEntuEntityId(someValue)) {
  // TypeScript knows someValue is EntuEntityId
}
```

### Protecting Routes

```vue
<script setup>
definePageMeta({
  middleware: ["auth"], // Requires authentication
});
</script>
```

## Troubleshooting

### "jwt audience invalid" errors

- See `DEPLOYMENT.md` for JWT audience configuration
- Consider server-side auth approach: `SERVER_AUTH_IMPLEMENTATION.md`

### CORS errors on file upload

- Should use `/api/upload-proxy` endpoint automatically
- Check `useClientSideFileUpload.ts` implementation

### GPS not working

- Check browser permissions in `useLocation.ts`
- Verify HTTPS (geolocation requires secure context)
- Check permission state: granted/denied/prompt/unknown

### Tests failing after changes

- Run specific suite: `npm test:unit` or `npm test:composables`
- Check for mock service worker (MSW) configuration
- Verify test database state in setup/teardown

### Type errors with Entu entities

- Check property access uses array indexing: `entity.name[0]?.string`
- Verify branded type usage for entity IDs
- Use type guards from `types/entu.ts`

## Project Governance

**Constitution Authority**: `.specify/memory/constitution.md` supersedes all other guidelines. All PRs must verify constitutional compliance.

**Amendment Process**: Changes to constitution require documentation in `.specify/memory/`, maintainer review, and version bump.

**Exception Handling**: Exceptions must be documented with justification and tracked for resolution.
