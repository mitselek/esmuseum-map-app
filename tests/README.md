# Authentication Testing Suite

This document describes the comprehensive authentication testing strategy implemented for the ESMuseum Map App.

## Overview

The authentication testing suite provides complete coverage of both client-side and server-side authentication flows using mocked data and APIs. This ensures safe, fast, and reliable testing without dependencies on external services.

## Test Structure

```text
tests/
├── setup.ts                           # Global test setup and MSW configuration
├── mocks/
│   ├── jwt-tokens.ts                  # Mock JWT tokens and user data
│   └── entu-auth-api.ts               # MSW mocks for Entu API endpoints
├── server/
│   └── utils/
│       └── auth.test.ts               # Server-side authentication utilities
├── api/
│   └── auth-routes.test.ts            # API route authentication testing
└── composables/
    └── useEntuAuth.test.ts            # Client-side auth composable testing
```

## Test Categories

### 1. Server-Side Authentication Tests

**File**: `tests/server/utils/auth.test.ts`

Tests the core server authentication utilities:

- **extractBearerToken()**: Token extraction from Authorization headers
- **authenticateUser()**: JWT validation and user authentication
- **withAuth()**: Authentication wrapper for API routes

**Test Scenarios**:

- ✅ Valid JWT token authentication
- ✅ Expired token rejection
- ✅ Malformed token handling
- ✅ Missing Authorization header
- ✅ Invalid Bearer format
- ✅ Empty token handling
- ✅ Network error handling
- ✅ Handler error propagation

### 2. API Route Authentication Tests

**File**: `tests/api/auth-routes.test.ts`

Tests authentication behavior in API endpoints:

- `/api/tasks/[id]` - Task detail endpoint
- `/api/user/profile` - User profile endpoint
- `/api/tasks/search` - Task search endpoint

**Test Scenarios**:

- ✅ Authenticated requests succeed
- ✅ Unauthenticated requests return 401
- ✅ Expired tokens rejected
- ✅ Malformed tokens rejected
- ✅ Invalid task ID validation

### 3. Client-Side Authentication Tests

**File**: `tests/composables/useEntuAuth.test.ts`

Tests client-side authentication composable behavior:

**Test Scenarios**:

- ✅ Token initialization from localStorage
- ✅ Missing token handling
- ✅ Token persistence to localStorage
- ✅ Logout and localStorage cleanup
- ✅ Corrupted localStorage data handling
- ✅ Token expiry detection
- ✅ Token refresh functionality
- ✅ OAuth authentication flow
- ✅ Error handling and recovery

## Mock Data Strategy

### JWT Tokens

**File**: `tests/mocks/jwt-tokens.ts`

Provides realistic JWT tokens for testing:

```typescript
export const mockTokens = {
  valid: "eyJ...valid-jwt-token", // Active, valid token
  expired: "eyJ...expired-jwt-token", // Expired token
  malformed: "not.a.valid.jwt.token", // Invalid format
  invalidSignature: "eyJ...invalid-sig", // Invalid signature
  noUser: "eyJ...no-user-data", // Missing user data
  noAccounts: "eyJ...no-accounts", // Missing accounts data
};
```

### API Mocking

**File**: `tests/mocks/entu-auth-api.ts`

MSW (Mock Service Worker) handlers for Entu API endpoints:

- Authentication endpoint (`/api/esmuuseum`)
- Token refresh endpoint (`/api/auth`)
- Entity retrieval (`/api/esmuuseum/entity/:id`)
- Search functionality (`/api/esmuuseum/search`)
- Error scenarios (rate limiting, server errors)

## Running Tests

### Individual Test Suites

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run only authentication tests
npm run test:auth

# Run only API tests
npm run test:api

# Run with coverage
npm run test:coverage
```

### Specific Test Files

```bash
# Server auth utilities only
npx vitest tests/server/utils/auth.test.ts

# Client composables only
npx vitest tests/composables/useEntuAuth.test.ts

# API routes only
npx vitest tests/api/auth-routes.test.ts
```

## Test Configuration

### Environment Variables

Tests use isolated environment variables:

```env
NUXT_ENTU_URL=http://localhost:3001
NUXT_ENTU_ACCOUNT=test-account
NUXT_ENTU_KEY=test-key-not-real
```

### Vitest Configuration

**File**: `vitest.config.ts`

- Uses Nuxt test environment
- Global test helpers enabled
- MSW setup for API mocking
- Path aliases configured

## Benefits

### 1. **Safety**

- ✅ No production data exposure
- ✅ No real API dependencies
- ✅ Safe credential handling
- ✅ Isolated test environment

### 2. **Speed & Reliability**

- ✅ Fast execution (no network calls)
- ✅ Deterministic results
- ✅ Parallel test execution
- ✅ Offline capability

### 3. **Comprehensive Coverage**

- ✅ All authentication paths tested
- ✅ Error scenarios covered
- ✅ Edge cases validated
- ✅ Both client and server tested

### 4. **Development Workflow**

- ✅ Fast feedback during development
- ✅ Catches regressions early
- ✅ Documents expected behavior
- ✅ Enables confident refactoring

## Testing Best Practices

### 1. **Mock Strategy**

- Mock external APIs completely
- Use realistic test data
- Test edge cases and errors
- Keep mocks simple and focused

### 2. **Test Organization**

- Group related tests together
- Use descriptive test names
- Keep tests independent
- Clean up after each test

### 3. **Assertions**

- Test behavior, not implementation
- Use specific assertions
- Verify error conditions
- Check side effects

### 4. **Maintenance**

- Update tests with code changes
- Keep mock data realistic
- Review test coverage regularly
- Remove obsolete tests

## Future Enhancements

### Planned Additions

1. **E2E Authentication Tests**

   - Full browser-based auth flows
   - OAuth provider integration
   - Real user journey testing

2. **Performance Testing**

   - Authentication response times
   - Token validation benchmarks
   - Concurrent user simulation

3. **Security Testing**

   - Token manipulation attempts
   - Injection attack prevention
   - Rate limiting validation

4. **Integration Testing**
   - Staging environment validation
   - Cross-browser compatibility
   - Mobile device testing

## Troubleshooting

### Common Issues

**MSW Not Working**  

```bash
# Ensure MSW is properly set up
npm install -D msw@latest
```

**Import Path Errors**  

```bash
# Check alias configuration in vitest.config.ts
# Verify file paths in test imports
```

**Test Environment Issues**  

```bash
# Clear test cache
npx vitest run --no-cache
```

### Debug Tips

1. Add `console.log` statements in tests
2. Use `--reporter=verbose` for detailed output
3. Run single tests with `--t "test name"`
4. Check MSW request logging

## Conclusion

This comprehensive authentication testing suite ensures the reliability and security of the ESMuseum Map App's authentication system. By using mocked data and APIs, we maintain fast, safe, and deterministic tests that cover all authentication scenarios without compromising production systems.

The test suite serves as both validation and documentation of the authentication behavior, making it easier for developers to understand and maintain the authentication system.
