# F025 Expired Token Handling - Testing Guide

**Created**: October 5, 2025  
**Feature**: F025 - Expired Token Handling  
**Status**: Ready for Testing

## Overview

F025 introduces proactive token expiry detection to prevent users from getting stuck on 403 error pages. This guide covers all test scenarios for desktop and mobile.

## What Changed

### 1. Proactive Token Validation (Middleware)

- **File**: `app/middleware/auth.ts`
- **What**: Checks if token is expired BEFORE loading protected route
- **When**: Every navigation to protected pages
- **Buffer**: 60 seconds before actual expiry
- **Action**: Auto-redirect to login with notification

### 2. Smart Error Handling (API)

- **File**: `app/composables/useEntuApi.ts`
- **What**: Distinguishes auth errors from network/server errors
- **When**: Any API call returns 401/403 or throws error
- **Action**: Show notification + redirect to login (auth errors only)

### 3. User Notifications

- **File**: `app/composables/useNotifications.ts`
- **What**: Naive UI notifications with i18n support
- **Messages**: "Session Expired" or "Authentication Required"
- **Languages**: Estonian, English, Ukrainian

### 4. Instant Callback Redirect

- **File**: `app/pages/auth/callback.vue`
- **What**: Minimal loading page with instant redirect
- **UX**: Barely visible spinner, <100ms redirect

## Test Environment

**Dev Server**: <http://localhost:3000>  
**Browser DevTools**: Required for localStorage manipulation  
**Languages to Test**: Estonian (et), English (en), Ukrainian (uk)

---

## Test Scenarios

### Test 1: Expired Token on Page Load (Tab Restore)

**Goal**: Verify middleware catches expired tokens before page loads

**Setup**:

1. Login to the app successfully
2. Open DevTools → Application → Local Storage
3. Find `esm_token` key
4. Copy the token value

**Expire the Token**:

```javascript
// In browser console:
// Decode the token to see expiry
const token = localStorage.getItem("esm_token");
const payload = JSON.parse(atob(token.split(".")[1]));
console.log("Token expires at:", new Date(payload.exp * 1000));
console.log(
  "Token expires in:",
  Math.floor((payload.exp * 1000 - Date.now()) / 1000),
  "seconds"
);

// Option A: Wait for natural expiry (if < 5 min)
// Option B: Manually create expired token (replace exp claim)

// Option B - Create expired token:
const parts = token.split(".");
const header = parts[0];
const payloadObj = JSON.parse(atob(parts[1]));
payloadObj.exp = Math.floor(Date.now() / 1000) - 100; // Expired 100 seconds ago
const newPayload = btoa(JSON.stringify(payloadObj))
  .replace(/=/g, "")
  .replace(/\+/g, "-")
  .replace(/\//g, "_");
const expiredToken = header + "." + newPayload + "." + parts[2];
localStorage.setItem("esm_token", expiredToken);
console.log("✅ Token manually expired");
```

**Test Steps**:

1. With expired token in localStorage, refresh the page or navigate to `/`
2. Observe what happens

**Expected Result**:

- ✅ Notification appears: "Sessioon aegunud" (ET) / "Session Expired" (EN)
- ✅ Message: "Palun logi uuesti sisse" (ET) / "Please log in again" (EN)
- ✅ Automatic redirect to `/login` within 100ms
- ✅ Token and user data cleared from localStorage
- ✅ Return URL preserved (redirects to original page after login)

**Console Logs to Check**:

```text
🔒 [EVENT] auth middleware - Token expired, clearing and redirecting
🔒 [EVENT] auth middleware - Cleared expired auth, stored redirect: /
```

---

### Test 2: Expired Token During Navigation

**Goal**: Verify middleware catches expired tokens when navigating between pages

**Setup**:

1. Login successfully
2. Navigate to a task detail page (e.g., `/` and click a task)
3. Stay on the page for token to expire OR manually expire it

**Test Steps**:

1. Try to navigate to another page (click different task, go to home, etc.)
2. Observe middleware behavior

**Expected Result**:

- ✅ Same as Test 1: notification + redirect + cleanup
- ✅ Navigation blocked, user sent to login instead
- ✅ Return URL preserved

---

### Test 3: 401 Error from API Call

**Goal**: Verify API error handling redirects on auth errors

**Setup**:

1. Login successfully
2. Open DevTools → Network tab
3. Navigate to homepage

**Simulate 401**:

- This is hard to simulate without backend cooperation
- Natural scenario: Token expires mid-session while API call is in progress

**Test Steps**:

1. If using token that will expire soon, wait for API call during expiry
2. Watch for 401 response in Network tab

**Expected Result**:

- ✅ Notification: "Autentimine vajalik" (ET) / "Authentication Required" (EN)
- ✅ Automatic redirect to login
- ✅ Token cleared from localStorage
- ✅ Return URL preserved

**Console Logs**:

```text
[Auth] Handling authentication error - clearing stored auth
```

---

### Test 4: Network Error (Should NOT Redirect)

**Goal**: Verify network errors show retry option, not login redirect

**Setup**:

1. Login successfully
2. Open DevTools → Network tab → Enable "Offline" mode
3. Try to load tasks or make any API call

**Test Steps**:

1. Navigate to page that requires API call
2. Observe error handling

**Expected Result**:

- ✅ **NO redirect to login** (important!)
- ✅ Error message about network connectivity
- ✅ "Proovi uuesti" (Try again) button visible
- ✅ Token stays in localStorage
- ✅ Retry works after disabling offline mode

---

### Test 5: Return URL Preservation

**Goal**: Verify user returns to intended page after re-login

**Setup**:

1. Login successfully
2. Navigate to a specific task (e.g., `/` then click task with ID)
3. Manually expire token (see Test 1)

**Test Steps**:

1. Try to navigate to another page or refresh
2. Get redirected to login
3. Login again with any provider
4. Observe where you land

**Expected Result**:

- ✅ Redirected to original page (task detail) after login
- ✅ Not redirected to `/` (home)
- ✅ Page state preserved (same task visible)

**Check localStorage**:

```javascript
// Before login, should see:
localStorage.getItem("auth_redirect"); // → "/path/you/were/on"

// After login, should be cleared:
localStorage.getItem("auth_redirect"); // → null
```

---

### Test 6: Auth Callback Page (Instant Redirect)

**Goal**: Verify callback page is barely visible with instant redirect

**Setup**:

1. Logout completely
2. Go to login page
3. Click any OAuth provider (Google, Apple, etc.)

**Test Steps**:

1. Complete OAuth flow with provider
2. Watch what happens on `/auth/callback`

**Expected Result**:

- ✅ Callback page visible for <100ms (barely a flash)
- ✅ Minimal UI: spinner + "Suunatakse ümber..." message
- ✅ NO debug info visible (OAuth details, tokens, localStorage keys)
- ✅ Automatic redirect to homepage or preserved return URL
- ✅ Fallback link visible but not needed: "Click here if not redirected"

**What Should NOT Appear**:

- ❌ OAuth callback URL details
- ❌ Auth keys from localStorage
- ❌ Token values
- ❌ "Processing authentication..." message
- ❌ Error state displays

---

### Test 7: i18n Translations

**Goal**: Verify notifications work in all supported languages

**Languages to Test**: Estonian (et), English (en), Ukrainian (uk)

**Setup**:

1. Change language in app header (flag selector)
2. Expire token (see Test 1)

**Test Steps**:

1. For each language:
   - Set language
   - Expire token
   - Trigger middleware check (refresh page)
   - Observe notification

**Expected Translations**:

| Key                     | Estonian (et)                                          | English (en)                               | Ukrainian (uk)                                                  |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------- |
| Session Expired Title   | Sessioon aegunud                                       | Session Expired                            | Сесія закінчилася                                               |
| Session Expired Message | Palun logi uuesti sisse                                | Please log in again                        | Будь ласка, увійдіть знову                                      |
| Auth Required Title     | Autentimine vajalik                                    | Authentication Required                    | Потрібна автентифікація                                         |
| Auth Required Message   | Suuname sisselogimislehele...                          | Redirecting to login...                    | Перенаправлення на сторінку входу...                            |
| Callback Redirecting    | Suunatakse ümber...                                    | Redirecting...                             | Перенаправлення...                                              |
| Callback Fallback       | Vajutage siia, kui automaatset ümbersuunamist ei toimu | Click here if not redirected automatically | Натисніть тут, якщо автоматичне перенаправлення не відбувається |

---

### Test 8: Mobile Testing (Real Device)

**Goal**: Verify behavior on actual mobile device (iOS/Android)

**Setup**:

1. Access dev server from mobile: http://YOUR_LOCAL_IP:3000
2. Login on mobile device
3. Manually expire token using browser DevTools (if available) or wait for expiry

**Test Steps**:

1. Restore tab after expiry (lock device, unlock later)
2. Try to navigate
3. Observe notifications and redirects

**Expected Result**:

- ✅ Same behavior as desktop
- ✅ Notifications visible and readable on mobile
- ✅ Touch targets work (fallback link clickable)
- ✅ No layout issues

**iOS Specific**:

- Safari may restore tabs automatically after unlock
- Check if middleware catches expired token on restore

**Android Specific**:

- Chrome may preserve tabs differently
- Test with device sleep/wake cycle

---

## Testing Checklist

### Desktop Tests

- [ ] Test 1: Expired token on page load
- [ ] Test 2: Expired token during navigation
- [ ] Test 3: 401 error from API
- [ ] Test 4: Network error (no redirect)
- [ ] Test 5: Return URL preservation
- [ ] Test 6: Auth callback instant redirect
- [ ] Test 7: i18n - Estonian notifications
- [ ] Test 7: i18n - English notifications
- [ ] Test 7: i18n - Ukrainian notifications

### Mobile Tests

- [ ] Test 8: Mobile - Tab restore with expired token
- [ ] Test 8: Mobile - Navigation with expired token
- [ ] Test 8: Mobile - Notification visibility
- [ ] Test 8: Mobile - Touch interactions

### Edge Cases

- [ ] Multiple rapid navigations with expired token
- [ ] Logout while token expired (should work smoothly)
- [ ] Login → Immediate logout → Login again
- [ ] Network offline during token expiry check
- [ ] Browser back button after token expiry redirect

---

## Helper Scripts

**IMPORTANT**: Copy these scripts into your **app's browser console** (not the test helper page).
The test helper runs on `file://` origin and cannot access `localStorage` from `http://localhost:3000`.

### Check Token Status

```javascript
// Run in browser console (app tab at http://localhost:3000)
function checkToken() {
  const token = localStorage.getItem("esm_token");
  if (!token) {
    console.log("❌ No token found");
    return;
  }

  try {
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp * 1000;
    const now = Date.now();
    const remaining = exp - now;

    console.log("✅ Token found");
    console.log("Expires at:", new Date(exp).toLocaleString());
    console.log("Time remaining:", Math.floor(remaining / 1000), "seconds");
    console.log(
      "Status:",
      remaining > 60000 ? "✅ Valid" : "⚠️ Expiring soon (< 60s)"
    );

    if (remaining < 0) {
      console.log("❌ Token is EXPIRED");
    }
  } catch (err) {
    console.error("❌ Failed to parse token:", err);
  }
}

checkToken();
```

### Manually Expire Token

```javascript
// Run in browser console (app tab at http://localhost:3000)
function expireToken() {
  const token = localStorage.getItem("esm_token");
  if (!token) {
    console.log("❌ No token to expire");
    return;
  }

  try {
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));

    // Set expiry to 2 minutes ago
    payload.exp = Math.floor(Date.now() / 1000) - 120;

    // Re-encode (note: this breaks signature, but client doesn't verify)
    const newPayloadB64 = btoa(JSON.stringify(payload))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const expiredToken = parts[0] + "." + newPayloadB64 + "." + parts[2];
    localStorage.setItem("esm_token", expiredToken);

    console.log("✅ Token manually expired");
    console.log("New expiry:", new Date(payload.exp * 1000).toLocaleString());
    console.log("🔄 Refresh page or navigate to trigger middleware");
  } catch (err) {
    console.error("❌ Failed to expire token:", err);
  }
}

expireToken();
```

### Check Auth Storage

```javascript
// Run in browser console (app tab at http://localhost:3000)
function checkAuthStorage() {
  console.log("=== Auth Storage ===");
  console.log(
    "Token:",
    localStorage.getItem("esm_token") ? "✅ Present" : "❌ Missing"
  );
  console.log(
    "User:",
    localStorage.getItem("esm_user") ? "✅ Present" : "❌ Missing"
  );
  console.log("Redirect:", localStorage.getItem("auth_redirect") || "None");

  const user = localStorage.getItem("esm_user");
  if (user) {
    try {
      const parsed = JSON.parse(user);
      console.log("User ID:", parsed._id || "❌ Missing");
      console.log("User Name:", parsed.name || "❌ Missing");
    } catch {
      console.log("❌ User data corrupted");
    }
  }
}

checkAuthStorage();
```

---

## Known Issues / Expected Behavior

### Token Buffer (60 seconds)

- Token is considered expired 60 seconds BEFORE actual expiry
- This prevents mid-request expiry
- User might see "expired" notification while token technically has 30s left
- **This is intentional and correct behavior**

### Callback Page Flash

- Callback page may be visible for 50-100ms
- This is normal - OAuth processing takes time
- Should NOT show debug info during this flash
- Fallback link is defensive programming (approved)

### Console Logs

- `🔒 [EVENT]` logs are verbose but helpful for debugging
- These were intentionally kept during Phase 1 cleanup
- Can be removed later if too noisy

### Network vs Auth Errors

- Network errors show "Proovi uuesti" (Try again)
- Auth errors redirect to login
- **Do not confuse these two!**
- Test both scenarios separately

---

## Fixed Issues

### ~~500 Error: useI18n() in Middleware~~ ✅ **FIXED**

**Issue**: (Discovered during testing - October 5, 2025)

- Initial implementation used `useI18n()` in `notifySessionExpired()` and `notifyAuthRequired()`
- These functions are called from middleware context
- `useI18n()` can only be called in component setup functions
- Result: 500 error: "Must be called at the top of a `setup` function"

**Fix**: (Commit: 1918cf0)

- Changed to `useNuxtApp().$i18n` instead of `useI18n()`
- `$i18n` is available in all Nuxt contexts (middleware, composables, plugins)
- Same translation functionality, different API
- Notifications now work correctly from middleware

**Impact**:

- ✅ No more 500 errors on token expiry
- ✅ Notifications work in middleware context
- ✅ i18n translations still work (et, en, uk)

---

- Test both scenarios separately

---

## Bug Reporting Template

If you find issues during testing, use this template:

```markdown
## Bug Report: F025 Test Failure

**Test Scenario**: [Test number and name]
**Browser**: [Chrome/Firefox/Safari + version]
**Device**: [Desktop/Mobile + OS]
**Language**: [et/en/uk]

**Steps to Reproduce**:

1.
2.
3.

**Expected Behavior**:

- **Actual Behavior**:

- **Screenshots/Console Logs**:
  [Paste here]

  **Auth Storage State**:

- Token: [present/missing]
- User: [present/missing]
- Redirect: [value or none]
```

---

## Success Criteria

F025 is considered fully tested and working when:

- ✅ All 9 desktop test scenarios pass
- ✅ All 4 mobile test scenarios pass
- ✅ All 5 edge case scenarios pass
- ✅ All 3 languages show correct translations
- ✅ Zero users stuck on error pages
- ✅ Return URL works 100% of the time
- ✅ Callback page is invisible (<100ms)
- ✅ No sensitive data leaked in console/UI

**Total Test Cases**: 18 scenarios + 5 edge cases = **23 test cases**

---

**Testing Started**: [Date]  
**Testing Completed**: [Date]  
**Tested By**: [Name]  
**Status**: ⏳ Pending / ✅ Passed / ❌ Failed
