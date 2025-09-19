/**
 * Integration Test: Profile Cache Management
 * 
 * This test validates localStorage profile caching, expiration handling,
 * and offline functionality as specified in the authentication system design.
 * 
 * Constitutional Compliance: Article II (Test-Driven Development)
 * These tests MUST FAIL before implementation exists.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { UserProfile, EntuPerson, EntuGroup } from '../../app/types/auth'

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

// Mock user profile data
const mockPerson: EntuPerson = {
  _id: '66b6245c7efc9ac06a437b97',
  _type: 'person',
  entu_user: 'test.student@example.com',
  email: 'test.student@example.com',
  forename: 'Test',
  surname: 'Student',
  idcode: '37204030303',
  _parent: [{
    reference: '686a6c011749f351b9c83124',
    entity_type: 'grupp',
    string: 'esimene klass'
  }],
  _created: '2024-08-09T14:14:52.460Z'
}

const mockGroup: EntuGroup = {
  _id: '686a6c011749f351b9c83124',
  _type: 'grupp',
  name: 'esimene klass',
  kirjeldus: [
    { string: 'proovigrupp', language: 'et' },
    { string: 'test group', language: 'en' }
  ],
  grupijuht: {
    reference: '66b6245c7efc9ac06a437b97',
    string: 'Test Teacher',
    entity_type: 'person'
  }
}

describe('Integration Test: Profile Cache Management', () => {
  beforeEach(() => {
    global.localStorage = localStorageMock as any
    vi.clearAllMocks()
    
    // Reset localStorage mock state
    localStorageMock.length = 0
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Profile Storage', () => {
    it('should store complete user profile with correct structure', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { storeUserProfile } = useProfileCache()

      const profile: UserProfile = {
        person: mockPerson,
        groups: [mockGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      }

      await storeUserProfile(profile)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'esmuseum_user_profile',
        JSON.stringify(profile)
      )
    })

    it('should store profile with automatic expiration timestamp', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { storeUserProfile } = useProfileCache()

      const baseProfile = {
        person: mockPerson,
        groups: [mockGroup]
      }

      const now = new Date('2024-01-15T10:30:00.000Z')
      vi.setSystemTime(now)

      await storeUserProfile(baseProfile as UserProfile)

      const expectedProfile: UserProfile = {
        ...baseProfile,
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z' // 24 hours later
      }

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'esmuseum_user_profile',
        JSON.stringify(expectedProfile)
      )
    })

    it('should handle storage errors gracefully', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { storeUserProfile } = useProfileCache()

      // Mock localStorage error (quota exceeded)
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const profile: UserProfile = {
        person: mockPerson,
        groups: [mockGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      }

      const result = await storeUserProfile(profile)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('QuotaExceededError')
    })
  })

  describe('Profile Retrieval', () => {
    it('should retrieve valid cached profile', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { getCachedUserProfile } = useProfileCache()

      const profile: UserProfile = {
        person: mockPerson,
        groups: [mockGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(profile))

      const now = new Date('2024-01-15T12:00:00.000Z') // 1.5 hours later
      vi.setSystemTime(now)

      const cachedProfile = await getCachedUserProfile()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('esmuseum_user_profile')
      expect(cachedProfile).toEqual(profile)
    })

    it('should return null for expired profiles', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { getCachedUserProfile } = useProfileCache()

      const expiredProfile: UserProfile = {
        person: mockPerson,
        groups: [mockGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredProfile))

      const now = new Date('2024-01-17T10:30:00.000Z') // Next day, expired
      vi.setSystemTime(now)

      const cachedProfile = await getCachedUserProfile()

      expect(cachedProfile).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('esmuseum_user_profile')
    })

    it('should handle corrupted cache data', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { getCachedUserProfile } = useProfileCache()

      // Mock corrupted JSON data
      localStorageMock.getItem.mockReturnValue('invalid-json-data')

      const cachedProfile = await getCachedUserProfile()

      expect(cachedProfile).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('esmuseum_user_profile')
    })

    it('should return null when no cache exists', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { getCachedUserProfile } = useProfileCache()

      localStorageMock.getItem.mockReturnValue(null)

      const cachedProfile = await getCachedUserProfile()

      expect(cachedProfile).toBeNull()
    })
  })

  describe('Profile Validation', () => {
    it('should validate profile structure and required fields', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { isProfileValid } = useProfileCache()

      const validProfile: UserProfile = {
        person: mockPerson,
        groups: [mockGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      }

      const isValid = isProfileValid(validProfile)
      expect(isValid).toBe(true)
    })

    it('should reject profiles missing required fields', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { isProfileValid } = useProfileCache()

      const invalidProfile = {
        person: mockPerson,
        // Missing groups, authenticated_at, expires_at
      } as UserProfile

      const isValid = isProfileValid(invalidProfile)
      expect(isValid).toBe(false)
    })

    it('should validate person entity structure', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { isProfileValid } = useProfileCache()

      const profileWithInvalidPerson: UserProfile = {
        person: {
          _id: '66b6245c7efc9ac06a437b97',
          // Missing required fields like _type, entu_user, etc.
        } as EntuPerson,
        groups: [mockGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      }

      const isValid = isProfileValid(profileWithInvalidPerson)
      expect(isValid).toBe(false)
    })

    it('should check timestamp validity', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { isProfileValid } = useProfileCache()

      const profileWithInvalidTimestamp: UserProfile = {
        person: mockPerson,
        groups: [mockGroup],
        authenticated_at: 'invalid-timestamp',
        expires_at: '2024-01-16T10:30:00.000Z'
      }

      const isValid = isProfileValid(profileWithInvalidTimestamp)
      expect(isValid).toBe(false)
    })
  })

  describe('Cache Expiration Management', () => {
    it('should check if profile is expired', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { isProfileExpired } = useProfileCache()

      const expiredProfile: UserProfile = {
        person: mockPerson,
        groups: [mockGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      }

      const now = new Date('2024-01-17T10:30:00.000Z') // Next day
      vi.setSystemTime(now)

      const isExpired = isProfileExpired(expiredProfile)
      expect(isExpired).toBe(true)
    })

    it('should check if profile will expire soon', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { isProfileExpiringSoon } = useProfileCache()

      const profileExpiringSoon: UserProfile = {
        person: mockPerson,
        groups: [mockGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-15T12:30:00.000Z' // Expires in 2 hours
      }

      const now = new Date('2024-01-15T11:30:00.000Z') // 1 hour before expiry
      vi.setSystemTime(now)

      const isExpiringSoon = isProfileExpiringSoon(profileExpiringSoon)
      expect(isExpiringSoon).toBe(true)
    })

    it('should extend profile expiration', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { extendProfileExpiration } = useProfileCache()

      const profile: UserProfile = {
        person: mockPerson,
        groups: [mockGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      }

      const now = new Date('2024-01-15T12:00:00.000Z')
      vi.setSystemTime(now)

      const extendResult = await extendProfileExpiration(profile)

      expect(extendResult.success).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'esmuseum_user_profile',
        expect.stringContaining('2024-01-16T12:00:00.000Z')
      )
    })
  })

  describe('Offline Functionality', () => {
    it('should work completely offline with valid cache', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { getCachedUserProfile, isOfflineCapable } = useProfileCache()

      const validProfile: UserProfile = {
        person: mockPerson,
        groups: [mockGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(validProfile))

      const now = new Date('2024-01-15T12:00:00.000Z')
      vi.setSystemTime(now)

      const cachedProfile = await getCachedUserProfile()
      const offlineCapable = await isOfflineCapable()

      expect(cachedProfile).toEqual(validProfile)
      expect(offlineCapable).toBe(true)
    })

    it('should detect when offline operation is not possible', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { isOfflineCapable } = useProfileCache()

      // No cached profile
      const offlineCapable = await isOfflineCapable()
      expect(offlineCapable).toBe(false)
    })

    it('should provide offline profile summary', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { getOfflineProfileSummary } = useProfileCache()

      const profile: UserProfile = {
        person: mockPerson,
        groups: [mockGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      }

      // Mock localStorage to return the profile
      localStorageMock.getItem.mockReturnValue(JSON.stringify(profile))

      const summary = await getOfflineProfileSummary()

      expect(summary).toEqual({
        user_name: 'Test Student',
        user_email: 'test.student@example.com',
        user_type: 'student',
        groups_count: 1,
        primary_group: 'esimene klass',
        cached_until: '2024-01-16T10:30:00.000Z'
      })
    })
  })

  describe('Cache Cleanup', () => {
    it('should clear all cached authentication data', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { clearCache } = useProfileCache()

      await clearCache()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('esmuseum_user_profile')
    })

    it('should clear expired profiles automatically', async () => {
      const { useProfileCache } = await import('../../app/composables/useProfileCache')
      const { cleanupExpiredProfiles } = useProfileCache()

      const expiredProfile: UserProfile = {
        person: mockPerson,
        groups: [mockGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredProfile))

      const now = new Date('2024-01-17T10:30:00.000Z') // Next day, expired
      vi.setSystemTime(now)

      const cleaned = await cleanupExpiredProfiles()

      expect(cleaned).toBe(true)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('esmuseum_user_profile')
    })
  })
})