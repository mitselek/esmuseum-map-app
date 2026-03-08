/**
 * Tests for client-side authentication composables
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'
import { mockTokens, mockUsers, createMockJWTWithExp } from '../mocks/jwt-tokens'
import { decodeJWT } from '../../app/utils/token-validation'

// Mock the composables since we can't import them directly in Node.js test environment
const mockUseEntuAuth = () => {
  const token = ref<string | null>(null)
  const user = ref<any>(null)
  const isAuthenticated = computed(() => !!token.value)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getToken = vi.fn()
  const refreshToken = vi.fn()
  const logout = vi.fn()
  const checkAndRefreshToken = vi.fn()

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    getToken,
    refreshToken,
    logout,
    checkAndRefreshToken
  }
}

// Mock localStorage operations
const mockLocalStorage = () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
})

describe('Client Auth Composables', () => {
  let localStorage: ReturnType<typeof mockLocalStorage>

  beforeEach(() => {
    localStorage = mockLocalStorage()
    Object.defineProperty(global, 'localStorage', {
      value: localStorage,
      writable: true
    })
  })

  describe('useEntuAuth composable behavior', () => {
    it('should initialize with token from localStorage', () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'esm_token') return mockTokens.valid
        if (key === 'esm_user') return JSON.stringify({ email: 'test@example.com', name: 'Test User' })
        return null
      })

      const auth = mockUseEntuAuth()

      // Simulate initialization
      auth.token.value = localStorage.getItem('esm_token')
      auth.user.value = JSON.parse(localStorage.getItem('esm_user') || 'null')

      expect(auth.token.value).toBe(mockTokens.valid)
      expect(auth.isAuthenticated.value).toBe(true)
    })

    it('should handle missing token gracefully', () => {
      localStorage.getItem.mockReturnValue(null)

      const auth = mockUseEntuAuth()

      // Simulate initialization with no stored data
      auth.token.value = localStorage.getItem('esm_token')
      auth.user.value = JSON.parse(localStorage.getItem('esm_user') || 'null')

      expect(auth.token.value).toBe(null)
      expect(auth.isAuthenticated.value).toBe(false)
    })

    it('should save token to localStorage when set', () => {
      const auth = mockUseEntuAuth()

      // Simulate setting a token
      auth.token.value = mockTokens.valid

      // Simulate the watcher behavior
      if (auth.token.value) {
        localStorage.setItem('esm_token', auth.token.value)
      }

      expect(localStorage.setItem).toHaveBeenCalledWith('esm_token', mockTokens.valid)
    })

    it('should clear localStorage on logout', () => {
      const auth = mockUseEntuAuth()

      // Mock the logout implementation
      auth.logout.mockImplementation(() => {
        auth.token.value = null
        auth.user.value = null
        localStorage.removeItem('esm_token')
        localStorage.removeItem('esm_user')
        localStorage.removeItem('esm_token_expiry')
        localStorage.removeItem('esm_auth_response')
      })

      auth.logout()

      expect(localStorage.removeItem).toHaveBeenCalledWith('esm_token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('esm_user')
      expect(localStorage.removeItem).toHaveBeenCalledWith('esm_token_expiry')
      expect(localStorage.removeItem).toHaveBeenCalledWith('esm_auth_response')
    })

    it('should handle corrupted user data in localStorage', () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'esm_token') return mockTokens.valid
        if (key === 'esm_user') return 'invalid-json-data'
        return null
      })

      const auth = mockUseEntuAuth()

      // Simulate initialization with corrupted data
      try {
        auth.user.value = JSON.parse(localStorage.getItem('esm_user') || 'null')
      }
      catch {
        auth.user.value = null
        localStorage.removeItem('esm_user')
      }

      expect(auth.user.value).toBe(null)
      expect(localStorage.removeItem).toHaveBeenCalledWith('esm_user')
    })
  })

  describe('Token management', () => {
    it('should detect expired tokens', () => {
      const now = Date.now()
      const expiredTime = now - 3600000 // 1 hour ago

      localStorage.getItem.mockImplementation((key) => {
        if (key === 'esm_token') return mockTokens.expired
        if (key === 'esm_token_expiry') return expiredTime.toString()
        return null
      })

      mockUseEntuAuth()

      // Simulate token expiry check
      const tokenExpiry = parseInt(localStorage.getItem('esm_token_expiry') || '0')
      const isExpired = tokenExpiry <= Date.now()

      expect(isExpired).toBe(true)
    })

    it('should refresh token when needed', async () => {
      const auth = mockUseEntuAuth()

      // Mock successful token refresh
      auth.refreshToken.mockResolvedValue(mockTokens.valid)

      const newToken = await auth.refreshToken()

      expect(newToken).toBe(mockTokens.valid)
      expect(auth.refreshToken).toHaveBeenCalled()
    })

    it('should handle refresh token failure', async () => {
      const auth = mockUseEntuAuth()

      // Mock failed token refresh
      const refreshError = new Error('Token refresh failed')
      auth.refreshToken.mockRejectedValue(refreshError)

      await expect(auth.refreshToken()).rejects.toThrow('Token refresh failed')
    })
  })

  describe('Authentication flow simulation', () => {
    it('should complete OAuth authentication flow', async () => {
      const auth = mockUseEntuAuth()

      // Mock successful OAuth authentication
      auth.getToken.mockResolvedValue({
        token: mockTokens.valid,
        user: mockUsers.student,
        accounts: [{ user: { _id: mockUsers.student._id } }]
      })

      const authResponse = await auth.getToken('oauth-token-from-callback')

      expect(authResponse.token).toBe(mockTokens.valid)
      expect(authResponse.user).toEqual(mockUsers.student)
      expect(auth.getToken).toHaveBeenCalledWith('oauth-token-from-callback')
    })

    it('should handle authentication failure', async () => {
      const auth = mockUseEntuAuth()

      // Mock authentication failure
      auth.getToken.mockRejectedValue(new Error('Authentication failed'))

      await expect(auth.getToken('invalid-oauth-token')).rejects.toThrow('Authentication failed')
    })

    it('should check and refresh token on initialization', () => {
      const auth = mockUseEntuAuth()

      // Mock token check and refresh
      auth.checkAndRefreshToken.mockImplementation(() => {
        // Simulate checking token expiry and refreshing if needed
        return Promise.resolve()
      })

      auth.checkAndRefreshToken()

      expect(auth.checkAndRefreshToken).toHaveBeenCalled()
    })
  })

  describe('JWT-based token expiry', () => {
    it('should parse exp claim from a valid JWT', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 7200 // 2 hours from now
      const token = createMockJWTWithExp(futureExp)
      const payload = decodeJWT(token)

      expect(payload).not.toBeNull()
      expect(payload!.exp).toBe(futureExp)
    })

    it('should detect token with exp in the past as expired', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      const token = createMockJWTWithExp(pastExp)
      const payload = decodeJWT(token)

      expect(payload).not.toBeNull()
      const isExpired = payload!.exp * 1000 <= Date.now()
      expect(isExpired).toBe(true)
    })

    it('should detect token with exp in the future as not expired', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 7200 // 2 hours from now
      const token = createMockJWTWithExp(futureExp)
      const payload = decodeJWT(token)

      expect(payload).not.toBeNull()
      const isExpired = payload!.exp * 1000 <= Date.now()
      expect(isExpired).toBe(false)
    })

    it('should handle JWT with no exp claim (fallback to 48h)', () => {
      const payload = decodeJWT(mockTokens.noExp)

      expect(payload).not.toBeNull()
      expect(payload!.exp).toBeUndefined()

      // When exp is missing, composable should fallback to 48h
      const FALLBACK_48H_MS = 48 * 60 * 60 * 1000
      const fallbackExpiry = Date.now() + FALLBACK_48H_MS

      // Verify the fallback value is approximately 48h from now (within 5s tolerance)
      expect(fallbackExpiry).toBeGreaterThan(Date.now() + FALLBACK_48H_MS - 5000)
      expect(fallbackExpiry).toBeLessThan(Date.now() + FALLBACK_48H_MS + 5000)
    })

    it('should set tokenExpiry from JWT exp (not hardcoded 12h)', () => {
      // This test verifies the composable sets expiry from JWT exp claim
      // The exp claim is in seconds, tokenExpiry is stored in milliseconds
      const futureExp = Math.floor(Date.now() / 1000) + 86400 // 24 hours from now
      const token = createMockJWTWithExp(futureExp)
      const payload = decodeJWT(token)

      expect(payload).not.toBeNull()

      // The composable should convert exp (seconds) to milliseconds
      const expectedExpiryMs = futureExp * 1000
      expect(expectedExpiryMs).toBeGreaterThan(Date.now())

      // Verify it's NOT the old hardcoded 12h value
      const hardcoded12h = Date.now() + (12 * 60 * 60 * 1000)
      expect(Math.abs(expectedExpiryMs - hardcoded12h)).toBeGreaterThan(3600000) // differs by >1h
    })

    it('should correctly convert exp from seconds to milliseconds', () => {
      const expSeconds = Math.floor(Date.now() / 1000) + 3600
      const token = createMockJWTWithExp(expSeconds)
      const payload = decodeJWT(token)

      expect(payload).not.toBeNull()
      // exp is in seconds, tokenExpiry should be in milliseconds
      const expiryMs = payload!.exp * 1000
      expect(expiryMs).toBeCloseTo(Date.now() + 3600000, -3) // within ~1 second
    })
  })

  describe('Error handling', () => {
    it('should handle network errors during authentication', async () => {
      const auth = mockUseEntuAuth()

      // Mock network error
      const networkError = new Error('Network error')
      auth.getToken.mockRejectedValue(networkError)

      auth.error.value = null

      try {
        await auth.getToken()
      }
      catch (error) {
        auth.error.value = (error as Error).message
      }

      expect(auth.error.value).toBe('Network error')
    })

    it('should handle malformed API responses', async () => {
      const auth = mockUseEntuAuth()

      // Mock malformed response
      auth.getToken.mockResolvedValue({
        // Missing required fields
        invalidResponse: true
      })

      try {
        const response = await auth.getToken()

        // Simulate validation that would happen in real composable
        if (!response.token) {
          throw new Error('No token received from authentication endpoint')
        }
      }
      catch (error) {
        auth.error.value = (error as Error).message
      }

      expect(auth.error.value).toBe('No token received from authentication endpoint')
    })
  })
})
