<script setup>
const { isAuthenticated, error, user } = useEntuAuth()
const { startOAuthFlow } = useEntuOAuth()
const router = useRouter()

// Check if we have a redirect URL stored
const redirectPath = ref(null)
const activeProvider = ref(null) // Track which provider button is loading

// OAuth provider options - ensure they match the values in useEntuOAuth.js
const oauthProviders = [
  { id: 'e-mail', label: 'Email' },
  { id: 'google', label: 'Google' },
  { id: 'apple', label: 'Apple' },
  { id: 'smart-id', label: 'Smart-ID' },
  { id: 'mobile-id', label: 'Mobile-ID' },
  { id: 'id-card', label: 'ID-Card' }
]

onMounted(() => {
  if (import.meta.client) {
    // Get redirect URL from localStorage
    redirectPath.value = localStorage.getItem('auth_redirect') || '/'
  }

  // Check token and refresh if needed
  if (isAuthenticated.value) {
    handleSuccessfulLogin()
  }
})

// Handle login success
const handleSuccessfulLogin = () => {
  if (import.meta.client) {
    // Use utility to get and clear the stored redirect path
    const path = getAndClearRedirect() || '/'
    router.push(path)
  }
}

// No API key login for public users

// Perform login with OAuth.ee - now accepts provider as parameter
const loginWithOAuth = async (providerId) => {
  activeProvider.value = providerId
  try {
    // Start the OAuth flow which will redirect to OAuth.ee with the selected provider
    await startOAuthFlow(providerId)
  }
  catch (err) {
    console.error('OAuth login error:', err)
    activeProvider.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- App Header -->
    <AppHeader />

    <!-- Login Content -->
    <div class="flex items-center justify-center p-4">
      <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 class="mb-6 text-center text-2xl font-bold">
          {{ $t('title') }}
        </h1>

        <div
          v-if="error"
          class="mb-4 rounded bg-red-100 p-4 text-red-700"
        >
          {{ error }}
        </div>

        <div v-if="isAuthenticated">
          <div class="mb-4 rounded bg-green-100 p-4 text-green-700">
            {{ $t('alreadyLoggedIn') }}
          </div>

          <div
            v-if="user"
            class="mb-4"
          >
            <p><strong>{{ $t('user') }}:</strong> {{ user.name || user.email || user.id }}</p>
          </div>

          <button
            class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            @click="handleSuccessfulLogin"
          >
            {{ $t('continue') }}
          </button>
        </div>

        <div v-else>
          <p class="mb-6 text-center text-gray-600">
            {{ $t('description') }}
          </p>

          <!-- OAuth Provider Buttons -->
          <div class="space-y-3">
            <button
              v-for="provider in oauthProviders"
              :key="provider.id"
              class="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-left font-medium text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="activeProvider !== null"
              @click="loginWithOAuth(provider.id)"
            >
              <span class="flex items-center justify-between">
                <span>{{ provider.label }}</span>
                <span
                  v-if="activeProvider === provider.id"
                  class="text-sm text-blue-600"
                >
                  {{ $t('loggingIn') }}
                </span>
              </span>
            </button>
          </div>
        </div>

        <!-- Interreg Logo -->
        <div class="mt-8 flex justify-center border-t border-gray-200 pt-6">
          <img
            src="/interreg-estonia-latvia.png"
            alt="Interreg Estonia-Latvia - Co-funded by the European Union"
            class="h-auto w-full max-w-xs"
          >
        </div>
      </div>
    </div>
  </div>
</template>
