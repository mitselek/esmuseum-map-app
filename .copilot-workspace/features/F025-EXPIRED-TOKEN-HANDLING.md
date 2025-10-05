# F025 - Expired Token Handling

## Overview

Fix the critical UX issue where returning users with expired tokens get stuck on error pages instead of being automatically redirected to login. This affects both mobile and desktop users who restore tabs or return to the app after the token has expired.

## Problem Statement

**Current broken flow:**  

1. User closes browser/app with active session
2. Token expires (time passes)
3. User reopens browser → tab restores with URL like `/?task=68bab85d43e4daafab199988`
4. App loads, tries to fetch data
5. Gets 401/403 errors
6. User sees confusing error: "API error: 403 Forbidden" with "Proovi uuesti" button
7. Retry button doesn't help (token still expired)
8. User is stuck - no clear path to login

**Why this is critical:**  

- ❌ Affects EVERY returning user whose token expired
- ❌ Confusing UX - retry button is misleading
- ❌ No clear way to recover (user might give up)
- ❌ Poor first impression for returning users
- ❌ Console errors visible to users on desktop

## Goals

### Primary Goals

- ✅ Detect expired tokens BEFORE making API calls
- ✅ Automatically redirect to login when token is expired
- ✅ Preserve the original URL for return navigation
- ✅ Show user-friendly notification explaining what happened
- ✅ Distinguish auth errors from network errors

### Secondary Goals

- Consider "remember me" / longer-lived tokens
- Add token refresh mechanism
- Improve token expiry logging for debugging

## Requirements

### Functional Requirements

**FR-1: Proactive Token Validation**  

- Check token expiry in `auth.js` middleware BEFORE route loads
- Validate token signature and expiration time
- Don't allow expired tokens to reach API calls

**FR-2: Automatic Login Redirect**  

- If token is expired/invalid, redirect to `/login`
- Preserve original URL: `/login?redirect=/path/to/original/page`
- After login, automatically navigate back to original destination

**FR-3: User-Friendly Notifications**  

- Show notification: "Session expired, please log in again"
- Use Naive UI's `useNotification()` for consistent styling
- Auto-dismiss after 5 seconds
- Don't block user interaction

**FR-4: Smart Error Handling**  

- **Auth errors (401, 403)**: Redirect to login immediately
- **Network errors (500, timeout)**: Show retry button
- **Other errors**: Show generic error with retry option
- Remove "Proovi uuesti" button for auth errors

**FR-5: Return URL Preservation**  

- Store original URL when redirecting to login
- Support query parameters: `?task=123&filter=active`
- Handle edge cases: login page itself, auth callback page
- Clear return URL after successful navigation

### Non-Functional Requirements

**NFR-1: Performance**  

- Token validation should be fast (<5ms)
- Don't add noticeable delay to page loads
- Cache token expiry checks when possible

**NFR-2: Security**  

- Don't expose token details in URLs or logs
- Clear expired tokens from localStorage
- Validate token structure and signature

**NFR-3: User Experience**  

- Redirect should feel instant (<100ms)
- Notification should be subtle but noticeable
- No jarring page transitions
- Clear messaging in user's language (i18n)

## Technical Design

### Architecture

```text
┌─────────────────────────────────────────┐
│  User opens app / restores tab         │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  auth.js middleware (NEW LOGIC)         │
│  - Get token from localStorage          │
│  - Check if token exists                │
│  - Validate token expiry (JWT decode)   │
└─────────────┬───────────────────────────┘
              │
       ┌──────┴──────┐
       │             │
   EXPIRED       VALID
       │             │
       ▼             ▼
┌─────────────┐  ┌──────────────────┐
│ Redirect to │  │ Allow navigation │
│ /login with │  │ Proceed normally │
│ ?redirect=  │  └──────────────────┘
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Login page                             │
│  - Show notification (session expired)  │
│  - User authenticates                   │
│  - Redirect back to original URL        │
└─────────────────────────────────────────┘
```

### Token Validation Logic

```typescript
// In auth.js middleware

interface TokenPayload {
  exp: number; // Unix timestamp
  user: string;
  // other claims...
}

const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    // Decode JWT without verification (we just need expiry)
    const payload = JSON.parse(atob(token.split(".")[1])) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);

    // Add 60s buffer to prevent edge cases
    return payload.exp < now + 60;
  } catch (error) {
    console.error("Invalid token format:", error);
    return true; // Treat malformed tokens as expired
  }
};

// In middleware
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip for public routes
  if (to.path === "/login" || to.path.startsWith("/auth/")) {
    return;
  }

  const token = localStorage.getItem("entuAccessToken");

  if (!token || isTokenExpired(token)) {
    // Clear expired token
    localStorage.removeItem("entuAccessToken");

    // Show notification
    const notification = useNotification();
    notification.warning({
      title: "Session Expired",
      content: "Please log in again",
      duration: 5000,
    });

    // Redirect to login with return URL
    const returnUrl = to.fullPath;
    return navigateTo(`/login?redirect=${encodeURIComponent(returnUrl)}`);
  }
});
```

### Error Handling Updates

```typescript
// In useEntuApi.ts or error handling composable

export const handleApiError = (error: any, context: string) => {
  const statusCode = error.response?.status || error.statusCode;

  // Auth errors - redirect to login
  if (statusCode === 401 || statusCode === 403) {
    const notification = useNotification();
    notification.error({
      title: "Authentication Required",
      content: "Redirecting to login...",
      duration: 3000,
    });

    // Clear token and redirect
    localStorage.removeItem("entuAccessToken");
    const router = useRouter();
    const route = useRoute();
    router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`);

    return { shouldRetry: false, redirected: true };
  }

  // Network errors - allow retry
  if (statusCode >= 500 || !statusCode) {
    return { shouldRetry: true, redirected: false };
  }

  // Other errors - show generic message
  return { shouldRetry: false, redirected: false };
};
```

### Login Page Return URL Handling

```typescript
// In pages/login/index.vue

const route = useRoute();
const router = useRouter();

const redirectAfterLogin = () => {
  const redirectUrl = route.query.redirect as string;

  if (redirectUrl && redirectUrl !== "/login") {
    router.push(redirectUrl);
  } else {
    router.push("/");
  }
};

// Call after successful authentication
onAuthenticated(() => {
  redirectAfterLogin();
});
```

## Implementation Plan

### Phase 1: Token Validation in Middleware (45 min)

1. ✅ Create JWT decode helper function
2. ✅ Add token expiry validation logic
3. ✅ Update `auth.js` middleware with proactive checks
4. ✅ Test with expired tokens
5. ✅ Handle edge cases (malformed tokens, missing tokens)

### Phase 2: Smart Error Handling (30 min)

1. ✅ Update `useEntuApi.ts` error handling
2. ✅ Distinguish auth errors from network errors
3. ✅ Remove retry button for 401/403 errors
4. ✅ Add automatic redirect logic
5. ✅ Test error scenarios

### Phase 3: Return URL Preservation (30 min)

1. ✅ Update login redirect to include `?redirect=` parameter
2. ✅ Update login page to handle return URL
3. ✅ Test with various URL patterns (query params, hash fragments)
4. ✅ Handle edge cases (login page as return URL, auth callback)

### Phase 4: User Notifications (20 min)

1. ✅ Set up Naive UI notification provider
2. ✅ Add session expired notification
3. ✅ Add i18n translations (et, en, uk)
4. ✅ Test notification timing and styling
5. ✅ Ensure mobile-friendly display

### Phase 5: Testing & Polish (25 min)

1. ✅ Manual testing: expired token scenarios
2. ✅ Manual testing: return URL preservation
3. ✅ Manual testing: mobile experience
4. ✅ Check console logs (remove sensitive data)
5. ✅ Performance check (middleware overhead)

**Total Estimated Time**: ~2.5 hours

## Testing Strategy

### Manual Testing Scenarios

**Test 1: Expired Token on Desktop**  

1. Log in to app
2. Open DevTools → Application → Local Storage
3. Manually set token expiry to past date (modify JWT payload)
4. Refresh page
5. ✅ Should redirect to login with notification
6. ✅ After login, should return to original page

**Test 2: Expired Token on Mobile**  

1. Log in on mobile
2. Wait for token to expire naturally (or force expire)
3. Reopen browser tab
4. ✅ Should show notification and redirect to login
5. ✅ Should NOT show "Proovi uuesti" button
6. ✅ After login, should return to original task

**Test 3: Tab Restore with Query Parameters**  

1. Open URL: `/?task=68bab85d43e4daafab199988`
2. Let token expire
3. Restore tab
4. ✅ Should redirect to `/login?redirect=%2F%3Ftask%3D68bab85d43e4daafab199988`
5. ✅ After login, should load task 68bab85d

**Test 4: Network Error (Not Auth Error)**  

1. Log in with valid token
2. Disconnect internet / block API
3. Try to load tasks
4. ✅ Should show "Proovi uuesti" button
5. ✅ Should NOT redirect to login
6. ✅ Retry should work after reconnecting

**Test 5: Auth Error During Session**  

1. Log in successfully
2. Admin revokes token on server side
3. Try to perform action
4. ✅ Should show notification
5. ✅ Should redirect to login
6. ✅ Should preserve current URL

### Edge Cases

- [ ] User is already on login page (don't redirect)
- [ ] User is on auth callback page (don't redirect)
- [ ] Token expires during form submission (preserve form data?)
- [ ] Multiple tabs open (sync logout across tabs?)
- [ ] Race condition: token expires mid-request

## Success Metrics

- ✅ Zero users stuck on 403 error page
- ✅ Automatic redirect happens in <100ms
- ✅ 100% of expired token scenarios handled
- ✅ Return URL works for all page types
- ✅ Clear, translated error messages
- ✅ No sensitive data in logs or URLs

## i18n Translations

```typescript
// In i18n files (et, en, uk)

{
  "auth": {
    "sessionExpired": {
      "title": "Sessioon aegunud", // Session Expired
      "message": "Palun logi uuesti sisse", // Please log in again
      "redirecting": "Suuname sisselogimislehele..." // Redirecting to login...
    },
    "authRequired": {
      "title": "Autentimine vajalik", // Authentication Required
      "message": "Suuname sisselogimislehele..." // Redirecting to login...
    }
  }
}
```

## Related Files

- `/app/middleware/auth.js` - Main authentication middleware (to be updated)
- `/app/composables/useEntuApi.ts` - API error handling (to be updated)
- `/app/composables/useEntuAuth.ts` - Auth state management
- `/app/pages/login/index.vue` - Login page with return URL handling
- `/app/pages/auth/callback.vue` - OAuth callback page

## Future Enhancements

### Phase 2 (Future)

1. **Token Refresh Mechanism**  

   - Automatically refresh tokens before expiry
   - Background refresh without user interaction
   - Extend session for active users

2. **Remember Me / Longer Tokens**  

   - Optional "keep me logged in" checkbox
   - Issue longer-lived refresh tokens
   - Balance security vs convenience

3. **Multi-Tab Sync**  

   - Sync logout across all open tabs
   - Use BroadcastChannel API or localStorage events
   - Clear all tabs when token expires

4. **Offline Support**  

   - Cache last known auth state
   - Queue actions when offline
   - Retry queue after reconnection

5. **Session Analytics**
   - Track average session length
   - Monitor token expiry patterns
   - Optimize token lifetime

## Security Considerations

- ✅ Don't expose token contents in URLs
- ✅ Clear tokens from localStorage on expiry
- ✅ Don't log full token values (only prefix/suffix)
- ✅ Validate token structure before use
- ✅ Use secure HTTP-only cookies (future consideration)
- ✅ Implement CSRF protection for sensitive operations

## Notes

**Token Expiry Buffer:**
Adding a 60-second buffer to token expiry checks prevents edge cases where the token expires mid-request. Better to redirect slightly early than to fail an important operation.

**Why Not Use HTTP-Only Cookies?**
Currently using localStorage for client-side auth. HTTP-only cookies would be more secure (XSS protection) but require server-side changes. Consider for Phase 2.

**Naive UI Setup:**
Need to ensure Naive UI's notification provider is properly initialized in the app. May need to add `<n-notification-provider>` wrapper in `app.vue` or use Naive UI's auto-import.

## Success Criteria

- [x] No users see "API error: 403 Forbidden" with retry button
- [x] All expired token scenarios trigger automatic login redirect
- [x] Return URL preservation works 100% of the time
- [x] Notifications are clear and translated
- [x] No performance degradation from middleware checks
- [x] Mobile experience is smooth and intuitive
