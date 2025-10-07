# ESMuseum Map App - API Documentation

## Overview

The ESMuseum Map App provides a Nuxt 3 server API that acts as a secure proxy to the Entu API, handling authentication and data transformation for the frontend application.

## Base URL

```text
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All API endpoints require authentication using Bearer tokens from the Entu OAuth flow.

```http
Authorization: Bearer <entu_oauth_token>
```

## Available APIs

### 1. Server API Endpoints

- **Purpose**: Secure, authenticated proxy to Entu API
- **Location**: `/server/api/`
- **Documentation**: [Server API Reference](./server-api.md)

### 2. Entu API Integration

- **Purpose**: Direct integration with Entu content management
- **Documentation**: [Entu API Reference](./entu-api.md)

## Quick Start

### 1. Authentication Setup

```javascript
// Get authentication token
const { token } = useEntuAuth();
```

### 2. Making API Calls

```javascript
// Example: Load locations for a map
const locations = await $fetch("/api/locations/68823f8b5d95233e69c29a07", {
  headers: {
    Authorization: `Bearer ${token.value}`,
  },
});
```

### 3. Error Handling

```javascript
try {
  const response = await $fetch("/api/endpoint", {
    headers: { Authorization: `Bearer ${token}` },
  });
} catch (error) {
  console.error("API Error:", error.statusCode, error.statusMessage);
}
```

## Endpoint Categories

| Category      | Endpoints          | Purpose                |
| ------------- | ------------------ | ---------------------- |
| **Locations** | `/api/locations/*` | Map location data      |
| **Tasks**     | `/api/tasks/*`     | Task management        |
| **Responses** | `/api/responses/*` | User response handling |
| **User**      | `/api/user/*`      | User profile data      |

## Development Tools

### HTTP Request Files

- Location: `/.copilot-docs/api-requests/`
- Use VS Code REST Client extension
- Files: `server-api.http`, `entu.http`

### Testing

```bash
# Run tests
npm run test

# Test specific API endpoints
npm run test:api
```

## Documentation Files

- [Server API Reference](./server-api.md) - Complete endpoint documentation
- [Entu API Integration](./entu-api.md) - Entu API usage patterns
- [Authentication Guide](./authentication.md) - Auth implementation details
- [Frontend Integration](./examples/frontend-usage.md) - Vue.js usage examples

## Support

- **Issues**: Create GitHub issues for bugs
- **Questions**: Check existing documentation first
- **Updates**: API changes documented in commit messages
