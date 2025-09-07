<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <AppHeader />

    <!-- Task Workspace SPA -->
    <TaskWorkspace />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
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
