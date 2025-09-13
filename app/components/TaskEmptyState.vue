<template>
  <div class="flex flex-1 items-center justify-center p-8">
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
</template>

<script setup lang="ts">
// No props or logic needed - this is a pure presentation component
</script>
