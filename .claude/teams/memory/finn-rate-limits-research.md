# Entu API Rate Limits Research

## Findings Summary

**Official Entu API rate limit docs**: NOT PUBLICLY DOCUMENTED

The official Entu API repository (github.com/entu/entu-api) does NOT include rate limit documentation in README or public docs.

## Project-Specific Rate Limiting Implementation

### Webhook Rate Limiting (Project-Level)

**File**: `server/utils/webhook-validation.ts` (lines 157–208)

**Implementation**: Simple in-memory rate limiter per IP

```typescript
const requestCounts = new Map<string, { count: number, resetAt: number }>()

export function checkRateLimit(
  event: H3Event,
  maxRequests: number = 100,  // Default: 100 requests
  windowMs: number = 60000      // Default: 60 seconds (1 minute)
): boolean
```

**Usage** (both webhook handlers):

- `server/api/webhooks/student-added-to-class.post.ts` (line 101)
- `server/api/webhooks/task-assigned-to-class.post.ts` (line 73)

```typescript
const rateLimitOk = checkRateLimit(event, 100, 60000)
if (!rateLimitOk) {
  logger.warn('Rate limit exceeded')
  return error(429, 'Too many requests')
}
```

**Default thresholds**: 100 requests per IP per minute (webhook endpoint level)

---

### Entu API Token Validity Issue

**File**: `server/api/webhooks/README.md` (lines 414–422)

**Current limitation**: JWT tokens from Entu webhooks expire after **60 seconds**

```markdown
**Current:** JWT tokens expire after 60 seconds

**Challenge:** If webhook processing takes > 60s, token expires mid-process

**Solution:** Requesting Entu extend token validity to 10 minutes
```

**Implication for #3 analysis**:

- Webhook handlers processing many permission grants sequentially may hit 60s timeout
- Sequential approach is necessary here (not just rate limit, but token validity)

---

## Sequential vs Parallel Recommendations

### NO PUBLIC Entu Rate Limit Documented

Since Entu doesn't publish rate limits, we must infer from:

1. Token expiry patterns (60s limit suggests conservative API design)
2. Webhook success logs (permissions granted sequentially works in practice)
3. Project conventions (sequential processing in entu-admin.ts)

### Project Evidence: Sequential Works

**File**: `server/api/webhooks/README.md` (lines 268–279) — Log Example

```log
[INFO] Found groups for person: ['686a6c011749f351b9c83124']
[INFO] Found tasks for person's groups: 3 tasks
[INFO] Starting batch permission grant...
[INFO] Batch permission grant completed { successful: 3, skipped: 0 }
[INFO] Webhook processing completed { success: true, duration: ~850ms }
```

- Processing 3 tasks completes in ~850ms sequentially
- Token remains valid (60s available, 850ms used = safe margin)

---

## Recommendation for #3 Issues

### For Permission-Related Loops (safe to keep sequential)

**Files affected:**

- `student-added-to-class.post.ts:65, 81` — Permission grants
- `task-assigned-to-class.post.ts:179, 187` — While loops (not actual loops)
- `entu-admin.ts:290` — Permission checks

**Recommendation**: Keep sequential, add `eslint-disable` with rate-limit justification

**Rationale**:

- No published Entu rate limit docs, so conservative approach is safest
- 60s token validity window favors sequential processing
- Project logs show ~850ms for 3 tasks = safe margin
- Graceful error handling already in place

### For Upload/Style Loops (safe to parallelize)

**Files affected:**

- `useClientSideFileUpload.ts:273, 285` — Independent file uploads
- `useMapStyleScheduler.ts:171` — Independent rule checks

**Recommendation**: Parallelize with `Promise.all`

**Rationale**:

- No API calls → no rate limit concern
- File uploads to external storage (not Entu) → independent
- Rule evaluation is deterministic → order doesn't matter

---

## No .env Rate Limit Configuration

**File**: `.env.example`

No rate limit settings found. Project relies on hardcoded defaults:

```typescript
checkRateLimit(event, 100, 60000)  // 100 req/min per IP
```

---

## Key Finding: Conservative Default

The 60-second token validity window strongly suggests Entu's philosophy is:

- Sequential API operations preferred
- Tight feedback loops (user actions trigger webhooks fast)
- Not optimized for bulk parallelization

**Conclusion**: Sequential processing with proper justification comments is the safest approach for Entu API operations until official rate limit docs are published.
