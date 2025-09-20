import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '~/app/components/HelloWorld.vue'

describe('HelloWorld Component', () => {
  it('renders "Hello World" text', () => {
    const wrapper = mount(HelloWorld)
    
    // Test that the component renders the greeting text
    expect(wrapper.text()).toContain('Hello World')
  })

  it('has proper heading structure for accessibility', () => {
    const wrapper = mount(HelloWorld)
    
    // Test that the greeting is in an h1 element for screen readers
    const heading = wrapper.find('h1')
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toBe('Hello World')
  })

  it('has appropriate CSS classes for mobile-first design', () => {
    const wrapper = mount(HelloWorld)
    
    // Test that the component has the expected CSS classes
    // These classes should be defined in our main.css
    const container = wrapper.find('.greeting-container')
    expect(container.exists()).toBe(true)
    
    const text = wrapper.find('.greeting-text')
    expect(text.exists()).toBe(true)
  })

  it('is a Vue component instance', () => {
    const wrapper = mount(HelloWorld)
    
    // Basic sanity check that we can mount the component
    expect(wrapper.vm).toBeDefined()
    expect(wrapper.element.tagName).toBeTruthy()
  })
})