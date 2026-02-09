<template>
  <div class="shrink-0 border-b border-gray-200 bg-white p-6">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h1 class="text-xl font-semibold text-esm-dark">
          {{ taskTitle }}
        </h1>

        <p
          v-if="taskDescription"
          class="mt-2 text-sm text-gray-600"
        >
          {{ taskDescription }}
        </p>

        <div class="mt-3 flex items-center space-x-4 text-sm text-gray-500">
          <span
            v-if="selectedTask.groupName"
            class="flex items-center"
          >
            <span class="mr-1">👥</span>
            {{ selectedTask.groupName }}
          </span>
          <span class="flex items-center">
            <span class="mr-1">📊</span>
            <span v-if="taskResponseStats">
              {{ $t('taskDetail.responsesProgress', {
                actual: taskResponseStats.actual,
                expected: taskResponseStats.expected,
              }) }}
            </span>
            <span v-else>
              {{ $t('taskDetail.totalResponses', { count: responseCount }) }}
            </span>
          </span>
        </div>
      </div>

      <!-- Close button for mobile -->
      <button
        class="ml-4 rounded-md p-2 text-gray-400 hover:text-gray-600 lg:hidden"
        @click="$emit('clearSelection')"
      >
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedTask: Record<string, unknown>
  taskTitle: string
  taskDescription: string | null
  responseCount: number
  taskResponseStats?: { actual: number, expected: number } | null
}

interface Emits {
  (e: 'clearSelection'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
