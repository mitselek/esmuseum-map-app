import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LocalStorageError from '~/app/components/LocalStorageError.vue'

// Mock window.location.reload
const mockReload = vi.fn()
Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload
  },
  writable: true
})

describe('LocalStorageError.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders error message from props', () => {
    const errorMessage = 'localStorage is not available in this browser'
    const wrapper = mount(LocalStorageError, {
      props: { errorMessage }
    })

    expect(wrapper.text()).toContain(errorMessage)
  })

  it('displays application error title', () => {
    const wrapper = mount(LocalStorageError, {
      props: { errorMessage: 'Test error' }
    })

    expect(wrapper.find('h2').text()).toBe('Application Error')
  })

  it('shows main error description', () => {
    const wrapper = mount(LocalStorageError, {
      props: { errorMessage: 'Test error' }
    })

    expect(wrapper.text()).toContain('This application cannot function without localStorage access.')
  })

  it('displays solution suggestions list', () => {
    const wrapper = mount(LocalStorageError, {
      props: { errorMessage: 'Test error' }
    })

    const expectedSolutions = [
      'Enable cookies and local storage in your browser',
      'Disable private/incognito browsing mode',
      'Check browser extensions that might block storage',
      'Try refreshing the page'
    ]

    expectedSolutions.forEach(solution => {
      expect(wrapper.text()).toContain(solution)
    })
  })

  it('has reload page button', () => {
    const wrapper = mount(LocalStorageError, {
      props: { errorMessage: 'Test error' }
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Reload Page')
  })

  it('calls window.location.reload when reload button is clicked', async () => {
    const wrapper = mount(LocalStorageError, {
      props: { errorMessage: 'Test error' }
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(mockReload).toHaveBeenCalledOnce()
  })

  it('applies critical CSS classes for proper styling', () => {
    const wrapper = mount(LocalStorageError, {
      props: { errorMessage: 'Test error' }
    })

    // Check overlay classes (should cover entire screen)
    const overlay = wrapper.find('.fixed.inset-0.bg-red-600')
    expect(overlay.exists()).toBe(true)

    // Check modal classes
    const modal = wrapper.find('.bg-white.p-8.rounded-lg')
    expect(modal.exists()).toBe(true)

    // Check button classes
    const button = wrapper.find('.bg-red-600.text-white')
    expect(button.exists()).toBe(true)
  })

  it('has high z-index to appear above other content', () => {
    const wrapper = mount(LocalStorageError, {
      props: { errorMessage: 'Test error' }
    })

    const overlay = wrapper.find('.z-50')
    expect(overlay.exists()).toBe(true)
  })

  it('includes error icon SVG', () => {
    const wrapper = mount(LocalStorageError, {
      props: { errorMessage: 'Test error' }
    })

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.classes()).toContain('text-red-600')
  })

  it('provides visual hierarchy with different text colors', () => {
    const wrapper = mount(LocalStorageError, {
      props: { errorMessage: 'Test error' }
    })

    // Title should be red
    const title = wrapper.find('.text-red-600')
    expect(title.exists()).toBe(true)

    // Main text should be gray
    const mainText = wrapper.find('.text-gray-800')
    expect(mainText.exists()).toBe(true)

    // Error message should be lighter gray
    const errorText = wrapper.find('.text-gray-600')
    expect(errorText.exists()).toBe(true)
  })

  it('has proper responsive design classes', () => {
    const wrapper = mount(LocalStorageError, {
      props: { errorMessage: 'Test error' }
    })

    // Modal should have max width and margins for mobile
    const modal = wrapper.find('.max-w-md.mx-4')
    expect(modal.exists()).toBe(true)
  })

  it('displays different error messages correctly', () => {
    const errorMessages = [
      'localStorage is not available',
      'Storage quota exceeded',
      'Access denied to localStorage'
    ]

    errorMessages.forEach(message => {
      const wrapper = mount(LocalStorageError, {
        props: { errorMessage: message }
      })
      expect(wrapper.text()).toContain(message)
    })
  })

  it('has proper semantic HTML structure', () => {
    const wrapper = mount(LocalStorageError, {
      props: { errorMessage: 'Test error' }
    })

    // Should have heading
    expect(wrapper.find('h2').exists()).toBe(true)

    // Should have list for solutions
    expect(wrapper.find('ul').exists()).toBe(true)
    expect(wrapper.findAll('li')).toHaveLength(4)

    // Should have button for action
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('maintains accessibility with proper contrast colors', () => {
    const wrapper = mount(LocalStorageError, {
      props: { errorMessage: 'Test error' }
    })

    // Red background should be sufficient contrast
    const redBackground = wrapper.find('.bg-red-600')
    expect(redBackground.exists()).toBe(true)

    // White text on red should have good contrast
    const whiteOnRed = wrapper.find('.bg-red-600.text-white')
    expect(whiteOnRed.exists()).toBe(true)
  })
})