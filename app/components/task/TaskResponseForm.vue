<template>
  <div class="rounded-lg border bg-white p-4 shadow-sm">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900">
        {{ hasUserResponse ? $t('taskDetail.yourResponse') : $t('taskDetail.submitResponse') }}
      </h3>

      <!-- Auto-save Status -->
      <div
        v-if="autoSaveStatus"
        class="text-sm italic text-gray-500"
      >
        {{ autoSaveStatus }}
      </div>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <!-- File Upload -->
      <FileUpload
        :model-value="persistedFormData.files || []"
        :disabled="submitting"
        @update:model-value="updateFiles"
      />

      <!-- Location Selection -->
      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700">
          {{ $t('taskDetail.location') }}
        </label>

        <!-- Location Picker Component -->
        <slot
          name="location-picker"
          :selected="selectedLocation"
          :on-select="onLocationSelect"
          :on-manual="() => showManualCoordinates = true"
          :on-request-location="onRequestLocation"
        />

        <!-- Manual Coordinate Entry -->
        <ManualCoordinatesInput
          :latitude="persistedFormData.manualCoordinates?.latitude || ''"
          :longitude="persistedFormData.manualCoordinates?.longitude || ''"
          :show="showManualCoordinates"
          :disabled="submitting"
          @update:latitude="updateLatitude"
          @update:longitude="updateLongitude"
          @update:show="showManualCoordinates = $event"
          @get-gps="handleGetGPS"
        />

        <!-- Current Selection Display -->
        <div
          v-if="currentCoordinates && !showManualCoordinates"
          class="mt-2 rounded-lg bg-green-50 p-3"
        >
          <p class="text-sm text-green-800">
            {{ $t('taskDetail.locationSet', { coordinates: currentCoordinates }) }}
          </p>
        </div>
      </div>

      <!-- Text Response -->
      <ResponseTextarea
        :model-value="persistedFormData.textResponse || ''"
        :disabled="submitting"
        @update:model-value="updateTextResponse"
      />

      <!-- Action Buttons -->
      <div class="flex flex-col space-y-3">
        <div class="flex gap-3">
          <button
            type="submit"
            class="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canSubmit || submitting"
          >
            {{ submitting ? $t('taskDetail.submitting') : (hasUserResponse ? $t('taskDetail.updateResponse') : $t('taskDetail.submitResponseBtn')) }}
          </button>

          <!-- Manual Save Button -->
          <button
            type="button"
            class="rounded-lg border border-blue-300 px-4 py-3 text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSaving || !isDirty"
            @click="handleManualSave"
          >
            {{ isSaving ? $t('taskDetail.saving') : $t('taskDetail.save') }}
          </button>

          <!-- Clear Button -->
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-3 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="submitting"
            @click="handleClear"
          >
            {{ $t('taskDetail.clear') }}
          </button>
        </div>

        <div
          v-if="hasUserResponse"
          class="text-center"
        >
          <p class="text-xs text-gray-500">
            {{ $t('taskDetail.canUpdateUntilDeadline') }}
          </p>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
// Import child components
import FileUpload from '~/components/task/FileUpload.vue'
import ResponseTextarea from '~/components/task/ResponseTextarea.vue'
import ManualCoordinatesInput from '~/components/task/ManualCoordinatesInput.vue'

const { t } = useI18n()

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  userResponse: {
    type: Object,
    default: null
  },
  submitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'location-request'])

// Form persistence integration
const {
  formData: persistedFormData,
  isDirty,
  isSaving,
  autoSaveStatus,
  updateField,
  saveFormData,
  clearFormData
} = useFormPersistence(props.task._id)

// Local state for UI
const selectedLocation = ref(null)
const showManualCoordinates = ref(false)

// Computed properties
const hasUserResponse = computed(() => !!props.userResponse)

const canSubmit = computed(() => {
  const textResponse = persistedFormData.value.textResponse?.trim()
  const hasFiles = persistedFormData.value.files?.length > 0
  return textResponse?.length > 0 || hasFiles
})

const currentCoordinates = computed(() => {
  const coords = persistedFormData.value.coordinates
  if (coords?.latitude && coords?.longitude) {
    return `${coords.latitude}, ${coords.longitude}`
  }

  const manualCoords = persistedFormData.value.manualCoordinates
  if (manualCoords?.latitude && manualCoords?.longitude) {
    return `${manualCoords.latitude}, ${manualCoords.longitude}`
  }

  return null
})

// Initialize form data from user response if exists
watch(() => props.userResponse, (response) => {
  if (response) {
    const text = getUserResponseText(response)
    const location = getUserResponseLocation(response)

    if (text) {
      updateField('textResponse', text)
    }

    if (location) {
      // Parse location coordinates if needed
      const [lat, lng] = location.split(',').map((s) => s.trim())
      if (lat && lng) {
        updateField('coordinates', { latitude: parseFloat(lat), longitude: parseFloat(lng) })
      }
    }
  }
}, { immediate: true })

// Form field update methods
const updateTextResponse = (value) => {
  updateField('textResponse', value)
}

const updateFiles = (files) => {
  updateField('files', files)
}

const updateLatitude = (value) => {
  const current = persistedFormData.value.manualCoordinates || {}
  updateField('manualCoordinates', { ...current, latitude: value })
}

const updateLongitude = (value) => {
  const current = persistedFormData.value.manualCoordinates || {}
  updateField('manualCoordinates', { ...current, longitude: value })
}

// Event handlers
const handleSubmit = () => {
  const formData = {
    text: persistedFormData.value.textResponse || '',
    files: persistedFormData.value.files || [],
    coordinates: persistedFormData.value.coordinates || persistedFormData.value.manualCoordinates || null
  }

  emit('submit', formData)
}

const handleManualSave = async () => {
  await saveFormData(true)
}

const handleClear = () => {
  clearFormData()
  selectedLocation.value = null
  showManualCoordinates.value = false
}

const onLocationSelect = (location) => {
  selectedLocation.value = location
  if (location) {
    // Extract coordinates from location object
    const coords = getLocationCoordinates(location)
    if (coords) {
      updateField('coordinates', coords)
      showManualCoordinates.value = false
    }
  }
  else {
    updateField('coordinates', null)
  }
}

const onRequestLocation = async () => {
  emit('location-request')
}

const handleGetGPS = async () => {
  try {
    const position = await getUserPosition()
    const coords = {
      latitude: position.lat,
      longitude: position.lng
    }

    updateField('coordinates', coords)
    selectedLocation.value = null
    showManualCoordinates.value = false
  }
  catch (err) {
    console.error('Geolocation error:', err)
    alert(t('taskDetail.geolocationError', { error: err.message }))
  }
}

// Helper functions
const getUserResponseText = (response) => {
  return response?.properties?.text?.[0]?.value || ''
}

const getUserResponseLocation = (response) => {
  return response?.properties?.geopunkt?.[0]?.value || ''
}

const getLocationCoordinates = (location) => {
  // Extract coordinates from location object - implement based on your location data structure
  if (location?.coordinates) {
    return {
      latitude: location.coordinates.lat || location.coordinates.latitude,
      longitude: location.coordinates.lng || location.coordinates.longitude
    }
  }
  return null
}

const getUserPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      }
    )
  })
}

// Expose form data for parent component
defineExpose({
  formData: persistedFormData,
  resetForm: handleClear,
  saveForm: handleManualSave
})
</script>
