<template>
  <div class="min-h-screen bg-esm-beige">
    <!-- GPS Permission Prompt -->
    <GPSPermissionPrompt />

    <!-- Task Workspace SPA -->
    <TaskWorkspace />

    <!-- Event Debug Panel - Available for mobile debugging -->
    <EventDebugPanel />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

// Import debug panel explicitly (auto-import fix)
const EventDebugPanel = defineAsyncComponent(() => import('~/components/EventDebugPanel.vue'))

const log = useClientLogger('index')

// Check for pending group join from signup flow
const { user } = useEntuAuth()
const { joinGroup, pollGroupMembership } = useOnboarding()

// Initialize GPS - request directly without custom prompt
const { checkGeolocationPermission, requestGPSPermission, getUserPosition, startGPSUpdates } = useLocation()

/**
 * Process pending group join after OAuth redirect
 * This handles the case where user clicked join link, authenticated via OAuth,
 * and was redirected to home page
 */
async function processPendingGroupJoin () {
  const pendingGroupId = localStorage.getItem('pending_group_id')

  if (!pendingGroupId || !user.value) {
    log.info('[ONBOARDING] No pending group join')
    return
  }

  log.info('[ONBOARDING] Processing pending group join:', pendingGroupId)

  try {
    const userId = user.value._id

    // Join the group (endpoint already handles duplicate membership check)
    log.info('[ONBOARDING] Joining group...')
    const response = await joinGroup(pendingGroupId, userId)

    if (!response.success) {
      log.error('[ONBOARDING] Failed to join group:', response.message)
      return
    }

    log.info('[ONBOARDING] Join initiated, polling for confirmation...')

    // Poll for membership confirmation
    const confirmed = await pollGroupMembership(pendingGroupId, userId)

    if (confirmed) {
      log.info('[ONBOARDING] Membership confirmed!')
      localStorage.removeItem('pending_group_id')
      localStorage.removeItem('auth_redirect')
    }
    else {
      log.warn('[ONBOARDING] Membership polling timed out')
    }
  }
  catch (error: unknown) {
    log.error('[ONBOARDING] Error processing pending group join:', error)
  }
}

onMounted(async () => {
  // Process pending group join first
  await processPendingGroupJoin()

  // Check profile completeness - redirect to /profile if incomplete
  const router = useRouter()
  if (user.value && (!user.value.forename || !user.value.surname)) {
    log.info('[PROFILE] Profile incomplete, redirecting to /profile')
    localStorage.setItem('profile_redirect', '/')
    router.push('/profile')
    return // Stop further initialization
  }

  // Initialize GPS
  try {
    const permissionState = await checkGeolocationPermission()

    if (permissionState === 'granted') {
      // Already granted - just start GPS
      await getUserPosition()
      startGPSUpdates()
    }
    else if (permissionState === 'prompt') {
      // Need permission - request immediately (native prompt)
      requestGPSPermission()
    }
    // If 'denied' - do nothing, GPSPermissionPrompt will show recovery UI
  }
  catch (error) {
    log.error('Error initializing GPS:', error)
  }
})

// Set page title
const { t } = useI18n()
useHead({
  title: computed(() => t('appName'))
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
