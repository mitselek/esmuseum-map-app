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

// Process the callback safely when the component mounts
onMounted(async () => {
  if (!import.meta.client) return

  // Log the current URL for debugging
  const currentUrl = window.location.href
  const urlObj = new URL(currentUrl)
  const fullPath = urlObj.pathname

  // Check if we have a redirect stored and log it explicitly
  const storedRedirect = localStorage.getItem('auth_redirect')

  // DEBUG: Investigate all localStorage entries related to auth/redirect
  const allKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    allKeys.push(localStorage.key(i))
  }
  const allAuthKeys = allKeys.filter((key) => key && (key.includes('auth') || key.includes('redirect')))
  const allAuthValues = allAuthKeys.map((key) => `${key}: ${localStorage.getItem(key)}`)

  debugInfo.value = `Processing callback:
- Full URL: ${currentUrl}
- Path: ${fullPath}
- Stored redirect: ${storedRedirect || 'none'}
- All auth keys: ${JSON.stringify(allAuthKeys)}
- All auth values: ${allAuthValues.join(', ')}`

  try {
    // Let the OAuth handler do all the work
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

      <!-- Show debug info (temporarily enabling in production for debugging) -->
      <div
        v-if="debugInfo"
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
