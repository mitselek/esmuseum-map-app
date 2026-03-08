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
