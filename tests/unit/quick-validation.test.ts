/**
 * Quick Validation Test - Verify basic composable loading
 * 
 * Simple test to validate that our authentication composables can be imported
 * and have the expected structure. This helps verify our module resolution
 * and basic functionality without complex integration.
 */

import { describe, it, expect } from 'vitest'

describe('Quick Composable Validation', () => {
  it('should import useEntuProfileAuth composable', async () => {
    // Test basic import resolution
    const { useEntuProfileAuth } = await import('../../app/composables/useEntuProfileAuth')
    
    expect(typeof useEntuProfileAuth).toBe('function')
    
    // Test that composable returns expected structure
    const composable = useEntuProfileAuth()
    
    expect(composable).toBeDefined()
    expect(typeof composable.authenticateWithEstonianId).toBe('function')
    expect(typeof composable.getUserProfile).toBe('function')
    expect(typeof composable.refreshUserProfile).toBe('function')
  })

  it('should import useEstonianIdValidation composable', async () => {
    const { useEstonianIdValidation } = await import('../../app/composables/useEstonianIdValidation')
    
    expect(typeof useEstonianIdValidation).toBe('function')
    
    const validation = useEstonianIdValidation()
    expect(validation).toBeDefined()
    expect(typeof validation.validateEstonianId).toBe('function')
  })

  it('should import useProfileCache composable', async () => {
    const { useProfileCache } = await import('../../app/composables/useProfileCache')
    
    expect(typeof useProfileCache).toBe('function')
    
    const cache = useProfileCache()
    expect(cache).toBeDefined()
    expect(typeof cache.storeUserProfile).toBe('function')
    expect(typeof cache.getCachedUserProfile).toBe('function')
  })
})