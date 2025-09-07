# Entu Authentication Implementation

This document outlines how authentication with Entu is implemented in the ESMuseum Map application.

## Overview

The application uses Entu's API for authentication and data retrieval. The authentication flow follows these steps:

1. User initiates login from the application
2. App requests a token from Entu API using the private API key
3. Token is stored in the browser's localStorage
4. Token is used for all subsequent API requests
5. Token is refreshed automatically when needed

## Components

### 1. Environment Variables

Authentication requires the following environment variables:

```dotenv
# .env file
NUXT_ENTU_KEY=your_private_entu_key
NUXT_PUBLIC_ENTU_URL=https://entu.app
NUXT_PUBLIC_ENTU_ACCOUNT=esmuuseum
```

### 2. Authentication Composable (`useEntuAuth.js`)

This composable manages the authentication state and provides methods for logging in and out:

- `getToken()` - Authenticates with Entu and gets a token
- `refreshToken()` - Refreshes the token if needed
- `logout()` - Logs the user out
- `isAuthenticated` - Computed property that checks if user is authenticated
- `token` - The current authentication token
- `user` - User data if available

### 3. API Composable (`useEntuApi.js`)

This composable provides methods for interacting with the Entu API:

- `callApi()` - Makes authenticated API calls
- `getEntity()` - Gets an entity by ID
- `searchEntities()` - Searches for entities
- `createEntity()` - Creates a new entity
- `updateEntity()` - Updates an existing entity
- `deleteEntity()` - Deletes an entity
- `getEntityTypes()` - Gets all entity types
- `getEntitiesByType()` - Gets entities by type

### 4. Authentication Middleware (`pupil-auth.js`)

Client-side route protection is provided by `app/middleware/pupil-auth.js`:

- Checks if a user is authenticated in the browser
- Redirects to the login page if not authenticated
- Stores the original destination for redirect after login

Note: The older `app/middleware/auth.js` file has been removed. Use `pupil-auth` for client-side route guards. For server-side API routes use the `withAuth` wrapper from `server/utils/auth.ts` which decodes and validates request tokens and enforces authentication.

### 5. Login Page (`/login/index.vue`)

The login page initiates the authentication process:

- Shows login button
- Handles authentication errors
- Redirects to the original destination after login

## Usage

### Protecting a Route

To protect a route and require authentication, add the `auth` middleware to the page:

```vue
<script setup>
definePageMeta({
  middleware: ['pupil-auth']
})
</script>
```

### Making Authenticated API Calls

Use the `useEntuApi` composable to make API calls:

```vue
<script setup>
const { getEntitiesByType } = useEntuApi()

const fetchData = async () => {
  const response = await getEntitiesByType('kaart')
  // Handle response...
}
</script>
```

## Authentication Flow Diagram

```ascii
┌──────────┐     ┌───────────┐     ┌───────────┐
│          │     │           │     │           │
│  Client  │◄────┤  Nuxt.js  │◄────┤  Entu API │
│          │     │           │     │           │
└──────────┘     └───────────┘     └───────────┘
      │                │                  │
      │  Visit protected page             │
      │───────────────►│                  │
      │                │                  │
      │  Redirect to login if no token    │
      │◄───────────────│                  │
      │                │                  │
      │  Click login                      │
      │───────────────►│                  │
      │                │  Request token   │
      │                │─────────────────►│
      │                │                  │
      │                │  Return token    │
      │                │◄─────────────────│
      │                │                  │
      │  Store token & redirect to page   │
      │◄───────────────│                  │
      │                │                  │
      │  Make API request with token      │
      │───────────────►│                  │
      │                │  API request     │
      │                │─────────────────►│
      │                │                  │
      │                │  Return data     │
      │                │◄─────────────────│
      │  Return data                      │
      │◄───────────────│                  │
      │                │                  │
```

## References

- Entu API authentication is based on the approach seen in `entity-types-creation.http` and `scripts/fetch-entu-model.js`
- The authentication endpoint is `https://entu.app/api/auth?account=esmuuseum`
- API endpoints require a Bearer token in the Authorization header
- Token management is handled automatically by the composables

## Future Improvements

- Add token expiry detection and automatic refresh
- Add user profile management
- Implement role-based access control
- Add error handling for API rate limits
