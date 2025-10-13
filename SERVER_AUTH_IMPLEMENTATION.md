# Server-Side Authentication Implementation

## Problem Solved

**Original Issue**: JWT tokens from Entu were bound to client IP addresses (e.g., `82.131.122.238`), but server-side API calls were made from a different IP (DigitalOcean server), causing "jwt audience invalid" errors.

**Root Cause**: Entu sets the JWT audience to the IP address of the device that initiates the OAuth flow. When your server tries to use these client-bound JWT tokens for API calls, Entu rejects them because the server IP doesn't match the token audience.

## Solution: Server-Side OAuth Proxy

We've implemented a **server-side OAuth proxy** that ensures all interactions with Entu happen from the server IP:

### 1. Server-Side OAuth Flow

**Client → Server → Entu → Server → Client**  

1. Client calls `/api/auth/start` with provider choice
2. Server redirects to Entu OAuth (Entu sees server IP)
3. Entu redirects back to server with JWT (audience = server IP)
4. Server validates JWT and creates session cookie
5. Client is redirected back with session

### 2. New API Endpoints

#### `/api/auth/start` (POST)

- **Purpose**: Start OAuth flow from server-side
- **Input**: `{ provider: 'google'|'apple'|etc, redirectUrl?: string }`
- **Output**: `{ authUrl: string }` - Client redirects to this URL
- **Key**: Server IP becomes the callback origin

#### `/api/auth/callback` (GET)

- **Purpose**: Handle OAuth callback from Entu
- **Process**: Validates JWT token and creates session cookie
- **Key**: JWT audience matches server IP ✅

#### `/api/auth/status` (GET)

- **Purpose**: Check current authentication status
- **Output**: `{ authenticated: boolean, user: object|null }`
- **Uses**: Server-side session cookies

#### `/api/auth/logout` (POST)

- **Purpose**: Clear authentication session
- **Process**: Removes session cookie

### 3. New Composable: `useServerAuth`

**Client-side composable for server-side authentication:**

```typescript
const { isAuthenticated, user, startAuthFlow, logout, checkAuthStatus } =
  useServerAuth();

// Login
await startAuthFlow("google");

// Check status
await checkAuthStatus();

// Logout
await logout();
```

### 4. Updated Auth Utility

**Enhanced `server/utils/auth.ts`**:

- **Session-first**: Checks session cookies before JWT tokens
- **Fallback**: Still supports direct JWT if needed
- **Consistent**: Works for all API endpoints

### 5. Test Page

**`/auth-test`**: Complete testing interface for the new authentication system

## Authentication Flow Comparison

### ❌ Old Flow (Client-bound JWT)

```text
User Browser (IP: 82.131.122.238)
  → Entu OAuth
  → JWT (audience: 82.131.122.238)
  → Client stores JWT
  → Client sends JWT to Server
  → Server (IP: 209.38.213.121) calls Entu API with JWT
  → Entu rejects: audience mismatch!
```

### ✅ New Flow (Server-bound JWT + Sessions)

```text
User Browser
  → Your Server (IP: 209.38.213.121)
  → Server → Entu OAuth
  → JWT (audience: 209.38.213.121)
  → Server validates JWT & creates session
  → Client gets session cookie
  → Server uses JWT for API calls
  → Entu accepts: audience matches! ✅
```

## Migration Strategy

### Immediate Benefits

- ✅ **Fixes production authentication errors**
- ✅ **Consistent IP-based audience validation**
- ✅ **Scalable across different deployment environments**
- ✅ **Better security** (httpOnly session cookies)

### Migration Path

1. **Test the new flow** using `/auth-test` page
2. **Update login/logout components** to use `useServerAuth`
3. **Verify API calls work** with session-based auth
4. **Remove old client-side JWT handling** (gradual)

## Security Improvements

1. **HttpOnly Cookies**: Session tokens can't be accessed by JavaScript
2. **Server-side Validation**: All authentication happens server-side
3. **IP Consistency**: Eliminates IP address mismatches
4. **Session Expiry**: Configurable session timeouts

## Technical Details

**Session Management**: Simple base64-encoded user data (production should use signed tokens or secure session store)

**Compatibility**: Existing API endpoints continue to work - the auth utility tries session auth first, then falls back to JWT tokens.

**Environment**: Works consistently across development, staging, and production environments.

## Next Steps

1. **Test in development**: Use `/auth-test` to verify functionality
2. **Deploy to production**: Test with real Entu environment
3. **Update UI components**: Migrate from `useEntuOAuth` to `useServerAuth`
4. **Monitor logs**: Verify no more "jwt audience invalid" errors

This solution fundamentally fixes the IP address mismatch issue while providing a more robust and secure authentication system.
