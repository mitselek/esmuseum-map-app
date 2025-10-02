# F020: Webhook Endpoints

This directory contains webhook endpoints that Entu will call to automate student access management.

## Endpoints

### POST /api/webhooks/student-added-to-class
**Purpose:** Automatically grant student access to all tasks when added to a class

**Trigger:** Entu webhook when `person._parent` references a `grupp`

**Flow:**
1. Receive webhook from Entu
2. Extract student ID and group ID
3. Query all tasks assigned to that group
4. Grant `_expander` permission to student for each task
5. Return success/failure response

### POST /api/webhooks/task-assigned-to-class
**Purpose:** Automatically grant all class students access when task is assigned

**Trigger:** Entu webhook when `ulesanne.grupp` is set/updated

**Flow:**
1. Receive webhook from Entu
2. Extract task ID and group ID
3. Query all students in that group
4. Grant `_expander` permission to each student for the task
5. Return success/failure response

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

To test webhooks locally, you can use tools like:
- curl
- Postman
- VS Code REST Client

Example test request:
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
