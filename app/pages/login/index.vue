<script setup>
const { getToken, isAuthenticated, error, user } = useEntuAuth()
const { startOAuthFlow } = useEntuOAuth()
const router = useRouter()
const loginType = ref('oauth') // Default to OAuth login
const selectedProvider = ref('google') // Default provider

// Check if we have a redirect URL stored
const redirectPath = ref(null)
const apiKeyLoginLoading = ref(false)
const oauthLoginLoading = ref(false)

// OAuth provider options
const oauthProviders = [
  { id: 'google', label: 'Google' },
  { id: 'apple', label: 'Apple' },
  { id: 'smartid', label: 'Smart-ID' },
  { id: 'mobileid', label: 'Mobile-ID' },
  { id: 'esteid', label: 'ID-Card' }
]

onMounted(() => {
  if (import.meta.client) {
    redirectPath.value = localStorage.getItem('auth_redirect') || '/'
  }

  // If already authenticated, redirect
  if (isAuthenticated.value) {
    handleSuccessfulLogin()
  }
})

// Handle login success
const handleSuccessfulLogin = () => {
  if (import.meta.client) {
    // Clear the stored redirect path
    localStorage.removeItem('auth_redirect')

    // Navigate to the redirect path or home
    const path = redirectPath.value || '/'
    router.push(path)
  }
}

// Perform login with API key
const loginWithApiKey = async () => {
  apiKeyLoginLoading.value = true
  try {
    await getToken()

    if (isAuthenticated.value) {
      handleSuccessfulLogin()
    }
  }
  catch (err) {
    // Error is already captured in the useEntuAuth composable
    console.error('Login error:', err)
  }
  finally {
    apiKeyLoginLoading.value = false
  }
}

// Perform login with OAuth.ee
const loginWithOAuth = async () => {
  oauthLoginLoading.value = true
  try {
    // Store the current path for redirect after successful login
    if (import.meta.client) {
      localStorage.setItem('auth_redirect', redirectPath.value || '/')
    }

    // Start the OAuth flow which will redirect to OAuth.ee with the selected provider
    await startOAuthFlow(selectedProvider.value)
  }
  catch (err) {
    console.error('OAuth login error:', err)
    oauthLoginLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
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
        <p class="mb-4 text-gray-600">
          {{ $t('description') }}
        </p>

        <div class="mb-4">
          <label class="mb-2 block text-sm font-medium text-gray-700">{{ $t('loginMethod') }}</label>
          <div class="flex gap-4">
            <label class="flex cursor-pointer items-center">
              <input
                v-model="loginType"
                type="radio"
                value="oauth"
                class="size-4 text-blue-600"
              >
              <span class="ml-2">{{ $t('oauthMethod') }}</span>
            </label>
            <label class="flex cursor-pointer items-center">
              <input
                v-model="loginType"
                type="radio"
                value="apikey"
                class="size-4 text-blue-600"
              >
              <span class="ml-2">{{ $t('apikeyMethod') }}</span>
            </label>
          </div>
        </div>

        <!-- OAuth Provider Selection -->
        <div
          v-if="loginType === 'oauth'"
          class="mb-4"
        >
          <label class="mb-2 block text-sm font-medium text-gray-700">{{ $t('selectProvider') }}</label>
          <select
            v-model="selectedProvider"
            class="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
          >
            <option
              v-for="provider in oauthProviders"
              :key="provider.id"
              :value="provider.id"
            >
              {{ provider.label }}
            </option>
          </select>
        </div>

        <button
          v-if="loginType === 'oauth'"
          class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          :disabled="oauthLoginLoading"
          @click="loginWithOAuth"
        >
          <span v-if="oauthLoginLoading">{{ $t('loggingIn') }}</span>
          <span v-else>{{ $t('loginWithOAuth') }}</span>
        </button>

        <button
          v-else
          class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          :disabled="apiKeyLoginLoading"
          @click="loginWithApiKey"
        >
          <span v-if="apiKeyLoginLoading">{{ $t('loggingIn') }}</span>
          <span v-else>{{ $t('loginWithEntu') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  title: Login to ESMuseum
  description: Select your authentication method and click the button below to log in.
  loginWithEntu: Login with API Key
  loginWithOAuth: Login with OAuth
  loggingIn: Logging in...
  alreadyLoggedIn: You are already logged in
  continue: Continue to application
  user: User
  loginMethod: Login Method
  oauthMethod: OAuth Authentication
  apikeyMethod: API Key
  selectProvider: Select Authentication Provider
et:
  title: Logi sisse ESMuseum
  description: Vali autentimise meetod ja vajuta allolevat nuppu, et sisse logida.
  loginWithEntu: Logi sisse API võtmega
  loginWithOAuth: Logi sisse OAuth-ga
  loggingIn: Sisselogimine...
  alreadyLoggedIn: Sa oled juba sisse logitud
  continue: Jätka rakendusega
  user: Kasutaja
  loginMethod: Sisselogimise meetod
  oauthMethod: OAuth autentimine
  apikeyMethod: API võti
  selectProvider: Vali autentimisteenuse pakkuja
</i18n>
