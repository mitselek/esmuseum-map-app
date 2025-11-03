# Student Task Access Flow

**Last Updated:** October 29, 2025

This document explains how students gain access to class tasks in the ESMuseum Map Application. The system uses a combination of Entu's permission inheritance model and automated webhooks to ensure reliable, synchronized access.

---

## Table of Contents

- [Overview](#overview)
- [Permission Model](#permission-model)
- [Access Mechanisms](#access-mechanisms)
  - [1. Manual Access (Student Signup)](#1-manual-access-student-signup)
  - [2. Automated Access (Webhooks)](#2-automated-access-webhooks)
- [Implementation Details](#implementation-details)
- [Why Two Mechanisms?](#why-two-mechanisms)
- [Troubleshooting](#troubleshooting)

---

## Overview

When a student joins a class (group), they need access to all tasks assigned to that class. The application provides this access through:

1. **Entu's parent-child relationship** (`_parent` reference)
2. **Permission inheritance** (`_parent_expander`)
3. **Automated webhook sync** (explicit `_expander` grants)

This multi-layered approach ensures students always have reliable access to their tasks.

---

## Permission Model

### Entity Relationships

```text
Group (grupp)
  ├── _expander: [task1, task2, ...]     # Tasks this group can access
  └── _parent: [person1, person2, ...]   # Students (children of group)

Person (person)
  ├── _parent: [groupId]                 # Student belongs to group
  ├── _parent_expander: [inherited]      # Inherits group's _expander
  └── _expander: [task1, task2, ...]     # Direct permissions (from webhooks)

Task (ulesanne)
  ├── grupp: [groupId]                   # Task assigned to group
  └── _expander: [groupId, person1, ...]  # Who can view this task
```

### Access Layers

#### Layer 1: Inheritance (Automatic)

- When person has `_parent: [groupId]`
- Entu automatically grants `_parent_expander` (inherits group's `_expander`)
- Person can see all tasks where group is in `_expander`

#### Layer 2: Direct Permissions (Webhook-Managed)

- Webhooks explicitly add person to task's `_expander` list
- Ensures access even if inheritance fails
- Provides explicit audit trail

---

## Access Mechanisms

### 1. Manual Access (Student Signup)

**When:** Student visits signup page and joins a group

**Flow:**

```text
1. Student visits /signup/[groupId]
2. Page clears any existing session (logout)
3. Student clicks "Start" → OAuth redirect to Entu
4. Student authenticates with Entu
5. Returns to /auth/callback with JWT token
6. Frontend calls joinGroup(groupId, userId)
7. Backend adds _parent reference to person entity
8. Frontend polls membership confirmation
9. Redirects to home page (/)
```

**Code Locations:**

**Frontend:**

- `app/pages/signup/[groupId].vue` - Signup page UI
- `app/composables/useOnboarding.ts` - Join group logic
  - `joinGroup(groupId, userId)` - Calls backend endpoint
  - `pollGroupMembership(groupId, userId)` - Confirms membership

**Backend:**

- `server/api/onboard/join-group.post.ts` - Join group endpoint

**What Happens in Backend:**

```typescript
// 1. Check if already a member
const existingMembers = await searchEntuEntities({
  "_type.string": "person",
  "_parent.reference": groupId,
});

// 2. Add _parent reference if not already member
await callEntuApi(`/entity/${userId}`, {
  method: "POST",
  body: JSON.stringify([
    {
      type: "_parent",
      reference: groupId,
    },
  ]),
});
```

**Result:**

- Person entity becomes child of group entity
- Inherits group's `_expander` as `_parent_expander`
- Can see all tasks assigned to the group

---

### 2. Automated Access (Webhooks)

The application provides **two webhook endpoints** that automatically synchronize permissions when entities change in Entu.

#### Webhook A: Student Added to Class

**File:** `server/api/webhooks/student-added-to-class.post.ts`

**Trigger:** Entu calls this webhook when a `person` entity is edited

**Purpose:** Grant student access to all tasks when they're added to a group

**Flow:**

```text
1. Teacher adds student to group in Entu (or student joins via signup)
2. Entu detects person entity edit
3. Entu calls webhook: POST /api/webhooks/student-added-to-class
4. Webhook extracts all groups from person's _parent references
5. Webhook queries all tasks assigned to those groups
6. Webhook grants _expander permission to person for each task
7. Returns success response
```

**Implementation Details:**

```typescript
async function processStudentWebhook(entityId, userToken) {
  // 1. Fetch person entity
  const entity = await getEntityDetails(entityId, userToken);

  // 2. Extract groups from _parent references
  const groupIds = extractGroupsFromPerson(entity);

  // 3. Get all tasks for all groups
  let allTasks = [];
  for (const groupId of groupIds) {
    const tasks = await getTasksByGroup(groupId, userToken);
    allTasks = allTasks.concat(tasks);
  }

  // 4. Grant permissions
  await batchGrantPermissions(
    taskIds, // All task IDs
    [entityId], // Student ID
    userToken
  );
}
```

**When This Runs:**

- Student completes signup flow
- Teacher manually adds student in Entu
- Student is moved between groups
- Any edit to person entity (triggers re-check)

---

#### Webhook B: Task Assigned to Class

**File:** `server/api/webhooks/task-assigned-to-class.post.ts`

**Trigger:** Entu calls this webhook when an `ulesanne` (task) entity is edited

**Purpose:** Grant all class students access when a new task is assigned

**Flow:**

```text
1. Teacher assigns task to group in Entu
2. Entu detects task entity edit
3. Entu calls webhook: POST /api/webhooks/task-assigned-to-class
4. Webhook extracts group from task's grupp reference
5. Webhook queries all students in that group
6. Webhook grants _expander permission to each student for the task
7. Returns success response
```

**Implementation Details:**

```typescript
async function processTaskWebhook(entityId, userToken) {
  // 1. Fetch task entity
  const entity = await getEntityDetails(entityId, userToken);

  // 2. Extract group from grupp reference
  const groupId = extractGroupFromTask(entity);

  // 3. Get all students in group
  const students = await getStudentsByGroup(groupId, userToken);

  // 4. Grant permissions
  await batchGrantPermissions(
    [entityId], // Task ID
    studentIds, // All student IDs
    userToken
  );
}
```

**When This Runs:**

- Teacher creates new task and assigns to group
- Teacher changes task's group assignment
- Task properties are edited (triggers re-check)

---

#### Webhook Features

**Queue System:**

- Each entity ID gets its own queue slot
- If webhook arrives while processing same entity → marked for reprocessing
- After completion, waits 2 seconds and reprocesses if marked
- Prevents duplicate work while ensuring final state is synced

**User Attribution:**

- Webhooks receive JWT token from user who triggered the action
- All API calls use that user's token (not admin key)
- Entu audit log shows which user granted permissions
- Proper attribution for compliance and security

**Error Handling:**

- Rate limiting (100 requests per minute)
- Webhook signature validation
- Comprehensive logging for audit trail
- Failed webhooks can be retried by re-editing entity

---

## Implementation Details

### Backend Utilities

**`server/utils/entu-admin.ts`** - Core API functions:

```typescript
// Get full entity details
getEntityDetails(entityId, userToken, userId, userEmail);

// Extract groups from person entity
extractGroupsFromPerson(entity) → [groupIds];

// Extract group from task entity
extractGroupFromTask(entity) → groupId;

// Query tasks assigned to group
getTasksByGroup(groupId, userToken) → [tasks];

// Query students in group
getStudentsByGroup(groupId, userToken) → [persons];

// Grant permissions in batch
batchGrantPermissions(taskIds, personIds, userToken);
```

**`server/utils/webhook-validation.ts`** - Security:

```typescript
// Validate webhook authenticity
validateWebhookRequest(event) → boolean;

// Validate payload structure
validateWebhookPayload(payload) → { valid, errors };

// Extract user token from webhook
extractUserToken(payload) → { token, userId, userEmail };

// Rate limiting
checkRateLimit(event, maxRequests, windowMs) → boolean;
```

**`server/utils/webhook-queue.ts`** - Queue management:

```typescript
// Enqueue webhook for processing
enqueueWebhook(entityId) → boolean;

// Mark processing complete, check for reprocessing
completeWebhookProcessing(entityId) → boolean;
```

### Frontend Composables

**`app/composables/useOnboarding.ts`** - Student signup:

```typescript
const { joinGroup, pollGroupMembership, state } = useOnboarding();

// Join a group
const response = await joinGroup(groupId, userId);

// Wait for confirmation
const confirmed = await pollGroupMembership(groupId, userId);
```

### API Endpoints

**`POST /api/onboard/join-group`** - Manual group join:

```typescript
Body: { groupId: string; userId: string };
Response: { success: boolean; error?: string };
```

**`GET /api/onboard/check-membership`** - Check membership:

```typescript
Query: ?groupId=xxx&userId=yyy;
Response: { isMember: boolean };
```

**`POST /api/webhooks/student-added-to-class`** - Student webhook:

```typescript
Body: { entity: { _id: personId }; token: "jwt..." };
Response: { success: boolean; permissions_granted: number };
```

**`POST /api/webhooks/task-assigned-to-class`** - Task webhook:

```typescript
Body: { entity: { _id: taskId }; token: "jwt..." };
Response: { success: boolean; permissions_granted: number };
```

---

## Why Two Mechanisms?

### Redundancy & Reliability

**Entu's inheritance _should_ be enough:**

- Person with `_parent: [groupId]` gets `_parent_expander`
- Inherits group's `_expander` permissions
- Can see all tasks where group is in `_expander`

**But webhooks add explicit permissions as backup:**

- Person added directly to task's `_expander` list
- Access works even if inheritance fails
- Explicit audit trail of who has access

### Two-Way Synchronization

**Student → Tasks (Student Added Webhook):**

- When student joins group
- Grant access to ALL existing tasks for that group
- Covers scenario: existing class, new student

**Task → Students (Task Assigned Webhook):**

- When task assigned to group
- Grant access to ALL existing students in that group
- Covers scenario: existing class, new task

Both directions = No missing permissions

### Real-World Benefits

1. **Teacher adds student manually in Entu** → Webhook grants access automatically
2. **Teacher creates new task** → All students get access immediately
3. **Student switches groups** → Permissions updated automatically
4. **Network issues during signup** → Webhooks fill any gaps
5. **Audit requirements** → Explicit permission grants logged

---

## Troubleshooting

### Student Can't See Tasks

**Diagnostic Steps:**

1. **Check group membership:**

   ```text
   GET /api/onboard/check-membership?groupId=xxx&userId=yyy
   ```

   Should return `{ isMember: true }`

2. **Check person entity in Entu:**

   - Open person entity in Entu admin
   - Verify `_parent` references include the group
   - Check `_parent_expander` shows inherited tasks

3. **Check task entity in Entu:**

   - Open task entity in Entu admin
   - Verify `grupp` references the group
   - Check `_expander` includes both group and students

4. **Check webhook logs:**

   ```bash
   # Look for webhook processing
   grep "student-added-to-class" logs/*.log
   grep "task-assigned-to-class" logs/*.log
   ```

5. **Manually trigger webhooks:**

   - Edit person entity in Entu (add comment or change field)
   - Edit task entity in Entu (add comment or change field)
   - Webhooks should fire and sync permissions

### Common Issues

#### Issue: "0 / 5 tasks" shown despite tasks existing

**Cause:** Task queries might be using wrong relationship property

**Solution:** Check that task loading uses `_parent_expander` or `_expander` in queries

---

#### Issue: Webhooks not firing

**Cause:** Webhook URLs not configured in Entu

**Solution:**

1. Contact Entu administrator
2. Configure webhook URLs:
   - `https://your-domain.com/api/webhooks/student-added-to-class`
   - `https://your-domain.com/api/webhooks/task-assigned-to-class`
3. Set trigger: "entity-edit-webhook" for person and ulesanne types

---

#### Issue: "401 Unauthorized" in webhook logs

**Cause:** JWT token expired (60-second validity)

**Solution:**

- Current limitation: Tokens expire after 60 seconds
- If processing takes longer, webhook fails
- Workaround: Re-edit entity to trigger new webhook
- Long-term: Request Entu extend token validity to 10 minutes

---

#### Issue: Permissions granted but student still can't see tasks

**Cause:** Frontend might be caching old task list

**Solution:**

- Refresh the page
- Check browser console for errors
- Clear localStorage and re-login
- Verify task loading composables query with correct properties

---

## Configuration

### Environment Variables

```bash
# Required
NUXT_PUBLIC_ENTU_URL=https://entu.app
NUXT_PUBLIC_ENTU_ACCOUNT=esmuuseum

# Optional - for webhook signature validation
NUXT_WEBHOOK_SECRET=your_webhook_secret_here
```

### Entu Webhook Configuration

**Required Webhook URLs:**

1. **Student Added to Class:**

   - URL: `https://your-domain.com/api/webhooks/student-added-to-class`
   - Trigger: `entity-edit-webhook`
   - Entity Type: `person`

2. **Task Assigned to Class:**

   - URL: `https://your-domain.com/api/webhooks/task-assigned-to-class`
   - Trigger: `entity-edit-webhook`
   - Entity Type: `ulesanne`

**Contact Entu administrator to configure these webhooks.**

---

## Testing

### Local Testing with Cloudflare Tunnel

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start tunnel
cloudflared tunnel --url http://localhost:3000
# Copy the tunnel URL (e.g., https://random-name.trycloudflare.com)

# Configure Entu webhooks with tunnel URLs:
# - https://random-name.trycloudflare.com/api/webhooks/student-added-to-class
# - https://random-name.trycloudflare.com/api/webhooks/task-assigned-to-class

# Test by:
# 1. Adding student to group in Entu
# 2. Assigning task to group in Entu
# 3. Check logs for webhook processing
```

### Manual Testing

```bash
# Test join-group endpoint
curl -X POST http://localhost:3000/api/onboard/join-group \
  -H "Content-Type: application/json" \
  -d '{"groupId": "686a6c011749f351b9c83124", "userId": "66b6245c7efc9ac06a437b97"}'

# Test webhook (requires valid JWT token)
curl -X POST http://localhost:3000/api/webhooks/student-added-to-class \
  -H "Content-Type: application/json" \
  -d '{
    "entity": {"_id": "66b6245c7efc9ac06a437b97"},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## Further Reading

- [Webhook Endpoint README](../../server/api/webhooks/README.md) - Detailed webhook documentation
- [Student Signup Guide](./student-signup-guide.md) - User-facing signup process
- [Entu API Documentation](https://github.com/entu/api) - Entu API reference
- [F020 Specification](../../specs/020-automated-student-access-webhooks/) - Original feature spec

---

## Related Files

**Backend:**

- `server/api/onboard/join-group.post.ts` - Manual group join
- `server/api/webhooks/student-added-to-class.post.ts` - Student webhook
- `server/api/webhooks/task-assigned-to-class.post.ts` - Task webhook
- `server/utils/entu-admin.ts` - Core API utilities
- `server/utils/webhook-validation.ts` - Security utilities
- `server/utils/webhook-queue.ts` - Queue management

**Frontend:**

- `app/pages/signup/[groupId].vue` - Signup page
- `app/composables/useOnboarding.ts` - Join group logic
- `app/composables/useTaskWorkspace.ts` - Task loading (respects permissions)

**Types:**

- `types/onboarding.ts` - Onboarding types
- `types/entu.ts` - Entity type definitions
