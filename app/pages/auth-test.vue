/**
 * Test page for server-side authentication
 * This page allows testing the new authentication flow
 */
<template>
  <div class="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 class="mb-6 text-center text-2xl font-bold text-gray-900">
        Server-Side Authentication Test
      </h2>

      <!-- Authentication Status -->
      <div
        class="mb-6 rounded-lg p-4"
        :class="authStatusClass"
      >
        <h3 class="mb-2 font-semibold">
          Authentication Status
        </h3>
        <p><strong>Authenticated:</strong> {{ isAuthenticated ? 'Yes' : 'No' }}</p>
        <p v-if="user">
          <strong>User:</strong> {{ user.name || user.email || user._id }}
        </p>
        <p
          v-if="error"
          class="text-red-600"
        >
          <strong>Error:</strong> {{ error }}
        </p>
      </div>

      <!-- Login Section -->
      <div
        v-if="!isAuthenticated"
        class="space-y-4"
      >
        <h3 class="text-lg font-semibold text-gray-700">
          Login with:
        </h3>

        <button
          v-for="(providerKey, providerName) in providers"
          :key="providerKey"
          :disabled="isLoading"
          class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          @click="handleLogin(providerKey)"
        >
          <span v-if="isLoading">Authenticating...</span>
          <span v-else>{{ providerName }}</span>
        </button>
      </div>

      <!-- Logout Section -->
      <div
        v-if="isAuthenticated"
        class="space-y-4"
      >
        <div class="rounded-lg bg-green-50 p-4">
          <p class="text-green-800">
            You are successfully authenticated!
          </p>
        </div>

        <button
          :disabled="isLoading"
          class="flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          @click="handleLogout"
        >
          <span v-if="isLoading">Logging out...</span>
          <span v-else>Logout</span>
        </button>
      </div>

      <!-- Test API Calls -->
      <div
        v-if="isAuthenticated"
        class="mt-6 border-t pt-6"
      >
        <h3 class="mb-4 text-lg font-semibold text-gray-700">
          Test API Calls
        </h3>

        <button
          :disabled="isLoading"
          class="mb-2 flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          @click="testProfileAPI"
        >
          Test Profile API
        </button>

        <div
          v-if="apiTestResult"
          class="mt-2 rounded bg-gray-50 p-3 text-sm"
        >
          <pre>{{ JSON.stringify(apiTestResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Use the new server-side auth composable
const {
  isAuthenticated,
  user,
  isLoading,
  error,
  startAuthFlow,
  logout,
  providers
} = useServerAuth()

// State for API testing
const apiTestResult = ref(null)

// Computed class for auth status
const authStatusClass = computed(() => {
  if (error.value) return 'bg-red-50 border border-red-200'
  if (isAuthenticated.value) return 'bg-green-50 border border-green-200'
  return 'bg-yellow-50 border border-yellow-200'
})

// Handle login
const handleLogin = async (provider) => {
  console.log('Starting login with provider:', provider)
  await startAuthFlow(provider, '/auth-test')
}

// Handle logout
const handleLogout = async () => {
  console.log('Logging out...')
  await logout()
  apiTestResult.value = null
}

// Test profile API
const testProfileAPI = async () => {
  try {
    apiTestResult.value = { loading: true }
    const result = await $fetch('/api/user/profile')
    apiTestResult.value = result
  }
  catch (err) {
    apiTestResult.value = { error: err.message || 'API call failed' }
  }
}

// Set page title
useHead({
  title: 'Server-Side Auth Test - ESMuseum'
})
</script>
