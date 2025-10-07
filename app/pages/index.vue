<template>
  <div class="min-h-screen">
    <!-- GPS Permission Prompt -->
    <GPSPermissionPrompt />

    <!-- Task Workspace SPA -->
    <TaskWorkspace />

    <!-- Event Debug Panel - Available for mobile debugging -->
    <EventDebugPanel />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

// Import debug panel explicitly (auto-import fix)
const EventDebugPanel = defineAsyncComponent(() => import('~/components/EventDebugPanel.vue'))

// Initialize GPS - request directly without custom prompt
const { checkGeolocationPermission, requestGPSPermission, getUserPosition, startGPSUpdates } = useLocation()
onMounted(async () => {
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
    console.error('Error initializing GPS:', error)
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
