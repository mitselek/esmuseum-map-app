/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-dynamic-delete */

/**
 * Tests for /signup/[groupId] page component (FEAT-001)
 * TDD: Write tests FIRST, then implement the component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock composables
const mockUseEntuAuth = vi.fn()
const mockUseEntuOAuth = vi.fn()
const mockUseOnboarding = vi.fn()
const mockNavigateTo = vi.fn()

vi.mock('../../app/composables/useEntuAuth', () => ({
  useEntuAuth: () => mockUseEntuAuth()
}))

vi.mock('../../app/composables/useEntuOAuth', () => ({
  useEntuOAuth: () => mockUseEntuOAuth()
}))

vi.mock('../../app/composables/useOnboarding', () => ({
  useOnboarding: () => mockUseOnboarding()
}))

vi.mock('#app', () => ({
  useRoute: () => ({
    params: { groupId: '686a6c011749f351b9c83124' }
  }),
  navigateTo: () => mockNavigateTo()
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('/signup/[groupId] page', () => {
  let SignupPage: any

  beforeEach(async () => {
    vi.clearAllMocks()
    localStorageMock.clear()

    // Default mock implementations
    mockUseEntuAuth.mockReturnValue({
      isAuthenticated: { value: false },
      user: { value: null }
    })

    mockUseEntuOAuth.mockReturnValue({
      startOAuthFlow: vi.fn()
    })

    mockUseOnboarding.mockReturnValue({
      isWaiting: { value: false },
      error: { value: null },
      hasTimedOut: { value: false },
      joinGroup: vi.fn(),
      pollGroupMembership: vi.fn(),
      stopPolling: vi.fn()
    })

    // Dynamically import the component
    SignupPage = (await import('../../app/pages/signup/[groupId].vue')).default
  })

  it('should extract groupId from route params', () => {
    const wrapper = mount(SignupPage, {
      global: {
        stubs: ['NuxtLink']
      }
    })

    // Component should extract groupId from route
    expect(localStorageMock.getItem('onboarding_groupId')).toBe('686a6c011749f351b9c83124')
  })

  it('should store groupId in localStorage', () => {
    mount(SignupPage, {
      global: {
        stubs: ['NuxtLink']
      }
    })

    expect(localStorageMock.getItem('onboarding_groupId')).toBe('686a6c011749f351b9c83124')
  })

  it('should redirect to OAuth if not authenticated', () => {
    mockUseEntuAuth.mockReturnValue({
      isAuthenticated: { value: false },
      user: { value: null }
    })

    const startOAuthFlow = vi.fn()
    mockUseEntuOAuth.mockReturnValue({
      startOAuthFlow
    })

    mount(SignupPage, {
      global: {
        stubs: ['NuxtLink']
      }
    })

    expect(startOAuthFlow).toHaveBeenCalledWith('google') // Or any default provider
  })

  it('should display waiting screen with message', async () => {
    mockUseEntuAuth.mockReturnValue({
      isAuthenticated: { value: true },
      user: { value: { _id: '66b6245c7efc9ac06a437b97' } }
    })

    mockUseOnboarding.mockReturnValue({
      isWaiting: { value: true },
      error: { value: null },
      hasTimedOut: { value: false },
      joinGroup: vi.fn().mockResolvedValue(undefined),
      pollGroupMembership: vi.fn(),
      stopPolling: vi.fn()
    })

    const wrapper = mount(SignupPage, {
      global: {
        stubs: ['NuxtLink'],
        mocks: {
          $t: (key: string) => key // Simple translation mock
        }
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('onboarding.waiting.title')
  })

  it('should display three-dot animated spinner', async () => {
    mockUseEntuAuth.mockReturnValue({
      isAuthenticated: { value: true },
      user: { value: { _id: '66b6245c7efc9ac06a437b97' } }
    })

    mockUseOnboarding.mockReturnValue({
      isWaiting: { value: true },
      error: { value: null },
      hasTimedOut: { value: false },
      joinGroup: vi.fn().mockResolvedValue(undefined),
      pollGroupMembership: vi.fn(),
      stopPolling: vi.fn()
    })

    const wrapper = mount(SignupPage, {
      global: {
        stubs: ['NuxtLink'],
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Check for spinner element
    const spinner = wrapper.find('[data-testid="waiting-spinner"]')
    expect(spinner.exists()).toBe(true)
  })

  it('should display timeout error after 30 seconds', async () => {
    mockUseEntuAuth.mockReturnValue({
      isAuthenticated: { value: true },
      user: { value: { _id: '66b6245c7efc9ac06a437b97' } }
    })

    mockUseOnboarding.mockReturnValue({
      isWaiting: { value: false },
      error: { value: 'Setup timed out' },
      hasTimedOut: { value: true },
      joinGroup: vi.fn(),
      pollGroupMembership: vi.fn(),
      stopPolling: vi.fn()
    })

    const wrapper = mount(SignupPage, {
      global: {
        stubs: ['NuxtLink'],
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('onboarding.error.timeout')
  })

  it('should display retry link on timeout', async () => {
    mockUseEntuAuth.mockReturnValue({
      isAuthenticated: { value: true },
      user: { value: { _id: '66b6245c7efc9ac06a437b97' } }
    })

    mockUseOnboarding.mockReturnValue({
      isWaiting: { value: false },
      error: { value: 'Setup timed out' },
      hasTimedOut: { value: true },
      joinGroup: vi.fn(),
      pollGroupMembership: vi.fn(),
      stopPolling: vi.fn()
    })

    const wrapper = mount(SignupPage, {
      global: {
        stubs: ['NuxtLink'],
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    await wrapper.vm.$nextTick()

    const retryLink = wrapper.find('[data-testid="retry-link"]')
    expect(retryLink.exists()).toBe(true)
    expect(retryLink.attributes('href')).toContain('/signup/686a6c011749f351b9c83124')
  })

  it('should redirect immediately if user already member', async () => {
    mockUseEntuAuth.mockReturnValue({
      isAuthenticated: { value: true },
      user: { value: { _id: '66b6245c7efc9ac06a437b97' } }
    })

    const pollGroupMembership = vi.fn().mockResolvedValue(true) // Already member

    mockUseOnboarding.mockReturnValue({
      isWaiting: { value: false },
      error: { value: null },
      hasTimedOut: { value: false },
      joinGroup: vi.fn(),
      pollGroupMembership,
      stopPolling: vi.fn()
    })

    mount(SignupPage, {
      global: {
        stubs: ['NuxtLink'],
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    await vi.runOnlyPendingTimersAsync()

    expect(mockNavigateTo).toHaveBeenCalledWith('/tasks')
  })

  it('should display technical error message', async () => {
    mockUseEntuAuth.mockReturnValue({
      isAuthenticated: { value: true },
      user: { value: { _id: '66b6245c7efc9ac06a437b97' } }
    })

    mockUseOnboarding.mockReturnValue({
      isWaiting: { value: false },
      error: { value: 'Network connection failed' },
      hasTimedOut: { value: false },
      joinGroup: vi.fn(),
      pollGroupMembership: vi.fn(),
      stopPolling: vi.fn()
    })

    const wrapper = mount(SignupPage, {
      global: {
        stubs: ['NuxtLink'],
        mocks: {
          $t: (key: string, params: any) => `${key}: ${params?.error || ''}`
        }
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Network connection failed')
  })

  it('should redirect to /tasks on successful signup', async () => {
    mockUseEntuAuth.mockReturnValue({
      isAuthenticated: { value: true },
      user: { value: { _id: '66b6245c7efc9ac06a437b97' } }
    })

    const pollGroupMembership = vi.fn().mockResolvedValue(true) // Success

    mockUseOnboarding.mockReturnValue({
      isWaiting: { value: false },
      error: { value: null },
      hasTimedOut: { value: false },
      joinGroup: vi.fn().mockResolvedValue(undefined),
      pollGroupMembership,
      stopPolling: vi.fn()
    })

    mount(SignupPage, {
      global: {
        stubs: ['NuxtLink'],
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    await vi.runOnlyPendingTimersAsync()

    expect(mockNavigateTo).toHaveBeenCalledWith('/tasks')
    expect(localStorageMock.getItem('onboarding_groupId')).toBeNull() // Should clear
  })

  it('should have proper accessibility attributes', async () => {
    mockUseEntuAuth.mockReturnValue({
      isAuthenticated: { value: true },
      user: { value: { _id: '66b6245c7efc9ac06a437b97' } }
    })

    mockUseOnboarding.mockReturnValue({
      isWaiting: { value: true },
      error: { value: null },
      hasTimedOut: { value: false },
      joinGroup: vi.fn(),
      pollGroupMembership: vi.fn(),
      stopPolling: vi.fn()
    })

    const wrapper = mount(SignupPage, {
      global: {
        stubs: ['NuxtLink'],
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Check for aria-live region
    const liveRegion = wrapper.find('[aria-live="polite"]')
    expect(liveRegion.exists()).toBe(true)

    // Check for aria-label on main content
    const mainContent = wrapper.find('main')
    expect(mainContent.attributes('aria-label')).toBeTruthy()
  })

  it('should cleanup on unmount', async () => {
    mockUseEntuAuth.mockReturnValue({
      isAuthenticated: { value: true },
      user: { value: { _id: '66b6245c7efc9ac06a437b97' } }
    })

    const stopPolling = vi.fn()

    mockUseOnboarding.mockReturnValue({
      isWaiting: { value: true },
      error: { value: null },
      hasTimedOut: { value: false },
      joinGroup: vi.fn(),
      pollGroupMembership: vi.fn(),
      stopPolling
    })

    const wrapper = mount(SignupPage, {
      global: {
        stubs: ['NuxtLink'],
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    wrapper.unmount()

    expect(stopPolling).toHaveBeenCalled()
  })
})
