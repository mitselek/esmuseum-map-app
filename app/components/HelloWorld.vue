<template>
  <div class="greeting-container">
    <h1 class="greeting-text">
      Hello World
    </h1>
    <div 
      :lang="locale"
      data-testid="greeting"
      class="greeting-translated mt-4 text-lg text-center"
    >
      {{ $t('greeting.welcome') }}
    </div>
  </div>
</template>

<script setup lang="ts">
// Enhanced Hello World component with i18n support
// TypeScript strict mode compliance

const { locale } = useI18n()
</script>

<style scoped>
/* Mobile-first responsive design with Tailwind CSS classes */
/* Additional component-specific styles if needed */

.greeting-translated {
  /* Ensure proper text wrapping for long translations */
  word-wrap: break-word;
  hyphens: auto;
}

/* Container should handle responsive layout */
.greeting-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

@media (max-width: 640px) {
  .greeting-container {
    padding: 0.5rem;
  }
  
  .greeting-translated {
    font-size: 1rem; /* Smaller on mobile */
  }
}
</style>