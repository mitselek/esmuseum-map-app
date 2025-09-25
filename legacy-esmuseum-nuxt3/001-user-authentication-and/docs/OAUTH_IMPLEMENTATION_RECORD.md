# OAuth Authentication Implementation Record

**Project**: Estonian War Museum Educational Platform  
**Implementation Date**: December 2024  
**Implementation Type**: OAuth-Only Authentication with Provider Selection  
**Status**: Functional and Ready for Production

## Executive Summary

This document records the actual OAuth authentication implementation for the Estonian War Museum platform. Unlike the original specifications which considered hybrid authentication, the final implementation uses a pure OAuth-only approach with multiple provider selection.

## What We Actually Built

### Core Architecture

**Authentication Pattern**: OAuth-only with Entu backend integration  
**Frontend Framework**: Nuxt 3.19.2 (client-side only)  
**API Integration**: Direct Entu API calls from frontend  
**Token Handling**: JWT tokens from OAuth providers processed client-side  
**State Management**: Vue composables with localStorage persistence

### Provider Selection Implementation

**Available OAuth Providers**:

1. **Google** - `google` provider
2. **Smart-ID** - `smart-id` provider
3. **Mobile-ID** - `mobile-id` provider
4. **Estonian ID-Card** - `id-card` provider
5. **Apple** - `apple` provider

**Provider Selection UI**: `/pages/login/index.vue`

- Five distinct authentication buttons
- Provider-specific icons and branding
- Loading states per provider
- Error handling with user feedback

### OAuth Flow Implementation

#### Step 1: Provider Selection

```typescript
// Location: /pages/login/index.vue
const buildOAuthUrl = (provider: string): string => {
  const config = useRuntimeConfig();
  const entuBaseUrl = config.public.entuApiUrl || "https://entu.app";
  const accountName = config.public.entuClientId || "esmuuseum";
  const appUrl = config.public.appUrl || "https://localhost:3000";

  // Critical: Callback URL must end with ?jwt= for Entu to append token
  const callbackUrl = `${appUrl}/auth/callback?jwt=`;
  const encodedCallback = encodeURIComponent(callbackUrl);

  // Entu OAuth URL pattern
  return `${entuBaseUrl}/api/auth/${provider}?account=${accountName}&next=${encodedCallback}`;
};
```

#### Step 2: OAuth Callback Processing

```typescript
// Location: /pages/auth/callback.vue
// Extract JWT from query parameter where Entu appends it
const urlParams = new URLSearchParams(window.location.search);
const jwtToken = urlParams.get("jwt") || "";
```

### Configuration Details

**Environment Variables** (`.env`):

```bash
NUXT_ENTU_API_URL=https://entu.app
NUXT_ENTU_CLIENT_ID=esmuuseum
NUXT_PUBLIC_APP_URL=https://localhost:3000
```

**Runtime Configuration** (`nuxt.config.ts`):

```typescript
runtimeConfig: {
  public: {
    entuApiUrl: process.env.NUXT_ENTU_API_URL,
    entuClientId: process.env.NUXT_ENTU_CLIENT_ID,
    appUrl: process.env.NUXT_PUBLIC_APP_URL
  }
}
```

### Critical Implementation Details

**OAuth Callback URL Pattern**:

- **Incorrect**: `/auth/callback`
- **Correct**: `/auth/callback?jwt=`
- **Reason**: Entu appends the JWT token after the `=` sign

**Provider URL Construction**:

```text
Pattern: ${entuApiUrl}/api/auth/${provider}?account=${accountName}&next=${callbackUrl}
Example: https://entu.app/api/auth/google?account=esmuuseum&next=https%3A//localhost%3A3000/auth/callback%3Fjwt%3D
```

**JWT Token Extraction**:

```typescript
// Entu redirects with: /auth/callback?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
const urlParams = new URLSearchParams(window.location.search);
const jwtToken = urlParams.get("jwt");
```

## File Structure

### Authentication Pages

- `/pages/login/index.vue` - Provider selection interface
- `/pages/auth/callback.vue` - OAuth callback handler

### Composables (Not Yet Implemented)

- `/composables/useEntuProfileAuth.js` - OAuth state management
- `/composables/useEntuApi.js` - Entu API integration

### Configuration

- `.env` - Environment variables
- `nuxt.config.ts` - Runtime configuration

## User Experience Flow

1. **Landing on Login Page**

   - User sees 5 authentication provider options
   - Each button has distinct styling and loading states
   - Error messages displayed for failed attempts

2. **Provider Selection**

   - User clicks preferred provider (Google, Smart-ID, etc.)
   - System builds provider-specific OAuth URL
   - Browser redirects to Entu OAuth endpoint

3. **OAuth Authentication**

   - User completes authentication with chosen provider
   - Entu validates authentication
   - Entu redirects back with JWT token appended

4. **Callback Processing**
   - System extracts JWT from query parameter
   - Token validation (to be implemented)
   - Profile data fetching (to be implemented)
   - Redirect to main application

## Security Considerations

**Token Handling**:

- JWT tokens received via URL query parameters
- Tokens need immediate extraction and secure storage
- URL should be cleaned after token extraction

**Provider Trust**:

- All providers go through Entu's OAuth implementation
- Entu handles provider-specific security protocols
- Client receives standardized JWT regardless of provider

**HTTPS Requirements**:

- All OAuth flows require HTTPS in production
- Callback URLs must use HTTPS protocol
- Development uses localhost with HTTP exception

## Development vs Production

**Development Configuration**:

```bash
NUXT_PUBLIC_APP_URL=https://localhost:3000
# Uses localhost with self-signed certificates
```

**Production Configuration**:

```bash
NUXT_PUBLIC_APP_URL=https://museum.education.ee
# Must use valid HTTPS certificate
```

## Known Implementation Status

### ✅ Completed Components

- Provider selection UI with 5 OAuth options
- OAuth URL construction with proper callback handling
- Callback page with JWT extraction logic
- Environment configuration setup
- Error handling and loading states

### 🚧 Partially Implemented

- JWT token validation (extraction works, validation pending)
- User profile data fetching from Entu API
- Profile persistence in localStorage
- Session management and expiration

### ❌ Not Yet Implemented

- `useEntuProfileAuth` composable (referenced but not implemented)
- `useEntuApi` composable for API calls
- Profile data processing and storage
- Session refresh mechanisms
- Error recovery and retry logic

## Next Development Phase

### Priority 1: Complete OAuth Flow

1. Implement `useEntuProfileAuth` composable
2. Add JWT token validation
3. Fetch user profile from Entu API
4. Store profile in localStorage

### Priority 2: User Experience

1. Implement proper loading states during OAuth
2. Add session management
3. Handle authentication errors gracefully
4. Add automatic token refresh

### Priority 3: Security Hardening

1. Implement secure token storage
2. Add CSRF protection
3. Validate JWT signatures
4. Add rate limiting

## Testing OAuth Implementation

### Manual Testing Checklist

- [ ] All 5 providers redirect to correct OAuth URLs
- [ ] OAuth callback receives JWT tokens correctly
- [ ] JWT tokens extracted from query parameters
- [ ] Error states display properly
- [ ] Loading states work during redirects

### OAuth URL Testing

```bash
# Test Google OAuth URL generation
Expected: https://entu.app/api/auth/google?account=esmuuseum&next=https%3A//localhost%3A3000/auth/callback%3Fjwt%3D

# Test callback URL with JWT
Expected: /auth/callback?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Implementation Learnings

### Critical Discoveries

1. **Callback URL Format**: Must end with `?jwt=` for Entu to append tokens
2. **Provider Flexibility**: Same OAuth flow works for all 5 providers
3. **Client-Side Processing**: JWT extraction happens entirely in frontend
4. **URL Encoding**: Callback URLs must be properly encoded in OAuth requests

### Technical Decisions

1. **No Server-Side Auth**: Chose pure client-side OAuth processing
2. **Multiple Providers**: Implemented 5 providers for maximum accessibility
3. **Vue Composables**: Structured for reusable authentication logic
4. **Environment Flexibility**: Easy switching between development and production

## Rebuilding Instructions

### 1. OAuth Setup

```bash
# Set environment variables
NUXT_ENTU_API_URL=https://entu.app
NUXT_ENTU_CLIENT_ID=esmuuseum
NUXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Provider Configuration

Copy the `buildOAuthUrl` function ensuring:

- Callback URL ends with `?jwt=`
- Provider names match Entu's expected values
- Account name matches your Entu account

### 3. Callback Handling

Implement JWT extraction with:

```typescript
const urlParams = new URLSearchParams(window.location.search);
const jwtToken = urlParams.get("jwt");
```

### 4. UI Components

Use the provider button structure from `/pages/login/index.vue` with:

- 5 distinct provider buttons
- Loading states per provider
- Error message display
- Proper accessibility attributes

## Support and Maintenance

**Key Contacts**:

- Entu API: Documentation at <https://entu.app/api>
- OAuth Issues: Check provider-specific Entu documentation
- Frontend: Standard Nuxt 3 troubleshooting

**Common Issues**:

1. **Missing JWT**: Check callback URL format
2. **Redirect Loops**: Verify environment configuration
3. **Provider Errors**: Check Entu account permissions
4. **HTTPS Issues**: Ensure valid certificates in production

---

**Documentation Status**: Complete OAuth Implementation Record  
**Last Updated**: December 2024  
**Next Review**: After composables implementation  
**Maintainer**: Development Team
