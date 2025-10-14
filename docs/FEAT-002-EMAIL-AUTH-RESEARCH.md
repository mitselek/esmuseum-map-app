# FEAT-002: Email Authentication Research

**Date**: October 14, 2025  
**Status**: Research Complete - **FEASIBLE**  
**Decision**: Proceed with Option A - Enable Email/Phone Authentication

## Summary

Email authentication **CAN BE IMPLEMENTED** via OAuth.ee's existing e-mail and phone providers. These authentication methods are already fully implemented at the service level and just need to be enabled in our OAuth client configuration.

## Research Findings

### Entu OAuth Supported Providers

According to the [official Entu API documentation](https://github.com/entu/api#get-apiauth-provider-):

**Available OAuth Providers:**

- `apple` - Apple ID
- `google` - Google Account
- `smart-id` - Estonian Smart-ID
- `mobile-id` - Estonian Mobile-ID
- `id-card` - Estonian ID-Card

**Current State:**

- Application implements 5 OAuth providers (Google, Apple, Smart-ID, Mobile-ID, ID-Card)
- OAuth.ee service supports 7 total providers (including e-mail and phone)
- Entu client configuration only enables 5 providers
- Request asks for additional "email/password" authentication method

## 2. Demo Feedback Context

## Problem Statement

The demo feedback requested:
> **[FEAT-002] E-posti põhine autentimine**  
>
> - Implement email-based authentication through Entu OAuth

## 3. CRITICAL UPDATE: Email Authentication DOES Exist

### 3.1 Discovery from OAuth.ee Source Code

After exploring the **OAuth.ee implementation repository** (<https://github.com/argoroots/est-o-auth>), we discovered that email and phone authentication **ARE ALREADY IMPLEMENTED**!

**Key Evidence:**

1. **Provider List** (app/pages/usage.vue, server/utils/storage.js):

    ```js
    const providers = [
    'apple',
    'google',
    'smart-id',
    'mobile-id',
    'id-card',
    'e-mail',    // ← EMAIL EXISTS!
    'phone'      // ← PHONE TOO!
    ]
    ```

2. **Email Authentication Endpoints:**

   - `server/api/e-mail.get.js` - Sends verification code via AWS SES email
   - `server/api/e-mail.post.js` - Validates code and creates OAuth session
   - `app/pages/auth/e-mail.vue` - Email authentication UI

3. **Phone Authentication Endpoints:**

   - `server/api/phone.get.js` - Sends verification code via AWS SNS SMS
   - `server/api/phone.post.js` - Validates code
   - `app/pages/auth/phone.vue` - Phone authentication UI

4. **Official Documentation:**

    ```md
    Redirect user to one of the following url:
        - /auth/id-card
        - /auth/mobile-id
        - /auth/smart-id
        - /auth/e-mail      ← DOCUMENTED!
        - /auth/phone       ← DOCUMENTED!
    ```

### 3.4 Revised Alternative Solutions

#### Option A: Enable Email/Phone Authentication (RECOMMENDED - NOW POSSIBLE!)

- **What**: Enable the already-implemented e-mail and phone providers in OAuth.ee
- **How**:
  1. Contact Entu administrator to enable e-mail/phone providers in client configuration
  2. Add e-mail and phone login buttons to `app/pages/login/index.vue`
  3. Use existing OAuth.ee endpoints: `/auth/e-mail` and `/auth/phone`
  4. Verification codes sent via AWS SES (email) and AWS SNS (SMS)
- **Effort**: 2-4 hours (mostly configuration + UI updates)
- **Dependencies**: Entu admin must enable providers in OAuth.ee client config
- **User Experience**: Email/phone + verification code (no password storage)
- **Pros**:
  - Already implemented at OAuth.ee service level
  - No password management complexity
  - Secure verification code flow
  - Consistent with OAuth flow architecture
- **Cons**:
  - Requires Entu admin configuration changes
  - Not traditional password-based login
  - Relies on email/SMS delivery

#### Option B: External Password-Based Authentication Service

- **What**: Integrate service like Auth0, Firebase Auth, or Supabase
- **How**: Add separate authentication provider alongside Entu OAuth
- **Effort**: 8-16 hours (new integration, security setup)
- **Dependencies**: New service subscription, architecture changes
- **Pros**: Traditional email/password login, full control
- **Cons**: Multiple authentication systems, increased complexity, ongoing costs

#### Option C: Accept Current State + Clarify with Stakeholders

- **What**: Explain that Google/Apple provide email-based authentication
- **How**: Update documentation, potentially redesign login UI to emphasize email options
- **Effort**: 1-2 hours (documentation + communication)
- **Pros**: No changes needed, already functional
- **Cons**: May not meet stakeholder expectations

### 3.3 Implementation Details

**How Email Authentication Works in OAuth.ee:**

1. **User initiates login:**
   - Navigate to `/auth/e-mail?client_id=...&redirect_uri=...&scope=openid&state=...`
   - Or provide `email` parameter directly

2. **Verification code sent:**
   - OAuth.ee generates 6-digit code
   - Sends via AWS SES (Simple Email Service)
   - Code stored in session with email + redirect info

3. **User enters code:**
   - Input verification code on e-mail auth page
   - POST to `/api/e-mail` with email + code

4. **Session created:**
   - OAuth.ee validates code
   - Creates OAuth authorization code
   - Redirects to app with `code` parameter

5. **Standard OAuth flow:**
   - App exchanges code for access token
   - Gets user info (email becomes user ID)
   - Creates local session

**Similar flow exists for phone authentication** via AWS SNS (SMS).

## 4. DECISION: Proceed with Option A

### 4.1 Selected Implementation Path

**Option A: Enable Email/Phone Authentication** - SELECTED

We will implement email and phone authentication by enabling the existing OAuth.ee providers.

**Rationale:**

- Feature already exists at OAuth.ee level (proven via source code)
- Minimal development effort (2-4 hours)
- No password management complexity
- Consistent with existing OAuth architecture
- Provides email-based authentication as requested

### 4.2 Implementation Steps

**Step 1: Contact Entu Administrator** (Priority: HIGH)

**Step 2: Update Login UI** (2 hours)

File: `app/pages/login/index.vue`

Add two (or one) new provider buttons:

```vue
<!-- Add after existing provider buttons -->
<button @click="login('e-mail')" class="provider-button">
  <IconEmail />
  <span>Email</span>
</button>

<button @click="login('phone')" class="provider-button">
  <IconChat />
  <span>Phone</span>
</button>
```

**Step 3: Test Authentication Flow** (1-2 hours)

- Test email verification code delivery
- Test phone SMS code delivery
- Verify OAuth token exchange
- Test user session creation
- Confirm user data persistence in Entu

**Step 4: Update Documentation** (30 minutes)

- Add email/phone authentication to user guides
- Document verification code process
- Update teacher onboarding documentation

**Total Estimated Effort:** 4-6 hours

### 4.3 Success Criteria

- Users can log in with email address + verification code
- Users can log in with phone number + SMS code
- Verification codes are delivered within 30 seconds
- OAuth flow completes successfully
- User sessions persist correctly
- Documentation is updated

### 4.4 Alternatives Considered (Not Selected)

**Option B: External Authentication Service** - NOT SELECTED

- Reason: Adds unnecessary complexity when OAuth.ee already supports email

**Option C: Accept Current State** - NOT SELECTED

- Reason: Stakeholder feedback specifically requested email authentication

### 4.5 Research Insight: Why This Wasn't Obvious

The confusion arose from researching the wrong layer:

**Entu API (Client Layer):**

- Shows only 5 providers in documentation
- These are providers *configured for Entu's use*
- Not the full list of *available* providers

**OAuth.ee (Service Layer):**

- Implements 7 total providers
- Includes e-mail and phone providers
- Per-client configuration determines which providers are enabled

## 5. Next Steps

### 5.1 IMMEDIATE ACTION: Contact Entu Administrator

**Priority:** HIGH  
**Assigned to:** Project lead/Entu admin contact  
**Target response time:** 2-3 business days

**Contact Information:**

- Entu support: `support@entu.ee`
- Argo Roots (Entu/OAuth.ee maintainer): `argo@roots.ee`
- GitHub issues: <https://github.com/entu/api/issues>

**Message Template:**

> Subject: Request to Enable Email and Phone Authentication Providers
>
> Hello,
>
> We are using Entu OAuth for the Estonian Sports Museum Map Application. We would like to enable the `e-mail` and `phone` authentication providers that OAuth.ee supports.
>
> Current setup:
>
> - Client ID: [YOUR_CLIENT_ID]
> - Enabled providers: apple, google, smart-id, mobile-id, id-card
> - Request: Enable `e-mail` and `phone` providers
>
> Use case: We need email-based authentication for users who don't have Google/Apple accounts or Estonian digital ID.
>
> Questions:
>
> 1. Can you enable e-mail and phone providers for our OAuth client?
> 2. Are there any additional costs for these authentication methods?
> 3. Is AWS SES/SNS already configured for OAuth.ee?
>
> Thank you!

### 5.2 PENDING: Implementation Work (After Provider Enablement)

**Dependency:** Wait for Entu administrator to enable e-mail and phone providers

**Tasks:**

1. **Update Login UI** (2 hours)
   - File: `app/pages/login/index.vue`
   - Add Email and Phone provider buttons
   - Test button styling and layout

2. **Test Authentication Flows** (1-2 hours)
   - Email: Input → Code delivery → Verification → Login
   - Phone: Input → SMS delivery → Verification → Login
   - Verify all edge cases (invalid code, expired code, etc.)

3. **Update Documentation** (30 minutes)
   - User guides with email/phone authentication instructions
   - Screenshot verification code process
   - FAQ section for common issues

4. **QA Testing** (1 hour)
   - Test with real email addresses
   - Test with real phone numbers
   - Verify on mobile and desktop
   - Cross-browser testing

**Total estimated time:** 4-6 hours development + waiting for Entu response

### 5.3 Contingency Plan (If Email/Phone Cannot Be Enabled)

If Entu administrator cannot or will not enable these providers:

1. **Document the limitation** - Update stakeholders
2. **Emphasize alternatives** - Google/Apple provide email-based login
3. **Consider external service** - Evaluate Auth0/Firebase as fallback (8-16 hours)
4. **Update FEAT-002 status** - Mark as "Blocked - Platform Limitation"

### 5.4 Timeline

- **Day 1:** Send request to Entu administrator
- **Days 2-5:** Wait for response from Entu
- **Day 6:** Implement UI changes (if approved)
- **Day 7:** Testing and documentation
- **Day 8:** Deploy and mark FEAT-002 complete

**Target completion:** 1-2 weeks (including Entu response time)

## 6. Conclusion

### 6.1 Key Finding

Email authentication **DOES EXIST** at OAuth.ee service level! The initial research was based on incomplete information from the Entu API repository documentation.

**Correct Provider Count:**

- Entu API documentation: 5 providers (incomplete)
- OAuth.ee actual support: **7 providers** (includes e-mail and phone)

### 6.2 Final Decision

**Status:** PROCEEDING WITH IMPLEMENTATION  
**Approach:** Option A - Enable Email/Phone Authentication  
**Required:** Entu administrator approval to enable providers  
**Effort:** 4-6 hours (after approval)  
**Timeline:** 1-2 weeks (including approval wait time)

### 6.3 Next Immediate Action

**SEND EMAIL TO ENTU ADMINISTRATOR** using template in Section 5.1

### 6.4 Learning

This research demonstrates the importance of:

- Exploring the full service layer, not just client documentation
- Distinguishing between "configured" vs "available" features
- Investigating actual implementation code (OAuth.ee repository)

The hint to explore `https://github.com/argoroots/est-o-auth` was crucial for discovering the truth!

---

**Research conducted by**: AI Assistant  
**Documentation date**: October 14, 2025  
**Key discovery**: Email/phone authentication exists at OAuth.ee level  
**Decision**: Proceed with Option A (Enable Email/Phone Authentication)  
**Status**: Awaiting Entu administrator approval  
**Sources**:

- <https://github.com/entu/api> (Entu API - client layer)
- <https://github.com/argoroots/est-o-auth> (OAuth.ee - service layer)
- Application composables and authentication code
