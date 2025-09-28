<template>
  <div class="min-h-screen bg-gray-50">
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

// 🔍 EVENT TRACKING: Page initialization
console.log('🚀 [EVENT] index.vue - Script setup started', new Date().toISOString())

// Initialize GPS with permission detection
const { initializeGPSWithPermissionCheck } = useLocation()
onMounted(() => {
  console.log('🔍 [EVENT] index.vue - onMounted triggered', new Date().toISOString())
  initializeGPSWithPermissionCheck()
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
