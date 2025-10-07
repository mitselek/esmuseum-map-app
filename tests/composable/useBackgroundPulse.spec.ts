import { describe, it, expect, beforeEach, afterEach } from 'vitest'

/**
 * Tests for useBackgroundPulse composable
 * Feature F028 - Evil DST Map Schedule
 * 
 * TDD Red Phase: These tests MUST FAIL before implementation
 */
describe('useBackgroundPulse', () => {
  let originalClassList: DOMTokenList

  beforeEach(() => {
    // Save original classList for restoration
    originalClassList = document.body.classList
    // Clear any existing classes
    document.body.className = ''
  })

  afterEach(() => {
    // Restore original classList
    document.body.className = ''
  })

  it('should be a function that returns an object with expected properties', async () => {
    // Dynamic import to ensure fresh module state
    const { useBackgroundPulse } = await import('../../app/composables/useBackgroundPulse')
    
    const result = useBackgroundPulse()

    expect(result).toBeDefined()
    expect(result).toHaveProperty('isDSTActive')
    expect(result).toHaveProperty('activatePulse')
    expect(result).toHaveProperty('deactivatePulse')
    expect(typeof result.activatePulse).toBe('function')
    expect(typeof result.deactivatePulse).toBe('function')
  })

  it('should initialize with isDSTActive as false', async () => {
    const { useBackgroundPulse } = await import('../../app/composables/useBackgroundPulse')
    
    const { isDSTActive } = useBackgroundPulse()

    expect(isDSTActive.value).toBe(false)
  })

  it('should add "evil-dst-active" class to document.body when activatePulse is called', async () => {
    const { useBackgroundPulse } = await import('../../app/composables/useBackgroundPulse')
    
    const { activatePulse } = useBackgroundPulse()

    // Verify class not present initially
    expect(document.body.classList.contains('evil-dst-active')).toBe(false)

    // Activate pulse
    activatePulse()

    // Verify class was added
    expect(document.body.classList.contains('evil-dst-active')).toBe(true)
  })

  it('should set isDSTActive to true when activatePulse is called', async () => {
    const { useBackgroundPulse } = await import('../../app/composables/useBackgroundPulse')
    
    const { isDSTActive, activatePulse } = useBackgroundPulse()

    expect(isDSTActive.value).toBe(false)

    activatePulse()

    expect(isDSTActive.value).toBe(true)
  })

  it('should remove "evil-dst-active" class from document.body when deactivatePulse is called', async () => {
    const { useBackgroundPulse } = await import('../../app/composables/useBackgroundPulse')
    
    const { activatePulse, deactivatePulse } = useBackgroundPulse()

    // First activate
    activatePulse()
    expect(document.body.classList.contains('evil-dst-active')).toBe(true)

    // Then deactivate
    deactivatePulse()
    expect(document.body.classList.contains('evil-dst-active')).toBe(false)
  })

  it('should set isDSTActive to false when deactivatePulse is called', async () => {
    const { useBackgroundPulse } = await import('../../app/composables/useBackgroundPulse')
    
    const { isDSTActive, activatePulse, deactivatePulse } = useBackgroundPulse()

    // First activate
    activatePulse()
    expect(isDSTActive.value).toBe(true)

    // Then deactivate
    deactivatePulse()
    expect(isDSTActive.value).toBe(false)
  })

  it('should handle multiple activate/deactivate cycles', async () => {
    const { useBackgroundPulse } = await import('../../app/composables/useBackgroundPulse')
    
    const { isDSTActive, activatePulse, deactivatePulse } = useBackgroundPulse()

    // Cycle 1
    activatePulse()
    expect(isDSTActive.value).toBe(true)
    expect(document.body.classList.contains('evil-dst-active')).toBe(true)

    deactivatePulse()
    expect(isDSTActive.value).toBe(false)
    expect(document.body.classList.contains('evil-dst-active')).toBe(false)

    // Cycle 2
    activatePulse()
    expect(isDSTActive.value).toBe(true)
    expect(document.body.classList.contains('evil-dst-active')).toBe(true)

    deactivatePulse()
    expect(isDSTActive.value).toBe(false)
    expect(document.body.classList.contains('evil-dst-active')).toBe(false)
  })

  it('should not throw error if deactivatePulse called without prior activation', async () => {
    const { useBackgroundPulse } = await import('../../app/composables/useBackgroundPulse')
    
    const { deactivatePulse } = useBackgroundPulse()

    // Should not throw
    expect(() => deactivatePulse()).not.toThrow()
    expect(document.body.classList.contains('evil-dst-active')).toBe(false)
  })
})
