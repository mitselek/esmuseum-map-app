<template>
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
</template>

<script setup lang="ts">
// Simple file upload placeholder component
// Currently just displays allowed files message
// TODO: Implement actual file upload functionality
</script>
