<template>
  <div class="flex h-full flex-col">
    <!-- No task selected -->
    <div
      v-if="!selectedTask"
      class="flex flex-1 items-center justify-center p-8"
    >
      <div class="max-w-md text-center">
        <div class="mx-auto mb-4 size-16 rounded-full bg-gray-100 p-4">
          <svg
            class="size-8 text-gray-400"
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
        <h3 class="mb-2 text-lg font-medium text-gray-900">
          {{ $t('tasks.selectTask') }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ $t('tasks.selectTaskDescription') }}
        </p>
      </div>
    </div>

    <!-- Task selected -->
    <div
      v-else
      class="flex h-full flex-col"
    >
      <!-- Task header -->
      <div class="shrink-0 border-b border-gray-200 bg-white p-6">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h1 class="text-xl font-semibold text-gray-900">
              {{ getTaskTitle(selectedTask) }}
            </h1>

            <p
              v-if="getTaskDescription(selectedTask)"
              class="mt-2 text-sm text-gray-600"
            >
              {{ getTaskDescription(selectedTask) }}
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
                {{ $t('taskDetail.totalResponses', { count: getResponseCount(selectedTask) }) }}
              </span>
            </div>
          </div>

          <!-- Close button for mobile -->
          <button
            class="ml-4 rounded-md p-2 text-gray-400 hover:text-gray-600 lg:hidden"
            @click="clearSelection"
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

      <!-- Task content -->
      <div class="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div class="mx-auto max-w-4xl space-y-6">
          <!-- Map Card (if task has location data) -->
          <div
            v-if="hasMapData"
            class="rounded-lg border bg-white p-6 shadow-sm"
          >
            <h3 class="mb-4 text-lg font-medium text-gray-900">
              {{ $t('taskDetail.map') }}
            </h3>
            <div class="rounded-lg bg-gray-100 p-8 text-center text-gray-500">
              🗺️ {{ $t('taskDetail.mapIntegrationComing') }}
            </div>
          </div>

          <!-- Response Form -->
          <div class="rounded-lg border bg-white p-6 shadow-sm">
            <h3 class="mb-4 text-lg font-medium text-gray-900">
              {{ $t('taskDetail.yourResponse') }}
            </h3>

            <form @submit.prevent="submitResponse">
              <!-- Location Selection (if needed) -->
              <div
                v-if="needsLocation"
                class="mb-6"
              >
                <label class="mb-3 block text-sm font-medium text-gray-700">
                  {{ $t('taskDetail.location') }}
                </label>

                <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p class="text-sm text-gray-600">
                    📍 {{ $t('locationPicker.placeholder') }}
                  </p>
                </div>
              </div>

              <!-- Text Response -->
              <div class="mb-6">
                <label
                  for="response-text"
                  class="mb-2 block text-sm font-medium text-gray-700"
                >
                  {{ $t('taskDetail.response') }}
                </label>
                <textarea
                  id="response-text"
                  v-model="responseForm.text"
                  class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows="4"
                  :placeholder="$t('taskDetail.responsePlaceholder')"
                  :disabled="submitting"
                />
              </div>

              <!-- File Upload -->
              <div class="mb-6">
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  {{ $t('taskDetail.addFile') }}
                </label>
                <div class="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                  <p class="text-sm text-gray-500">
                    📎 {{ $t('taskDetail.allowedFiles') }}
                  </p>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="flex flex-col space-y-2">
                <button
                  type="submit"
                  class="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!canSubmit || submitting"
                >
                  {{ submitting ? $t('taskDetail.submitting') : $t('taskDetail.submitResponseBtn') }}
                </button>

                <p class="text-center text-xs text-gray-500">
                  {{ $t('taskDetail.canUpdateUntilDeadline') }}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { selectedTask, clearSelection } = useTaskWorkspace()
const { t } = useI18n()

// Form state
const responseForm = ref({
  text: '',
  geopunkt: null,
  file: null
})

const submitting = ref(false)

// Helper functions (matching existing task detail page)
const getTaskTitle = (task) => {
  // Handle both data structures: task.name (string) or task.name[0].string (array format)
  if (typeof task?.name === 'string') {
    return task.name || t('taskDetail.noTitle', 'Untitled Task')
  }
  return task?.name?.[0]?.string || t('taskDetail.noTitle', 'Untitled Task')
}

const getTaskDescription = (task) => {
  return task?.description?.[0]?.string || task?.description || null
}

const getResponseCount = (task) => {
  return task?.responseCount || 0
}

// Check if task needs location
const hasMapData = computed(() => {
  // For now, assume all tasks might have location data
  return !!selectedTask.value
})

const needsLocation = computed(() => {
  // Check if task requires location input
  return !!selectedTask.value && hasMapData.value
})

const canSubmit = computed(() => {
  return responseForm.value.text.trim().length > 0
})

// Form submission
const submitResponse = async () => {
  if (!canSubmit.value || !selectedTask.value) return

  submitting.value = true

  try {
    console.log('Submitting response for task:', selectedTask.value._id)
    console.log('Response data:', responseForm.value)

    // TODO: Implement actual submission
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    // Success handling
    console.log('Response submitted successfully')
  }
  catch (error) {
    console.error('Failed to submit response:', error)
  }
  finally {
    submitting.value = false
  }
}

// Load existing response when task changes
watch(selectedTask, async (newTask) => {
  if (newTask) {
    // TODO: Load existing user response
    responseForm.value = {
      text: '',
      geopunkt: null,
      file: null
    }
  }
}, { immediate: true })
</script>
