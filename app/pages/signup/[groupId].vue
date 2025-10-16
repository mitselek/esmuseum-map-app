<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-extrabold text-gray-900">
          {{ $t('onboarding.title') }}
        </h1>
        <p class="mt-2 text-sm text-gray-600">
          {{ $t('onboarding.subtitle') }}
        </p>
      </div>

      <!-- Waiting Screen -->
      <div v-if="state.isWaiting" class="text-center py-8" role="status" aria-live="polite">
        <div 
          class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"
          aria-label="Loading"
        ></div>
        <p class="text-lg font-medium text-gray-900">{{ $t('onboarding.waiting') }}</p>
        <p class="mt-2 text-sm text-gray-600">{{ $t('onboarding.waitingSubtext') }}</p>
        <span class="sr-only">{{ $t('onboarding.waiting') }} {{ $t('onboarding.waitingSubtext') }}</span>
      </div>

      <!-- Error Message -->
      <div
        v-if="state.error"
        role="alert"
        aria-live="assertive"
        class="rounded-md bg-red-50 p-4"
      >
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              {{ $t('onboarding.error') }}
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ state.error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeout Message -->
      <div
        v-if="state.hasTimedOut"
        role="alert"
        aria-live="assertive"
        class="rounded-md bg-yellow-50 p-4"
      >
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">
              {{ $t('onboarding.timeout') }}
            </h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>{{ $t('onboarding.timeoutMessage') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Start Button -->
      <div v-if="!state.isWaiting && !state.error && !state.hasTimedOut" class="text-center">
        <button
          type="button"
          :disabled="isLoading"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleJoinGroup"
        >
          {{ $t('onboarding.startButton') }}
        </button>
      </div>

      <!-- Retry Button (shown after error/timeout) -->
      <div v-if="state.error || state.hasTimedOut" class="text-center">
        <button
          type="button"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          @click="handleRetry"
        >
          {{ $t('onboarding.retryButton') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEntuAuth } from '../../composables/useEntuAuth'
import { useEntuOAuth } from '../../composables/useEntuOAuth'
import { useOnboarding } from '../../composables/useOnboarding'

const route = useRoute()
const router = useRouter()
const { token, user } = useEntuAuth()
const { startOAuthFlow } = useEntuOAuth()
const { state, joinGroup, pollGroupMembership, reset } = useOnboarding()

const isLoading = ref(false)

// Get groupId from route params
const groupId = computed(() => route.params.groupId as string)

/**
 * Handle OAuth authentication and join group flow
 */
async function handleJoinGroup() {
  // Check if user is authenticated
  if (!token.value || !user.value) {
    // Store callback URL and groupId for after OAuth
    const callbackUrl = `/signup/${groupId.value}`
    localStorage.setItem('auth_callback_url', callbackUrl)
    localStorage.setItem('pending_group_id', groupId.value)
    
    // Initiate OAuth login (using Google provider)
    startOAuthFlow('google')
    return
  }

  // User is authenticated, proceed with group assignment
  isLoading.value = true
  
  try {
    const userId = user.value._id

    // Step 1: Call server endpoint to assign user to group
    const response = await joinGroup(groupId.value, userId)

    if (!response.success) {
      isLoading.value = false
      return
    }

    // Step 2: Poll for membership confirmation
    const confirmed = await pollGroupMembership(groupId.value, userId)

    if (confirmed) {
      // Success! Clear localStorage and redirect
      localStorage.removeItem('pending_group_id')
      localStorage.removeItem('auth_callback_url')
      
      // Redirect to dashboard or success page
      router.push('/dashboard')
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    state.value.error = errorMessage
  } finally {
    isLoading.value = false
  }
}

/**
 * Handle retry after error/timeout
 */
function handleRetry() {
  reset()
  handleJoinGroup()
}

/**
 * On mount, check if we're returning from OAuth
 */
onMounted(() => {
  const pendingGroupId = localStorage.getItem('pending_group_id')
  
  // If user is authenticated and has pending groupId, auto-start join flow
  if (token.value && user.value && pendingGroupId && pendingGroupId === groupId.value) {
    handleJoinGroup()
  }
})
</script>
