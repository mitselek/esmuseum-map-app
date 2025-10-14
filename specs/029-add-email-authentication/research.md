# Research: Email Authentication Implementation

**Date**: October 14, 2025  
**Feature**: 029-add-email-authentication  
**Status**: Complete - All technical unknowns resolved

## Overview

This research document consolidates findings for implementing email authentication by extending the existing OAuth flow to support OAuth.ee's `e-mail` provider.

## Research Questions & Findings

### 1. OAuth.ee Email Provider Integration

**Question**: How does OAuth.ee's email authentication work, and what changes are needed in our OAuth composable?

**Decision**: Add `EMAIL: 'e-mail'` constant to existing `OAUTH_PROVIDERS` object in `useEntuOAuth.ts`

**Rationale**:

- OAuth.ee already implements email authentication at service level
- Uses AWS SES to send 6-digit verification codes
- Flow: User enters email → Code sent → User enters code → OAuth token returned
- Our existing `startOAuthFlow()` function already accepts any `OAuthProvider` string
- OAuth.ee endpoint pattern: `/api/auth/e-mail` (matches existing `/api/auth/google`, etc.)
- No changes needed to callback handling - token exchange is identical

**Alternatives Considered**:

- **Custom email/password system**: Rejected - adds complexity, security burden, doesn't match OAuth architecture
- **Third-party auth service (Auth0/Firebase)**: Rejected - unnecessary when OAuth.ee already supports it
- **Password-based authentication**: Rejected - stakeholder feedback and OAuth.ee use verification codes, not passwords

**Implementation Details**:

```typescript
// In app/composables/useEntuOAuth.ts
export const OAUTH_PROVIDERS = {
  GOOGLE: "google",
  APPLE: "apple",
  SMART_ID: "smart-id",
  MOBILE_ID: "mobile-id",
  ID_CARD: "id-card",
  EMAIL: "e-mail", // ← ADD THIS
} as const;
```

**Evidence from FEAT-002 Research**:

- OAuth.ee source code confirms `/auth/e-mail` endpoint exists
- AWS SES integration already configured at OAuth.ee level
- Verification code flow handled entirely by OAuth.ee
- No custom implementation needed in our application

---

### 2. Login UI Button Design

**Question**: How should the email authentication button be styled and positioned on the login page?

**Decision**: Add email button to end of existing `oauthProviders` array with consistent styling

**Rationale**:

- Existing login page uses uniform button styling for all providers
- Design pattern: `border-2 border-gray-300 bg-white px-4 py-3` + hover states
- Loading state already implemented: `activeProvider` ref tracks which button is loading
- Natural placement: After ID-card (last current provider)
- Visual consistency: Same button structure, just different label

**Alternatives Considered**:

- **Separate section for "Alternative Authentication"**: Rejected - creates unnecessary visual hierarchy
- **Email icon**: Deferred - can add later if design feedback requests it
- **Different button styling**: Rejected - consistency with existing providers is better UX

**Implementation Details**:

```vue
<!-- In app/pages/login/index.vue -->
const oauthProviders = [ { id: 'google', label: 'Google' }, { id: 'apple',
label: 'Apple' }, { id: 'smart-id', label: 'Smart-ID' }, { id: 'mobile-id',
label: 'Mobile-ID' }, { id: 'id-card', label: 'ID-Card' }, { id: 'e-mail',
label: 'Email' } // ← ADD THIS ]
```

**i18n Considerations**:

- Add translation key for "Email" label
- Estonian translation: "E-post" or "Meiliaadress"
- Check existing `app/lang/` files for locale patterns

---

### 3. Testing Strategy

**Question**: What tests are needed to validate email authentication without actual OAuth.ee access?

**Decision**: Three-layer testing approach:

1. Unit test for `OAUTH_PROVIDERS.EMAIL` constant
2. Component test for email button rendering
3. Integration test mocking OAuth.ee email flow

**Rationale**:

- **Unit test**: Validates TypeScript type safety and constant definition
- **Component test**: Validates button appears, triggers correct handler, shows loading state
- **Integration test**: Validates full OAuth flow with mocked OAuth.ee responses
- MSW (Mock Service Worker) already in package.json - use for OAuth.ee mocking
- Cannot test actual email delivery without OAuth.ee configuration

**Alternatives Considered**:

- **E2E test with real OAuth.ee**: Rejected - requires email provider to be enabled first (chicken-egg problem)
- **Skip integration tests**: Rejected - Constitution requires strategic integration testing
- **Manual testing only**: Rejected - Constitution requires TDD approach

**Implementation Details**:

**Unit Test** (`tests/composables/useEntuOAuth.test.ts`):

```typescript
describe("OAUTH_PROVIDERS", () => {
  it("should include EMAIL provider", () => {
    expect(OAUTH_PROVIDERS.EMAIL).toBe("e-mail");
  });

  it("should accept EMAIL as valid OAuthProvider type", () => {
    const provider: OAuthProvider = OAUTH_PROVIDERS.EMAIL;
    // TypeScript compilation validates this
  });
});
```

**Component Test** (`tests/component/LoginPage.spec.ts`):

```typescript
it("should render email authentication button", async () => {
  const wrapper = mount(LoginPage);
  const emailButton = wrapper.find('button[data-provider="e-mail"]');
  expect(emailButton.exists()).toBe(true);
  expect(emailButton.text()).toContain("Email");
});

it("should call startOAuthFlow with email provider", async () => {
  const startOAuthFlowMock = vi.fn();
  // Mock useEntuOAuth composable
  const wrapper = mount(LoginPage);
  await wrapper.find('button[data-provider="e-mail"]').trigger("click");
  expect(startOAuthFlowMock).toHaveBeenCalledWith("e-mail");
});
```

**Integration Test** (`tests/integration/email-auth.spec.ts`):

```typescript
it("should complete email OAuth flow", async () => {
  // Mock OAuth.ee email authentication endpoints
  server.use(
    http.get("https://entu.app/api/auth/e-mail", () => {
      return HttpResponse.redirect("/auth/callback?jwt=mock-token-123");
    })
  );

  // Simulate user clicking email button
  // Assert redirect to OAuth.ee
  // Simulate callback with token
  // Assert user authenticated
});
```

---

### 4. External Dependency Management

**Question**: What happens if Entu administrator hasn't enabled the email provider yet?

**Decision**: Graceful degradation with clear error messaging

**Rationale**:

- OAuth.ee will return 404 or error if provider not configured
- Existing error handling in `startOAuthFlow` catches this
- User sees existing error UI: "Failed to start OAuth flow"
- Can enhance error message to suggest contacting administrator

**Alternatives Considered**:

- **Hide button until provider verified**: Rejected - no way to check without attempting login
- **Show warning banner**: Possible future enhancement, but not blocking
- **Fail silently**: Rejected - violates Observable Development principle

**Implementation Details**:

- Existing error handling already sufficient
- Optional enhancement: Check for specific error codes and customize message
- Document in quickstart.md that administrator must enable provider first

**Verification Strategy**:

1. Attempt email authentication after deployment
2. If error: Contact Entu administrator using template from FEAT-002 research
3. Wait for provider enablement (2-3 business days expected)
4. Retest and verify success

---

### 5. Internationalization (i18n)

**Question**: What translation keys are needed for email authentication?

**Decision**: Add single translation key for "Email" button label, reuse existing OAuth error messages

**Rationale**:

- Existing i18n setup: @nuxtjs/i18n 9.5.6
- Current supported locales: English (en), Estonian (et)
- Existing provider buttons use simple label strings (no complex i18n)
- Error messages already internationalized in useEntuOAuth

**Alternatives Considered**:

- **No i18n**: Rejected - inconsistent with existing multilingual support
- **Full email flow i18n**: Not needed - OAuth.ee handles verification page in user's browser language
- **Complex key structure**: Rejected - keep simple like existing providers

**Implementation Details**:

Add to `app/lang/en.json`:

```json
{
  "login": {
    "providers": {
      "email": "Email"
    }
  }
}
```

Add to `app/lang/et.json`:

```json
{
  "login": {
    "providers": {
      "email": "E-post"
    }
  }
}
```

Update login page to use i18n:

```vue
{ id: 'e-mail', label: $t('login.providers.email') }
```

---

## Testing Infrastructure Analysis

**Current Setup** (from package.json):

- **Test Framework**: Vitest 3.2.4
- **Nuxt Testing**: @nuxt/test-utils 3.19.2
- **Coverage**: @vitest/coverage-v8 3.2.4
- **Mocking**: msw 2.11.1 (Mock Service Worker)

**Existing Test Patterns** (from tests/ directory scan):

- **Unit tests**: Logic-only tests for composables
- **Component tests**: Mounting with @nuxt/test-utils
- **API tests**: Server route testing
- **Integration tests**: Full flow testing with MSW mocking

**Approach for This Feature**:

- Use existing patterns from `tests/composables/useEntuAuth.test.ts`
- Component mounting via `@nuxt/test-utils/runtime`
- MSW for mocking OAuth.ee endpoints
- No need for new testing infrastructure

---

## Naive UI Component Usage

**Required Components**: None (using existing button structure)

**Rationale**:

- Login page doesn't use Naive UI components currently
- Uses plain HTML `<button>` with Tailwind styling
- Consistency with existing design > introducing Naive UI for single button
- Keep implementation minimal

---

## Vue 3 Reactivity Patterns

**State Management Needed**: None (reuse existing login page state)

**Existing Patterns to Follow**:

- `activeProvider` ref already tracks loading state
- `oauthProviders` array is static data (no reactivity needed)
- `loginWithOAuth` function already handles provider selection

**Changes Required**:

- Add object to `oauthProviders` array
- No new refs, reactives, or computed properties needed

---

## Performance Considerations

**Baseline**: Existing OAuth providers redirect in <500ms

**Expected Performance**:

- Email button rendering: <10ms (simple array append)
- OAuth redirect: <500ms (same as other providers)
- Verification code delivery: <30s (AWS SES SLA)
- Total login time: <2 minutes (matches success criteria)

**No Optimization Needed**: Feature adds negligible overhead

---

## Security Considerations

**Verification Code Security**: Handled by OAuth.ee

- 6-digit codes with expiration
- Rate limiting at OAuth.ee level
- HTTPS for all OAuth communication

**Our Responsibilities**:

- Use existing OAuth callback validation
- Don't store verification codes (handled by OAuth.ee)
- HTTPS already enforced for authentication routes

**Existing Security Measures Sufficient**: No additional implementation required

---

## Deployment Dependencies

**Critical Path**:

1. Deploy code changes (email provider support)
2. Contact Entu administrator to enable `e-mail` provider
3. Verify email authentication works in production
4. Monitor for OAuth errors

**Rollback Plan**:

- If provider not enabled: Button appears but OAuth fails (graceful)
- Can remove button by reverting provider array change
- No database migrations or data changes required

---

## Summary of Decisions

| Area              | Decision                                 | Reason                                          |
| ----------------- | ---------------------------------------- | ----------------------------------------------- |
| OAuth Integration | Add `EMAIL: 'e-mail'` to OAUTH_PROVIDERS | Minimal change, type-safe, reuses existing flow |
| UI Design         | Append email button to provider list     | Consistent with existing design patterns        |
| Testing           | Unit + Component + Integration tests     | TDD approach, comprehensive coverage            |
| Error Handling    | Reuse existing OAuth error UI            | Sufficient for graceful degradation             |
| i18n              | Add single translation key per locale    | Matches existing provider i18n pattern          |
| Performance       | No optimization needed                   | Negligible overhead                             |
| Security          | Rely on OAuth.ee + existing OAuth flow   | Proven secure, no additional implementation     |

---

**Research Status**: ✅ COMPLETE - All technical unknowns resolved, ready for Phase 1 design
