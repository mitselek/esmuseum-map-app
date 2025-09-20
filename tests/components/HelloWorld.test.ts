import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import HelloWorld from '~/app/components/HelloWorld.vue'
import { mockT, mockLocale, resetMocks } from '../setup'

// Configure Vue Test Utils to provide the i18n mock globally
const mountWithGlobal = (component: any, options: any = {}) => {
  return mount(component, {
    ...options,
    global: {
      ...options.global,
      mocks: {
        $t: mockT,
        ...options.global?.mocks
      }
    }
  })
}

describe('HelloWorld with i18n', () => {
  beforeEach(() => {
    resetMocks()
  })
  it('renders "Hello World" text', () => {
    const wrapper = mountWithGlobal(HelloWorld)
    
    // Test that the component renders the greeting text
    expect(wrapper.text()).toContain('Hello World')
  })

  it('renders greeting with translation', () => {
    const wrapper = mountWithGlobal(HelloWorld)
    
    expect(wrapper.text()).toContain('Tere tulemast ESMuseumi kaardirakenduse')
    expect(mockT).toHaveBeenCalledWith('greeting.welcome')
  })

  it('has proper language attribute', () => {
    const wrapper = mountWithGlobal(HelloWorld)
    
    const greetingElement = wrapper.find('[data-testid="greeting"]')
    expect(greetingElement.exists()).toBe(true)
    expect(greetingElement.attributes('lang')).toBe('et')
  })

  it('updates when translation changes', async () => {
    // Mock translation change to Ukrainian
    mockT.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        'greeting.welcome': 'Ласкаво просимо до картографічного застосунку ESMuseum'
      }
      return translations[key] || key
    })

    const wrapper = mountWithGlobal(HelloWorld)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Ласкаво просимо до картографічного застосунку ESMuseum')
  })

  it('has proper heading structure for accessibility', () => {
    const wrapper = mountWithGlobal(HelloWorld)
    
    // Test that the greeting is in an h1 element for screen readers
    const heading = wrapper.find('h1')
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toBe('Hello World')
  })

  it('has appropriate CSS classes for mobile-first design', () => {
    const wrapper = mountWithGlobal(HelloWorld)
    
    // Test that the component has the expected CSS classes
    // These classes should be defined in our main.css
    const container = wrapper.find('.greeting-container')
    expect(container.exists()).toBe(true)
    
    const text = wrapper.find('.greeting-text')
    expect(text.exists()).toBe(true)
  })

  it('maintains responsive styling with translations', () => {
    const wrapper = mountWithGlobal(HelloWorld)
    
    const container = wrapper.find('.greeting-container')
    expect(container.exists()).toBe(true)
    
    // Check that Tailwind classes are present on the translated element
    const translatedElement = wrapper.find('.greeting-translated')
    expect(translatedElement.classes()).toContain('text-center')
  })

  it('is a Vue component instance', () => {
    const wrapper = mountWithGlobal(HelloWorld)
    
    // Basic sanity check that we can mount the component
    expect(wrapper.vm).toBeDefined()
    expect(wrapper.element.tagName).toBeTruthy()
  })
})