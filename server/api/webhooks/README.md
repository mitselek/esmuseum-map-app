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
  "user": { "_id": "editor_id" },
  "entity": { "_id": "person_id" }
}
```

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
  "user": { "_id": "editor_id" },
  "entity": { "_id": "task_id" }
}
```

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

- Webhook requests are validated using signature/token (when configured)
- Rate limiting prevents webhook spam
- All operations use privileged admin API key
- Comprehensive logging for audit trail

## Configuration

Required environment variables:

```bash
NUXT_ENTU_ADMIN_KEY=your_admin_key_here
NUXT_WEBHOOK_SECRET=your_webhook_secret_here
```

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
- Permission grants (success/failure)
- Error details (if any)

Check server logs for webhook activity.

## Future Enhancements

- Webhook retry mechanism
- Admin notification on failures
- Dashboard for monitoring webhook activity
- Bulk permission sync tool
