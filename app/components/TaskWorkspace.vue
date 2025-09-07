<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Desktop Sidebar / Mobile Drawer -->
    <div
      class="relative transition-all duration-300 ease-in-out"
      :class="[
        // Desktop: always visible with fixed width
        'lg:flex lg:w-80 lg:shrink-0',
        // Mobile: overlay drawer
        isMobile ? (sidebarVisible ? 'fixed inset-y-0 left-0 z-40 w-80' : 'hidden') : '',
      ]"
    >
      <!-- Sidebar content -->
      <div class="h-full">
        <TaskSidebar />
      </div>
    </div>

    <!-- Mobile Overlay (when sidebar is open) -->
    <div
      v-if="isMobile && sidebarVisible"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      @click="closeSidebar"
    />

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col lg:ml-80">
      <!-- Mobile header -->
      <div class="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <h1 class="text-lg font-semibold text-gray-900">
          {{ t('tasks.title') }}
        </h1>

        <button
          class="rounded-md p-2 text-gray-500 hover:text-gray-600"
          @click="toggleSidebar"
        >
          <span class="sr-only">Open sidebar</span>
          <svg
            class="size-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <!-- Main content -->
      <div class="flex-1">
        <TaskDetailPanel />
      </div>
    </div>
  </div>
</template>

<script setup>
// TaskWorkspace is a component, not a page - no definePageMeta needed

const { selectTask } = useTaskWorkspace()
const { isMobile } = useResponsiveLayout()
const { t } = useI18n()

// Sidebar state for mobile
const sidebarVisible = ref(false)

// Sidebar controls
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}

const closeSidebar = () => {
  sidebarVisible.value = false
}

// Watch for route changes to handle deep linking
const route = useRoute()
watch(() => route.query.task, (taskId) => {
  if (taskId && typeof taskId === 'string') {
    selectTask(taskId)
    // Close sidebar on mobile after selection
    if (isMobile.value) {
      sidebarVisible.value = false
    }
  }
}, { immediate: true })

// Set page title - only if this component is used as a page
// This will be handled by the page that uses this component
</script>
