<template>
  <div class="mb-4">
    <label
      :for="inputId"
      class="mb-2 block text-sm font-medium text-gray-700"
    >
      {{ $t('taskDetail.response') }}
    </label>
    <textarea
      :id="inputId"
      :value="modelValue"
      class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      :rows="rows"
      :placeholder="$t('taskDetail.responsePlaceholder')"
      :disabled="disabled"
      @input="handleInput"
    />

    <!-- Character count -->
    <div
      v-if="showCharCount && maxLength"
      class="mt-1 text-xs text-gray-500"
    >
      {{ characterCount }}/{{ maxLength }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  inputId: {
    type: String,
    default: 'response-text'
  },
  rows: {
    type: Number,
    default: 4
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxLength: {
    type: Number,
    default: null
  },
  showCharCount: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const characterCount = computed(() => props.modelValue?.length || 0)

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>
