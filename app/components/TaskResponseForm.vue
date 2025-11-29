<template>
  <div class="p-6">
    <h3 class="mb-4 text-lg font-medium text-gray-900">
      {{ $t('taskDetail.yourResponse') }}
    </h3>

    <!-- Permission checking state -->
    <TaskPermissionLoading v-if="checkingPermissions" />

    <!-- No permissions message -->
    <TaskNoPermission v-else-if="!hasResponsePermission" />

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
          :selected="selectedLocation"
          :loading="loadingTaskLocations"
          :error="geolocationError"
          :visited-locations="visitedLocations"
          @select="onLocationSelect"
          @request-location="onRequestLocation"
          @retry="loadTaskLocations"
        />
      </div>

      <!-- Text Response (only show when location selected or not needed) -->
      <TaskResponseTextarea
        v-if="!needsLocation || selectedLocation"
        v-model:response-text="responseForm.text"
        :submitting="submitting"
      />

      <!-- File Upload (only show when location selected or not needed) -->
      <TaskFileUpload
        v-if="!needsLocation || selectedLocation"
        ref="fileUploadRef"
        @upload-complete="onFileUploadComplete"
        @upload-error="onFileUploadError"
      />

      <!-- Submit Button (only show when location selected or not needed) -->
      <div
        v-if="!needsLocation || selectedLocation"
        class="flex flex-col space-y-2"
      >
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
</template>

<script setup lang="ts">
import type { EntuTask } from '../../types/entu'
import type { TaskLocation } from '~/types/location'
import { roundCoordinates } from '~/utils/distance'

// Types
interface ResponseFormData {
  text: string
  seadmeGps: string | null // Device GPS location at submission
  file: File | null
}

interface FileUploadRef {
  files: File[]
  uploadFiles: (entityId: string) => Promise<Array<{ success: boolean, entityId?: string }>>
  clearFiles: () => void
}

interface UploadResult {
  success: boolean
  entityId?: string
}

// Props
interface Props {
  selectedTask: EntuTask
  checkingPermissions?: boolean
  hasResponsePermission?: boolean
  needsLocation?: boolean
  taskLocations?: TaskLocation[]
  selectedLocation?: TaskLocation | null
  loadingTaskLocations?: boolean
  geolocationError?: string | null
  visitedLocations?: Set<string>
}

const props = withDefaults(defineProps<Props>(), {
  checkingPermissions: false,
  hasResponsePermission: false,
  needsLocation: false,
  taskLocations: () => [],
  selectedLocation: null,
  loadingTaskLocations: false,
  geolocationError: null,
  visitedLocations: () => new Set()
})

// Emits
interface Emits {
  (e: 'locationSelect', location: TaskLocation | null): void
  (e: 'requestLocation' | 'loadTaskLocations'): void
  (e: 'response-submitted', data: {
    responseData: unknown
    apiResponse: unknown
    locationReference?: string
    uploadedFiles: string[]
  }): void
}

const emit = defineEmits<Emits>()

const { user: entuUser } = useEntuAuth()

// Form state
const responseForm = ref<ResponseFormData>({
  text: '',
  seadmeGps: null,
  file: null
})

const submitting = ref<boolean>(false)
const fileUploadRef = ref<FileUploadRef | null>(null)
const uploadedFiles = ref<UploadResult[]>([])

const respondentName = computed(() => {
  const entu = entuUser.value

  const normalize = (value: unknown): string | null => {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  return normalize(entu?.name)
})

// Computed properties
const canSubmit = computed(() => {
  // Allow submission with or without text (text is optional)
  // User can submit just a location, just files, or combination
  return true
})

// Debug: Watch selectedLocation changes
watch(() => props.selectedLocation, (newLocation, oldLocation) => {
  console.log('[TaskResponseForm] selectedLocation changed:', {
    from: oldLocation?.nimi || oldLocation?.name || 'null',
    to: newLocation?.nimi || newLocation?.name || 'null'
  })
}, { deep: true })

// Event handlers
const onLocationSelect = (location: TaskLocation | null): void => {
  emit('locationSelect', location)
}

const onRequestLocation = (): void => {
  emit('requestLocation')
}

const loadTaskLocations = (): void => {
  emit('loadTaskLocations')
}

// File upload handlers
const onFileUploadComplete = (results: UploadResult[]): void => {
  console.log('File upload completed:', results)
  uploadedFiles.value = results.filter((result) => result.success)
}

const onFileUploadError = (error: Error): void => {
  console.error('File upload error:', error)
}

// Form submission
const submitResponse = async () => {
  if (!canSubmit.value || !props.selectedTask) return

  submitting.value = true

  try {
    // F015: Use feature-flagged response creation
    const { createTaskResponse } = useTaskResponseCreation()

    // Step 1: Create the response entity first
    const requestData = {
      taskId: props.selectedTask._id,
      responses: [
        {
          questionId: 'default', // Using default for simple text response
          type: 'text',
          value: responseForm.value.text,
          metadata: {
            // Include location reference if available
            locationId: props.selectedLocation?.reference || props.selectedLocation?._id,
            // Include coordinates if available (rounded to 6 decimal places)
            coordinates: responseForm.value.seadmeGps
              ? ((): { lat: number, lng: number } | undefined => {
                  const coords = responseForm.value.seadmeGps?.split(',') || []
                  const lat = parseFloat(coords[0]?.trim() || '')
                  const lng = parseFloat(coords[1]?.trim() || '')
                  if (!isNaN(lat) && !isNaN(lng)) {
                    return roundCoordinates(lat, lng) as { lat: number, lng: number }
                  }
                  return undefined
                })()
              : undefined
          }
        }
      ],
      respondentName: respondentName.value || undefined
    }

    // Create the response entity using feature-flagged approach
    const response = await createTaskResponse(requestData)

    console.log('Response created:', response)

    // Step 2: Upload files to the newly created response entity
    let fileReferences: string[] = []

    // Debug: Check response structure and extract correct ID
    console.log('F015: Full response structure:', JSON.stringify(response, null, 2))
    
    // Extract ID from response - use type guard for data property
    let responseId = response.id
    if (response.data && typeof response.data === 'object' && response.data !== null) {
      const dataObj = response.data as Record<string, unknown>
      responseId = responseId || (dataObj.id as string) || (dataObj._id as string)
    }
    console.log('F015: Extracted response ID:', responseId)

    // Debug: Check file upload component state
    console.log('F015: Checking file upload state:', {
      hasFileUploadRef: !!fileUploadRef.value,
      filesLength: fileUploadRef.value?.files?.length || 0,
      files: fileUploadRef.value?.files || 'undefined',
      responseId: responseId
    })

    if (fileUploadRef.value && fileUploadRef.value.files.length > 0 && responseId) {
      console.log('F015: Starting file upload process...')
      try {
        const uploadResults = await fileUploadRef.value.uploadFiles(responseId)
        fileReferences = uploadResults
          .filter((result) => result.success && result.entityId)
          .map((result) => result.entityId!)
        console.log('Files uploaded, entity IDs:', fileReferences)
      }
      catch (uploadError) {
        console.error('File upload failed:', uploadError)
        // Continue with form submission even if file upload fails
      }
    }

    // Emit response submitted event for optimistic updates
    emit('response-submitted', {
      responseData: requestData,
      apiResponse: response,
      locationReference: props.selectedLocation?.reference,
      uploadedFiles: fileReferences
    })

    // Reset form after successful submission
    responseForm.value.text = ''
    responseForm.value.seadmeGps = null
    responseForm.value.file = null
    uploadedFiles.value = []

    // Clear file upload component
    if (fileUploadRef.value) {
      fileUploadRef.value.clearFiles()
    }
  }
  catch (error) {
    console.error('Failed to submit response:', error)
  }
  finally {
    submitting.value = false
  }
}

// Expose methods and data for parent component
defineExpose({
  responseForm,
  setLocation: (coordinates: string | { lat: number, lng: number } | null): void => {
    if (typeof coordinates === 'string') {
      responseForm.value.seadmeGps = coordinates
    }
    else if (coordinates && typeof coordinates === 'object') {
      responseForm.value.seadmeGps = `${coordinates.lat}, ${coordinates.lng}`
    }
    else {
      responseForm.value.seadmeGps = null
    }
  },
  resetForm: (): void => {
    // Clear form fields
    responseForm.value.text = ''
    responseForm.value.seadmeGps = null
    responseForm.value.file = null

    // Clear uploaded files
    uploadedFiles.value = []

    // Reset file upload component if it exists
    if (fileUploadRef.value && typeof fileUploadRef.value.clearFiles === 'function') {
      fileUploadRef.value.clearFiles()
    }
  }
})
</script>
