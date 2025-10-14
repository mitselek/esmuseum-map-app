# Data Model: Email Authentication

**Feature**: 029-add-email-authentication  
**Date**: October 14, 2025  
**Status**: Complete

## Overview

This feature extends existing authentication components and composables with minimal new data structures. Primary change is adding email provider constant to OAuth system.

## Components

### LoginPage (Existing - Modified)

**File**: `app/pages/login/index.vue`

**Modifications**:

- Add email provider to `oauthProviders` array

**Data Structure**:

```typescript
// Existing array with new entry
const oauthProviders = [
  { id: 'google', label: 'Google' },
  { id: 'apple', label: 'Apple' },
  { id: 'smart-id', label: 'Smart-ID' },
  { id: 'mobile-id', label: 'Mobile-ID' },
  { id: 'id-card', label: 'ID-Card' },
  { id: 'e-mail', label: 'Email' }  // NEW
]
```

**Props**: None (page component)

**Emits**: None

**Slots**: None

**State** (no changes):

- `activeProvider: Ref<string | null>` - Tracks loading state
- `error: Ref<string | null>` - From useEntuAuth composable
- `isAuthenticated: ComputedRef<boolean>` - From useEntuAuth composable

## Composables

### useEntuOAuth (Existing - Modified)

**File**: `app/composables/useEntuOAuth.ts`

**Modifications**:

- Add `EMAIL` constant to `OAUTH_PROVIDERS` object

**Type Definitions**:

```typescript
// Existing with new entry
export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  APPLE: 'apple',
  SMART_ID: 'smart-id',
  MOBILE_ID: 'mobile-id',
  ID_CARD: 'id-card',
  EMAIL: 'e-mail'  // NEW
} as const

// Type automatically includes new provider
export type OAuthProvider = typeof OAUTH_PROVIDERS[keyof typeof OAUTH_PROVIDERS]
// Type: 'google' | 'apple' | 'smart-id' | 'mobile-id' | 'id-card' | 'e-mail'
```

**Function Signatures** (no changes):

```typescript
export interface UseEntuOAuthReturn {
  startOAuthFlow: (provider: OAuthProvider) => boolean  // Accepts EMAIL now
  handleOAuthCallback: () => Promise<EntuAuthResponse | null>
  providers: typeof OAUTH_PROVIDERS
  isLoading: Ref<boolean>
  error: Ref<string | null>
  isAuthenticated: ComputedRef<boolean>
}
```

## Types

### OAuthProvider (Existing - Extended)

**File**: `app/composables/useEntuOAuth.ts`

**Definition**:

```typescript
export type OAuthProvider = 
  | 'google' 
  | 'apple' 
  | 'smart-id' 
  | 'mobile-id' 
  | 'id-card'
  | 'e-mail'  // NEW
```

**Usage**: Type-safe provider parameter for `startOAuthFlow()` function

**Validation**: TypeScript compile-time check prevents invalid provider strings

## Pages

### /login (Existing - Modified)

**File**: `app/pages/login/index.vue`

**Route**: `/login`

**Route Params**: None

**Query Params**: None (redirect handled via localStorage)

**Middleware**: None (public page)

**Layout**: Default

**Changes**: Add email button to provider list

## Plugins

**No new plugins required**  

Existing plugins remain unchanged:

- `leaflet.client.js` - Map functionality (not used in auth)
- i18n - Internationalization (used for email button label)

## Server Routes

**No server routes required**  

OAuth flow handled by:

- Client: `useEntuOAuth.startOAuthFlow()` redirects to OAuth.ee
- OAuth.ee: Handles email verification and token generation
- Client: `app/pages/auth/callback.vue` handles OAuth callback
- Server: No backend logic needed

## Data Flow

### Email Authentication Flow

```text
1. User clicks "Email" button on /login
   ↓
2. LoginPage calls loginWithOAuth('e-mail')
   ↓
3. useEntuOAuth.startOAuthFlow('e-mail') validates provider
   ↓
4. Browser redirects to OAuth.ee: 
   https://entu.app/api/auth/e-mail?account=esmuuseum&next=[callback]
   ↓
5. OAuth.ee shows email input form (external to our app)
   ↓
6. User enters email, receives verification code via AWS SES
   ↓
7. User enters code on OAuth.ee verification page
   ↓
8. OAuth.ee validates code, generates JWT token
   ↓
9. Browser redirects back to /auth/callback?jwt=[token]
   ↓
10. useEntuOAuth.handleOAuthCallback() extracts token
   ↓
11. useEntuAuth.getToken(tempKey) exchanges token for session
   ↓
12. User authenticated, redirected to original destination
```

### State Transitions

```text
Initial State:
  - isAuthenticated = false
  - activeProvider = null
  - error = null

User Clicks Email Button:
  - activeProvider = 'e-mail'
  - Browser redirects (component unmounts)

OAuth Callback:
  - isLoading = true
  - Token exchange in progress

Success:
  - isAuthenticated = true
  - isLoading = false
  - activeProvider = null
  - Redirect to intended page

Failure:
  - isAuthenticated = false
  - isLoading = false
  - activeProvider = null
  - error = "OAuth callback failed" (or specific message)
```

## Validation Rules

### Provider Validation

**Location**: `useEntuOAuth.startOAuthFlow()`

**Rule**: Provider must be valid `OAuthProvider` type

**Implementation**:

```typescript
if (!provider || !Object.values(OAUTH_PROVIDERS).includes(provider)) {
  throw new Error('Invalid authentication provider')
}
```

**Effect**: TypeScript prevents invalid providers at compile-time, runtime check is backup

### Email Format Validation

**Location**: OAuth.ee (external)

**Our Responsibility**: None - OAuth.ee handles email validation

**User Experience**: OAuth.ee shows error if email format invalid

### Verification Code Validation

**Location**: OAuth.ee (external)

**Our Responsibility**: None - OAuth.ee validates codes

**Our Handling**: Display error message if OAuth callback fails

## Entity Relationships

```text
User (Entu)
  ├─ authenticates_via → OAuthProvider ('e-mail' | 'google' | ...)
  ├─ has → UserSession (JWT token)
  └─ identified_by → Email Address (for 'e-mail' provider)

OAuthProvider
  ├─ defines → Provider ID ('e-mail')
  ├─ has → Display Label ('Email')
  └─ maps_to → OAuth.ee Endpoint (/api/auth/e-mail)

UserSession
  ├─ contains → JWT Token
  ├─ has → Expiration Time
  └─ stored_in → LocalStorage ('entu_token')

VerificationCode (managed by OAuth.ee)
  ├─ sent_to → Email Address
  ├─ has → 6-digit Code
  ├─ has → Expiration Time
  └─ validated_by → OAuth.ee
```

## Storage

### LocalStorage

**Existing Keys** (no changes):

- `entu_token` - User's authentication JWT token
- `auth_redirect` - Path to redirect after successful login
- `auth_callback_url` - OAuth callback URL configuration

**No New Keys Required**  

### Session Storage

**Not Used**: Feature relies on existing localStorage patterns

### Cookies

**Not Used**: Authentication handled via JWT in localStorage

## Performance Considerations

### Memory Impact

**Negligible**: One additional object in `oauthProviders` array (~50 bytes)

### Bundle Size Impact

**Negligible**: One additional string constant (~10 bytes after minification)

### Runtime Performance

**No Impact**:

- Array iteration remains O(n) with n=6 instead of n=5
- No new reactive watchers
- No new computed properties
- No new DOM elements (same button structure)

## Error States

### Provider Not Enabled

**Trigger**: Entu administrator hasn't enabled `e-mail` provider

**Detection**: OAuth.ee returns 404 or error on `/api/auth/e-mail`

**Handling**: Existing error handling in `startOAuthFlow` catch block

**User Message**: "Failed to start OAuth flow" (existing error UI)

**Recovery**: User can try different provider or contact support

### Verification Code Expired

**Trigger**: User takes >5 minutes to enter code (OAuth.ee timeout)

**Detection**: OAuth.ee shows error on verification page

**Handling**: OAuth.ee UI allows requesting new code

**Our Involvement**: None - handled externally by OAuth.ee

### Email Delivery Failure

**Trigger**: AWS SES fails to deliver verification email

**Detection**: OAuth.ee shows error on email input page

**Handling**: OAuth.ee UI allows retry

**Our Involvement**: None - handled externally by OAuth.ee

## Testing Data Structures

### Mock OAuth Provider

```typescript
// For component tests
const mockOAuthProvider = {
  id: 'e-mail',
  label: 'Email'
}
```

### Mock OAuth Response

```typescript
// For integration tests (MSW)
const mockOAuthCallback = {
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User'
  }
}
```

### Test User Data

```typescript
// For E2E tests (when provider enabled)
const testUser = {
  email: 'test+oauth@esmuseum.ee',
  expectedName: 'Test User',
  expectedSession: true
}
```

## Migration

**No Migration Required**:

- No database changes
- No data transformation
- No user data migration
- No breaking changes to existing auth flow

**Backwards Compatible**: Existing OAuth providers continue working unchanged

## Future Extensions

### Phone Authentication

**Effort**: ~30 minutes

**Changes Required**:

```typescript
// Add to OAUTH_PROVIDERS
PHONE: 'phone'

// Add to oauthProviders array
{ id: 'phone', label: 'Phone' }
```

**Benefit**: Identical pattern, minimal incremental work

### Custom Email Icon

**Effort**: ~15 minutes

**Changes Required**:

- Add email icon component/asset
- Update button template to include icon
- Follow existing icon pattern (Google/Apple buttons)

---

**Data Model Status**: ✅ COMPLETE - All components, types, and data flows documented
