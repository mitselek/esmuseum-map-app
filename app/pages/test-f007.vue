<template>
  <div>
    <TaskWorkspace />
  </div>
</template>

<script setup>
// Test page for F007 TaskWorkspace
definePageMeta({
  middleware: 'auth'
})

const { t } = useI18n()
const { selectedTask } = useTaskWorkspace()

useHead({
  title: computed(() =>
    selectedTask.value
      ? `${selectedTask.value.name || 'Task'} - ${t('appName')}`
      : `F007 ${t('tasks.title')}`
  )
})
</script>
