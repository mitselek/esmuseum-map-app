<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <!-- Header with Language Selector -->
      <div class="text-center">
        <!-- Language Selector -->
        <div class="mb-4 flex justify-end space-x-2">
          <button
            v-for="lang in availableLanguages"
            :key="lang.code"
            class="text-2xl transition-transform hover:scale-110"
            :title="lang.name"
            @click="switchLanguage(lang.code)"
          >
            {{ lang.flag }}
          </button>
        </div>

        <h1 class="text-3xl font-extrabold text-gray-900">
          {{ $t('onboarding.title') }}
        </h1>
        <p
          v-if="groupName"
          class="mt-2 text-lg font-medium text-blue-600"
        >
          {{ groupName }}
        </p>
        <p class="mt-2 text-sm text-gray-600">
          {{ $t('onboarding.subtitle') }}
        </p>
      </div>

      <!-- Name Collection Form (shown if user has no name) -->
      <div
        v-if="needsName && !state.isWaiting"
        class="space-y-6"
      >
        <div>
          <p class="mb-4 text-sm text-gray-700">
            {{ $t('onboarding.nameRequired') }}
          </p>
        </div>

        <form
          class="space-y-4"
          @submit.prevent="handleNameSubmit"
        >
          <div>
            <label
              for="forename"
              class="block text-sm font-medium text-gray-700"
            >
              {{ $t('onboarding.forename') }} *
            </label>
            <input
              id="forename"
              v-model="formData.forename"
              type="text"
              required
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              :placeholder="$t('onboarding.forenamePlaceholder')"
            >
          </div>

          <div>
            <label
              for="surname"
              class="block text-sm font-medium text-gray-700"
            >
              {{ $t('onboarding.surname') }} *
            </label>
            <input
              id="surname"
              v-model="formData.surname"
              type="text"
              required
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              :placeholder="$t('onboarding.surnamePlaceholder')"
            >
          </div>

          <button
            type="submit"
            :disabled="isSubmitting || !formData.forename || !formData.surname"
            class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ isSubmitting ? $t('onboarding.submitting') : $t('onboarding.submitName') }}
          </button>
        </form>
      </div>

      <!-- Waiting Screen -->
      <div
        v-if="state.isWaiting"
        class="py-8 text-center"
        role="status"
        aria-live="polite"
      >
        <div
          class="mx-auto mb-4 size-16 animate-spin rounded-full border-b-2 border-blue-600"
          aria-label="Loading"
        />
        <p class="text-lg font-medium text-gray-900">
          {{ $t('onboarding.waiting') }}
        </p>
        <p class="mt-2 text-sm text-gray-600">
          {{ $t('onboarding.waitingSubtext') }}
        </p>
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

      <!-- Start Button (only shown when not authenticated) -->
      <div
        v-if="!token && !state.isWaiting && !state.error && !state.hasTimedOut && !needsName"
        class="text-center"
      >
        <button
          type="button"
          :disabled="isLoading"
          class="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          @click="handleJoinGroup"
        >
          {{ $t('onboarding.startButton') }}
        </button>
      </div>

      <!-- Retry Button (shown after error/timeout) -->
      <div
        v-if="state.error || state.hasTimedOut"
        class="text-center"
      >
        <button
          type="button"
          class="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="handleRetry"
        >
          {{ $t('onboarding.retryButton') }}
        </button>
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
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEntuAuth } from '../../composables/useEntuAuth'
import { useEntuOAuth } from '../../composables/useEntuOAuth'
import { useOnboarding } from '../../composables/useOnboarding'

// Language code type
type LanguageCode = 'et' | 'en' | 'uk' | 'lv'

// Language interface
interface Language {
  code: LanguageCode
  name: string
  flag: string
}

const route = useRoute()
const router = useRouter()
const { locale, setLocale } = useI18n()
const { token, user } = useEntuAuth()
const { startOAuthFlow } = useEntuOAuth()
const { state, joinGroup, pollGroupMembership, reset } = useOnboarding()

const isLoading = ref(false)

// Name collection state
const needsName = ref(false)
const isSubmitting = ref(false)
const formData = ref({ forename: '', surname: '' })

// Group information state
const groupName = ref<string | null>(null)

// Get groupId from route params
const groupId = computed(() => route.params.groupId as string)

// Language configuration
const allLanguages: Language[] = [
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' }
]

// Computed property for available languages (excluding current)
const availableLanguages = computed<Language[]>(() => {
  return allLanguages.filter((lang) => lang.code !== locale.value)
})

// Language switching method
const switchLanguage = (langCode: LanguageCode): void => {
  setLocale(langCode)
}

/**
 * Fetch group information to display group name
 */
async function fetchGroupInfo () {
  if (!groupId.value) return

  try {
    const res = await $fetch<{ success: boolean, groupId: string, groupName: string }>(
      `/api/onboard/get-group-info?groupId=${groupId.value}`
    )

    if (res.success && res.groupName) {
      groupName.value = res.groupName
    }
  }
  catch (error) {
    // Silent fail - group name is nice-to-have, not critical
    console.warn('Failed to fetch group info:', error)
  }
}

/**
 * Submit name to server (sets Entu person forename/surname)
 */
async function handleNameSubmit () {
  if (!token.value || !user.value) return

  isSubmitting.value = true
  state.value.error = null

  try {
    const userId = user.value._id
    const userToken = token.value

    // Call Entu API directly from client-side with user's token
    const { updateUserName } = await import('../../utils/entu-client')
    await updateUserName(
      userId,
      formData.value.forename,
      formData.value.surname,
      userToken
    )

    // Refresh user data by calling getToken() which fetches fresh user info
    const { getToken } = useEntuAuth()
    await getToken() // This will update the user object with fresh data from Entu

    // Name set successfully - clear flag and continue join flow
    needsName.value = false

    // Proceed to join group and poll membership
    await startJoinAndPoll()
  }
  catch (error: unknown) {
    state.value.error = error instanceof Error ? error.message : 'Unknown error'
  }
  finally {
    isSubmitting.value = false
  }
}

/**
 * Shared start flow: call joinGroup then poll
 */
async function startJoinAndPoll () {
  if (!token.value || !user.value) return
  isLoading.value = true

  try {
    const userId = user.value._id

    const response = await joinGroup(groupId.value, userId)
    if (!response.success) return

    const confirmed = await pollGroupMembership(groupId.value, userId)
    if (confirmed) {
      localStorage.removeItem('pending_group_id')
      localStorage.removeItem('auth_redirect')
      router.push('/') // Redirect to main task workspace
    }
  }
  catch (error: unknown) {
    state.value.error = error instanceof Error ? error.message : 'Unknown error'
  }
  finally {
    isLoading.value = false
  }
}

/**
 * Handle OAuth authentication and join group flow (entrypoint)
 */
async function handleJoinGroup () {
  // If not authenticated, start OAuth and redirect to home after auth
  if (!token.value || !user.value) {
    // After successful authentication, redirect directly to home (not back here)
    localStorage.setItem('auth_redirect', '/') // Redirect to home after OAuth
    localStorage.setItem('pending_group_id', groupId.value)

    startOAuthFlow('google')
    return
  }

  // Authenticated - check if user has names; if not, show name form
  const hasForename = Boolean(user.value.forename)
  const hasSurname = Boolean(user.value.surname)

  if (!hasForename || !hasSurname) {
    needsName.value = true
    // Pre-fill form if one of the fields exists
    formData.value.forename = user.value.forename || ''
    formData.value.surname = user.value.surname || ''
    return
  }

  // Check if user is already a member of this group
  try {
    const userId = user.value._id
    const membershipCheck = await $fetch<{ isMember: boolean }>(
      `/api/onboard/check-membership?groupId=${groupId.value}&userId=${userId}`
    )

    if (membershipCheck.isMember) {
      // User is already in the group - redirect to main workspace
      localStorage.removeItem('pending_group_id')
      localStorage.removeItem('auth_redirect')
      router.push('/')
      return
    }
  }
  catch (error) {
    console.warn('Failed to check membership, will proceed with join:', error)
    // Continue with join flow even if check fails
  }

  // Otherwise proceed with join + poll
  await startJoinAndPoll()
}

/**
 * Handle retry after error/timeout
 */
function handleRetry () {
  reset()
  handleJoinGroup()
}

/**
 * Clear stale authentication and show name collection form
 * Helper function to reduce code duplication (Copilot review)
 */
function clearStaleAuthAndShowNameForm () {
  const { logout } = useEntuAuth()
  logout()
  needsName.value = true
  formData.value.forename = ''
  formData.value.surname = ''
}

/**
 * On mount, always clear any existing session for a fresh start
 * 
 * Since OAuth callback now redirects to home (not back here), we can
 * safely logout without worrying about clearing a fresh session.
 * 
 * FIX #21: Check membership even for authenticated users without pendingGroupId
 * FIX #23: Validate user entity exists before proceeding (detect stale auth)
 */
onMounted(async () => {
  // Always clear any existing session when landing on signup page
  // OAuth flow redirects to home after auth, never back here
  const { logout } = useEntuAuth()
  logout()

  // Fetch group name to display in header
  fetchGroupInfo()
})
</script>
