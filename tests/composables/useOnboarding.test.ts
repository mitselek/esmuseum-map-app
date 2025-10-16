/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Tests for useOnboarding composable (FEAT-001)
 * TDD: Write tests FIRST, then implement the composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { useOnboarding } from '../../app/composables/useOnboarding'

// Mock $fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock useEntuAuth
vi.mock('../../app/composables/useEntuAuth', () => ({
  useEntuAuth: () => ({
    user: { value: { _id: '66b6245c7efc9ac06a437b97' } },
    token: { value: 'mock-token' }
  })
}))

// Helper component to test the composable in a Vue context
const TestComponent = {
  template: '<div></div>',
  setup () {
    return useOnboarding()
  }
}

describe('useOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with correct default state', () => {
    const wrapper = mount(TestComponent)
    const composable = wrapper.vm as any

    expect(composable.isWaiting).toBe(false)
    expect(composable.error).toBeNull()
    expect(composable.hasTimedOut).toBe(false)
  })

  it('should call /api/onboard/join-group endpoint when joinGroup is called', async () => {
    mockFetch.mockResolvedValueOnce({ success: true })

    const wrapper = mount(TestComponent)
    const composable = wrapper.vm as any

    await composable.joinGroup('686a6c011749f351b9c83124')

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

    const wrapper = mount(TestComponent)
    const composable = wrapper.vm as any

    const promise = composable.joinGroup('686a6c011749f351b9c83124')

    expect(composable.isWaiting).toBe(true)

    await promise

    expect(composable.isWaiting).toBe(false)
  })

  it('should handle API errors in joinGroup', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const wrapper = mount(TestComponent)
    const composable = wrapper.vm as any

    await expect(composable.joinGroup('686a6c011749f351b9c83124')).rejects.toThrow('Network error')

    expect(composable.error).toBe('Network error')
    expect(composable.isWaiting).toBe(false)
  })

  it('should poll group membership every 2 seconds', async () => {
    // Mock that user is NOT a member initially
    mockFetch.mockResolvedValueOnce({ entities: [] })

    const wrapper = mount(TestComponent)
    const composable = wrapper.vm as any

    const promise = composable.pollGroupMembership('686a6c011749f351b9c83124')

    // First call happens immediately
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Advance timers by 2 seconds
    await vi.advanceTimersByTimeAsync(2000)

    // Second call after 2 seconds
    expect(mockFetch).toHaveBeenCalledTimes(2)

    // Advance another 2 seconds
    await vi.advanceTimersByTimeAsync(2000)

    // Third call
    expect(mockFetch).toHaveBeenCalledTimes(3)

    // Clean up
    composable.stopPolling()
  })

  it('should stop polling when user becomes a member', async () => {
    // First call: not a member
    mockFetch.mockResolvedValueOnce({ entities: [] })
    // Second call: now a member
    mockFetch.mockResolvedValueOnce({
      entities: [{ _id: '66b6245c7efc9ac06a437b97' }]
    })

    const wrapper = mount(TestComponent)
    const composable = wrapper.vm as any

    const promise = composable.pollGroupMembership('686a6c011749f351b9c83124')

    // First check
    await vi.runOnlyPendingTimersAsync()

    // Advance 2 seconds for second check
    await vi.advanceTimersByTimeAsync(2000)
    await vi.runOnlyPendingTimersAsync()

    const result = await promise

    // Should return true (membership confirmed)
    expect(result).toBe(true)

    // Should have called the API exactly twice
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should timeout after 30 seconds', async () => {
    // Always return no membership
    mockFetch.mockResolvedValue({ entities: [] })

    const wrapper = mount(TestComponent)
    const composable = wrapper.vm as any

    const promise = composable.pollGroupMembership('686a6c011749f351b9c83124')

    // Advance full 30 seconds
    await vi.advanceTimersByTimeAsync(30000)
    await vi.runOnlyPendingTimersAsync()

    const result = await promise

    // Should return false (timeout)
    expect(result).toBe(false)
    expect(composable.hasTimedOut).toBe(true)

    // Should have polled 15 times (every 2s for 30s)
    expect(mockFetch).toHaveBeenCalledTimes(15)
  })

  it('should check membership by querying for user as child of group', async () => {
    mockFetch.mockResolvedValueOnce({ entities: [] })

    const wrapper = mount(TestComponent)
    const composable = wrapper.vm as any

    composable.pollGroupMembership('686a6c011749f351b9c83124')

    await vi.runOnlyPendingTimersAsync()

    // Should query Entu for person with _parent = groupId
    expect(mockFetch).toHaveBeenCalledWith('/api/onboard/check-membership', {
      method: 'POST',
      body: {
        groupId: '686a6c011749f351b9c83124',
        userId: '66b6245c7efc9ac06a437b97'
      }
    })

    composable.stopPolling()
  })

  it('should handle errors during polling', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API error'))

    const wrapper = mount(TestComponent)
    const composable = wrapper.vm as any

    const promise = composable.pollGroupMembership('686a6c011749f351b9c83124')

    await vi.runOnlyPendingTimersAsync()

    const result = await promise

    expect(result).toBe(false)
    expect(composable.error).toContain('API error')
  })

  it('should cleanup intervals on unmount', async () => {
    mockFetch.mockResolvedValue({ entities: [] })

    const wrapper = mount(TestComponent)
    const composable = wrapper.vm as any

    composable.pollGroupMembership('686a6c011749f351b9c83124')

    // Verify polling started
    expect(mockFetch).toHaveBeenCalled()

    // Unmount component (should cleanup intervals)
    wrapper.unmount()

    // Clear existing calls
    mockFetch.mockClear()

    // Advance time - should NOT make new calls after unmount
    await vi.advanceTimersByTimeAsync(10000)

    expect(mockFetch).not.toHaveBeenCalled()
  })
})
