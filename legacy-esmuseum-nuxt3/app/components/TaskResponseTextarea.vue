<template>
  <div class="mb-6">
    <label
      for="response-text"
      class="mb-2 block text-sm font-medium text-gray-700"
    >
      {{ $t('taskDetail.response') }}
    </label>
    <textarea
      id="response-text"
      :value="responseText"
      class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      rows="4"
      :placeholder="$t('taskDetail.responsePlaceholder')"
      :disabled="submitting"
      @input="$emit('update:responseText', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  responseText: string
  submitting: boolean
}

interface Emits {
  (e: 'update:responseText', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
