# Feature Specification: Email and Phone Authentication

**Feature Branch**: `029-add-email-authentication`  
**Created**: October 14, 2025  
**Status**: Draft  
**Input**: User description: "Add email authentication providers to login page according to our FEAT-002 research."  
**Research Reference**: [FEAT-002 Email Authentication Research](../../docs/FEAT-002-EMAIL-AUTH-RESEARCH.md)

## Execution Flow (main)

```text
1. Parse user description from Input ✓
   → Feature: Add email authentication provider to login
2. Extract key concepts from description ✓
   → Actors: Users without Google/Apple/Estonian ID
   → Actions: Login with email + verification code
   → Data: Email address, verification codes
   → Constraints: OAuth.ee provider must be enabled by Entu admin
3. For each unclear aspect ✓
   → Clarified: Email only (phone deferred to future enhancement)
4. Fill User Scenarios & Testing section ✓
5. Generate Functional Requirements ✓
6. Identify Key Entities ✓
7. Run Review Checklist ✓
8. Return: SUCCESS (spec ready for planning)
```

---

## Quick Guidelines

- Focus on WHAT users need and WHY
- Avoid HOW to implement (no tech stack, APIs, code structure)
- Written for business stakeholders, not developers

---

## User Scenarios & Testing

### Primary User Story

**As a** museum visitor without Google/Apple accounts or Estonian digital ID  
**I want to** log in to the Sports Museum Map Application using my email address  
**So that** I can access the application and participate in activities without requiring third-party accounts

### Acceptance Scenarios

1. **Given** a user on the login page, **When** they click the "Email" authentication button, **Then** they are redirected to enter their email address and receive a verification code
2. **Given** a user has entered their email, **When** they receive the verification code (within 30 seconds), **Then** they can enter the code to complete login
3. **Given** a user has successfully authenticated with email, **When** they return to the application, **Then** their session persists across pages
4. **Given** a returning user, **When** they log in again with the same email, **Then** their previous data and progress are preserved

### Edge Cases

- **Invalid verification code**: System displays clear error message, allows user to request new code
- **Expired verification code**: System prompts user to request new code after timeout period
- **Email/SMS delivery failure**: System provides feedback and retry option
- **Network interruption during authentication**: User can resume authentication flow without starting over
- **User enters email/phone incorrectly**: System allows correction before code is sent
- **Multiple login attempts**: System implements rate limiting to prevent abuse
- **User already logged in**: System recognizes existing session and redirects appropriately

## Requirements

### Functional Requirements

- **FR-001**: System MUST display email authentication option on login page alongside existing providers
- **FR-002**: Users MUST be able to initiate authentication by clicking email provider button
- **FR-003**: System MUST redirect users to OAuth.ee authentication flow when provider is selected
- **FR-004**: System MUST handle OAuth callback and token exchange for email provider
- **FR-005**: System MUST create user session after successful authentication
- **FR-006**: System MUST persist user identity across sessions using email as identifier
- **FR-007**: System MUST provide clear visual feedback during authentication process
- **FR-008**: System MUST display appropriate error messages for authentication failures
- **FR-009**: System MUST verify that email provider is enabled before displaying button

### Success Criteria

- Users can complete login using email address within 2 minutes
- Verification codes are delivered within 30 seconds
- Authentication completion rate matches or exceeds existing OAuth providers (>95%)
- User feedback indicates authentication process is intuitive and straightforward
- No increase in support requests related to authentication issues

### Future Enhancements

- Phone authentication can be added later with minimal effort (same OAuth.ee infrastructure)

### Dependencies

- **External Dependency**: Entu administrator must enable `e-mail` provider in OAuth.ee client configuration
- **Assumption**: OAuth.ee service has AWS SES (email) configured and operational
- **Assumption**: Existing OAuth flow implementation can accommodate additional provider without architectural changes

### Key Entities

- **Authentication Provider**: Represents a login method (email, Google, Apple, etc.)
  - Attributes: provider name, display label, icon, OAuth endpoint
  - Relationships: User can authenticate via one or more providers
  
- **User Session**: Represents authenticated user state
  - Attributes: user identifier (email), authentication method, session expiration
  - Relationships: Created after successful authentication, linked to user identity

- **Verification Code**: Temporary code sent via email for authentication
  - Attributes: code value, expiration time, destination email
  - Relationships: Generated by OAuth.ee, validated during authentication

---

## Scope

### In Scope

- Adding email authentication button to login page
- Integrating with existing OAuth.ee email provider
- Handling OAuth callback flow for email provider
- Basic error handling and user feedback
- Documentation updates for email authentication method

### Out of Scope

- Phone authentication (deferred to future enhancement)
- Custom verification code implementation (uses OAuth.ee existing service)
- Password-based authentication (feature uses verification codes)
- Email delivery infrastructure (handled by OAuth.ee/AWS)
- User account migration or data transformation
- Multi-factor authentication beyond single verification code
- Social recovery or account linking features

---

## Assumptions

1. OAuth.ee email provider is production-ready and stable
2. Entu administrator will approve enabling email provider
3. AWS SES service is configured at OAuth.ee level
4. Email delivery rates meet standard service levels (>99%)
5. Verification code security is handled by OAuth.ee service
6. Current login page can accommodate 1 additional provider button without UX degradation
7. Email addresses serve as unique user identifiers
8. Users have access to email at time of authentication
9. Phone authentication can be added later as a separate enhancement with minimal additional effort

---

## Review & Acceptance Checklist

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities clarified (Option B: Email only, phone deferred)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

## Notes

This specification is based on comprehensive research documented in [FEAT-002-EMAIL-AUTH-RESEARCH.md](../../docs/FEAT-002-EMAIL-AUTH-RESEARCH.md), which confirms:

- Email and phone authentication already exist at OAuth.ee service level
- Implementation requires minimal development effort (2-4 hours for email only)
- Primary dependency is Entu administrator enabling email provider
- Authentication uses verification codes, not passwords
- OAuth flow architecture remains consistent with existing providers
- **Decision**: Implementing email authentication only; phone authentication deferred to future enhancement
