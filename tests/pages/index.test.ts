import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import IndexPage from '../../app/pages/index.vue'

// Mock the child components
vi.mock('../../app/components/HelloWorld.vue', () => ({
  default: {
    template: '<div data-testid="hello-world">Hello World Component</div>'
  }
}))

vi.mock('../../app/components/LanguageSwitcher.vue', () => ({
  default: {
    template: '<div data-testid="language-switcher">Language Switcher Component</div>',
    emits: ['language-changed']
  }
}))

// Create a mock i18n instance with Composition API
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: 'et',
  fallbackLocale: 'et',
  messages: {
    et: {
      greeting: {
        hello: 'Tere, Maailm!',
        welcome: 'Tere tulemast'
      }
    },
    uk: {
      greeting: {
        hello: 'Привіт, Світ!',
        welcome: 'Ласкаво просимо'
      }
    },
    'en-GB': {
      greeting: {
        hello: 'Hello, World!',
        welcome: 'Welcome'
      }
    }
  }
})

describe('Index Page', () => {
  it('renders the page with correct structure', () => {
    const wrapper = mount(IndexPage, {
      global: {
        plugins: [i18n],
        stubs: {
          HelloWorld: true,
          LanguageSwitcher: true
        }
      }
    })

    // Check main container structure
    expect(wrapper.find('.min-h-screen').exists()).toBe(true)
    expect(wrapper.find('.container').exists()).toBe(true)
    expect(wrapper.find('.max-w-4xl').exists()).toBe(true)
  })

  it('renders HelloWorld component', () => {
    const wrapper = mount(IndexPage, {
      global: {
        plugins: [i18n],
        stubs: {
          HelloWorld: true,
          LanguageSwitcher: true
        }
      }
    })

    expect(wrapper.findComponent({ name: 'HelloWorld' }).exists()).toBe(true)
  })

  it('renders LanguageSwitcher component', () => {
    const wrapper = mount(IndexPage, {
      global: {
        plugins: [i18n],
        stubs: {
          HelloWorld: true,
          LanguageSwitcher: true
        }
      }
    })

    expect(wrapper.findComponent({ name: 'LanguageSwitcher' }).exists()).toBe(true)
  })

  it('handles language change events', async () => {
    const wrapper = mount(IndexPage, {
      global: {
        plugins: [i18n],
        stubs: {
          HelloWorld: true,
          LanguageSwitcher: true
        }
      }
    })

    // Manually call the handler function (simulates language change)
    const vm = wrapper.vm as any
    
    // Test that the handler doesn't throw any errors
    expect(() => vm.onLanguageChanged('uk')).not.toThrow()
    
    // The function should complete successfully (no console.log per constitution)
    await vm.onLanguageChanged('uk')
    expect(vm).toBeDefined() // Function executed without error
  })

  it('has proper responsive container classes', () => {
    const wrapper = mount(IndexPage, {
      global: {
        plugins: [i18n],
        stubs: {
          HelloWorld: true,
          LanguageSwitcher: true
        }
      }
    })

    const container = wrapper.find('.container')
    expect(container.classes()).toContain('mx-auto')
    expect(container.classes()).toContain('px-4')
  })

  it('has proper gradient background styling', () => {
    const wrapper = mount(IndexPage, {
      global: {
        plugins: [i18n],
        stubs: {
          HelloWorld: true,
          LanguageSwitcher: true
        }
      }
    })

    const mainDiv = wrapper.find('.min-h-screen')
    expect(mainDiv.classes()).toContain('bg-gradient-to-br')
    expect(mainDiv.classes()).toContain('from-blue-50')
    expect(mainDiv.classes()).toContain('to-indigo-100')
  })
})