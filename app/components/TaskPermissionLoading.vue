<template>
  <div class="flex items-center justify-center py-8">
    <div class="text-center">
      <div class="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-gray-300 border-t-esm-blue" />
      <p class="text-sm text-gray-500">
        {{ $t('taskDetail.checkingPermissions') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Pure presentation component for loading/checking state
// No props or logic needed
</script>
