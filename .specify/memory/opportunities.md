# Optimization Opportunities Log

**Purpose**: Track suspicious patterns and optimization opportunities discovered during development.  
**Principle**: Log and continue - don't lose focus on current task (Constitution Principle V).

**Guidelines**:

- Keep this file focused on **active** opportunities only
- Maximum ~20 active items - when full, prioritize or archive
- Move reviewed/rejected items to `opportunities-archive.md`
- Include date, context, and discovery location
- Review monthly and clean up

---

## Active Opportunities

<!-- Format: - [ ] [YYYY-MM-DD] Brief description | Discovered in: file/feature | Impact: low/medium/high -->

- [ ] [2025-10-03] **Code Duplication**: TaskLocationOverride vs TaskMapCard have near-identical manual coordinate override functionality | Discovered in: Component migration | Impact: medium | Consider extracting to useManualCoordinates() composable or consolidating
- [ ] [2025-10-05] **Duplicate Token Expiry Logic**: Proactive (middleware) + Reactive (API) token checking | Discovered in: F025 | Impact: low | Monitor in production - might be good defensive duplication or unnecessary overhead
- [ ] [2025-10-05] **Magic Status Codes**: HTTP status codes (401, 403, 500) as magic numbers in error-handling.ts | Discovered in: F025 | Impact: low | Consider HTTP_STATUS constants for readability
- [ ] [2025-10-05] **Magic Notification Durations**: Hardcoded durations (4000, 4500, 5000 ms) in useNotifications.ts | Discovered in: F025 | Impact: low | Consider NOTIFICATION_DURATION constants with comments
- [ ] [2025-10-05] **Event Logging in Middleware**: 6 console.log statements with 🔒 markers in auth.ts | Discovered in: F025 | Impact: low | Review if all logs needed now that notifications provide feedback
- [ ] [2025-10-05] **i18n Translation Namespacing**: Flat structure (auth.sessionExpired) vs nested (auth.errors.sessionExpired.title) | Discovered in: F025 | Impact: very-low | Would require refactor, cosmetic improvement
- [ ] [2025-10-03] **Response Entity Search Patterns**: Three files search for responses with similar patterns | Discovered in: Phase 1 | Impact: medium | Could create shared searchUserResponses() utility
- [ ] [2025-10-03] **Page Initialization Log**: index.vue has 🚀 [EVENT] script setup log | Discovered in: Phase 1 | Impact: low | Review if still needed for debugging

---

## Recently Reviewed

<!-- Last 5 reviewed items for context - move older to archive -->

- [x] [2025-10-05] **Middleware TypeScript Migration**: auth.js → auth.ts completed | Decision: IMPLEMENTED | Impact: 100% TypeScript middleware coverage achieved
- [x] [2025-10-03] **useLocation Debug Logging**: Excessive 🔍 [EVENT] logs (12 total) | Decision: OPTIMIZED | Kept 7 iOS-critical logs, removed 5 verbose logs
- [x] [2025-10-03] **useLocation Permission Detection Complexity**: iOS permission workarounds | Decision: KEPT | Research confirmed WebKit bug #294751 still open, workarounds necessary
- [x] [2025-10-03] **EventDebugPanel Component**: Appears obsolete (~300 lines) | Decision: KEEP | Critical mobile debugging tool until Sentry implemented
- [x] [2025-10-03] **useEntuAdminAuth Dead Code**: 46 lines never imported anywhere | Decision: DELETED | Backend-only auth never integrated, eliminated confusion

---

## Archive

Older reviewed opportunities moved to `.specify/memory/opportunities-archive.md` to keep this file manageable.

---

**Last Reviewed**: 2025-10-06  
**Active Count**: 8 / 20 max
