/**
 * Test page for server-side authentication
 * This page allows testing the new authentication flow
 */
<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
        Server-Side Authentication Test
      </h2>

      <!-- Authentication Status -->
      <div class="mb-6 p-4 rounded-lg" :class="authStatusClass">
        <h3 class="font-semibold mb-2">Authentication Status</h3>
        <p><strong>Authenticated:</strong> {{ isAuthenticated ? 'Yes' : 'No' }}</p>
        <p v-if="user"><strong>User:</strong> {{ user.name || user.email || user._id }}</p>
        <p v-if="error" class="text-red-600"><strong>Error:</strong> {{ error }}</p>
      </div>

      <!-- Login Section -->
      <div v-if="!isAuthenticated" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-700">Login with:</h3>
        
        <button
          v-for="(providerKey, providerName) in providers"
          :key="providerKey"
          @click="handleLogin(providerKey)"
          :disabled="isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <span v-if="isLoading">Authenticating...</span>
          <span v-else>{{ providerName }}</span>
        </button>
      </div>

      <!-- Logout Section -->
      <div v-if="isAuthenticated" class="space-y-4">
        <div class="bg-green-50 p-4 rounded-lg">
          <p class="text-green-800">You are successfully authenticated!</p>
        </div>
        
        <button
          @click="handleLogout"
          :disabled="isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          <span v-if="isLoading">Logging out...</span>
          <span v-else>Logout</span>
        </button>
      </div>

      <!-- Test API Calls -->
      <div v-if="isAuthenticated" class="mt-6 pt-6 border-t">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Test API Calls</h3>
        
        <button
          @click="testProfileAPI"
          :disabled="isLoading"
          class="w-full mb-2 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Test Profile API
        </button>
        
        <div v-if="apiTestResult" class="mt-2 p-3 bg-gray-50 rounded text-sm">
          <pre>{{ JSON.stringify(apiTestResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useServerAuth } from '~/composables/useServerAuth'

// Use the new server-side auth composable
const { 
  isAuthenticated, 
  user, 
  isLoading, 
  error, 
  startAuthFlow, 
  logout, 
  checkAuthStatus,
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
  } catch (err) {
    apiTestResult.value = { error: err.message || 'API call failed' }
  }
}

// Set page title
useHead({
  title: 'Server-Side Auth Test - ESMuseum'
})
</script>