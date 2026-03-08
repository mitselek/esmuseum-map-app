# Finn - Research & Verification Reports

## Issue #2 Acceptance Criteria Check

### ✗ `npm run lint -- --max-warnings 0`

**FAILED** — 12 warnings remain (need 0):

```
useClientSideFileUpload.ts:273:28, 285:9       — no-await-in-loop (2)
useMapStyleScheduler.ts:171:25, 333:23         — no-await-in-loop (2)
student-added-to-class.post.ts:65:7, 81:19, 204:16, 212:9  — no-await-in-loop (4)
task-assigned-to-class.post.ts:179:16, 187:9   — no-await-in-loop (2)
entu-admin.ts:290:24, 322:9                    — no-await-in-loop (2)
```

All 12 are `no-await-in-loop` warnings. These are legitimate code patterns that need case-by-case analysis per issue #3.

### ✓ `npm test`

**PASSED** — 148 passed | 9 skipped (157 total)

- Test Files: 14 passed | 3 skipped (17)
- Duration: 1.70s
- No failures

### ✓ `useClientLogger` composable

**EXISTS** at `/home/michelek/Documents/github/esmuseum-map-app/app/composables/useClientLogger.ts`

- Lines 15, 18: `eslint-disable-line no-console` with inline justification
- Lines 1-8: JSDoc block explains why

### ✓ `eslint-disable` comments audit

**ALL JUSTIFIED** — All 32 instances across source code include explanatory comments:

- Block-level disables (7): `no-console` in debug/logging files
- Inline next-line (25): `@typescript-eslint/no-explicit-any` with reasons (Entu schema, devtools, JWT, FormData type inference)
- No unjustified disables found

### ✗ Latest CI run

**NO DATA** — `gh run list` returns empty (no GitHub Actions context available in this environment)

## Summary

**#2 Acceptance**: 3/5 checks pass

- Lint: BLOCKED by 12 `no-await-in-loop` warnings (issue #3)
- Tests: PASSED
- Logger: VERIFIED
- Comments: VERIFIED (all justified)
- CI: UNKNOWN (no GitHub context)

---

## Logo Research Report (2026-03-05)

### 1. Login Page Logo

- **File**: `/app/pages/login/index.vue` (lines 7-82)
- **Assets**:
  - `/public/esm-logo-et.svg` (Estonian version, 160KB)
  - `/public/esm-logo-en.svg` (English version, 159KB)
  - `/public/esm_logo.png` (PNG fallback, 95KB)
- **Current Implementation**:
  - Inline `<img>` tag with locale-aware dynamic src
  - Computed property `localeLogo` (lines 8-10) switches between SVG versions based on `locale.value`
  - CSS classes: `h-20 w-auto` (height 80px, width auto-scale)
  - Alt text: `$t('title')` (i18n translated)
  - **NOT a reusable component** — directly embedded in login page template
- **Location in template**: Lines 76-82 (centered in white card)

### 2. Profile Page

- **File**: `/app/pages/profile/index.vue`
- **Structure**:
  - Minimal layout: centered max-w-md form card
  - Header section with title + subtitle (i18n translated)
  - Name collection form: forename + surname inputs
  - Error display + submit button
  - Protected route (auth middleware applied)
- **No logo on profile page** — only AppHeader used
- **No reusable components** — direct form implementation

### 3. Logo Reusability Status

- **Status**: NOT a component yet
- **Inline implementation**: Only used in login page as direct `<img>` tag
- **Opportunity**: Could extract to reusable component for:
  - Logo rendering consistency
  - Easier locale switching
  - Reuse in profile page (if needed in future)
  - Centralized SVG/PNG management

### 4. AppHeader Component

- **File**: `/app/components/AppHeader.vue`
- **Used on**: Both login and profile pages (and all other pages)
- **Current content**: Language switcher + logout/login buttons
- **No logo** — just text header (commented out title on line 5-6)
- **Could be enhanced** with logo if needed globally

---

## Signup Page & "Grupiga" Research (2026-03-05)

### 1. **Signup/Liitumisleht Page**

- **File**: `/app/pages/signup/[groupId].vue`
- **Logo Status**: NO museum logo (esm-logo)
  - Has Interreg logo (lines 179-186) but not museum logo
  - Language switcher inline (emoji flags)
- **Structure**:
  - Title: `{{ $t('onboarding.title') }}` (i18n)
  - Group name display (fetched from API)
  - Name collection form (forename/surname)
  - Loading spinner during join flow
  - Error/timeout message displays
  - Retry button after error
  - Interreg logo footer
- **Uses composables**: `useOnboarding()`, `useEntuAuth()`, `useEntuOAuth()`
- **Route params**: `[groupId]` from URL

### 2. **"Liitu Grupiga" Text**

- **Location**: `.config/i18n.config.ts` line 146
- **Key**: `onboarding.title`
- **Value**: `'Liitu Grupiga'` (both words capitalized)
- **Capitalization**: Capital L + Capital G
- **All 4 languages** in i18n.config.ts:
  - Estonian (et): `'Liitu Grupiga'` (line 146)
  - English (en): `'Join Group'` (verified in config)
  - Ukrainian (uk): `'Приєднатися до групи'` (Cyrillic)
  - Latvian (lv): Similar structure

### 3. **Pages Without Museum Logo**

From grep search, logo (esm-logo) appears in:

- **Login page**: ✓ has esm-logo
- **Signup page**: ✗ NO esm-logo (only Interreg)
- **Main workspace (index.vue)**: ✗ NO mention
- **Profile page**: ✗ NO esm-logo (confirmed earlier)
- **Auth callback**: ✗ probably none
- **Auth-test page**: ✗ mention only in comment

**Logos missing**: Signup, Profile, Main/Index pages

---

## Typecheck Research (2026-03-08)

### Root Cause: `~/types/location` module resolution

All 6 typecheck errors were `TS2307: Cannot find module '~/types/location'`. The `~` alias resolves to `app/` but `types/` is at project root. Fix: use `~~/types/location` (project root alias).

### TaskLocation vs LocationEntity Type Mismatch

- `TaskLocation` (in `types/location.ts`) = flat normalized format (`name: string`, `coordinates: {lat, lng}`)
- `LocationEntity` (in `useLocation.ts:53`) = raw Entu format (`name: [{string: "..."}]`, `nimi`, `properties`)
- `location-transform.ts` has `normalizeLocation()` function — NEVER IMPORTED/USED anywhere
- Components typed as `TaskLocation` but actually receive `LocationEntity` at runtime
- 6 different Entu property access patterns across components

### nuxt-icons: Abandoned, Should Remove

- `nuxt-icons@3.2.1` causes 2 TS2532 errors in typecheck
- Maintainer says module is abandoned, recommends official `@nuxt/icon`
- No `assets/icons/` dir exists, no `<nuxt-icon>` usage found — module appears unused
- tsconfig.json has broken workaround (include override) that doesn't actually exclude it

---

## Codebase Quality Audit Summary (2026-03-08)

[LEARNED] Key findings:

- 15 `any` usages (all eslint-disabled with comments), 9 are `[key: string]: any` on Entu interfaces
- `EntuEntityId` branded type defined but NEVER used at runtime in app/ code
- 2 unused composables: `useFormPersistence`, `useResponsiveLayout`
- `location-transform.ts` entire file is dead code
- 73 bare console.log/warn/error calls that should use `useClientLogger`
- 75% composables have NO tests (15/20 untested)
- 3 import conventions mixed: `~/`, `~~/`, relative `../../`
- `getLocationCoordinates` duplicated in 3 places
- `getLocationName`/`getLocationDescription` duplicated in 2 places
