# OAuth Implementation Quick Re### JWT Token Processing

```typescript
// Extract and decode JWT from callback URL
const urlParams = new URLSearchParams(window.location.search)
const jwtToken = urlParams.get('jwt')

// Process with composable
const { processOAuthCallback } = useEntuProfileAuth()
const result = await processOAuthCallback(jwtToken)

if (result.success) {
  // User profile saved to localStorage
  console.log('User:', result.userProfile.person.forename)
  console.log('Groups:', result.userProfile.groups.length)
}
```

**Status**: Working OAuth authentication with 5 providers  
**Last Updated**: sept 2025

## What We Built

**Authentication Method**: OAuth-only with provider selection  
**Providers**: Google, Smart-ID, Mobile-ID, ID-Card, Apple  
**Framework**: Nuxt 3 with client-side OAuth processing

## Key Implementation Details

### Environment Configuration

```bash
NUXT_ENTU_API_URL=https://entu.app
NUXT_ENTU_CLIENT_ID=esmuuseum
NUXT_PUBLIC_APP_URL=https://localhost:3000
```

### Critical OAuth URL Pattern

```typescript
// IMPORTANT: Callback URL must end with ?jwt= for Entu to append token
const callbackUrl = `${appUrl}/auth/callback?jwt=`;

// OAuth URL format for any provider
const oauthUrl = `${entuBaseUrl}/api/auth/${provider}?account=${accountName}&next=${encodedCallback}`;
```

### JWT Token Extraction

```typescript
// Entu redirects to: /auth/callback?jwt=TOKEN_HERE
const urlParams = new URLSearchParams(window.location.search);
const jwtToken = urlParams.get("jwt");
```

## Implementation Details

### localStorage Profile Structure

After successful authentication, two items are stored:

**Basic Profile** (`esmuseum_basic_profile`):
```json
{
  "userId": "686a6c011749f351b9c83124",
  "name": "Test User", 
  "email": "test@esmuseum.ee",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "tokenExpiry": 1637236800,
  "lastUpdated": "2024-12-20T10:30:00.000Z"
}
```

**Complete Profile** (`esmuseum_user_profile`):
```json
{
  "person": {
    "_id": "686a6c011749f351b9c83124",
    "forename": "Test User",
    "email": "test@esmuseum.ee",
    "_parent": [...]
  },
  "groups": [...],
  "authenticated_at": "2024-12-20T10:30:00.000Z", 
  "expires_at": "2024-12-21T10:30:00.000Z"
}
```

## File Locations

### Working Files

- `/pages/login/index.vue` - Provider selection with 5 OAuth buttons
- `/pages/auth/callback.vue` - JWT extraction from query params
- `.env` - Environment variables

### Not Yet Implemented

- `/composables/useEntuProfileAuth.js` - OAuth state management
- `/composables/useEntuApi.js` - Entu API calls

## Current Status

### ✅ Working

- Provider selection UI (5 providers)
- OAuth URL generation
- OAuth redirects to Entu
- JWT token callback and extraction
- **NEW**: JWT token decoding and user profile extraction
- **NEW**: Basic profile storage in localStorage

### 🚧 Needs Implementation

- Entu API person entity fetching (requires valid JWT from real OAuth)
- Complete group membership extraction via `_parent` relationships
- Session management and refresh

## Quick Rebuild Steps

1. **Set environment variables** (see above)
2. **Copy OAuth URL builder** with correct callback format
3. **Implement JWT extraction** from query parameters
4. **Create provider selection UI** with 5 buttons
5. **Add composables** for profile management

## Testing

Test OAuth URL generation:

```text
Expected Format: https://entu.app/api/auth/google?account=esmuuseum&next=https%3A//localhost%3A3000/auth/callback%3Fjwt%3D
```

Test callback URL:

```text
Expected Format: /auth/callback?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

**Key Insight**: The critical discovery was that Entu requires callback URLs ending with `?jwt=` to append the token correctly. This was the main issue we solved.
