/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Tests for useOnboarding composable (FEAT-001)
 * TDD: Write tests FIRST, then implement the composable
 * 
 * NOTE: Using 'any' types for test mocks to prioritize test readability
 * over strict typing. Test code focuses on behavior verification, not type safety.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useOnboarding } from '../../app/composables/useOnboarding'

// Mock $fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('useOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with correct default state', () => {
    const { state } = useOnboarding()

    expect(state.value.isWaiting).toBe(false)
    expect(state.value.error).toBeNull()
    expect(state.value.hasTimedOut).toBe(false)
  })

  it('should call /api/onboard/join-group endpoint when joinGroup is called', async () => {
    mockFetch.mockResolvedValueOnce({ success: true })

    const { joinGroup } = useOnboarding()

    await joinGroup('686a6c011749f351b9c83124', '66b6245c7efc9ac06a437b97')

    expect(mockFetch).toHaveBeenCalledWith('/api/onboard/join-group', {
      method: 'POST',
      body: {
        groupId: '686a6c011749f351b9c83124',
        userId: '66b6245c7efc9ac06a437b97'
      }
    })
  })

  it('should set isWaiting to true during joinGroup', async () => {
    mockFetch.mockResolvedValueOnce({ success: true })

    const { state, joinGroup } = useOnboarding()

    const promise = joinGroup('686a6c011749f351b9c83124', '66b6245c7efc9ac06a437b97')

    expect(state.value.isWaiting).toBe(true)

    await promise

    expect(state.value.isWaiting).toBe(false)
  })

  it('should handle API errors in joinGroup', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { state, joinGroup } = useOnboarding()

    const result = await joinGroup('686a6c011749f351b9c83124', '66b6245c7efc9ac06a437b97')

    expect(result.success).toBe(false)
    expect(state.value.error).toBe('Network error')
    expect(state.value.isWaiting).toBe(false)
  })

  it('should poll group membership every 2 seconds', async () => {
    // Mock that user is NOT a member initially
    mockFetch.mockResolvedValue({ isMember: false })

    const { pollGroupMembership, cleanup } = useOnboarding()

    const promise = pollGroupMembership('686a6c011749f351b9c83124', '66b6245c7efc9ac06a437b97')

    // First call happens after first interval
    await vi.advanceTimersByTimeAsync(2000)
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Advance timers by 2 seconds
    await vi.advanceTimersByTimeAsync(2000)
    expect(mockFetch).toHaveBeenCalledTimes(2)

    // Advance another 2 seconds
    await vi.advanceTimersByTimeAsync(2000)
    expect(mockFetch).toHaveBeenCalledTimes(3)

    // Clean up
    cleanup()
  })

  it('should stop polling when user becomes a member', async () => {
    // First call: not a member
    mockFetch.mockResolvedValueOnce({ isMember: false })
    // Second call: now a member
    mockFetch.mockResolvedValueOnce({ isMember: true })

    const { pollGroupMembership } = useOnboarding()

    const promise = pollGroupMembership('686a6c011749f351b9c83124', '66b6245c7efc9ac06a437b97')

    // First check (2s)
    await vi.advanceTimersByTimeAsync(2000)

    // Second check (4s)
    await vi.advanceTimersByTimeAsync(2000)

    const result = await promise

    // Should return true (membership confirmed)
    expect(result).toBe(true)

    // Should have called the API exactly twice
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should timeout after 30 seconds', async () => {
    // Always return no membership
    mockFetch.mockResolvedValue({ isMember: false })

    const { state, pollGroupMembership } = useOnboarding()

    const promise = pollGroupMembership('686a6c011749f351b9c83124', '66b6245c7efc9ac06a437b97')

    // Advance full 30 seconds
    await vi.advanceTimersByTimeAsync(30000)

    const result = await promise

    // Should return false (timeout)
    expect(result).toBe(false)
    expect(state.value.hasTimedOut).toBe(true)

    // Should have polled 15 times (every 2s for 30s)
    expect(mockFetch).toHaveBeenCalledTimes(15)
  })

  it('should check membership by querying for user as child of group', async () => {
    mockFetch.mockResolvedValueOnce({ isMember: false })

    const { pollGroupMembership, cleanup } = useOnboarding()

    pollGroupMembership('686a6c011749f351b9c83124', '66b6245c7efc9ac06a437b97')

    await vi.advanceTimersByTimeAsync(2000)

    // Should query Entu for person with _parent = groupId
    expect(mockFetch).toHaveBeenCalledWith('/api/onboard/check-membership', {
      method: 'POST',
      body: {
        groupId: '686a6c011749f351b9c83124',
        userId: '66b6245c7efc9ac06a437b97'
      }
    })

    cleanup()
  })

  it('should handle errors during polling gracefully', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValueOnce({ isMember: false })

    const { pollGroupMembership, cleanup } = useOnboarding()

    const promise = pollGroupMembership('686a6c011749f351b9c83124', '66b6245c7efc9ac06a437b97')

    // First call (error)
    await vi.advanceTimersByTimeAsync(2000)

    // Second call (success)
    await vi.advanceTimersByTimeAsync(2000)

    // Should continue polling after error
    expect(mockFetch).toHaveBeenCalledTimes(2)

    cleanup()
  })

  it('should cleanup intervals when cleanup is called', async () => {
    mockFetch.mockResolvedValue({ isMember: false })

    const { pollGroupMembership, cleanup } = useOnboarding()

    pollGroupMembership('686a6c011749f351b9c83124', '66b6245c7efc9ac06a437b97')

    // Verify polling started
    await vi.advanceTimersByTimeAsync(2000)
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Cleanup intervals
    cleanup()

    // Clear existing calls
    mockFetch.mockClear()

    // Advance time - should NOT make new calls after cleanup
    await vi.advanceTimersByTimeAsync(10000)

    expect(mockFetch).not.toHaveBeenCalled()
  })
})
