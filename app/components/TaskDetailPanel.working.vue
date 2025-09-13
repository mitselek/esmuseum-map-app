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
                <span v-if="taskResponseStats">
                  {{ $t('taskDetail.responsesProgress', {
                    actual: taskResponseStats.actual,
                    expected: taskResponseStats.expected,
                  }) }}
                </span>
                <span v-else>
                  {{ $t('taskDetail.totalResponses', { count: getResponseCount(selectedTask) }) }}
                </span>
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
          <!-- Location Management Section -->
          <TaskLocationManager
            :selected-task="selectedTask"
            :user-position="userPosition"
            :task-locations="taskLocations"
            :loading-task-locations="loadingTaskLocations"
            @update:user-position="userPosition = $event"
            @location-change="responseForm.geopunkt = $event"
          />

          <!-- Response Form -->
          <div class="rounded-lg border bg-white p-6 shadow-sm">
            <h3 class="mb-4 text-lg font-medium text-gray-900">
              {{ $t('taskDetail.yourResponse') }}
            </h3>

            <!-- Permission checking state -->
            <div
              v-if="checkingPermissions"
              class="flex items-center justify-center py-8"
            >
              <div class="text-center">
                <div class="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                <p class="text-sm text-gray-500">
                  {{ $t('taskDetail.checkingPermissions') }}
                </p>
              </div>
            </div>

            <!-- No permissions message -->
            <div
              v-else-if="!hasResponsePermission"
              class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center"
            >
              <div class="mx-auto mb-3 size-12 text-amber-600">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h4 class="mb-2 font-medium text-amber-800">
                {{ $t('taskDetail.noPermission') }}
              </h4>
              <p class="text-sm text-amber-700">
                {{ $t('taskDetail.noPermissionDescription') }}
              </p>
            </div>

            <!-- Response form (shown only with permission) -->
            <form
              v-else
              @submit.prevent="submitResponse"
            >
              <!-- Location Selection (if needed) -->
              <div
                v-if="needsLocation"
                class="mb-6"
              >
                <label class="mb-3 block text-sm font-medium text-gray-700">
                  {{ $t('taskDetail.location') }}
                </label>

                <!-- LocationPicker Component -->
                <LocationPicker
                  :locations="taskLocations"
                  :user-position="userPosition"
                  :selected="selectedLocation"
                  :loading="loadingTaskLocations"
                  :error="geolocationError"
                  @select="onLocationSelect"
                  @request-location="onRequestLocation"
                  @retry="loadTaskLocations"
                />
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
import TaskLocationManager from './TaskLocationManager.vue'

const { selectedTask, clearSelection } = useTaskWorkspace()
const { t } = useI18n()
const {
  userPosition,
  sortByDistance
} = useLocation()
const { getTaskResponseStats } = useTaskResponseStats()

// Response stats state
const taskResponseStats = ref(null)

// Form state
const responseForm = ref({
  text: '',
  geopunkt: null,
  file: null
})

const submitting = ref(false)
const checkingPermissions = ref(false)
const hasResponsePermission = ref(false)

// Task locations state
const taskLocations = ref([])
const loadingTaskLocations = ref(false)
const selectedLocation = ref(null)

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
  // Handle Entu array format for response count
  if (task?.vastuseid && Array.isArray(task.vastuseid) && task.vastuseid[0]?.number !== undefined) {
    return task.vastuseid[0].number
  }
  // Fallback for direct number
  if (typeof task?.responseCount === 'number') {
    return task.responseCount
  }
  return 0
}

// Check if task needs location
const hasMapData = computed(() => {
  // For now, assume all tasks might have location data
  return !!selectedTask.value
})

// Simple stub for task locations loading (handled by TaskLocationManager)
const loadTaskLocations = async () => {
  // Location loading is now handled by TaskLocationManager component
  // This is kept for compatibility with existing code
}

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
    const { token } = useEntuAuth()

    if (!token.value) {
      console.error('Not authenticated')
      return
    }

    // Prepare the API request data matching the server validation
    const requestData = {
      taskId: selectedTask.value._id,
      responses: [
        {
          questionId: 'default', // Using default for simple text response
          type: 'text',
          value: responseForm.value.text,
          metadata: {}
        }
      ]
    }

    // Call the API endpoint
    await $fetch('/api/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: requestData
    })

    // Reset form after successful submission
    responseForm.value.text = ''
    responseForm.value.geopunkt = null
    responseForm.value.file = null
  }
  catch (error) {
    console.error('Failed to submit response:', error)
  }
  finally {
    submitting.value = false
  }
}

// Check permissions for current task
const checkPermissions = async (taskId) => {
  const { token } = useEntuAuth()

  if (!token.value) {
    hasResponsePermission.value = false
    return
  }

  try {
    checkingPermissions.value = true

    const permissionData = await $fetch(`/api/tasks/${taskId}/permissions`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    hasResponsePermission.value = permissionData.success && permissionData.hasPermission
  }
  catch {
    hasResponsePermission.value = false
  }
  finally {
    checkingPermissions.value = false
  }
}

// Load existing response when task changes
watch(selectedTask, async (newTask) => {
  if (newTask) {
    const taskId = newTask._id || newTask.id
    if (!taskId) {
      return
    }

    const { token } = useEntuAuth()

    // Check permissions first
    await checkPermissions(taskId)

    // Load task response stats
    try {
      taskResponseStats.value = await getTaskResponseStats(newTask)
    }
    catch (error) {
      console.warn('Failed to load task response stats:', error)
      taskResponseStats.value = null
    }

    // Load task locations
    await loadTaskLocations()

    if (token.value) {
      try {
        // Try to fetch existing response
        const responseData = await $fetch(`/api/responses/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        })

        if (responseData.success && responseData.response) {
          // Fill form with existing response data
          const existingResponse = responseData.response
          responseForm.value = {
            text: existingResponse.kirjeldus?.[0]?.string || '',
            geopunkt: existingResponse.geopunkt?.[0]?.string || null,
            file: null // Files need special handling
          }
        }
        else {
          // No existing response, clear form
          responseForm.value = {
            text: '',
            geopunkt: null,
            file: null
          }

          // Auto-geolocate if task needs location and no existing location
          if (needsLocation.value && !responseForm.value.geopunkt) {
            try {
              await getCurrentLocation()
            }
            catch (error) {
              console.log('Auto-geolocation failed:', error)
              // Continue without location - user can set manually
            }
          }
        }
      }
      catch (error) {
        console.log('No existing response found or error loading:', error)
        // Clear form if no response found
        responseForm.value = {
          text: '',
          geopunkt: null,
          file: null
        }

        // Auto-geolocate if task needs location
        if (needsLocation.value) {
          try {
            await getCurrentLocation()
          }
          catch {
            // Continue without location - user can set manually
          }
        }
      }
    }
    else {
      // Not authenticated, clear form
      responseForm.value = {
        text: '',
        geopunkt: null,
        file: null
      }
    }
  }
  else {
    // No task selected, reset permission state and clear locations
    hasResponsePermission.value = false
    checkingPermissions.value = false
    taskLocations.value = []
    selectedLocation.value = null
  }
}, { immediate: true })

// Watch for GPS position changes and refresh locations
watch(userPosition, (newPosition, oldPosition) => {
  if (newPosition && newPosition.lat !== undefined && newPosition.lng !== undefined && taskLocations.value.length > 0) {
    // Check if position actually changed to avoid unnecessary updates
    const positionChanged = !oldPosition
      || !oldPosition.lat
      || !oldPosition.lng
      || oldPosition.lat !== newPosition.lat
      || oldPosition.lng !== newPosition.lng

    if (positionChanged) {
      // Re-sort existing locations with updated distances
      taskLocations.value = sortByDistance(taskLocations.value, newPosition)
    }
  }
}, { deep: true })
</script>
