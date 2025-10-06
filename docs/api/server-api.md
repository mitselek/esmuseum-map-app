# Server API Reference

## Authentication

All endpoints require Bearer token authentication:

```http
Authorization: Bearer <entu_oauth_token>
```

## Endpoints

### Locations API

#### GET `/api/locations/[mapId]`

Retrieves all locations for a specific map.

**Parameters:**

- `mapId` (string): MongoDB ObjectId of the map

**Response:**

```json
{
  "entities": [
    {
      "_id": "location_id",
      "name": [{ "string": "Location Name" }],
      "properties": {
        "coordinates": [{ "value": "59.4370,24.7536" }]
      }
    }
  ],
  "count": 276
}
```

**Example:**

```javascript
const locations = await $fetch("/api/locations/68823f8b5d95233e69c29a07", {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Tasks API

#### GET `/api/tasks/[id]`

Retrieves a specific task by ID.

**Parameters:**

- `id` (string): Task ID

**Response:**

```json
{
  "entity": {
    "_id": "task_id",
    "name": [{ "string": "Task Name" }],
    "grupp": [{ "string": "Group Name" }],
    "vastuseid": [{ "number": 25 }]
  }
}
```

#### GET `/api/tasks/search`

Search for tasks based on query parameters.

**Query Parameters:**

- `_type.string` (string): Entity type (e.g., "ulesanne")
- `name` (string): Task name filter
- `limit` (number): Maximum results (default: 1000)

#### GET `/api/tasks/[taskId]/permissions`

Check user permissions for a specific task.

**Response:**

```json
{
  "canView": true,
  "canEdit": false,
  "canDelete": false
}
```

### Responses API

#### POST `/api/responses`

Create a new task response.

**Request Body:**

```json
{
  "taskId": "task_id",
  "responses": [
    {
      "questionId": "text-response",
      "value": "User response text",
      "type": "text"
    },
    {
      "questionId": "location-response",
      "value": "59.4370,24.7536",
      "type": "location"
    }
  ]
}
```

#### PUT `/api/responses/[id]`

Update an existing response.

#### GET `/api/responses/[taskId]`

Get user's response for a specific task.

**Response:**

```json
{
  "hasResponse": true,
  "response": {
    "_id": "response_id",
    "properties": {
      "text": [{ "value": "Response text" }],
      "geopunkt": [{ "value": "59.4370,24.7536" }]
    }
  }
}
```

#### GET `/api/responses/user`

Get all responses for the current user.

### User API

#### GET `/api/user/profile`

Get current user's profile information.

**Response:**

```json
{
  "user": {
    "_id": "user_id",
    "name": [{ "string": "User Name" }],
    "email": [{ "string": "user@example.com" }]
  }
}
```

## Error Handling

All endpoints return standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**

```json
{
  "statusCode": 400,
  "statusMessage": "Invalid map ID format"
}
```

## Rate Limiting

Currently no rate limiting is implemented, but consider:

- Reasonable request intervals
- Caching responses when possible
- Using proper error handling for failed requests

## Development Notes

- All endpoints use the server-side Entu API utilities
- Authentication is handled by the `withAuth` wrapper
- Responses are formatted consistently across endpoints
- Logging is implemented for debugging and monitoring
