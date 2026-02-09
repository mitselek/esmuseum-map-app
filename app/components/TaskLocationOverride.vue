<template>
  <div class="border-t pt-4">
    <div class="mb-3 flex items-center justify-between">
      <h4 class="text-sm font-medium text-gray-700">
        ✏️ {{ $t('taskDetail.manualLocationOverride') }}
      </h4>
      <button
        v-if="!showManualCoordinates"
        type="button"
        class="text-sm text-esm-blue hover:text-esm-dark"
        @click="startManualEntry"
      >
        {{ $t('taskDetail.enterManually') }}
      </button>
      <button
        v-else
        type="button"
        class="text-sm text-gray-600 hover:text-gray-800"
        @click="cancelManualEntry"
      >
        {{ $t('taskDetail.cancel') }}
      </button>
    </div>

    <div
      v-if="showManualCoordinates"
      class="space-y-3"
    >
      <div>
        <label class="mb-2 block text-xs text-gray-600">
          {{ $t('taskDetail.coordinatesFormat') }}
        </label>
        <input
          v-model="localCoordinates"
          type="text"
          :placeholder="$t('taskDetail.coordinatesExample')"
          class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-esm-blue focus:outline-none focus:ring-1 focus:ring-esm-blue"
          @keyup.enter="applyManualLocation"
        >
        <p class="mt-1 text-xs text-gray-500">
          {{ $t('taskDetail.manualLocationHelp') }}
        </p>
      </div>

      <div class="flex space-x-2">
        <button
          type="button"
          :disabled="!isValidCoordinates(localCoordinates)"
          class="rounded bg-esm-blue px-3 py-2 text-sm text-white hover:bg-esm-dark disabled:cursor-not-allowed disabled:opacity-50"
          @click="applyManualLocation"
        >
          {{ $t('taskDetail.applyLocation') }}
        </button>
        <button
          type="button"
          class="rounded bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
          @click="clearManualLocation"
        >
          {{ $t('taskDetail.clearOverride') }}
        </button>
      </div>
    </div>

    <div
      v-if="hasManualOverride && !showManualCoordinates"
      class="rounded-lg border border-amber-200 bg-amber-50 p-3"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-amber-800">
            ✏️ {{ $t('taskDetail.manualLocationActive') }}
          </p>
          <p class="mt-1 text-xs text-amber-600">
            {{ manualCoordinates }}
          </p>
        </div>
        <button
          type="button"
          class="text-sm text-amber-600 underline hover:text-amber-800"
          @click="clearManualLocation"
        >
          {{ $t('taskDetail.remove') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  manualCoordinates?: string
}

const props = withDefaults(defineProps<Props>(), {
  manualCoordinates: ''
})

// Emits
interface Emits {
  (e: 'location-change', coordinates: string | null): void
}

const emit = defineEmits<Emits>()

// Local state
const showManualCoordinates = ref<boolean>(false)
const localCoordinates = ref<string>('')
const hasManualOverride = computed<boolean>(() => !!props.manualCoordinates)

// Validation
const isValidCoordinates = (coordinates: string): boolean => {
  if (!coordinates) return false
  const parts = coordinates.split(',').map((s) => s.trim())
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false
  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

// Methods
const startManualEntry = (): void => {
  showManualCoordinates.value = true
  localCoordinates.value = props.manualCoordinates
}

const cancelManualEntry = (): void => {
  showManualCoordinates.value = false
  localCoordinates.value = ''
}

const applyManualLocation = (): void => {
  if (!isValidCoordinates(localCoordinates.value)) return

  emit('location-change', localCoordinates.value)
  showManualCoordinates.value = false
}

const clearManualLocation = (): void => {
  emit('location-change', null)
  showManualCoordinates.value = false
  localCoordinates.value = ''
}
</script>
