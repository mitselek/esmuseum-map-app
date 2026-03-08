# Finn - Research & Verification Reports

## Entu API Research (2026-03-08)

[LEARNED] Token expiry is 48h (not 12h as our code assumes)
[LEARNED] Webhook token is 1-minute short-lived JWT
[LEARNED] Webhook delivery NOT guaranteed — our queue system is correct approach
[LEARNED] File upload signed URLs expire after 15 minutes
[LEARNED] File download URLs valid for 60 seconds
[LEARNED] Best practice says "Upload directly to S3 — don't proxy through your own server" (we DO proxy for CORS)
[LEARNED] `props` parameter limits returned properties (we use this)
[LEARNED] Default entity query limit is 100 (we set 1000)
[LEARNED] Entity history endpoint exists: GET /entity/{id}/history
[LEARNED] Property update requires _id field to overwrite (without it, adds new value)
[LEARNED] Aggregate endpoint exists for fresh formula recalculation
[LEARNED] `counter` property type exists (auto-generated codes)
[LEARNED] `_sharing` replaces old `_public` property
[LEARNED] Passkey (WebAuthn) auth added recently
[GOTCHA] Our code sets 12h token expiry but Entu docs say 48h
[GOTCHA] Best practice says NOT to proxy file uploads — but we must due to CORS
[GOTCHA] Property deletion is per-property-value \_id, NOT per property name
[GOTCHA] No batch/bulk endpoint — but can bundle multiple properties in single POST

## Server Test Coverage Audit (2026-03-08)

[LEARNED] server/ has 15 files, 3149 lines total. 0% real coverage (existing API tests only test MSW mocks)
[LEARNED] Best first targets: webhook-queue.ts (pure state machine), validation.ts (pure validators), webhook-validation.ts extractors
[LEARNED] ~900 lines testable as pure unit tests with no backend help (P1)
[LEARNED] entu-admin.ts has 2 pure extractors (extractGroupsFromPerson, extractGroupFromTask) amid API-dependent code
[LEARNED] onboard-join-group.test.ts exists but all 6 tests are skipped ("requires Nuxt runtime")
[CHECKPOINT] Full report sent to lead with 4-priority breakdown and role assignments (Tess vs Entu)

## Bug & Feature Research (2026-03-08)

[LEARNED] Dependency audit: 26 deps, clean tree, no duplicates. Minor: @types/supertest orphaned, dotenv/js-yaml possibly unused
[LEARNED] i18n: 131 keys, 0 missing, 1 unused (taskDetail.noTitle). knip NOT suitable for Nuxt without config.
[LEARNED] "Infinity km" bug: distance.js getLocationCoordinates() doesn't check location.coordinates format → null → Infinity
[LEARNED] PDF upload bug: ALLOWED_MIME_TYPES is images-only, no application/pdf. Duplicate whitelist in composable + component.
[LEARNED] "Open in Maps": InteractiveMap.vue:587, uses maps:// (iOS), geo: (Android), google.com/maps (desktop). iPad detection broken.

## Epic #31 Final Audit (2026-03-08)

[CHECKPOINT] Epic #31 audit: 1006 tests, 74.31% coverage (threshold 60%), 0 lint errors (34 warnings = complexity), typecheck clean. All 6 sub-issues (#32-#37) CLOSED. Only #39 (complexity) remains as new scope.
[LEARNED] types/ files (location.ts, onboarding.ts, priority.ts, workspace.ts) show 0% coverage — expected, they're pure type definitions

## Complexity Audit (2026-03-09)

[CHECKPOINT] Issue #39: 34→3 warnings (91% reduction). 31 fixed across all categories.
[LEARNED] Remaining 3 warnings in 2 files:

- useEntuAuth.ts:241 — cyclomatic 24 (critical, multi-branch token validation)
- task-assigned-to-class.post.ts:116 — cyclomatic 17 + cognitive 16 (webhook handler)

[LEARNED] All max-depth, duplicate-string, and no-identical-functions warnings fully resolved
[LEARNED] All original "critical >20" items fixed EXCEPT useEntuAuth.ts (dropped from 27→24 but still over 15)
