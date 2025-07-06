<script setup>
// This page handles the OAuth callback
// It extracts the token from the URL and uses it to authenticate

// Get the OAuth helper
const { handleOAuthCallback, isLoading, error } = useEntuOAuth()

// Debug info for the OAuth callback process
const debugInfo = ref('')

// Check if we are in development mode
const isDev = ref(false)
if (import.meta.client) {
  isDev.value = import.meta.dev || false
}

// Process the callback when the component mounts
onMounted(async () => {
  if (import.meta.client) {
    // Log the current URL for debugging
    const currentUrl = window.location.href
    const urlObj = new URL(currentUrl)
    const fullPath = urlObj.pathname

    debugInfo.value = `Processing callback:\n- Full URL: ${currentUrl}\n- Path: ${fullPath}`

    // Check for the token in query parameters or path
    const searchParams = urlObj.searchParams

    let potentialToken = ''
    let extractionMethod = ''

    // First check for JWT in query parameter (preferred method)
    if (searchParams.has('jwt')) {
      potentialToken = searchParams.get('jwt')
      extractionMethod = 'query parameter'
      debugInfo.value += `\n- Found token in jwt query parameter`
    }
    // Fallback: check in the path
    else if (fullPath.startsWith('/auth/callback')) {
      const callbackPath = '/auth/callback'
      potentialToken = fullPath.substring(callbackPath.length)

      // Clean up the token if it starts with / or ?
      if (potentialToken.startsWith('/') || potentialToken.startsWith('?')) {
        potentialToken = potentialToken.substring(1)
      }

      extractionMethod = 'path'
      debugInfo.value += `\n- Fallback: extracted token from URL path`
    }

    if (potentialToken) {
      debugInfo.value += `\n- Detected token (${extractionMethod}): ${potentialToken.substring(0, 10) + '...'}`
    }
    else {
      debugInfo.value += '\n- No token detected in URL'
    }

    console.log('OAuth callback processing:', currentUrl)
  }

  try {
    const result = await handleOAuthCallback()
    if (result) {
      debugInfo.value += '\n\nAuthentication successful!'
    }
  }
  catch (err) {
    console.error('Error handling OAuth callback:', err)
    debugInfo.value += `\n\nError: ${err.message}`
  }
})
</script>

<template>
  <div>
    <AppHeader />
    <div class="container mx-auto px-4 py-8">
      <h1 class="mb-6 text-3xl font-bold">
        {{ $t('title') }}
      </h1>

      <div
        v-if="isLoading"
        class="mb-4 rounded bg-blue-100 p-4 text-blue-700"
      >
        {{ $t('loading') }}
      </div>

      <div
        v-if="error"
        class="mb-4 rounded bg-red-100 p-4 text-red-700"
      >
        {{ error }}
      </div>

      <p>{{ $t('redirecting') }}</p>

      <!-- Show debug info in development environment -->
      <div
        v-if="debugInfo && isDev"
        class="mt-4 rounded bg-gray-100 p-4 font-mono text-xs"
      >
        <pre>{{ debugInfo }}</pre>
      </div>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  title: Authentication
  loading: Processing authentication...
  redirecting: You will be redirected shortly.
et:
  title: Autentimine
  loading: Autentimise töötlemine...
  redirecting: Teid suunatakse peagi ümber.
</i18n>
