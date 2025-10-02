# Feature F020: Automated Student Access Management via Webhooks

## Status: PLANNING 🎯

## Overview

Automate student access permissions when students are added to classes or tasks are assigned to classes. This eliminates manual permission management and ensures students can immediately access and respond to assigned tasks.

## Problem Statement

Currently, when:

- A new student (`person`) is added to a class (`grupp`)
- OR a task (`ulesanne`) is assigned to a class (`grupp`)

Students may not automatically have the `_expander` permission on the task entity, which is required to create responses (`vastus`) as child entities.

## Solution

Implement two webhook endpoints that Entu will call automatically:

1. **Student Added to Class**: Grant student access to all tasks assigned to that class
2. **Task Assigned to Class**: Grant all class members access to that task

Both endpoints use a privileged API key stored in `.env` to manage permissions.

---

## Data Model Understanding

### Entity Relationships

```text
person (student)
  └─ _parent → grupp (class)
       └─ referenced by → ulesanne.grupp (task assignment)
            └─ needs _expander permission → to create → vastus (response)
```

### Key Entities

**grupp (Class)**  

```json
{
  "_id": "686a6c011749f351b9c83124",
  "name": "esimene klass",
  "_type": "grupp"
}
```

**person (Student)**  

```json
{
  "_id": "66b6245c7efc9ac06a437b97",
  "_type": "person",
  "_parent": [
    { "reference": "686a6c011749f351b9c83124", "entity_type": "grupp" }
  ]
}
```

**ulesanne (Task)**  

```json
{
  "_id": "68bab85d43e4daafab199988",
  "_type": "ulesanne",
  "grupp": [{ "reference": "686a6c011749f351b9c83124", "entity_type": "grupp" }]
}
```

### Permission Model

**`_expander` Permission**

- Allows entity to create child entities under the target entity
- Students need `_expander` on `ulesanne` to create `vastus` responses
- Format in Entu:

```json
{
  "type": "_expander",
  "reference": "<person_id>"
}
```

---

## Technical Design

### Webhook Endpoints

#### 1. `/api/webhooks/student-added-to-class`

**Trigger:** Entu webhook when `person._parent` references a `grupp`

**Request Payload** (from Entu):

```json
{
  "event": "entity.property.create",
  "entity_id": "<person_id>",
  "property": "_parent",
  "value": {
    "reference": "<grupp_id>",
    "entity_type": "grupp"
  }
}
```

**Logic:**

1. Validate webhook authenticity (signature/token if Entu provides)
2. Extract `person_id` and `grupp_id`
3. Query Entu: Find all `ulesanne` where `grupp` references `grupp_id`
4. For each task:
   - POST `_expander` permission for `person_id` to task entity
5. Return success/failure response

#### 2. `/api/webhooks/task-assigned-to-class`

**Trigger:** Entu webhook when `ulesanne.grupp` is set/updated

**Request Payload** (from Entu):

```json
{
  "event": "entity.property.create",
  "entity_id": "<ulesanne_id>",
  "property": "grupp",
  "value": {
    "reference": "<grupp_id>",
    "entity_type": "grupp"
  }
}
```

**Logic:**

1. Validate webhook authenticity
2. Extract `ulesanne_id` and `grupp_id`
3. Query Entu: Find all `person` entities where `_parent` references `grupp_id`
4. For each student:
   - POST `_expander` permission for `person_id` to task entity
5. Return success/failure response

---

## Implementation Plan

### Phase 1: Core Infrastructure ✅

#### 1.1 Environment Configuration

- [ ] Add `NUXT_ENTU_ADMIN_KEY` to `.env` (privileged key)
- [ ] Add `NUXT_WEBHOOK_SECRET` to `.env` (for webhook validation)
- [ ] Update `.env.example` with new variables

#### 1.2 Entu API Utilities (Server-side)

- [ ] Create `server/utils/entu-admin.ts` with privileged API functions:
  - `getAdminClient()` - Initialize admin API client
  - `addExpanderPermission(entityId, personId)` - Grant \_expander permission
  - `getTasksByGroup(gruppId)` - Query tasks by group
  - `getStudentsByGroup(gruppId)` - Query students by group

### Phase 2: Webhook Endpoints ✅

#### 2.1 Student Added Webhook

- [ ] Create `server/api/webhooks/student-added-to-class.post.ts`
  - Validate webhook payload
  - Extract student and group IDs
  - Fetch all tasks for that group
  - Grant \_expander permission to student for each task
  - Handle errors gracefully
  - Return appropriate status codes

#### 2.2 Task Assigned Webhook

- [ ] Create `server/api/webhooks/task-assigned-to-class.post.ts`
  - Validate webhook payload
  - Extract task and group IDs
  - Fetch all students in that group
  - Grant \_expander permission to each student for the task
  - Handle errors gracefully
  - Return appropriate status codes

### Phase 3: Security & Validation ✅

#### 3.1 Webhook Authentication

- [ ] Implement webhook signature validation (if Entu provides)
- [ ] Add request rate limiting
- [ ] Add IP whitelist (if Entu has fixed IPs)

#### 3.2 Idempotency

- [ ] Check if permission already exists before adding
- [ ] Handle duplicate webhook calls gracefully
- [ ] Log all permission grants for audit trail

### Phase 4: Error Handling & Monitoring ✅

#### 4.1 Error Handling

- [ ] Implement retry logic for failed Entu API calls
- [ ] Create error notification system (email/Slack?)
- [ ] Store failed webhooks for manual review

#### 4.2 Logging

- [ ] Add comprehensive logging for all webhook events
- [ ] Create dashboard/logs page for monitoring webhook activity
- [ ] Track permission grant statistics

### Phase 5: Testing ✅

#### 5.1 Unit Tests

- [ ] Test webhook payload parsing
- [ ] Test permission granting logic
- [ ] Test error scenarios

#### 5.2 Integration Tests

- [ ] Test full flow: student added → permissions granted
- [ ] Test full flow: task assigned → permissions granted
- [ ] Test edge cases (student already has access, etc.)

#### 5.3 Manual Testing

- [ ] Create test script to simulate Entu webhooks
- [ ] Test with real Entu data in staging
- [ ] Verify permissions in Entu UI

### Phase 6: Documentation ✅

- [ ] Document webhook endpoints (OpenAPI/Swagger?)
- [ ] Create Entu webhook configuration guide
- [ ] Update developer documentation
- [ ] Add troubleshooting guide

---

## Technical Questions to Resolve

### 1. Entu Webhook Specification

- **Question:** What is the exact webhook payload format?
- **Action:** Review Entu documentation or request webhook spec
- **Status:** PENDING

### 2. Webhook Authentication

- **Question:** Does Entu send any authentication headers/signatures?
- **Action:** Check Entu webhook docs for security mechanisms
- **Status:** PENDING

### 3. API Rate Limits

- **Question:** Are there Entu API rate limits we need to consider?
- **Action:** Check Entu API documentation
- **Status:** PENDING

### 4. Permission Check API

- **Question:** Is there an Entu API to check if permission already exists?
- **Action:** Review Entu API docs for GET permission endpoint
- **Status:** PENDING

### 5. Batch Permission API

- **Question:** Can we grant permissions in batch, or one-by-one?
- **Action:** Check if Entu supports batch operations
- **Status:** PENDING

---

## API Specification (Draft)

### POST /api/webhooks/student-added-to-class

**Request:**

```json
{
  "event": "entity.property.create",
  "entity_id": "66b6245c7efc9ac06a437b97",
  "property": "_parent",
  "value": {
    "reference": "686a6c011749f351b9c83124",
    "entity_type": "grupp"
  }
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Student access granted",
  "student_id": "66b6245c7efc9ac06a437b97",
  "group_id": "686a6c011749f351b9c83124",
  "tasks_updated": 5,
  "permissions_granted": [
    "68bab85d43e4daafab199988",
    "68bab85d43e4daafab199989"
  ]
}
```

**Response (Error):**

```json
{
  "success": false,
  "message": "Failed to grant permissions",
  "error": "Entu API error: Invalid credentials",
  "student_id": "66b6245c7efc9ac06a437b97",
  "group_id": "686a6c011749f351b9c83124"
}
```

### POST /api/webhooks/task-assigned-to-class

**Request:**

```json
{
  "event": "entity.property.create",
  "entity_id": "68bab85d43e4daafab199988",
  "property": "grupp",
  "value": {
    "reference": "686a6c011749f351b9c83124",
    "entity_type": "grupp"
  }
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Task access granted to all students",
  "task_id": "68bab85d43e4daafab199988",
  "group_id": "686a6c011749f351b9c83124",
  "students_updated": 12,
  "permissions_granted": [
    "66b6245c7efc9ac06a437b97",
    "66b6245c7efc9ac06a437b98"
  ]
}
```

---

## Environment Variables

### New Variables Required

```bash
# .env

# Privileged Entu API key with admin permissions
NUXT_ENTU_ADMIN_KEY=your_admin_key_here

# Secret for validating webhook authenticity (if supported by Entu)
NUXT_WEBHOOK_SECRET=your_webhook_secret_here

# Optional: Entu webhook IP whitelist (comma-separated)
NUXT_WEBHOOK_ALLOWED_IPS=192.168.1.1,10.0.0.1
```

---

## Security Considerations

### 1. API Key Security

- **Risk:** Admin key has privileged access
- **Mitigation:**
  - Store in `.env` only (never commit)
  - Use environment-specific keys (dev/staging/prod)
  - Rotate keys periodically

### 2. Webhook Validation

- **Risk:** Malicious actors could call webhook endpoints
- **Mitigation:**
  - Validate webhook signatures (if Entu provides)
  - IP whitelist
  - Rate limiting

### 3. Permission Scope

- **Risk:** Granting too many permissions
- **Mitigation:**
  - Only grant `_expander` (minimal permission needed)
  - Log all permission grants
  - Regular audit of permissions

### 4. Error Disclosure

- **Risk:** Error messages might leak sensitive info
- **Mitigation:**
  - Return generic error messages to webhook caller
  - Log detailed errors server-side only
  - Don't expose internal entity IDs in public errors

---

## Success Criteria

### Functional Requirements

- ✅ When student added to class → automatic access to all class tasks
- ✅ When task assigned to class → automatic access for all class students
- ✅ Permissions granted within 5 seconds of webhook trigger
- ✅ Zero manual permission management needed

### Non-Functional Requirements

- ✅ 99.9% webhook reliability
- ✅ Graceful handling of Entu API failures
- ✅ Comprehensive audit logs
- ✅ Clear error notifications for admins

---

## Open Questions

1. **Webhook Payload Format:** Need exact Entu webhook specification
2. **Webhook Authentication:** How does Entu authenticate webhook calls?
3. **Permission API:** Best way to check/grant permissions in Entu?
4. **Batch Operations:** Can we batch permission grants for better performance?
5. **Notification:** How should admins be notified of failures?
6. **Existing Students:** Should we backfill permissions for existing students when implementing?

---

## Next Steps

1. **Research Phase:**

   - [ ] Get Entu webhook documentation
   - [ ] Understand Entu permission API
   - [ ] Review Entu webhook authentication options

2. **MVP Development:**

   - [ ] Start with Phase 1 (Infrastructure)
   - [ ] Implement one webhook endpoint first (student-added)
   - [ ] Test thoroughly before implementing second endpoint

3. **Production Deployment:**
   - [ ] Configure webhooks in Entu
   - [ ] Monitor initial webhook calls
   - [ ] Adjust based on real-world data

---

## Related Features

- **F015**: File upload proxy (similar server-side Entu API integration)
- **Authentication System**: Uses similar Entu API patterns
- **Permission Management**: Core to entire task/response system

---

## Notes

- This feature is **critical** for user experience - without it, manual intervention is required for every new student or task
- Consider implementing a **manual sync button** in admin UI as backup
- May want to add **permission removal** webhooks in the future (student removed from class, task unassigned)
