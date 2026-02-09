<template>
  <div
    v-if="show"
    class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
  >
    <div class="mb-3 flex items-center justify-between">
      <h4 class="text-sm font-medium text-gray-700">
        {{ $t('taskDetail.manualCoordinates') }}
      </h4>
      <button
        type="button"
        class="text-sm text-gray-600 hover:text-gray-800"
        @click="$emit('close')"
      >
        {{ $t('taskDetail.close') }}
      </button>
    </div>

    <div class="space-y-3">
      <div>
        <label class="block text-xs text-gray-600">
          {{ $t('taskDetail.coordinatesFormat') }}
        </label>
        <input
          :value="modelValue"
          type="text"
          :placeholder="$t('taskDetail.coordinatesExample')"
          class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-esm-blue focus:outline-none focus:ring-1 focus:ring-esm-blue"
          :disabled="disabled"
          @input="handleInput"
        >
      </div>

      <div class="flex space-x-2">
        <button
          type="button"
          class="text-sm text-esm-blue hover:text-esm-dark disabled:opacity-50"
          :disabled="gettingLocation || disabled"
          @click="$emit('get-current-location')"
        >
          {{ gettingLocation ? $t('taskDetail.searchingLocation') : $t('taskDetail.useCurrentLocation') }}
        </button>

        <button
          type="button"
          class="text-sm text-green-600 hover:text-green-800 disabled:opacity-50"
          :disabled="!modelValue || disabled"
          @click="$emit('use-coordinates')"
        >
          {{ $t('taskDetail.useTheseCoordinates') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  gettingLocation: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'get-current-location', 'use-coordinates'])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>
