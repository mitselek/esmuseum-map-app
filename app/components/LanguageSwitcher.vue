<template>
  <div 
    role="group" 
    aria-label="Language selection"
    class="language-switcher flex flex-wrap gap-2 justify-center"
  >
    <button
      v-for="language in availableLanguages"
      :key="language.code"
      :data-testid="`language-${language.code}`"
      type="button"
      :aria-label="`Switch to ${language.displayName}`"
      :class="[
        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
        currentLanguage.code === language.code
          ? 'bg-blue-600 text-white active'
          : 'bg-gray-200 text-gray-700'
      ]"
      @click="handleLanguageSwitch(language.code)"
      @keydown.enter="handleLanguageSwitch(language.code)"
    >
      {{ language.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useLanguage } from '../composables/useLanguage'
import type { LanguageCode } from '../types/language'

const emit = defineEmits<{
  'language-changed': [languageCode: LanguageCode]
}>()

const { currentLanguage, availableLanguages, switchLanguage, isLoading } = useLanguage()

const handleLanguageSwitch = async (code: LanguageCode) => {
  if (code === currentLanguage.value.code || isLoading.value) {
    return // Don't switch to current language or if loading
  }
  
  await switchLanguage(code)
  emit('language-changed', code)
}
</script>

<style scoped>
.language-switcher {
  /* Mobile-first responsive design */
  min-height: 44px; /* Minimum touch target size */
}

.language-switcher button {
  min-width: 44px; /* Minimum touch target size */
  min-height: 44px;
}

/* Ensure proper contrast for accessibility */
.language-switcher button:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

@media (max-width: 640px) {
  .language-switcher {
    flex-direction: column;
    align-items: center;
  }
  
  .language-switcher button {
    width: 100%;
    max-width: 200px;
  }
}
</style>