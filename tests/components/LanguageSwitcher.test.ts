import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import LanguageSwitcher from '~/app/components/LanguageSwitcher.vue'

// Mock the useLanguage composable
const mockSwitchLanguage = vi.fn()
const mockCurrentLanguage = ref({ code: 'et', name: 'Eesti', displayName: 'Estonian', isDefault: true })
const mockAvailableLanguages = ref([
  { code: 'et', name: 'Eesti', displayName: 'Estonian', isDefault: true },
  { code: 'uk', name: 'Українська', displayName: 'Ukrainian', isDefault: false },
  { code: 'en-GB', name: 'English', displayName: 'British English', isDefault: false }
])

vi.mock('~/app/composables/useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: mockCurrentLanguage,
    availableLanguages: mockAvailableLanguages,
    switchLanguage: mockSwitchLanguage,
    isLoading: ref(false)
  })
}))

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentLanguage.value = { code: 'et', name: 'Eesti', displayName: 'Estonian', isDefault: true }
  })

  it('renders all available languages', () => {
    const wrapper = mount(LanguageSwitcher)
    
    expect(wrapper.text()).toContain('Eesti')
    expect(wrapper.text()).toContain('Українська')
    expect(wrapper.text()).toContain('English')
  })

  it('highlights current language', () => {
    const wrapper = mount(LanguageSwitcher)
    
    const currentButton = wrapper.find('[data-testid="language-et"]')
    expect(currentButton.classes()).toContain('active')
  })

  it('calls switchLanguage when clicking different language', async () => {
    const wrapper = mount(LanguageSwitcher)
    
    const ukrainianButton = wrapper.find('[data-testid="language-uk"]')
    await ukrainianButton.trigger('click')
    
    expect(mockSwitchLanguage).toHaveBeenCalledWith('uk')
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(LanguageSwitcher)
    
    const switcher = wrapper.find('[role="group"]')
    expect(switcher.exists()).toBe(true)
    expect(switcher.attributes('aria-label')).toBe('Language selection')
    
    const buttons = wrapper.findAll('button')
    buttons.forEach(button => {
      expect(button.attributes('type')).toBe('button')
      expect(button.attributes('aria-label')).toBeDefined()
    })
  })

  it('is keyboard navigable', async () => {
    const wrapper = mount(LanguageSwitcher)
    
    const firstButton = wrapper.find('button')
    await firstButton.trigger('keydown.enter')
    
    // Should not call switch language for current language
    expect(mockSwitchLanguage).not.toHaveBeenCalled()
  })

  it('emits language-changed event when switching', async () => {
    const wrapper = mount(LanguageSwitcher)
    
    const ukrainianButton = wrapper.find('[data-testid="language-uk"]')
    await ukrainianButton.trigger('click')
    
    expect(wrapper.emitted('language-changed')).toBeTruthy()
    expect(wrapper.emitted('language-changed')?.[0]).toEqual(['uk'])
  })
})