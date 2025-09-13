<template>
  <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
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
</template>

<script setup lang="ts">
// Pure presentation component for no permission state
// No props or logic needed
</script>
