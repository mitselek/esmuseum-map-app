# System Prompt: FEAT-001 Student Onboarding Flow Implementation

## Context

You are implementing FEAT-001 (User onboarding) for the Estonian War Museum (ESMuseum) Map Application - a Vue 3 + Nuxt 3 application with TypeScript strict mode, following the project's constitutional principles.

## Project Constitution Requirements

This implementation MUST adhere to `.specify/memory/constitution.md` principles:

1. **Type Safety First**: TypeScript strict mode, no `any` types without documented justification
2. **Composable-First Development**: Extract reusable logic into composables
3. **Test-First Development (TDD)**: Write tests before implementation
4. **Observable Development**: Console logging for debugging, structured logging for production
5. **Mobile-First**: Responsive design, touch-friendly UI
6. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
7. **Pragmatic Simplicity**: Simple solutions over complex ones

## Feature Requirements

### User Flow

**Signup Link Entry** → **OAuth Authentication** → **Waiting Screen** → **Group Assignment** → **Tasks Page**

### Detailed Flow

1. **User clicks signup link**: `https://esm.entu.ee/signup/686a6c011749f351b9c83124`
   - Route: `/signup/:groupId`
   - Extract `groupId` from URL
   - Store `groupId` in state/localStorage for OAuth callback

2. **Redirect to OAuth flow**:
   - Use existing OAuth providers (Google, Apple, Email, etc.)
   - After OAuth callback, user returns authenticated

3. **Waiting screen** (while group assignment happens):
   - Display: "Please wait while we set up your account..."
   - Three-dot animated spinner: "." → ". ." → ". . ." (cycling animation)
   - Poll Entu API every 2 seconds to check if user has access to the group
   - Timeout after 30 seconds

4. **Server-side group assignment**:
   - Endpoint: `POST /api/onboard/join-group`
   - Uses privileged `NUXT_WEBHOOK_KEY` from environment
   - Makes Entu API call to add user as child of group entity
   - Triggers F020: Student Added to Class Webhook (Entu trigger)

5. **Error handling**:
   - **Timeout (30s)**: Show "Please try again" with link back to original signup URL
   - **Already member**: Skip waiting screen, redirect directly to tasks
   - **Technical error**: Display error message with technical details

6. **Success**:
   - Redirect to tasks page: `/` or `/tasks`
   - User now sees tasks assigned to their group

### Technical Implementation

**Route Structure**:

- New route: `app/pages/signup/[groupId].vue`
- Signup page handles OAuth redirect and callback logic

**Server Endpoint**:

- New endpoint: `server/api/onboard/join-group.post.ts`
- Validates `NUXT_WEBHOOK_KEY` from environment
- Makes privileged Entu API call to assign user to group
- Returns success/error response

**Composable** (decide during specification):

- Consider new `useOnboarding()` or `useGroupSignup()` composable
- OR extend existing auth composables
- Handles polling state, timeout logic, error management

**Existing Code Reuse**:

- Leverage `useEntuOAuth()` for OAuth flow
- Reuse `useEntuAuth()` for authentication state
- Follow patterns from `app/pages/auth/callback.vue`
- Use existing Entu API utilities from `server/utils/entu.ts`

### Testing Requirements

Follow FEAT-002 (email authentication) testing pattern:

1. **Composable tests**: Logic for polling, timeout, state management
2. **Component tests**: Signup page UI and user interactions
3. **Server endpoint tests**: `/api/onboard/join-group` with mocked Entu API
4. **Integration tests**: E2E signup flow (optional, depending on complexity)

**Test data**:

- Use `TEST_ENTU_GROUP_ID = 686a6c011749f351b9c83124` from `.env`
- Use `TEST_ENTU_PERSON_ID = 66b6245c7efc9ac06a437b97` from `.env`

### Documentation Standards

**Markdown Quality** (for all generated specs/docs):

1. **Formatting**:
   - Blank lines before and after all headings
   - Blank lines before and after all lists
   - Blank lines before and after all code blocks
   - Remove trailing spaces

2. **Emoji Usage**:
   - Avoid emojis in formal documentation (specs, plans, tasks)
   - Avoid emojis in code comments and console logs
   - Use clear text prefixes: `[INFO]`, `[ERROR]`, `[WARNING]`

3. **Validation**: Review all markdown output for linting issues before presenting

### i18n Translations

Include translations for all UI text in 4 languages:

- `et` (Estonian - primary)
- `en` (English)
- `uk` (Ukrainian)
- `lv` (Latvian)

**Required translation keys** (minimum):

- `onboarding.waiting.title` - "Please wait while we set up your account..."
- `onboarding.waiting.description` - Optional explanatory text
- `onboarding.error.timeout` - "Setup timed out. Please try again."
- `onboarding.error.tryAgain` - "Try again"
- `onboarding.error.technical` - "Technical error: {error}"

## Expected Deliverables

When this prompt is used with `/speckit.specify`, it should generate:

1. **spec.md**: Feature specification with:
   - User stories
   - Acceptance criteria
   - Technical constraints
   - Out of scope items

2. **plan.md**: Implementation plan with:
   - Phase 1: Research & Analysis
   - Phase 2: Design & Architecture
   - Phase 3: Implementation Tasks
   - Testing strategy
   - Constitutional compliance checkpoints

3. **tasks.md**: Task breakdown with:
   - Dependencies clearly marked
   - Risk levels (LOW/MEDIUM/HIGH)
   - Test-first approach (TDD)
   - Validation checklists

## Success Criteria

1. User clicks signup link → successfully joins group → sees tasks (< 60 seconds)
2. Waiting screen shows clear feedback with animated spinner
3. Timeout after 30s with retry option
4. Duplicate signup handled gracefully (skip waiting if already member)
5. All tests passing (100% pass rate)
6. TypeScript strict mode compliance
7. Mobile-responsive design
8. i18n support for 4 languages
9. Constitutional principles followed
10. Markdown documentation lint-free

## Reference Implementation

Follow patterns from FEAT-002 (email authentication, PR #12):

- Minimal code changes (2 files modified, 2 tests created for core feature)
- TDD approach (tests first, then implementation)
- Constitutional compliance (proper type safety, documented exceptions)
- Clean PR with comprehensive description

## Constraints

- **Environment**: Use `NUXT_WEBHOOK_KEY` for privileged operations only
- **Security**: Never expose webhook key to client-side code
- **Performance**: Polling every 2 seconds, timeout at 30 seconds
- **Compatibility**: Must work with existing OAuth flow (no breaking changes)
- **Test data**: Use `TEST_ENTU_GROUP_ID` for integration tests

## Recursive Requirement

If this prompt generates derivative content (specs, plans, tasks) that itself contains markdown or code:

- Apply these same markdown formatting requirements
- Include constitutional compliance validation
- Propagate documentation quality standards
- Include this recursive propagation clause

---

**This system prompt is optimized for the AI model you are currently using and ensures the implementation follows ESMuseum Map App project standards, spec-kit workflow, and constitutional principles.**

## Usage

Use this prompt with the spec-kit workflow:

```bash
/speckit.specify <paste this prompt content>
```

Or reference this file when starting FEAT-001 implementation.

## Generated

- **Date**: October 16, 2025
- **Method**: Reverse AII interview process
- **For**: FEAT-001 Student Onboarding Flow
- **Reference**: Demo feedback item from October 8, 2025 demo session
