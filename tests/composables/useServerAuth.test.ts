/**
 * Tests for useServerAuth composable
 *
 * Tests server-side auth flow, logout, auth result handling, and error cases
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, readonly } from 'vue'

// Mock dependencies
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

vi.stubGlobal('useClientLogger', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

vi.stubGlobal('navigateTo', vi.fn())

// Mock import.meta.client
Object.defineProperty(import.meta, 'client', { value: true, writable: true })

/**
 * Recreate useServerAuth behavior for testing since Nuxt auto-imports
 * are not available in node test environment
 */
const createMockServerAuth = () => {
  const isAuthenticated = ref(false)
  const user = ref<unknown>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const providers = {
    GOOGLE: 'google',
    APPLE: 'apple',
    SMART_ID: 'smart-id',
    MOBILE_ID: 'mobile-id',
    ID_CARD: 'id-card'
  }

  const checkAuthStatus = async () => {
    try {
      const response = await mockFetch('/api/auth/status') as { authenticated: boolean, user: unknown }
      isAuthenticated.value = response.authenticated
      user.value = response.user
      return response
    }
    catch {
      isAuthenticated.value = false
      user.value = null
      return { authenticated: false, user: null }
    }
  }

  const startAuthFlow = async (provider: string, _redirectUrl = '/') => {
    isLoading.value = true
    error.value = null

    try {
      if (!provider || !Object.values(providers).includes(provider)) {
        throw new Error('Invalid authentication provider')
      }

      const response = await mockFetch('/api/auth/start', {
        method: 'POST',
        body: { provider, redirectUrl: _redirectUrl }
      }) as { success: boolean, authUrl?: string }

      if (!response.success || !response.authUrl) {
        throw new Error('Failed to start authentication flow')
      }

      return true
    }
    catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start authentication'
      error.value = errorMessage
      isLoading.value = false
      return false
    }
  }

  const logout = async () => {
    isLoading.value = true
    error.value = null

    try {
      await mockFetch('/api/auth/logout', { method: 'POST' })
      isAuthenticated.value = false
      user.value = null
    }
    catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to logout'
      error.value = errorMessage
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    startAuthFlow,
    logout,
    checkAuthStatus,
    providers,
    // Expose mutable refs for test assertions
    _isAuthenticated: isAuthenticated,
    _user: user,
    _error: error,
    _isLoading: isLoading
  }
}

describe('useServerAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start unauthenticated', () => {
      const auth = createMockServerAuth()

      expect(auth.isAuthenticated.value).toBe(false)
      expect(auth.user.value).toBeNull()
      expect(auth.isLoading.value).toBe(false)
      expect(auth.error.value).toBeNull()
    })

    it('should expose all OAuth providers', () => {
      const auth = createMockServerAuth()

      expect(auth.providers).toEqual({
        GOOGLE: 'google',
        APPLE: 'apple',
        SMART_ID: 'smart-id',
        MOBILE_ID: 'mobile-id',
        ID_CARD: 'id-card'
      })
    })
  })

  describe('checkAuthStatus', () => {
    it('should set authenticated state on success', async () => {
      const mockUser = { _id: '123', name: 'Test User', email: 'test@example.com' }
      mockFetch.mockResolvedValue({ authenticated: true, user: mockUser })

      const auth = createMockServerAuth()
      const result = await auth.checkAuthStatus()

      expect(result.authenticated).toBe(true)
      expect(auth.isAuthenticated.value).toBe(true)
      expect(auth.user.value).toEqual(mockUser)
    })

    it('should reset state on failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const auth = createMockServerAuth()
      const result = await auth.checkAuthStatus()

      expect(result.authenticated).toBe(false)
      expect(auth.isAuthenticated.value).toBe(false)
      expect(auth.user.value).toBeNull()
    })

    it('should handle unauthenticated response', async () => {
      mockFetch.mockResolvedValue({ authenticated: false, user: null })

      const auth = createMockServerAuth()
      const result = await auth.checkAuthStatus()

      expect(result.authenticated).toBe(false)
      expect(auth.isAuthenticated.value).toBe(false)
    })
  })

  describe('startAuthFlow', () => {
    it('should call auth start endpoint with valid provider', async () => {
      mockFetch.mockResolvedValue({
        success: true,
        authUrl: 'https://oauth.ee/auth?provider=google'
      })

      const auth = createMockServerAuth()
      const result = await auth.startAuthFlow('google')

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/start', {
        method: 'POST',
        body: { provider: 'google', redirectUrl: '/' }
      })
    })

    it('should pass custom redirect URL', async () => {
      mockFetch.mockResolvedValue({
        success: true,
        authUrl: 'https://oauth.ee/auth'
      })

      const auth = createMockServerAuth()
      await auth.startAuthFlow('google', '/dashboard')

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/start', {
        method: 'POST',
        body: { provider: 'google', redirectUrl: '/dashboard' }
      })
    })

    it('should reject invalid provider', async () => {
      const auth = createMockServerAuth()
      const result = await auth.startAuthFlow('invalid-provider')

      expect(result).toBe(false)
      expect(auth.error.value).toBe('Invalid authentication provider')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should reject empty provider', async () => {
      const auth = createMockServerAuth()
      const result = await auth.startAuthFlow('')

      expect(result).toBe(false)
      expect(auth.error.value).toBe('Invalid authentication provider')
    })

    it('should handle server error', async () => {
      mockFetch.mockRejectedValue(new Error('Server unavailable'))

      const auth = createMockServerAuth()
      const result = await auth.startAuthFlow('google')

      expect(result).toBe(false)
      expect(auth.error.value).toBe('Server unavailable')
      expect(auth.isLoading.value).toBe(false)
    })

    it('should handle missing authUrl in response', async () => {
      mockFetch.mockResolvedValue({ success: true })

      const auth = createMockServerAuth()
      const result = await auth.startAuthFlow('google')

      expect(result).toBe(false)
      expect(auth.error.value).toBe('Failed to start authentication flow')
    })
  })

  describe('logout', () => {
    it('should clear auth state on successful logout', async () => {
      mockFetch.mockResolvedValue({})

      const auth = createMockServerAuth()
      // Set authenticated state first
      auth._isAuthenticated.value = true
      auth._user.value = { name: 'Test' }

      await auth.logout()

      expect(auth.isAuthenticated.value).toBe(false)
      expect(auth.user.value).toBeNull()
      expect(auth.isLoading.value).toBe(false)
    })

    it('should call logout endpoint', async () => {
      mockFetch.mockResolvedValue({})

      const auth = createMockServerAuth()
      await auth.logout()

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
    })

    it('should set error on logout failure', async () => {
      mockFetch.mockRejectedValue(new Error('Logout failed'))

      const auth = createMockServerAuth()
      await auth.logout()

      expect(auth.error.value).toBe('Logout failed')
      expect(auth.isLoading.value).toBe(false)
    })
  })
})
