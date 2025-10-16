# Onboarding API Endpoints

**Feature**: Student Onboarding Flow (FEAT-001)  
**Version**: 1.0.0  
**Last Updated**: October 16, 2025

## Overview

The onboarding API provides two server endpoints for assigning students to groups and verifying membership. These endpoints are used during the student signup flow to integrate new users into the Estonian War Museum's educational platform.

## Endpoints

### 1. Join Group

Assigns a student (Entu person entity) to a group (Entu group entity) by creating a parent relationship.

#### Request

```http
POST /api/onboard/join-group
Content-Type: application/json
```

**Headers:**

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Webhook key for authentication: `Bearer <ENTU_WEBHOOK_KEY>` |

**Body:**

```typescript
{
  groupId: string  // Entu entity ID of the group (e.g., "686a6c011749f351b9c83124")
  userId: string   // Entu entity ID of the user (e.g., "66b6245c7efc9ac06a437b97")
}
```

**Example:**

```bash
curl -X POST https://esmuseum.app/api/onboard/join-group \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-webhook-key-here" \
  -d '{
    "groupId": "686a6c011749f351b9c83124",
    "userId": "66b6245c7efc9ac06a437b97"
  }'
```

#### Response

**Success (200 OK):**

```typescript
{
  success: true
  message: "User successfully assigned to group"
  alreadyMember?: boolean  // True if user was already a member (idempotent)
}
```

**Error (400 Bad Request):**

```typescript
{
  success: false
  message: "Missing required fields: groupId and userId"
}
```

**Error (401 Unauthorized):**

```typescript
{
  success: false
  message: "Invalid webhook key"
}
```

**Error (500 Internal Server Error):**

```typescript
{
  success: false
  message: "Failed to assign user to group"
  error?: string  // Detailed error message
}
```

#### Behavior

- **Idempotent**: Calling this endpoint multiple times with the same `groupId` and `userId` is safe. It will return success if the user is already a member.
- **Parent Relationship**: Creates an Entu relationship where the group is the user's parent (`_parent` property).
- **Logging**: All operations are logged with structured logging for debugging.

---

### 2. Check Membership

Verifies if a user is a member of a specific group.

**Request**:

```http
POST /api/onboard/check-membership
Content-Type: application/json
```

**Body:**

```typescript
{
  groupId: string  // Entu entity ID of the group
  userId: string   // Entu entity ID of the user
}
```

**Example:**

```bash
curl -X POST https://esmuseum.app/api/onboard/check-membership \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "686a6c011749f351b9c83124",
    "userId": "66b6245c7efc9ac06a437b97"
  }'
```

**Response**:

- **Success (200 OK):**

    ```typescript
    {
    isMember: boolean  // true if user is member of group, false otherwise
    }
    ```

    **Error (400 Bad Request):**

    ```typescript
    {
    isMember: false
    message: "Missing required fields: groupId and userId"
    }
    ```

- **Error (500 Internal Server Error):**

    ```typescript
    {
    isMember: false
    message: "Failed to check membership"
    error?: string  // Detailed error message
    }
    ```

**Behavior**:

- **No Authentication Required**: This endpoint is public and used by the client-side polling mechanism.
- **Search-Based**: Uses Entu's search API to find if the user has a `_parent` relationship with the group.
- **Fast**: Optimized for repeated polling (called every 2 seconds during signup).

---

## Authentication

### Webhook Key

The `/api/onboard/join-group` endpoint requires webhook authentication to prevent unauthorized group assignments.

**Setup:**

1. Set environment variable: `ENTU_WEBHOOK_KEY=your-secure-key-here`
2. Include in request header: `Authorization: Bearer your-secure-key-here`

**Security:**

- Never expose webhook key in client-side code
- Store in environment variables only
- Rotate key if compromised

---

## Integration Patterns

### Client-Side Flow

```typescript
import { useOnboarding } from '~/composables/useOnboarding'

const { state, joinGroup, pollGroupMembership } = useOnboarding()

// Step 1: Assign user to group
const response = await joinGroup(groupId, userId)

if (response.success) {
  // Step 2: Poll for membership confirmation
  const confirmed = await pollGroupMembership(groupId, userId)
  
  if (confirmed) {
    // Success! User is now a member
    router.push('/dashboard')
  } else {
    // Timeout or error
    console.error(state.value.error || 'Timeout')
  }
}
```

### Polling Strategy

The client polls `/api/onboard/check-membership` every **2 seconds** for up to **30 seconds** to confirm membership:

- **Interval**: 2000ms between requests
- **Timeout**: 30000ms total duration
- **Max Attempts**: 15 polls (30s / 2s)

This handles the eventual consistency of Entu's data synchronization.

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid webhook key | Check `ENTU_WEBHOOK_KEY` environment variable |
| 400 Bad Request | Missing groupId or userId | Ensure both fields are provided |
| 500 Internal Server Error | Entu API failure | Check Entu service status and credentials |
| Timeout (client-side) | Membership not confirmed in 30s | Ask user to retry or contact support |

### Debugging

Enable verbose logging:

```typescript
// Server-side logging is automatic
// Check logs for:
// - "onboard-join-group: ..." messages
// - "onboard-check-membership: ..." messages
```

---

## Rate Limiting

**Current**: No rate limiting implemented.

**Recommendation**: Add rate limiting to prevent abuse:

- `/api/onboard/join-group`: 10 requests per minute per IP
- `/api/onboard/check-membership`: 60 requests per minute per IP (allows 30s polling)

---

## Testing

### Unit Tests

```bash
npm run test tests/api/onboard-join-group.test.ts
npm run test tests/composables/useOnboarding.test.ts
```

### Manual Testing

1. **Join Group** (requires valid webhook key):

    ```bash
    # Replace with your actual values
    WEBHOOK_KEY="your-key"
    GROUP_ID="686a6c011749f351b9c83124"
    USER_ID="66b6245c7efc9ac06a437b97"

    curl -X POST http://localhost:3000/api/onboard/join-group \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $WEBHOOK_KEY" \
    -d "{\"groupId\":\"$GROUP_ID\",\"userId\":\"$USER_ID\"}"
    ```

2. **Check Membership**:

    ```bash
    curl -X POST http://localhost:3000/api/onboard/check-membership \
    -H "Content-Type: application/json" \
    -d "{\"groupId\":\"$GROUP_ID\",\"userId\":\"$USER_ID\"}"
    ```

---

## Dependencies

- **Entu API**: Requires valid Entu credentials (`ENTU_MASTER_ENTITY_ID`, `ENTU_API_KEY`)
- **Logger**: Uses `createLogger()` from `server/utils/logger.ts`
- **Helpers**: Uses `callEntuApi()`, `getEntuApiConfig()`, `searchEntuEntities()` from `server/utils/entu-helpers.ts`

---

## Related Documentation

- [User Guide: Student Signup](../guides/student-signup-guide.md)
- [FEAT-001 Specification](../../specs/030-student-onboarding-flow/spec.md)
- [Entu API Documentation](https://github.com/entu/api)

---

**Maintainer**: ESMuseum Development Team  
**Contact**: [GitHub Issues](https://github.com/your-org/esmuseum-map-app/issues)
