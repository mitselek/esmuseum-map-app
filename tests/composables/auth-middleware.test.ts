/**
 * Tests for auth middleware — profile redirect extension (issue #49)
 *
 * Verifies that authenticated users with an incomplete forename or surname
 * (< 2 chars after trimming) are redirected to /profile, and that the
 * redirect is loop-safe (no redirect when already navigating to /profile).
 *
 * Existing unauthenticated / expired-token behaviour must be unaffected.
 *
 * Pattern: Nuxt auto-imports (defineNuxtRouteMiddleware, navigateTo,
 * import.meta.server/client) are stubbed globally before importing the
 * middleware so we can call the inner handler directly.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Nuxt globals ──────────────────────────────────────────────────────────────

const mockNavigateTo = vi.fn()
vi.stubGlobal('navigateTo', mockNavigateTo)

// defineNuxtRouteMiddleware is an identity wrapper — return the handler as-is
// so our import gives us a callable function.
vi.stubGlobal('defineNuxtRouteMiddleware', (handler: unknown) => handler)

// ── Dependency mocks ──────────────────────────────────────────────────────────

vi.stubGlobal('useClientLogger', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

// isTokenExpired: default to false (token is valid) in most tests
const mockIsTokenExpired = vi.fn().mockReturnValue(false)
vi.mock('../../app/utils/token-validation', () => ({
  isTokenExpired: (...args: unknown[]) => mockIsTokenExpired(...args)
}))

// notifySessionExpired: no-op
vi.mock('../../app/composables/useNotifications', () => ({
  notifySessionExpired: vi.fn()
}))

// rememberRedirect / getStoredAuth / isClientAuthenticated
const mockRememberRedirect = vi.fn()
const mockGetStoredAuth = vi.fn()
const mockIsClientAuthenticated = vi.fn()
vi.mock('../../app/utils/auth-check.client', () => ({
  getStoredAuth: (...args: unknown[]) => mockGetStoredAuth(...args),
  isClientAuthenticated: (...args: unknown[]) => mockIsClientAuthenticated(...args),
  rememberRedirect: (...args: unknown[]) => mockRememberRedirect(...args)
}))

// useEntuAuth — the composable the middleware calls for user & logout
const mockLogout = vi.fn()
const mockUser = vi.fn()
vi.mock('../../app/composables/useEntuAuth', () => ({
  useEntuAuth: () => ({
    user: { value: mockUser() },
    logout: mockLogout
  })
}))

// isUserNameComplete — the new helper under test at middleware level
const mockIsUserNameComplete = vi.fn()
vi.mock('../../app/utils/profile-validation', () => ({
  isUserNameComplete: (...args: unknown[]) => mockIsUserNameComplete(...args)
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRoute (path: string) {
  return { path, fullPath: path, query: {}, params: {} }
}

// ── Test suite ─────────────────────────────────────────────────────────────────

describe('auth middleware — profile redirect (issue #49)', () => {
  let authMiddleware: (to: ReturnType<typeof makeRoute>, from: ReturnType<typeof makeRoute>) => unknown

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    // Re-stub globals after resetModules
    vi.stubGlobal('navigateTo', mockNavigateTo)
    vi.stubGlobal('defineNuxtRouteMiddleware', (handler: unknown) => handler)
    vi.stubGlobal('useClientLogger', () => ({
      debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()
    }))

    // Default: server-side is false (client)
    Object.defineProperty(import.meta, 'server', { value: false, writable: true })

    // Default: authenticated with a valid non-expired token
    mockGetStoredAuth.mockReturnValue({ token: 'tok', user: { _id: 'u1' } })
    mockIsClientAuthenticated.mockReturnValue(true)
    mockIsTokenExpired.mockReturnValue(false)

    // Default: user has a complete name
    mockUser.mockReturnValue({ _id: 'u1', forename: 'Mihkel', surname: 'Kask' })
    mockIsUserNameComplete.mockReturnValue(true)

    const mod = await import('../../app/middleware/auth')
    authMiddleware = mod.default as typeof authMiddleware
  })

  // ── Unauthenticated cases — existing behaviour unchanged ──────────────────

  it('redirects unauthenticated user to /login', () => {
    mockIsClientAuthenticated.mockReturnValue(false)
    mockGetStoredAuth.mockReturnValue({ token: null, user: null })

    authMiddleware(makeRoute('/map'), makeRoute('/login'))

    expect(mockNavigateTo).toHaveBeenCalledWith('/login')
  })

  it('does not redirect to /profile for unauthenticated user', () => {
    mockIsClientAuthenticated.mockReturnValue(false)
    mockGetStoredAuth.mockReturnValue({ token: null, user: null })

    authMiddleware(makeRoute('/map'), makeRoute('/login'))

    expect(mockNavigateTo).not.toHaveBeenCalledWith('/profile')
  })

  // ── Authenticated + complete name — no profile redirect ───────────────────

  it('passes through when authenticated user has complete name navigating to /map', () => {
    mockUser.mockReturnValue({ _id: 'u1', forename: 'Mihkel', surname: 'Kask' })
    mockIsUserNameComplete.mockReturnValue(true)

    const result = authMiddleware(makeRoute('/map'), makeRoute('/'))

    // No redirect to /profile
    expect(mockNavigateTo).not.toHaveBeenCalledWith('/profile')
    // Middleware returns nothing (passes through)
    expect(result).toBeUndefined()
  })

  // ── Authenticated + incomplete forename ───────────────────────────────────

  it('redirects to /profile when authenticated user has incomplete forename', () => {
    mockUser.mockReturnValue({ _id: 'u1', forename: 'X', surname: 'Kask' })
    mockIsUserNameComplete.mockReturnValue(false)

    authMiddleware(makeRoute('/map'), makeRoute('/'))

    expect(mockNavigateTo).toHaveBeenCalledWith('/profile')
  })

  // ── Authenticated + incomplete surname ────────────────────────────────────

  it('redirects to /profile when authenticated user has incomplete surname', () => {
    mockUser.mockReturnValue({ _id: 'u1', forename: 'Mihkel', surname: 'P' })
    mockIsUserNameComplete.mockReturnValue(false)

    authMiddleware(makeRoute('/map'), makeRoute('/'))

    expect(mockNavigateTo).toHaveBeenCalledWith('/profile')
  })

  // ── Loop-safety — already on /profile ────────────────────────────────────

  it('does NOT redirect to /profile when destination is already /profile (loop-safe)', () => {
    mockUser.mockReturnValue({ _id: 'u1', forename: 'X', surname: 'P' })
    mockIsUserNameComplete.mockReturnValue(false)

    const result = authMiddleware(makeRoute('/profile'), makeRoute('/map'))

    expect(mockNavigateTo).not.toHaveBeenCalledWith('/profile')
    expect(result).toBeUndefined()
  })

  // ── /profile child routes — explicit contract ─────────────────────────────

  it('redirects to /profile when destination is a /profile child (no subroutes today, but guard is path-exact)', () => {
    // The middleware checks to.path === '/profile' exactly.
    // A child like /profile/something is NOT guarded — middleware may redirect.
    // This test documents that choice: /profile/something IS redirected.
    mockUser.mockReturnValue({ _id: 'u1', forename: 'X', surname: '' })
    mockIsUserNameComplete.mockReturnValue(false)

    authMiddleware(makeRoute('/profile/something'), makeRoute('/map'))

    // Expect redirect since /profile/something !== '/profile'
    expect(mockNavigateTo).toHaveBeenCalledWith('/profile')
  })
})
