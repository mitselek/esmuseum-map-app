<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="shrink-0 border-b border-gray-200 bg-white p-4">
      <h2 class="text-lg font-semibold text-gray-900">
        {{ $t('tasks.title') }}
      </h2>

      <!-- Search/Filter -->
      <div class="mt-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            :placeholder="$t('tasks.searchTasks')"
          >
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              class="size-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Task count - Show count or loading indicator -->
      <div class="mt-2 text-xs text-gray-500">
        <span v-if="initialized">
          {{ $t('tasks.tasksFound', { count: filteredTasks.length }, filteredTasks.length) }}
        </span>
        <span
          v-else
          class="italic"
        >
          {{ $t('tasks.loadingTasks') }}...
        </span>
      </div>
    </div>

    <!-- Loading state - Show when loading OR when not initialized -->
    <div
      v-if="loading || !initialized"
      class="flex flex-1 items-center justify-center"
    >
      <div class="text-center">
        <div class="mx-auto size-8 animate-spin rounded-full border-b-2 border-blue-600" />
        <p class="mt-2 text-sm text-gray-500">
          {{ loading ? $t('tasks.loading') : $t('tasks.initializing') }}
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
      v-else-if="initialized || filteredTasks.length > 0"
      class="flex-1 overflow-y-auto bg-gray-50"
    >
      <div
        v-if="filteredTasks.length === 0"
        class="p-4 text-center"
      >
        <div class="mx-auto mb-3 size-12 rounded-full bg-gray-100 p-3">
          <svg
            class="size-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p class="text-sm font-medium text-gray-900">
          {{ searchQuery ? $t('tasks.noTasksMatchSearch') : $t('tasks.noTasks') }}
        </p>
        <p class="mt-1 text-xs text-gray-500">
          {{ searchQuery ? $t('tasks.tryDifferentSearch') : $t('tasks.noTasksDescription') }}
        </p>
      </div>

      <div
        v-else
        class="p-3"
      >
        <div
          v-for="task in filteredTasks"
          :key="task._id"
          class="mb-3 cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-all duration-200"
          :class="[
            selectedTaskId === task._id
              ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-200'
              : 'border-gray-200 hover:border-blue-300 hover:shadow-md',
            isTaskFullyCompleted(task._id) ? 'opacity-60' : '',
          ]"
          @click="navigateToTask(task._id)"
        >
          <!-- Task Title with Checkmark -->
          <div class="mb-2 flex items-start justify-between">
            <h3 class="line-clamp-2 flex-1 text-sm font-medium text-gray-900">
              {{ getTaskTitle(task) }}
            </h3>
            <!-- Checkmark for completed tasks -->
            <svg
              v-if="isTaskFullyCompleted(task._id)"
              class="ml-2 size-5 shrink-0 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <!-- Task Description (if available) -->
          <p
            v-if="getTaskDescription(task)"
            class="mb-2 line-clamp-2 text-xs text-gray-600"
          >
            {{ getTaskDescription(task) }}
          </p>

          <!-- Group Info -->
          <div
            v-if="task.groupName"
            class="mb-2 flex items-center"
          >
            <div class="flex items-center text-xs text-gray-500">
              <svg
                class="mr-1 size-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ task.groupName }}
            </div>
          </div>

          <!-- Response Count and Status -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <!-- Response Count -->
              <div class="flex items-center text-xs text-gray-500">
                <svg
                  class="mr-1 size-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span v-if="taskResponseStatsCache.has(task._id)">
                  {{ getResponseStatsText(task) }}
                </span>
                <span v-else>
                  {{ getResponseCount(task) }} {{ $t('tasks.responses') }}
                </span>
              </div>

              <!-- Due Date (if available) -->
              <div
                v-if="getTaskDueDate(task)"
                class="flex items-center text-xs text-orange-600"
              >
                <svg
                  class="mr-1 size-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ getTaskDueDate(task) }}
              </div>
            </div>

            <!-- Selection Indicator -->
            <div
              v-if="selectedTaskId === task._id"
              class="flex items-center"
            >
              <div class="size-2 rounded-full bg-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EntuTask } from '../../types/entu'
import { getTaskName, getTaskDescription, getTaskResponseCount, getTaskDeadline } from '../../utils/entu-helpers'

const {
  tasks,
  selectedTaskId,
  loading,
  error,
  initialized, // 🚀 PHASE 1: Track initialization state
  loadTasks,
  navigateToTask // Use navigateToTask for user clicks (preserves URL params like ?debug)
} = useTaskWorkspace()
const { loadCompletedTasks, getTaskStats } = useCompletedTasks()
const { t } = useI18n()

// Response stats cache for all tasks (stores actual and expected counts)
interface TaskStats {
  actual: number
  expected: number
}

const taskResponseStatsCache = ref<Map<string, TaskStats>>(new Map())

// Search functionality
const searchQuery = ref('')

// Computed property for filtered tasks (sorted: incomplete first, completed last)
const filteredTasks = computed(() => {
  let taskList = tasks.value

  // Apply search filter if query exists
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    taskList = taskList.filter((task) => {
      const title = getTaskTitle(task).toLowerCase()
      const description = getTaskDescription(task)?.toLowerCase() || ''
      const groupName = task.groupName?.toLowerCase() || ''

      return title.includes(query)
        || description.includes(query)
        || groupName.includes(query)
    })
  }

  // Sort: incomplete tasks first, completed tasks last
  return [...taskList].sort((a, b) => {
    const aStats = taskResponseStatsCache.value.get(a._id)
    const bStats = taskResponseStatsCache.value.get(b._id)

    const aCompleted = aStats && aStats.actual >= aStats.expected
    const bCompleted = bStats && bStats.actual >= bStats.expected

    if (aCompleted === bCompleted) return 0
    // Completed tasks go last
    return aCompleted ? 1 : -1
  })
})

// Helper functions using typed entu-helpers
const getTaskTitle = (task: EntuTask): string => {
  return getTaskName(task)
}

// getTaskDescription is imported from entu-helpers

const getResponseCount = (task: EntuTask): number => {
  return getTaskResponseCount(task)
}

const getResponseStatsText = (task: EntuTask): string => {
  const stats = taskResponseStatsCache.value.get(task._id)
  if (stats) {
    return `${stats.actual} / ${stats.expected} ${t('tasks.responses')}`
  }
  return `${getResponseCount(task)} ${t('tasks.responses')}`
}

const loadTaskResponseStats = (task: EntuTask): void => {
  try {
    // Get expected count from task data
    const expectedCount = getTaskResponseCount(task) || 1

    // Use getTaskStats from useCompletedTasks (no API call needed!)
    const stats = getTaskStats(task._id, expectedCount)

    taskResponseStatsCache.value.set(task._id, stats)
  }
  catch (error) {
    console.warn(`Failed to load response stats for task ${task._id}:`, error)
  }
}

const isTaskFullyCompleted = (taskId: string): boolean => {
  const stats = taskResponseStatsCache.value.get(taskId)
  if (!stats) return false
  return stats.actual >= stats.expected
}

const getTaskDueDate = (task: EntuTask): string | null => {
  const deadline = getTaskDeadline(task)
  if (deadline) {
    return deadline.toLocaleDateString()
  }
  return null
}

// Load completed tasks and stats when tasks change
watch(tasks, async (newTasks) => {
  if (newTasks && newTasks.length > 0) {
    // Load user's completed tasks first
    await loadCompletedTasks()

    // Then update stats for each task
    for (const task of newTasks) {
      // Sync, no await needed
      loadTaskResponseStats(task)
    }
  }
}, { immediate: false })

// 🚀 PHASE 1: Non-blocking initialization
onMounted(() => {
  console.log('🏢 [EVENT] TaskSidebar - Component mounted, UI ready immediately', new Date().toISOString())
  // Tasks will auto-load when accessed via computed property
  // Completed tasks will load when tasks are ready (via watch above)
  // No blocking calls here - UI shows immediately!
})
</script>
