<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar - Show when no task selected, hide when task selected -->
    <div
      v-show="!isTaskSelected"
      class="w-full lg:w-80 lg:shrink-0"
    >
      <TaskSidebar />
    </div>

    <!-- Main Content Area - Show when task selected, hide when no task selected -->
    <div
      v-show="isTaskSelected"
      class="flex w-full flex-1 flex-col"
    >
      <!-- Main content -->
      <div class="flex-1">
        <TaskDetailPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LocationQueryValue } from 'vue-router'

// TaskWorkspace is a component, not a page - no definePageMeta needed

// 🔍 EVENT TRACKING: TaskWorkspace initialization
console.log('🏢 [EVENT] TaskWorkspace - Component setup started', new Date().toISOString())

const { isTaskSelected } = useTaskWorkspace()
console.log('🔍 [EVENT] TaskWorkspace - useTaskWorkspace loaded', new Date().toISOString())

// Watch for route changes to handle deep linking
const route = useRoute()
const { selectTask } = useTaskWorkspace() // Use selectTask (state-only) for route sync

watch(() => route.query.task, (taskId: LocationQueryValue | LocationQueryValue[] | undefined) => {
  if (taskId && typeof taskId === 'string') {
    selectTask(taskId) // Route sync: update state without triggering navigation
  }
}, { immediate: true })
</script>
