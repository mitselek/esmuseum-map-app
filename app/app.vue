<template>
  <Html :lang="locale">
    <Head>
      <Title>{{ $t('greeting.welcome') }} - ESMuseum Map</Title>
      <Meta name="description" :content="$t('greeting.welcome')" />
      <Meta property="og:title" :content="$t('greeting.welcome')" />
      <Meta property="og:description" :content="$t('greeting.welcome')" />
      <Meta property="og:locale" :content="locale" />
      <Link rel="alternate" :hreflang="locale" :href="currentUrl" />
    </Head>
    <Body>
      <!-- App content -->
      <NuxtPage />
    </Body>
  </Html>
</template>

<script setup lang="ts">
// Root app component with i18n-enabled SEO meta tags
// TypeScript strict mode compliance

const { locale } = useI18n()
const route = useRoute()

// Initialize language management
useLanguage()

// Generate current URL for hreflang
const currentUrl = computed(() => {
  if (process.client) {
    return window.location.href
  }
  return `https://localhost:3000${route.path}`
})
</script>

<style>
/* Global styles - minimal reset and base typography */
html {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #2d3748;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f7fafc;
}

/* Accessibility improvements */
*:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Ensure good contrast for text */
h1, h2, h3, h4, h5, h6 {
  color: #1a202c;
}
</style>