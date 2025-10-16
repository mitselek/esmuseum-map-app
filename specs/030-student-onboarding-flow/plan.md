# Implementation Plan: FEAT-001 Student Onboarding Flow

## Executive Summary

This plan outlines the implementation of FEAT-001: Student Onboarding Flow, enabling students to join class groups via signup links with automated OAuth authentication and group assignment. The implementation follows a Test-First Development (TDD) approach and adheres to all constitutional principles.

## Implementation Phases

### Phase 1: Research & Analysis

**Duration**: 0.5 days

**Objectives**:

- Understand existing OAuth flow patterns
- Analyze Entu API group assignment requirements
- Review FEAT-002 reference implementation
- Identify reusable composables and utilities

**Activities**:

1. **Code Review**:
   - Read `app/composables/useEntuOAuth.ts`
   - Read `app/composables/useEntuAuth.ts`
   - Read `app/pages/auth/callback.vue`
   - Read `server/utils/entu.ts`

2. **API Research**:
   - Document Entu API endpoint for adding child entity
   - Verify `NUXT_WEBHOOK_KEY` privilege requirements
   - Test group membership query endpoint

3. **Pattern Analysis**:
   - Review FEAT-002 (PR #12) structure
   - Document testing patterns used
   - Identify constitutional compliance checkpoints

**Deliverables**:

- Technical research notes
- API endpoint documentation
- Reusable code inventory

**Constitutional Checkpoints**:

- Pragmatic Simplicity: Identify simplest solution path
- Observable Development: Plan logging strategy

### Phase 2: Design & Architecture

**Duration**: 1 day

**Objectives**:

- Design composable architecture
- Define component structure
- Design server endpoint API
- Create data flow diagrams

**Activities**:

1. **Composable Design**:
   - Decide: New `useOnboarding()` vs extend existing composables
   - Define composable interface and return values
   - Plan state management approach
   - Design polling mechanism with timeout

2. **Component Design**:
   - Create `/signup/[groupId].vue` wireframe
   - Design waiting screen UI (mobile-first)
   - Plan error message display
   - Define accessibility requirements

3. **Server Endpoint Design**:
   - Design `/api/onboard/join-group.post.ts` structure
   - Define request/response types
   - Plan authentication validation
   - Design error handling

4. **Data Flow Mapping**:
   - Document complete user journey
   - Map OAuth state preservation
   - Define polling logic flow
   - Plan error recovery paths

**Deliverables**:

- Architecture decision record (ADR)
- Component wireframes
- API contract definitions
- Data flow diagrams

**Constitutional Checkpoints**:

- Type Safety First: Define all TypeScript interfaces
- Composable-First: Verify logic extraction plan
- Mobile-First: Review responsive design
- Accessibility: Verify ARIA requirements

### Phase 3: Implementation

**Duration**: 3 days

**Objectives**:

- Implement composable with TDD
- Create signup page component
- Build server endpoint
- Add i18n translations

#### Phase 3.1: Composable Implementation (TDD)

**Duration**: 1 day

**Test-First Approach**:

1. **Write Tests First**: `tests/composables/useOnboarding.test.ts`
   - Test polling logic (2-second interval)
   - Test timeout after 30 seconds
   - Test error handling scenarios
   - Test state management (isWaiting, error, hasTimedOut)

2. **Implement Composable**: `app/composables/useOnboarding.ts`
   - Create composable structure
   - Implement `joinGroup()` function
   - Implement `pollGroupMembership()` function
   - Add error handling and timeout logic

3. **Verify Tests Pass**: Run `npm run test:composables`

**Deliverables**:

- `app/composables/useOnboarding.ts`
- `tests/composables/useOnboarding.test.ts`
- All tests passing (green)

**Constitutional Checkpoints**:

- Test-First Development: Tests written before implementation
- Type Safety First: No `any` types, strict mode compliant
- Observable Development: Logging for debugging

#### Phase 3.2: Server Endpoint Implementation (TDD)

**Duration**: 0.5 days

**Test-First Approach**:

1. **Write Tests First**: `tests/api/onboard-join-group.test.ts`
   - Test successful group assignment
   - Test authentication validation (401)
   - Test invalid parameters (400)
   - Test Entu API errors (500)

2. **Implement Endpoint**: `server/api/onboard/join-group.post.ts`
   - Validate `NUXT_WEBHOOK_KEY`
   - Parse request body (groupId, userId)
   - Call Entu API to add user as child
   - Return success/error response

3. **Verify Tests Pass**: Run `npm run test:api`

**Deliverables**:

- `server/api/onboard/join-group.post.ts`
- `tests/api/onboard-join-group.test.ts`
- All tests passing (green)

**Constitutional Checkpoints**:

- Test-First Development: API tests drive implementation
- Type Safety First: Request/response types defined
- Observable Development: Structured logging for errors

#### Phase 3.3: Component Implementation (TDD)

**Duration**: 1 day

**Test-First Approach**:

1. **Write Tests First**: `tests/component/signup-groupId.test.ts`
   - Test route param extraction
   - Test OAuth redirect when not authenticated
   - Test waiting screen display
   - Test error message rendering
   - Test success redirect

2. **Implement Component**: `app/pages/signup/[groupId].vue`
   - Extract groupId from route params
   - Store groupId in localStorage
   - Check authentication state
   - Display waiting screen with spinner
   - Handle errors and success states

3. **Verify Tests Pass**: Run `npm run test:component`

**Deliverables**:

- `app/pages/signup/[groupId].vue`
- `tests/component/signup-groupId.test.ts`
- All tests passing (green)

**Constitutional Checkpoints**:

- Test-First Development: Component tests guide implementation
- Mobile-First: Responsive design verified
- Accessibility: Semantic HTML, ARIA labels tested

#### Phase 3.4: i18n Translations

**Duration**: 0.5 days

**Activities**:

1. **Add Translation Keys**: Update i18n locale files
   - Estonian (et): Primary translations
   - English (en): English translations
   - Ukrainian (uk): Ukrainian translations
   - Latvian (lv): Latvian translations

2. **Required Keys**:
   - `onboarding.waiting.title`
   - `onboarding.waiting.description`
   - `onboarding.error.timeout`
   - `onboarding.error.tryAgain`
   - `onboarding.error.technical`
   - `onboarding.error.alreadyMember`
   - `onboarding.success.redirect`

3. **Verify Translations**: Test all 4 languages in UI

**Deliverables**:

- Updated locale files (et.json, en.json, uk.json, lv.json)
- Translation verification report

**Constitutional Checkpoints**:

- Pragmatic Simplicity: Clear, concise translations
- Accessibility: Plain language for all users

### Phase 4: Integration & Testing

**Duration**: 1 day

**Objectives**:

- Run full test suite
- Perform manual testing
- Validate constitutional compliance
- Test with real Entu data

**Activities**:

1. **Unit Test Verification**:
   - Run `npm run test` - Verify 100% pass rate
   - Check test coverage (aim for >80%)
   - Fix any failing tests

2. **Manual Testing**:
   - Test signup flow end-to-end
   - Test all error scenarios (timeout, technical, already member)
   - Test on mobile devices (iOS, Android)
   - Test with screen reader (accessibility)

3. **Integration Testing** (optional):
   - Create `tests/integration/student-onboarding.test.ts`
   - Test with real test data: `TEST_ENTU_GROUP_ID`, `TEST_ENTU_PERSON_ID`
   - Verify F020 webhook trigger

4. **Constitutional Compliance Audit**:
   - Type Safety: No `any` types without justification
   - Composable-First: Logic extracted to composables
   - Test-First: All tests written before implementation
   - Observable: Logging implemented
   - Mobile-First: Responsive design validated
   - Accessibility: WCAG 2.1 AA compliance checked
   - Pragmatic Simplicity: Code review for complexity

**Deliverables**:

- Test execution report (100% pass rate)
- Manual testing checklist (completed)
- Constitutional compliance report
- Integration test suite (optional)

**Constitutional Checkpoints**:

- All 7 principles verified and documented

### Phase 5: Documentation & Code Review

**Duration**: 0.5 days

**Objectives**:

- Write comprehensive documentation
- Ensure markdown quality
- Prepare pull request
- Request code review

**Activities**:

1. **Documentation**:
   - Update README with onboarding flow description
   - Document API endpoint in `docs/api/`
   - Add inline code comments where needed
   - Verify markdown lint-free (no trailing spaces, proper blank lines)

2. **Pull Request Preparation**:
   - Follow FEAT-002 PR structure
   - Write clear PR title and description
   - List all changes and files modified
   - Include test results and screenshots
   - Reference spec and plan documents

3. **Code Review**:
   - Self-review checklist completion
   - Request peer review
   - Address review comments
   - Final approval

**Deliverables**:

- Documentation updates
- Pull request (draft → ready for review)
- Code review completion
- Merge approval

**Constitutional Checkpoints**:

- Documentation Standards: Markdown quality verified
- No emoji in formal documentation or code
- Recursive propagation: Standards applied to all derivative content

## Testing Strategy

### Test-First Development (TDD) Approach

All implementation follows strict TDD:

1. **Red**: Write failing test first
2. **Green**: Implement minimum code to pass test
3. **Refactor**: Improve code while keeping tests green

### Test Pyramid

```text
        ┌──────────────┐
        │ Integration  │  Optional: E2E signup flow
        │   Tests      │  (1-2 tests)
        ├──────────────┤
        │  Component   │  Signup page UI tests
        │   Tests      │  (5-8 tests)
        ├──────────────┤
        │  Composable  │  Onboarding logic tests
        │   Tests      │  (8-12 tests)
        ├──────────────┤
        │     API      │  Server endpoint tests
        │   Tests      │  (6-10 tests)
        └──────────────┘
```

### Test Coverage Goals

- **Composable**: >90% coverage (critical business logic)
- **Component**: >80% coverage (UI interactions)
- **API**: >90% coverage (security and validation)
- **Integration**: >70% coverage (happy path + critical errors)

### Test Data

Use real test IDs from `.env` for integration tests:

- `TEST_ENTU_GROUP_ID = 686a6c011749f351b9c83124`
- `TEST_ENTU_PERSON_ID = 66b6245c7efc9ac06a437b97`

### Test Execution

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:composables
npm run test:component
npm run test:api
npm run test:integration

# Run with coverage
npm run test:coverage
```

## Risk Management

### High-Priority Risks

#### Risk 1: OAuth State Loss During Redirect

**Impact**: High - User cannot complete signup
**Probability**: Medium
**Mitigation**:

- Use localStorage to persist `groupId`
- Add expiration timestamp (1 hour)
- Fallback to OAuth state parameter

**Monitoring**:

- Log localStorage persistence
- Track OAuth callback success rate

#### Risk 2: Polling Performance Impact

**Impact**: Medium - Server load increases
**Probability**: Low (15 API calls per signup)
**Mitigation**:

- Monitor server metrics during testing
- Implement exponential backoff if needed
- Consider WebSocket for future optimization

**Monitoring**:

- Track API response times
- Monitor concurrent signup load

#### Risk 3: Timeout Edge Cases

**Impact**: Medium - User sees error despite successful assignment
**Probability**: Low
**Mitigation**:

- Final membership check before timeout error
- Extend grace period to 35 seconds total
- Log all timeout events

**Monitoring**:

- Track timeout frequency
- Analyze timeout vs success correlation

### Medium-Priority Risks

#### Risk 4: Mobile Browser Compatibility

**Impact**: Medium - Signup fails on specific browsers
**Probability**: Low
**Mitigation**:

- Test on iOS Safari, Chrome, Firefox
- Test on Android Chrome, Samsung Browser
- Use polyfills for localStorage if needed

**Monitoring**:

- Browser-specific error tracking
- User agent logging

#### Risk 5: i18n Translation Quality

**Impact**: Low - Poor user experience in non-Estonian languages
**Probability**: Medium
**Mitigation**:

- Use professional translations
- Review with native speakers
- Keep translations simple and clear

**Monitoring**:

- User feedback by language
- Translation accuracy reviews

## Resource Requirements

### Development Team

- **Frontend Developer**: 2 days (composable + component)
- **Backend Developer**: 0.5 days (server endpoint)
- **QA Engineer**: 1 day (testing and validation)
- **DevOps**: 0.5 days (deployment and monitoring)

### Tools and Infrastructure

- **Development**: VS Code, TypeScript, Vitest
- **Testing**: Vitest, Testing Library, MSW (Mock Service Worker)
- **Monitoring**: Structured logging, error tracking
- **Deployment**: Existing Nuxt deployment pipeline

### External Dependencies

- **Entu API**: Group assignment endpoint
- **OAuth Providers**: Google, Apple, Email
- **F020 Webhook**: Student Added to Class trigger

## Timeline

| Phase | Duration | Start Date | End Date | Owner |
|-------|----------|------------|----------|-------|
| Phase 1: Research & Analysis | 0.5 days | Day 1 | Day 1 | Frontend Dev |
| Phase 2: Design & Architecture | 1 day | Day 2 | Day 2 | Frontend + Backend |
| Phase 3.1: Composable (TDD) | 1 day | Day 3 | Day 3 | Frontend Dev |
| Phase 3.2: Server Endpoint (TDD) | 0.5 days | Day 4 AM | Day 4 AM | Backend Dev |
| Phase 3.3: Component (TDD) | 1 day | Day 4 PM | Day 5 AM | Frontend Dev |
| Phase 3.4: i18n Translations | 0.5 days | Day 5 PM | Day 5 PM | Frontend Dev |
| Phase 4: Integration & Testing | 1 day | Day 6 | Day 6 | QA Engineer |
| Phase 5: Documentation & Review | 0.5 days | Day 7 | Day 7 | All Team |

**Total Duration**: 5.5 days (approximately 1 week)

## Success Criteria

Implementation is considered successful when:

1. All tests pass (100% pass rate)
2. User completes signup in < 60 seconds
3. TypeScript strict mode compliance (no errors)
4. Mobile-responsive on all device sizes
5. WCAG 2.1 Level AA accessibility compliance
6. i18n support for all 4 languages verified
7. All 7 constitutional principles followed
8. Markdown documentation lint-free
9. Code review approved
10. Successfully deployed to production

## Deployment Strategy

### Pre-Deployment Checklist

- [ ] All tests passing in CI/CD
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Monitoring and logging in place
- [ ] Rollback plan documented

### Deployment Steps

1. **Staging Deployment**:
   - Deploy to staging environment
   - Run smoke tests with test data
   - Verify OAuth flow end-to-end
   - Test on mobile devices

2. **Production Deployment**:
   - Deploy during low-traffic window
   - Monitor error rates and response times
   - Verify F020 webhook triggering
   - Test with real teacher-provided signup link

3. **Post-Deployment Monitoring**:
   - Monitor signup success rate
   - Track timeout frequency
   - Monitor API response times
   - Review error logs

### Rollback Plan

If critical issues arise:

1. Revert to previous deployment
2. Disable signup route temporarily
3. Investigate and fix issues in staging
4. Re-deploy when stable

## Constitutional Compliance Verification

### Type Safety First

- [ ] All types explicitly defined (no implicit `any`)
- [ ] TypeScript strict mode enabled
- [ ] No type assertions without justification
- [ ] All `any` types documented with reason

### Composable-First Development

- [ ] Business logic extracted to `useOnboarding()` composable
- [ ] Reusable logic not duplicated in components
- [ ] Composable follows Vue 3 composition API patterns
- [ ] Composable thoroughly tested

### Test-First Development (TDD)

- [ ] Tests written before implementation
- [ ] Red-Green-Refactor cycle followed
- [ ] 100% test pass rate
- [ ] Test coverage >80% for all modules

### Observable Development

- [ ] Console logging for development debugging
- [ ] Structured logging for production
- [ ] Error tracking implemented
- [ ] Performance metrics logged

### Mobile-First

- [ ] Responsive design (320px+ screen widths)
- [ ] Touch-friendly UI elements (min 44px tap targets)
- [ ] Tested on iOS and Android devices
- [ ] Fast page load times (<3s)

### Accessibility

- [ ] Semantic HTML elements used
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation supported
- [ ] Screen reader tested
- [ ] Color contrast meets WCAG AA standards

### Pragmatic Simplicity

- [ ] Simplest solution chosen
- [ ] No over-engineering
- [ ] Code is readable and maintainable
- [ ] Dependencies minimized

## References

- **FEAT-002**: Email Authentication (PR #12) - Reference implementation
- **Spec Document**: `specs/030-student-onboarding-flow/spec.md`
- **System Prompt**: `docs/prompts/feat-001-student-onboarding.md`
- **Constitution**: `.specify/memory/constitution.md`
- **Demo Feedback**: October 8, 2025 demo session notes

## Approval

- **Plan Author**: AI Assistant (Spec-Kit Workflow)
- **Plan Date**: October 16, 2025
- **Review Status**: Pending
- **Approved By**: TBD
- **Approval Date**: TBD

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-16 | AI Assistant | Initial implementation plan from spec |
