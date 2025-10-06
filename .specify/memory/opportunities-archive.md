# Optimization Opportunities Archive

Historical record of reviewed/rejected optimization opportunities.  
Active opportunities live in `opportunities.md`.

---

## Implemented

<!-- Opportunities that were implemented -->

### 2025-10-03: TypeScript Migration (Phases 1-11)

**Complete Migration to TypeScript** - 100% composable and component coverage achieved

**What was done**:

- Migrated 9 composables (2,089 JS → 2,660 TS lines, +27% for interfaces)
- Migrated 18 components (100% coverage)
- Created 65+ comprehensive TypeScript interfaces
- Eliminated 25+ magic strings via ENTU_PROPERTIES constants
- Fixed 3 critical bugs (variable naming, user._id, OAuth error)
- Removed 73 lines dead code (useEntuAdminAuth.js)
- Optimized debug logs (18+ verbose logs removed, iOS-critical kept)

**Impact**: Complete type safety, better IDE support, compile-time validation

### 2025-10-05: F025 - Expired Token Handling

**Proactive Token Validation in Middleware** - Users no longer stuck on 403 errors

**What was done**:

- Created token-validation.ts with 60s buffer
- Created error-handling.ts for smart error analysis
- Updated auth.ts middleware with proactive expiry check
- Added i18n notifications (Estonian, English, Ukrainian)
- Fixed 4 critical bugs discovered during testing
- Created comprehensive testing guide (23 scenarios)

**Impact**: Better UX, prevents bad API calls, clean redirect flow

---

## Rejected

<!-- Opportunities evaluated and rejected with rationale -->

*None yet.*

---

## Superseded

<!-- Opportunities made irrelevant by other changes -->

*None yet.*
