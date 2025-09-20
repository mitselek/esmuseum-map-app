<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
    <div class="container mx-auto px-4">
      <!-- Language Switcher -->
      <div class="flex justify-center mb-8">
        <LanguageSwitcher @language-changed="onLanguageChanged" />
      </div>
      
      <!-- Main Content -->
      <div class="max-w-4xl mx-auto">
        <HelloWorld />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LanguageCode } from '../types/language'

// Home page - displays the HelloWorld greeting component with language switcher
// TypeScript strict mode compliance

const onLanguageChanged = (languageCode: LanguageCode) => {
  // Additional language change handling can be added here if needed
}
</script>

<style scoped>
/* Additional page-specific styles */
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Mobile-first responsive design */
@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }
}
</style>