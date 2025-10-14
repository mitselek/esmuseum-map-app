# Quickstart: Email Authentication Testing

**Feature**: 029-add-email-authentication  
**Date**: October 14, 2025  
**Status**: Ready for implementation

## Prerequisites

### Development Environment

- [ ] Node.js 22.x installed
- [ ] Repository cloned: `esmuseum-map-app`
- [ ] Branch checked out: `029-add-email-authentication`
- [ ] Dependencies installed: `npm install`
- [ ] Dev server running: `npm run dev`

### External Dependencies

- [ ] Entu administrator has been contacted (use template from FEAT-002 research)
- [ ] `e-mail` provider enabled in OAuth.ee for esmuuseum account
- [ ] AWS SES configured at OAuth.ee level (handled by Entu/OAuth.ee team)

**Note**: Feature can be implemented and tested locally with mocked OAuth flow before provider is enabled.

## Quick Start (3 Minutes)

### 1. Run Automated Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:composables  # Tests useEntuOAuth
npm run test:component    # Tests LoginPage
npm run test:auth         # Tests authentication flow
```

**Expected Result**: All tests pass ✓

### 2. Start Development Server

```bash
npm run dev
```

**Expected Result**: Server starts on `http://localhost:3000`

### 3. Visual Inspection

1. Navigate to `http://localhost:3000/login`
2. Verify "Email" button appears after "ID-Card" button
3. Verify button styling matches other OAuth providers
4. Verify button is clickable (before provider enabled, will show error)

**Expected UI**:

**Expected Result:**

```text
┌─────────────────────────────────────────────────┐
│                                                 │
│         War Museum Map Login                    │
│                                                 │
│         [Google]                                │
│         [Apple]                                 │
│         [Smart-ID]                              │
│         [Mobile-ID]                             │
│         [ID Card]                               │
│         [Email]        ← NEW BUTTON             │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Manual Testing Scenarios

### Scenario 1: Email Button Rendering

**Objective**: Verify email authentication option appears correctly

**Steps**:

1. Navigate to `/login` page
2. Scroll to provider buttons section
3. Count total providers (should be 6)
4. Locate "Email" button (should be last)
5. Inspect button styling (should match other providers)

**Expected Results**:

- [x] Email button visible
- [x] Button positioned after ID-Card
- [x] Button has same styling as other providers
- [x] Button label reads "Email" (English) or "E-post" (Estonian)
- [x] No console errors

**Screenshot Location**: `docs/screenshots/login-email-button.png`

---

### Scenario 2: Email Button Click (Provider Not Enabled)

**Objective**: Verify graceful error handling when provider not yet enabled

**Steps**:

1. Navigate to `/login` page
2. Click "Email" button
3. Wait for response (should be immediate error, not redirect)
4. Observe error message

**Expected Results**:

- [x] Button shows loading state briefly
- [x] Error message appears: "Failed to start OAuth flow"
- [x] User remains on login page (no redirect)
- [x] Other provider buttons remain functional
- [x] No application crash

**Error UI Expected**:

```text
┌─────────────────────────┐
│ ⚠ Failed to start       │
│   OAuth flow            │
└─────────────────────────┘
```

---

### Scenario 3: Email Authentication Flow (Provider Enabled)

**Objective**: Complete successful email authentication

**Prerequisites**:

- Entu administrator has enabled `e-mail` provider
- Have access to test email account

**Steps**:

1. Navigate to `/login` page
2. Click "Email" button
3. Wait for redirect to OAuth.ee
4. Enter email address: `your-email@example.com`
5. Click "Send Code" button
6. Check email inbox for verification code
7. Enter 6-digit verification code
8. Submit verification form
9. Wait for redirect back to application

**Expected Results**:

- [x] Redirect to OAuth.ee email page (~500ms)
- [x] Email input form appears (OAuth.ee UI)
- [x] Verification code received via email (<30 seconds)
- [x] Code entry form appears after email submission
- [x] Redirect to `/auth/callback` with JWT token
- [x] Token exchanged for user session
- [x] User authenticated and redirected to home page
- [x] User name/email displayed in app header

**Timing**:

- Total login time: <2 minutes (success criteria)
- Email delivery: <30 seconds (success criteria)

---

### Scenario 4: Invalid Verification Code

**Objective**: Verify error handling for incorrect code entry

**Prerequisites**: Provider enabled, email sent

**Steps**:

1. Complete Scenario 3 steps 1-6
2. Enter incorrect 6-digit code (e.g., `000000`)
3. Submit verification form
4. Observe error message on OAuth.ee page

**Expected Results**:

- [x] OAuth.ee shows error message: "Invalid code"
- [x] User can request new code
- [x] User can re-enter email address
- [x] Application remains functional (no crash)

---

### Scenario 5: Expired Verification Code

**Objective**: Verify handling of timeout scenario

**Prerequisites**: Provider enabled, email sent

**Steps**:

1. Complete Scenario 3 steps 1-6
2. Wait >5 minutes (OAuth.ee code expiration)
3. Enter the original code
4. Submit verification form
5. Observe error message

**Expected Results**:

- [x] OAuth.ee shows error message: "Code expired"
- [x] User can request new code
- [x] New code is sent via email
- [x] User can complete authentication with new code

---

### Scenario 6: Mobile Responsiveness

**Objective**: Verify email authentication works on mobile devices

**Steps**:

1. Open browser DevTools
2. Enable mobile device emulation (e.g., iPhone 12)
3. Navigate to `/login` page
4. Verify email button appears and is tappable
5. Complete Scenario 3 on mobile viewport

**Expected Results**:

- [x] Email button fully visible on mobile
- [x] Button tap target is adequate (44x44px minimum)
- [x] OAuth.ee page is mobile-responsive
- [x] Email input works on mobile keyboard
- [x] Verification code entry works on mobile
- [x] Complete flow functional on mobile

---

### Scenario 7: Browser Back Button

**Objective**: Verify handling of back button during OAuth flow

**Steps**:

1. Complete Scenario 3 steps 1-4 (reach OAuth.ee email page)
2. Click browser back button
3. Observe result

**Expected Results**:

- [x] User returns to `/login` page
- [x] No error messages appear
- [x] All provider buttons still functional
- [x] User can restart email authentication

---

### Scenario 8: Internationalization (i18n)

**Objective**: Verify email authentication works in Estonian

**Steps**:

1. Navigate to `/login` page
2. Change language to Estonian (if language switcher exists)
3. Verify button label changes
4. Complete authentication flow in Estonian

**Expected Results**:

- [x] Button label: "E-post" (Estonian)
- [x] Button label: "Email" (English)
- [x] OAuth.ee respects browser language
- [x] Error messages in correct language

---

### Scenario 9: Existing User Session

**Objective**: Verify behavior when user already logged in

**Steps**:

1. Complete Scenario 3 (authenticate with email)
2. Navigate back to `/login` page
3. Observe page state

**Expected Results**:

- [x] "Already logged in" message appears
- [x] User info displayed (name/email)
- [x] "Continue" button visible
- [x] OAuth provider buttons hidden
- [x] Click "Continue" redirects to home page

---

### Scenario 10: Concurrent Provider Usage

**Objective**: Verify email provider doesn't break other providers

**Steps**:

1. Authenticate with Google provider
2. Log out
3. Authenticate with email provider
4. Log out
5. Authenticate with Apple provider

**Expected Results**:

- [x] All providers work independently
- [x] No cross-provider interference
- [x] Each provider creates valid user session
- [x] Session data correctly associated with provider

---

## Performance Testing

### Load Time Measurements

**Tool**: Browser DevTools Performance tab

**Metrics to Capture**:

1. Time to Interactive (TTI) for login page
2. Time from button click to OAuth redirect
3. Time from OAuth callback to home page redirect

**Expected Performance**:

- Login page TTI: <1 second
- Button click to redirect: <500ms
- Callback to home: <500ms

**Recording**:

```bash
# Open DevTools Performance tab
# Click "Record"
# Perform Scenario 3
# Stop recording
# Export timeline as JSON
```

### Memory Usage

**Tool**: Browser DevTools Memory profiler

**Steps**:

1. Take heap snapshot before login
2. Complete email authentication
3. Take heap snapshot after login
4. Compare memory usage

**Expected Result**: Memory increase <5MB (negligible)

---

## Accessibility Testing

### Keyboard Navigation

**Steps**:

1. Navigate to `/login` page
2. Press Tab key repeatedly
3. Verify email button receives focus
4. Press Enter on email button
5. Verify OAuth flow starts

**Expected Results**:

- [x] Email button focusable via Tab
- [x] Focus indicator visible
- [x] Enter key activates button
- [x] Tab order logical (top to bottom)

### Screen Reader

**Tool**: NVDA (Windows) or VoiceOver (Mac)

**Steps**:

1. Enable screen reader
2. Navigate to `/login` page
3. Navigate to email button
4. Verify button announcement

**Expected Announcement**: "Email, button" or "E-post, nupp"

---

## Edge Cases

### Test Case: No Internet Connection

**Steps**:

1. Disconnect from internet (DevTools Offline mode)
2. Click email button
3. Observe error

**Expected**: Network error displayed, graceful failure

### Test Case: OAuth.ee Service Down

**Steps**:

1. Mock OAuth.ee 503 response (DevTools or MSW)
2. Click email button
3. Observe error

**Expected**: "Failed to start OAuth flow" error, retry possible

### Test Case: Malformed JWT Token

**Steps**:

1. Mock callback with invalid JWT
2. Navigate to `/auth/callback?jwt=invalid`
3. Observe error

**Expected**: "No valid temporary key" error, redirect to login

---

## Automated Test Verification

### Unit Tests

```bash
# Run useEntuOAuth tests
npm run test -- tests/composables/useEntuOAuth.test.ts
```

**Expected Tests**:

- [x] OAUTH_PROVIDERS.EMAIL constant exists
- [x] EMAIL value is 'e-mail'
- [x] OAuthProvider type includes 'e-mail'
- [x] startOAuthFlow accepts 'e-mail' provider

### Component Tests

```bash
# Run LoginPage tests
npm run test -- tests/component/LoginPage.spec.ts
```

**Expected Tests**:

- [x] Email button renders
- [x] Email button has correct label
- [x] Email button click calls startOAuthFlow('e-mail')
- [x] Email button shows loading state
- [x] Email button disabled during OAuth flow

### Integration Tests

```bash
# Run authentication flow tests
npm run test -- tests/integration/email-auth.spec.ts
```

**Expected Tests**:

- [x] Complete email OAuth flow (mocked)
- [x] OAuth.ee redirect URL correct
- [x] Callback token extraction works
- [x] Session creation after email auth
- [x] Error handling for failed OAuth

---

## Deployment Checklist

### Pre-Deployment

- [ ] All automated tests pass
- [ ] Manual testing scenarios completed
- [ ] Performance metrics acceptable
- [ ] Accessibility verified
- [ ] Code reviewed and approved
- [ ] Branch merged to main

### Deployment Steps

1. [ ] Deploy to staging environment
2. [ ] Run smoke tests on staging
3. [ ] Verify email provider still disabled (expected)
4. [ ] Deploy to production
5. [ ] Monitor error logs for 1 hour

### Post-Deployment

- [ ] Contact Entu administrator to enable provider
- [ ] Wait for provider enablement confirmation (2-3 days)
- [ ] Test email authentication in production
- [ ] Monitor success rate for 1 week
- [ ] Document any issues in `specs/029-add-email-authentication/COMPLETION.md`

---

## Troubleshooting

### Problem: Email button not appearing

**Check**:

1. Verify `oauthProviders` array includes email entry
2. Check browser console for JavaScript errors
3. Verify Nuxt auto-imports working
4. Clear browser cache and hard refresh

### Problem: OAuth redirect fails

**Check**:

1. Verify `OAUTH_PROVIDERS.EMAIL = 'e-mail'` (not 'email')
2. Check network tab for 404 on `/api/auth/e-mail`
3. Verify OAuth.ee base URL correct
4. Confirm provider enabled by Entu administrator

### Problem: Callback fails

**Check**:

1. Verify callback URL in localStorage
2. Check JWT token in URL params
3. Verify `handleOAuthCallback` is called
4. Check network tab for token exchange request

---

## Success Criteria Validation

From specification success criteria:

- [ ] Users can complete login using email address within 2 minutes (**Scenario 3**)
- [ ] Verification codes are delivered within 30 seconds (**Scenario 3**)
- [ ] Authentication completion rate matches or exceeds existing OAuth providers (>95%) (**Monitor post-deployment**)
- [ ] User feedback indicates authentication process is intuitive and straightforward (**Collect feedback**)
- [ ] No increase in support requests related to authentication issues (**Monitor post-deployment**)

---

## Documentation

### For End Users

**Location**: `docs/user-guide/authentication.md` (to be updated)

**Content**:

- How to log in with email
- What to expect (verification code email)
- How to enter verification code
- Troubleshooting tips

### For Developers

**Location**: This file + `data-model.md` + `research.md`

**Content**:

- Technical implementation details
- Type definitions
- Testing procedures
- Deployment checklist

---

**Quickstart Status**: ✅ COMPLETE - Ready for manual testing after implementation
