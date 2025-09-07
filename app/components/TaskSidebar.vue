<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="shrink-0 border-b border-gray-200 p-4">
      <h2 class="text-lg font-semibold text-gray-900">
        {{ $t('tasks.title') }}
      </h2>
    </div>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="flex flex-1 items-center justify-center"
    >
      <div class="text-center">
        <div class="mx-auto size-8 animate-spin rounded-full border-b-2 border-blue-600" />
        <p class="mt-2 text-sm text-gray-500">
          {{ $t('tasks.loading') }}
        </p>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="flex flex-1 items-center justify-center p-4"
    >
      <div class="text-center">
        <p class="text-sm text-red-600">
          {{ error }}
        </p>
        <button
          class="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          @click="loadTasks"
        >
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Task list -->
    <div
      v-else
      class="flex-1 overflow-y-auto"
    >
      <div
        v-if="tasks.length === 0"
        class="p-4 text-center"
      >
        <p class="text-sm text-gray-500">
          {{ $t('tasks.noTasks') }}
        </p>
      </div>

      <div
        v-else
        class="p-2"
      >
        <div
          v-for="task in tasks"
          :key="task._id"
          class="mb-2 cursor-pointer rounded-lg border p-3 transition-colors"
          :class="[
            selectedTaskId === task._id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
          ]"
          @click="selectTask(task._id)"
        >
          <h3 class="line-clamp-2 text-sm font-medium text-gray-900">
            {{ task.name || 'Unnamed Task' }}
          </h3>

          <p
            v-if="task.groupName"
            class="mt-1 text-xs text-gray-500"
          >
            {{ task.groupName }}
          </p>

          <div class="mt-2 flex items-center justify-between">
            <span class="text-xs text-gray-400">
              {{ task._id }}
            </span>

            <div
              v-if="selectedTaskId === task._id"
              class="size-2 rounded-full bg-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const {
  tasks,
  selectedTaskId,
  loading,
  error,
  loadTasks,
  selectTask
} = useTaskWorkspace()

// Load tasks when component mounts
onMounted(async () => {
  await loadTasks()
})
</script>
