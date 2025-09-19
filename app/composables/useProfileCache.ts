/**
 * Profile Cache Composable for Estonian War Museum Authentication System
 * 
 * Provides localStorage-based profile caching with automatic expiration,
 * data validation, and offline capability support.
 * 
 * Features:
 * - Automatic timestamp management (authenticated_at, expires_at)
 * - Profile validation and structure checking
 * - Expiration handling and extension
 * - Offline capability detection
 * - Error handling for storage operations
 * - GDPR-compliant data cleanup
 */

import type { UserProfile, EntuPerson, EntuGroup } from '../types/auth'

// Configuration constants
const CACHE_KEY = 'esmuseum_user_profile'
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const EXPIRY_WARNING_THRESHOLD = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

/**
 * Storage operation result interface
 */
interface StorageResult {
  success: boolean
  error?: string
}

/**
 * Profile summary for offline use
 */
interface OfflineProfileSummary {
  name: string
  groupsCount: number
  expiresAt: string
  isValid: boolean
}

export const useProfileCache = () => {
  
  /**
   * Store user profile in localStorage with automatic timestamp management
   */
  const storeUserProfile = async (profile: Partial<UserProfile>): Promise<StorageResult> => {
    try {
      const now = new Date().toISOString()
      const expiresAt = new Date(Date.now() + DEFAULT_CACHE_DURATION).toISOString()
      
      const completeProfile: UserProfile = {
        person: profile.person!,
        groups: profile.groups || [],
        authenticated_at: profile.authenticated_at || now,
        expires_at: profile.expires_at || expiresAt
      }

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(completeProfile))
        return { success: true }
      } else {
        return { success: false, error: 'LocalStorage not available' }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.name === 'QuotaExceededError' ? 'QuotaExceededError' : error.message
      }
    }
  }

  /**
   * Retrieve cached user profile from localStorage
   * Returns null if profile is expired, corrupted, or doesn't exist
   */
  const getCachedUserProfile = async (): Promise<UserProfile | null> => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null
      }

      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) {
        return null
      }

      const profile: UserProfile = JSON.parse(cached)
      
      // Check if profile is expired
      if (isProfileExpired(profile)) {
        // Auto-cleanup expired profile
        localStorage.removeItem(CACHE_KEY)
        return null
      }

      // Validate profile structure
      if (!isProfileValid(profile)) {
        // Cleanup corrupted profile
        localStorage.removeItem(CACHE_KEY)
        return null
      }

      return profile
    } catch (error) {
      // Handle corrupted data by removing it
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(CACHE_KEY)
      }
      return null
    }
  }

  /**
   * Validate profile structure and required fields
   */
  const isProfileValid = (profile: any): profile is UserProfile => {
    if (!profile || typeof profile !== 'object') {
      return false
    }

    // Check required top-level fields
    if (!profile.person || !profile.groups || !profile.authenticated_at || !profile.expires_at) {
      return false
    }

    // Validate person entity structure
    const person = profile.person
    if (!person._id || !person._type || person._type !== 'person' || 
        !person.entu_user || !person.email || !person.forename || !person.surname) {
      return false
    }

    // Validate _parent array
    if (!Array.isArray(person._parent)) {
      return false
    }

    // Validate groups array
    if (!Array.isArray(profile.groups)) {
      return false
    }

    // Validate timestamps
    if (!isValidTimestamp(profile.authenticated_at) || !isValidTimestamp(profile.expires_at)) {
      return false
    }

    return true
  }

  /**
   * Check if profile is expired
   */
  const isProfileExpired = (profile: UserProfile | any): boolean => {
    if (!profile || !profile.expires_at) {
      return true
    }

    try {
      const expirationTime = new Date(profile.expires_at).getTime()
      const now = Date.now()
      return now >= expirationTime
    } catch {
      return true
    }
  }

  /**
   * Check if profile will expire soon (within warning threshold)
   */
  const isProfileExpiringSoon = (profile: UserProfile): boolean => {
    try {
      const expirationTime = new Date(profile.expires_at).getTime()
      const now = Date.now()
      return (expirationTime - now) <= EXPIRY_WARNING_THRESHOLD
    } catch {
      return true
    }
  }

  /**
   * Extend profile expiration by the default cache duration
   */
  const extendProfileExpiration = async (profile: UserProfile): Promise<StorageResult> => {
    try {
      const newExpirationTime = new Date(Date.now() + DEFAULT_CACHE_DURATION).toISOString()
      
      const updatedProfile: UserProfile = {
        ...profile,
        expires_at: newExpirationTime
      }

      return await storeUserProfile(updatedProfile)
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Check if offline operation is possible (valid cached profile exists)
   */
  const isOfflineCapable = async (): Promise<boolean> => {
    const cachedProfile = await getCachedUserProfile()
    return cachedProfile !== null && !isProfileExpired(cachedProfile)
  }

  /**
   * Get profile summary for offline display
   */
  const getOfflineProfileSummary = async (): Promise<any | null> => {
    const cachedProfile = await getCachedUserProfile()
    
    if (!cachedProfile) {
      return null
    }

    // Determine user type based on groups or other criteria
    const userType = 'student' // Simplified - all users are students

    // Get primary group (first group or most relevant)
    const primaryGroup = cachedProfile.groups.length > 0 ? 
      cachedProfile.groups[0].name || 'Unknown Group' : 
      'No Groups'

    return {
      user_name: `${cachedProfile.person.forename} ${cachedProfile.person.surname}`,
      user_email: cachedProfile.person.email,
      user_type: userType,
      groups_count: cachedProfile.groups.length,
      primary_group: primaryGroup,
      cached_until: cachedProfile.expires_at
    }
  }

  /**
   * Clear all cached profile data
   */
  const clearCache = async (): Promise<StorageResult> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(CACHE_KEY)
        return { success: true }
      } else {
        return { success: false, error: 'LocalStorage not available' }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Clean up expired profiles and any corrupted data
   */
  const cleanupExpiredProfiles = async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false
      }

      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) {
        return true // Nothing to cleanup
      }

      try {
        const profile: UserProfile = JSON.parse(cached)
        
        // Remove if expired or invalid
        if (isProfileExpired(profile) || !isProfileValid(profile)) {
          localStorage.removeItem(CACHE_KEY)
        }
      } catch {
        // Remove corrupted data
        localStorage.removeItem(CACHE_KEY)
      }

      return true
    } catch (error: any) {
      return false
    }
  }

  // Helper function to validate timestamp strings
  const isValidTimestamp = (timestamp: string): boolean => {
    try {
      const date = new Date(timestamp)
      return date instanceof Date && !isNaN(date.getTime())
    } catch {
      return false
    }
  }

  return {
    // Core cache operations
    storeUserProfile,
    getCachedUserProfile,
    clearCache,
    
    // Profile validation
    isProfileValid,
    isProfileExpired,
    isProfileExpiringSoon,
    
    // Cache management
    extendProfileExpiration,
    cleanupExpiredProfiles,
    
    // Offline functionality
    isOfflineCapable,
    getOfflineProfileSummary
  }
}