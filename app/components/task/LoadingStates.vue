<template>
  <!-- Loading State -->
  <div
    v-if="loading"
    class="flex items-center justify-center py-8"
  >
    <div class="size-8 animate-spin rounded-full border-b-2 border-esm-blue" />
    <span
      v-if="loadingText"
      class="ml-3 text-gray-600"
    >
      {{ loadingText }}
    </span>
  </div>

  <!-- Error State -->
  <div
    v-else-if="error"
    class="p-4"
  >
    <div class="rounded-lg border border-red-200 bg-red-50 p-4">
      <div class="flex">
        <div class="shrink-0">
          <span class="text-red-400">⚠️</span>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            {{ errorTitle || $t('common.error') }}
          </h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ error }}</p>
          </div>
          <div
            v-if="showRetry"
            class="mt-4"
          >
            <button
              type="button"
              class="rounded bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200"
              @click="$emit('retry')"
            >
              {{ retryText || $t('common.retry') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div
    v-else-if="showEmpty"
    class="py-8 text-center"
  >
    <div class="text-4xl text-gray-400">
      {{ emptyIcon || '📋' }}
    </div>
    <h3 class="mt-2 text-sm font-medium text-gray-900">
      {{ emptyTitle || $t('common.noData') }}
    </h3>
    <p class="mt-1 text-sm text-gray-500">
      {{ emptyMessage }}
    </p>
    <div
      v-if="showEmptyAction"
      class="mt-6"
    >
      <button
        type="button"
        class="rounded bg-esm-blue px-4 py-2 text-sm font-medium text-white hover:bg-esm-dark"
        @click="$emit('empty-action')"
      >
        {{ emptyActionText || $t('common.reload') }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: null
  },
  error: {
    type: String,
    default: null
  },
  errorTitle: {
    type: String,
    default: null
  },
  showRetry: {
    type: Boolean,
    default: true
  },
  retryText: {
    type: String,
    default: null
  },
  showEmpty: {
    type: Boolean,
    default: false
  },
  emptyIcon: {
    type: String,
    default: null
  },
  emptyTitle: {
    type: String,
    default: null
  },
  emptyMessage: {
    type: String,
    default: null
  },
  showEmptyAction: {
    type: Boolean,
    default: false
  },
  emptyActionText: {
    type: String,
    default: null
  }
})

defineEmits(['retry', 'empty-action'])
</script>
