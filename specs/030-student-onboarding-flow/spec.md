# Feature Specification: FEAT-001 Student Onboarding Flow

## Overview

Enable students to join class groups via signup links, providing a streamlined onboarding experience that integrates with the existing Entu OAuth authentication system and automatically assigns students to their class groups.

## Feature ID

FEAT-001: Student Onboarding Flow

## Status

Draft - Awaiting Implementation

## Priority

High - Required for demo feedback completion (item 1/10)

## User Stories

### US-001: Student Signup via Link

**As a** student
**I want to** click a signup link provided by my teacher
**So that** I can quickly join my class and access assigned tasks

**Acceptance Criteria:**

- Student receives signup link in format: `https://esm.entu.ee/signup/{groupId}`
- Clicking link navigates to `/signup/:groupId` route in the application
- `groupId` is extracted from URL and stored for OAuth callback
- Student is presented with OAuth provider options (Google, Apple, Email, etc.)
- After OAuth authentication, student returns to waiting screen

### US-002: Automated Group Assignment

**As a** student
**I want to** be automatically assigned to my class group after authentication
**So that** I don't need to manually join or request access

**Acceptance Criteria:**

- Server-side endpoint `POST /api/onboard/join-group` is called after OAuth
- Endpoint uses privileged `NUXT_WEBHOOK_KEY` for Entu API access
- User is added as child entity to the group in Entu
- F020 webhook trigger fires: "Student Added to Class"
- Assignment completes within 30 seconds or times out

### US-003: Waiting Screen Feedback

**As a** student
**I want to** see clear feedback while my account is being set up
**So that** I know the process is working and I should wait

**Acceptance Criteria:**

- Waiting screen displays message: "Please wait while we set up your account..."
- Three-dot animated spinner cycles: "." → ". ." → ". . ."
- Screen polls Entu API every 2 seconds to check group membership
- Maximum wait time is 30 seconds before timeout
- Visual feedback is mobile-responsive and accessible

### US-004: Error Handling

**As a** student
**I want to** see clear error messages if signup fails
**So that** I know what went wrong and can retry

**Acceptance Criteria:**

- **Timeout Error**: After 30 seconds, show "Setup timed out. Please try again." with link to original signup URL
- **Already Member**: If student is already in group, skip waiting screen and redirect directly to tasks
- **Technical Error**: Display error message with technical details for debugging
- All error messages support i18n (4 languages)

### US-005: Successful Onboarding

**As a** student
**I want to** be redirected to my tasks after successful signup
**So that** I can immediately start working on assignments

**Acceptance Criteria:**

- Upon successful group assignment, redirect to `/` or `/tasks` page
- Student sees tasks assigned to their group
- No additional manual steps required
- Total onboarding time from link click to tasks view < 60 seconds

## Technical Constraints

### TC-001: Constitutional Compliance

All implementation MUST follow `.specify/memory/constitution.md` principles:

1. **Type Safety First**: TypeScript strict mode, no undocumented `any` types
2. **Composable-First**: Extract reusable logic into composables
3. **Test-First Development**: Write tests before implementation (TDD)
4. **Observable Development**: Structured logging for production
5. **Mobile-First**: Responsive design, touch-friendly UI
6. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
7. **Pragmatic Simplicity**: Simple solutions over complex ones

### TC-002: Environment Variables

- `NUXT_WEBHOOK_KEY`: Required for privileged group assignment operations
- `TEST_ENTU_GROUP_ID`: `686a6c011749f351b9c83124` for integration tests
- `TEST_ENTU_PERSON_ID`: `66b6245c7efc9ac06a437b97` for integration tests

### TC-003: Security

- Never expose `NUXT_WEBHOOK_KEY` to client-side code
- All privileged Entu API calls happen server-side only
- Validate `groupId` parameter to prevent injection attacks
- OAuth tokens handled securely via existing `useEntuAuth()` composable

### TC-004: Performance

- Polling interval: 2 seconds (maximum 15 API calls)
- Timeout: 30 seconds maximum wait time
- Page load time: < 3 seconds for signup page
- API response time: < 500ms for group assignment endpoint

### TC-005: Compatibility

- Must work with existing OAuth flow (no breaking changes)
- Reuse existing `useEntuOAuth()` and `useEntuAuth()` composables
- Follow patterns from `app/pages/auth/callback.vue`
- Leverage existing `server/utils/entu.ts` utilities

## Technical Design

### Architecture Overview

```text
[Signup Link] → [/signup/:groupId Route] → [OAuth Flow] → [Waiting Screen]
                                                                    ↓
[Tasks Page] ← [Success Redirect] ← [Poll Group Membership] ← [POST /api/onboard/join-group]
```

### Components

#### 1. Route: `/signup/[groupId].vue`

**Purpose**: Entry point for student onboarding

**Responsibilities:**

- Extract `groupId` from URL params
- Store `groupId` in localStorage for OAuth callback persistence
- Redirect to OAuth flow if not authenticated
- Display waiting screen after OAuth return
- Poll for group membership status
- Handle errors and success states

**Props**: None (uses route params)

**State Management:**

- `groupId`: string (from route params)
- `isWaiting`: boolean (polling state)
- `hasTimedOut`: boolean (timeout state)
- `error`: string | null (error message)

#### 2. Server Endpoint: `/api/onboard/join-group.post.ts`

**Purpose**: Privileged server-side group assignment

**Request Body:**

```typescript
{
  groupId: string;  // Entu group entity ID
  userId: string;   // Authenticated user's Entu person ID
}
```

**Response:**

```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

**Responsibilities:**

- Validate `NUXT_WEBHOOK_KEY` from environment
- Make Entu API call to add user as child of group
- Return success/error response
- Trigger F020 webhook (handled by Entu)

**Error Handling:**

- 401: Missing or invalid webhook key
- 400: Invalid groupId or userId
- 500: Entu API failure

#### 3. Composable: `useOnboarding()` or extend existing

**Purpose**: Manage onboarding state and polling logic

**Functions:**

```typescript
{
  joinGroup: (groupId: string) => Promise<void>;
  pollGroupMembership: (groupId: string) => Promise<boolean>;
  isWaiting: Ref<boolean>;
  error: Ref<string | null>;
  hasTimedOut: Ref<boolean>;
}
```

**Responsibilities:**

- Call `/api/onboard/join-group` endpoint
- Poll Entu API every 2 seconds for group membership
- Timeout after 30 seconds
- Handle errors and success states
- Provide reactive state for UI

### Data Flow

1. **Link Click**: Student clicks `https://esm.entu.ee/signup/686a6c011749f351b9c83124`
2. **Route Navigation**: App navigates to `/signup/686a6c011749f351b9c83124`
3. **Store GroupId**: `groupId` saved to localStorage: `onboarding_groupId`
4. **OAuth Check**: If not authenticated, redirect to OAuth flow
5. **OAuth Return**: After authentication, return to signup page
6. **Retrieve GroupId**: Load `groupId` from localStorage
7. **Server Assignment**: Call `POST /api/onboard/join-group` with groupId and userId
8. **Waiting Screen**: Display spinner and start polling
9. **Poll Membership**: Check every 2s if user is child of group
10. **Success**: Redirect to `/tasks` when membership confirmed
11. **Timeout**: Show error after 30s if membership not confirmed

### Error Handling

#### Timeout Scenario

```typescript
if (elapsedTime > 30000) {
  hasTimedOut.value = true;
  error.value = t('onboarding.error.timeout');
  // Show retry link to original signup URL
}
```

#### Already Member Scenario

```typescript
const isMember = await checkGroupMembership(groupId);
if (isMember) {
  // Skip waiting screen, redirect immediately
  await navigateTo('/tasks');
}
```

#### Technical Error Scenario

```typescript
try {
  await joinGroup(groupId);
} catch (err) {
  error.value = t('onboarding.error.technical', { error: err.message });
  // Display error with technical details
}
```

## i18n Translation Requirements

All UI text must be translated into 4 languages: Estonian (et), English (en), Ukrainian (uk), Latvian (lv).

### Required Translation Keys

```yaml
onboarding:
  waiting:
    title: "Please wait while we set up your account..."
    description: "This will only take a moment."
  error:
    timeout: "Setup timed out. Please try again."
    tryAgain: "Try again"
    technical: "Technical error: {error}"
    alreadyMember: "You are already a member of this class."
  success:
    redirect: "Redirecting to your tasks..."
```

## Testing Strategy

Follow FEAT-002 (email authentication, PR #12) testing pattern:

### Test Coverage Requirements

1. **Composable Tests**: `tests/composables/useOnboarding.test.ts`
   - Test polling logic with mocked API
   - Test timeout after 30 seconds
   - Test error handling scenarios
   - Test state management (isWaiting, error, hasTimedOut)

2. **Component Tests**: `tests/component/signup-groupId.test.ts`
   - Test route param extraction
   - Test OAuth redirect
   - Test waiting screen UI
   - Test error message display
   - Test success redirect

3. **Server Endpoint Tests**: `tests/api/onboard-join-group.test.ts`
   - Test successful group assignment
   - Test authentication validation
   - Test error handling (401, 400, 500)
   - Test Entu API integration (mocked)

4. **Integration Tests** (optional): `tests/integration/student-onboarding.test.ts`
   - Test full E2E signup flow
   - Test with real test data: `TEST_ENTU_GROUP_ID` and `TEST_ENTU_PERSON_ID`

### Test Data

Use real test IDs from `.env`:

- `TEST_ENTU_GROUP_ID = 686a6c011749f351b9c83124`
- `TEST_ENTU_PERSON_ID = 66b6245c7efc9ac06a437b97`

## Success Metrics

1. **User Experience**: Student completes onboarding in < 60 seconds
2. **Test Coverage**: 100% pass rate for all tests
3. **Type Safety**: TypeScript strict mode with no lint errors
4. **Mobile Responsive**: Works on all device sizes (320px+)
5. **Accessibility**: WCAG 2.1 Level AA compliance
6. **i18n Support**: All 4 languages supported
7. **Performance**: Polling completes within 30 seconds
8. **Error Handling**: All error scenarios covered with user-friendly messages
9. **Documentation**: Markdown lint-free, no emoji in formal docs
10. **Constitutional Compliance**: All 7 principles followed

## Out of Scope

The following items are explicitly out of scope for this feature:

1. **Teacher Workflow**: Creating signup links (handled by Entu)
2. **Multiple Group Assignment**: Assigning student to multiple groups simultaneously
3. **Group Discovery**: Browsing available groups
4. **Manual Join Requests**: Students requesting to join groups
5. **Group Invitations**: Email/SMS invitations (future feature)
6. **Custom Onboarding Fields**: Additional profile information during signup
7. **Group Admin Approval**: Manual approval by teachers (auto-assignment only)
8. **Analytics**: Tracking signup conversion rates (future enhancement)

## Dependencies

### Internal Dependencies

- Existing OAuth authentication system (`useEntuOAuth()`, `useEntuAuth()`)
- Existing Entu API utilities (`server/utils/entu.ts`)
- Existing i18n setup (4 language support)
- Existing F020 webhook: "Student Added to Class"

### External Dependencies

- Entu API: Group entity management
- Entu API: User-group relationship (child entity)
- Entu OAuth providers: Google, Apple, Email

### Environment Variables

- `NUXT_WEBHOOK_KEY`: Privileged operations key
- `NUXT_PUBLIC_ENTU_URL`: Entu API base URL
- `NUXT_PUBLIC_ENTU_ACCOUNT`: Account name (esmuuseum)

## Risks and Mitigations

### Risk 1: Polling Performance

**Risk**: 15 API calls per student signup could impact server load

**Mitigation**:

- Implement exponential backoff if needed
- Monitor server metrics during testing
- Consider WebSocket alternative for future optimization

### Risk 2: OAuth State Loss

**Risk**: `groupId` could be lost during OAuth redirect

**Mitigation**:

- Store `groupId` in localStorage with expiration
- Include `groupId` in OAuth state parameter (alternative)
- Clear localStorage after successful onboarding

### Risk 3: Timeout Edge Cases

**Risk**: Student assigned to group exactly at 30-second timeout

**Mitigation**:

- Final membership check before showing timeout error
- Extend timeout grace period by 5 seconds (35s total)
- Log timeout events for monitoring

### Risk 4: Duplicate Signup Attempts

**Risk**: Student clicks link multiple times

**Mitigation**:

- Check group membership before showing waiting screen
- Redirect immediately if already member
- Idempotent group assignment endpoint

## Future Enhancements

1. **WebSocket Polling**: Replace HTTP polling with WebSocket for real-time updates
2. **Email Notifications**: Send confirmation email after successful signup
3. **Analytics Dashboard**: Track signup success rates and bottlenecks
4. **Custom Welcome Messages**: Teacher-configured welcome messages per group
5. **Multi-Group Support**: Assign students to multiple groups in single flow
6. **Invitation System**: Email/SMS invitations with expiration

## References

- **FEAT-002**: Email Authentication (PR #12) - Reference implementation pattern
- **F020**: Student Added to Class Webhook - Triggered by group assignment
- **Demo Feedback**: October 8, 2025 - User onboarding identified as priority item
- **Constitution**: `.specify/memory/constitution.md` - Development principles
- **Reverse AII**: `docs/prompts/feat-001-student-onboarding.md` - System prompt

## Approval

- **Specification Author**: AI Assistant (Spec-Kit Workflow)
- **Specification Date**: October 16, 2025
- **Review Status**: Pending
- **Approved By**: TBD
- **Approval Date**: TBD

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-16 | AI Assistant | Initial specification from Reverse AII prompt |
