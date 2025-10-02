# F020: Webhook Endpoints

This directory contains webhook endpoints that Entu will call to automate student access management.

## Endpoints

### POST /api/webhooks/student-added-to-class

**Purpose:** Automatically grant student access to all tasks when added to a class

**Trigger:** Entu webhook when a `person` entity is edited

**Entu Webhook Format:**

```json
{
  "db": "esmuuseum",
  "plugin": "entity-edit-webhook",
  "entity": { "_id": "person_id" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Authentication:** Uses JWT token from webhook (user who triggered the action)

**Flow:**

1. Receive webhook from Entu
2. Check webhook queue - debounce if same entity already processing
3. Extract entity ID from payload
4. Fetch full entity details from Entu API
5. Check if entity is a `person` with `_parent` references to `grupp` entities
6. For each parent group:
   - Query all tasks (`ulesanne`) assigned to that group
   - Grant `_expander` permission to person for each task (skip if already granted)
7. Check if entity was re-edited during processing → reprocess if needed
8. Return success/failure response

**Queue Strategy:**

- Each entity ID gets its own queue slot
- If webhook arrives while processing same entity → mark for reprocessing
- After processing completes, wait 2 seconds and reprocess if marked
- This ensures final state is always synced without duplicate work

### POST /api/webhooks/task-assigned-to-class

**Purpose:** Automatically grant all class students access when task is assigned

**Trigger:** Entu webhook when an `ulesanne` (task) entity is edited

**Entu Webhook Format:**

```json
{
  "db": "esmuuseum",
  "plugin": "entity-edit-webhook",
  "entity": { "_id": "task_id" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Authentication:** Uses JWT token from webhook (user who triggered the action)

**Flow:**

1. Receive webhook from Entu
2. Check webhook queue - debounce if same entity already processing
3. Extract entity ID from payload
4. Fetch full entity details from Entu API
5. Check if entity is an `ulesanne` with `grupp` reference
6. Query all students (`person`) in that group (where `_parent` references the group)
7. Grant `_expander` permission to each student for the task (skip if already granted)
8. Check if entity was re-edited during processing → reprocess if needed
9. Return success/failure response

**Queue Strategy:**

- Each entity ID gets its own queue slot
- If webhook arrives while processing same entity → mark for reprocessing
- After processing completes, wait 2 seconds and reprocess if marked
- This ensures final state is always synced without duplicate work

## Security

- Webhook requests validated using signature/token (when configured)
- Rate limiting prevents webhook spam
- **User authentication:** All operations use JWT token from webhook (proper user attribution)
- Comprehensive logging for audit trail

## Configuration

Required environment variables:

```bash
# Required
NUXT_PUBLIC_ENTU_URL=https://entu.app
NUXT_PUBLIC_ENTU_ACCOUNT=esmuuseum

# Optional - for webhook signature validation
NUXT_WEBHOOK_SECRET=your_webhook_secret_here
```

**Note:** User JWT tokens are required in webhook payload. No admin API key needed!

## Testing

### Local Testing with Cloudflare Tunnel

To receive webhooks from Entu during development:

1. **Start your dev server:**

   ```bash
   npm run dev
   ```

2. **In a new terminal, start Cloudflare Tunnel:**

   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

   This will give you a public URL like `https://random-name.trycloudflare.com`

3. **Configure Entu webhooks** with your tunnel URL:

   - `https://your-tunnel-url.trycloudflare.com/api/webhooks/student-added-to-class`
   - `https://your-tunnel-url.trycloudflare.com/api/webhooks/task-assigned-to-class`

4. **Test by triggering events in Entu:**
   - Add a student to a class
   - Assign a task to a class

### Manual Testing

You can also test locally with tools like curl, Postman, or VS Code REST Client:

```bash
curl -X POST http://localhost:3000/api/webhooks/student-added-to-class \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: your_secret" \
  -d '{
    "entity_id": "66b6245c7efc9ac06a437b97",
    "property": "_parent",
    "value": {
      "reference": "686a6c011749f351b9c83124",
      "entity_type": "grupp"
    }
  }'
```

## Monitoring

All webhook events are logged with:

- Timestamp
- Entity IDs involved
- User who initiated the action
- Permission grants (success/failure)
- Processing duration
- Error details (if any)

Check server logs for webhook activity.

## Troubleshooting

### Common Issues

#### 1. "Missing token in webhook payload"

**Symptom:** Webhook fails with 401 error about missing token

**Cause:** Entu webhook didn't include JWT token

**Solution:**

- Verify webhook is configured correctly in Entu
- Check that webhook plugin is `entity-edit-webhook`
- Ensure Entu version supports token field in webhooks

#### 2. "Token expired" or 401 Unauthorized

**Symptom:** Webhook processing fails partway through with token expiry

**Cause:** JWT token expired (currently 60-second validity)

**Solution:**

- If processing takes > 60s, webhook will fail
- Request Entu extend token validity to 10 minutes
- Check for slow API responses causing delays
- User can re-trigger by re-editing entity

#### 3. Webhook Queue Backing Up

**Symptom:** Webhooks taking long time to process

**Cause:** Multiple webhooks for same entity stacking up

**Solution:**

- Queue system automatically debounces per entity
- Different entities process in parallel
- Check logs for which entity is blocking
- Verify Entu API is responding quickly

#### 4. Permissions Not Granted

**Symptom:** Webhook completes but permissions missing

**Cause:** Could be several issues

**Solutions:**

- Check logs for "Permission already exists" (might already be granted)
- Verify entity structure (student has `_parent` to group, task has `grupp` reference)
- Check user token has sufficient permissions
- Verify group entity exists and is correct type

#### 5. "jwt audience invalid" (Historical)

**Symptom:** 401 error about JWT audience

**Cause:** This was an issue when Entu had IP validation

**Status:** ✅ RESOLVED - Entu removed IP validation

**Note:** If you see this, Entu may have re-enabled IP validation. Contact Entu support.

### Debugging Steps

1. **Check webhook payload:**

   ```log
   [INFO] Extracted user token from webhook { userId: '...', userEmail: '...' }
   ```

   If missing, webhook didn't include token.

2. **Check entity structure:**

   ```log
   [INFO] Found groups for person: [...]
   [INFO] Found tasks for person's groups: [...]
   ```

   If empty, entity might not have expected references.

3. **Check permission grants:**

   ```log
   [INFO] Batch permission grant completed { successful: X, skipped: Y }
   ```

   Skipped means already had permission (normal).

4. **Check processing time:**

   ```log
   [INFO] Webhook processing completed { success: true, duration: ~800ms }
   ```

   If > 60s, token might expire.

### Log Examples

**Successful webhook:**

```log
[INFO] Webhook received: student-added-to-class
[INFO] Extracted user token from webhook { userId: '...', userEmail: '...' }
[INFO] Webhook initiated by user { userId: '...', userEmail: '...' }
[INFO] Processing student webhook { entityId: '...', userEmail: '...', initiatedBy: '...' }
[INFO] Found groups for person: ['686a6c011749f351b9c83124']
[INFO] Found tasks for person's groups: 3 tasks
[INFO] Starting batch permission grant...
[INFO] Batch permission grant completed { successful: 3, skipped: 0 }
[INFO] Webhook processing completed { success: true, duration: ~850ms }
```

**Failed webhook (missing token):**

```log
[ERROR] Webhook validation failed: Missing token in webhook payload
[ERROR] Webhook processing failed { error: 'Missing token', entityId: '...' }
```

**Failed webhook (expired token):**

```log
[INFO] Webhook received: task-assigned-to-class
[INFO] Extracted user token from webhook { userId: '...', userEmail: '...' }
[INFO] Processing task webhook...
[ERROR] Failed to grant permissions: 401 Unauthorized - Token expired
[ERROR] Webhook processing failed { error: 'Token expired', entityId: '...' }
```

### Getting Help

If webhooks are failing:

1. **Check logs** - Most issues are visible in server logs
2. **Verify entity structure** - Use Entu UI to check entity relationships
3. **Test manually** - Try granting permission manually to see if it's a webhook issue or permission issue
4. **Check token** - Use JWT debugger (jwt.io) to decode token and verify contents
5. **Contact support** - If issue persists, provide logs and entity IDs

### Token Requirements

**Required in webhook payload:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token must contain:**

- `user.email` - User's email address
- `accounts.esmuuseum` - User's ID in esmuuseum database
- `exp` - Expiration timestamp (must be future)

**Current limitation:** Tokens expire in 60 seconds. Requesting Entu extend to 10 minutes.

## User Token Authentication - Implementation Story

### ✅ Problem Resolved: JWT Tokens Work

The webhook system now uses **user JWT tokens** from webhooks for all API calls, providing proper user attribution for every permission grant.

### Timeline & Resolution

1. **Initial Challenge**: Tried to use user JWT tokens from Entu webhooks
2. **Issue Discovered**: Entu validated source IP server-side, causing `401 jwt audience invalid. expected: 82.131.122.238` errors
3. **Temporary Solution**: Implemented hybrid approach - extract user info for logging, use admin API key for actual calls
4. **Entu Fixed It**: 🎉 Entu removed IP validation for webhook tokens!
5. **Current Status**: ✅ **User JWT tokens work perfectly** - no admin key needed!

### What Changed in Entu

**Before:** JWT tokens had server-side IP validation

- Token generated when user at IP `82.131.122.238` edited entity
- Entu recorded the user's IP internally
- When webhook server (different IP) tried to use token → rejected with "jwt audience invalid"
- This was a security feature to prevent token theft/replay attacks

**After:** Entu removed IP validation

- Webhook JWT tokens now work from any IP
- Enables proper server-side API calls
- Maintains security through HTTPS and registered webhook URLs

### Token Structure

Entu webhook JWT tokens contain:

```json
{
  "user": {
    "email": "user@example.com"
  },
  "accounts": {
    "esmuuseum": "user_id"
  },
  "iat": 1759405472,
  "exp": 1759405532
}
```

**Note:** There is **NO `aud` (audience) claim** in the token itself. The previous IP validation happened entirely on Entu's server side.

### Implementation Details

**Webhook Validation (`server/utils/webhook-validation.ts`):**

- `validateWebhookPayload()` - Changed from expecting `user: { _id }` to `token: "jwt..."`
- `extractUserToken()` - Decodes JWT and extracts user email and ID

**Admin API Utilities (`server/utils/entu-admin.ts`):**

- `getAdminApiConfig(userToken, userId, userEmail)` - Requires user token, throws 401 if missing
- All API functions accept `userToken`, `userId`, `userEmail` parameters
- No admin API key fallback (token required!)

**Webhook Handlers:**

- Both endpoints extract token using `extractUserToken()`
- Pass user token to all API function calls
- Log user attribution for audit trail

### Benefits of User Token Approach

✅ **Proper Attribution**

- Each permission grant shows which user triggered it in Entu's audit log
- Clear responsibility chain
- Accurate audit trail

✅ **Better Security**

- No need to store highly privileged admin API key
- If user loses admin rights, their webhooks can't grant permissions
- Follows principle of least privilege

✅ **Compliance**

- Each action properly attributed to real person
- Better audit trail for regulatory compliance
- No ambiguity about who performed actions

### Token Validity & Limitations

**Current:** JWT tokens expire after **60 seconds**

**Challenge:** If webhook processing takes > 60s, token expires mid-process

**Solution:** Requesting Entu extend token validity to **10 minutes**

**Workaround:** If token expires, webhook fails with clear error. User can re-trigger by re-editing entity.

### How Tokens Are Used

```typescript
// 1. Extract token from webhook payload
const { token, userId, userEmail } = extractUserToken(payload);

// 2. Pass to all API calls
const entity = await getEntityDetails(entityId, token, userId, userEmail);
const tasks = await getTasksByGroup(groupId, token, userId, userEmail);
await batchGrantPermissions(taskIds, studentIds, token, userId, userEmail);

// 3. Entu logs show real user (not system account) made the changes
```

## Future Enhancements

- Request Entu extend token validity from 60s to 10 minutes
- Webhook signature validation (HMAC) for additional security layer
- Admin notification on failures
- Dashboard for monitoring webhook activity
- Bulk permission sync tool for backfilling existing students
