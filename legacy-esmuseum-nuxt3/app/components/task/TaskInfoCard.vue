<template>
  <div class="mb-4 rounded-lg border bg-white p-4 shadow-sm">
    <h2 class="mb-2 text-xl font-semibold text-gray-900">
      {{ title }}
    </h2>

    <div
      v-if="description"
      class="mb-4 text-gray-700"
    >
      <p class="whitespace-pre-wrap">
        {{ description }}
      </p>
    </div>

    <!-- Task Metadata -->
    <div class="space-y-2 text-sm text-gray-600">
      <div
        v-if="group"
        class="flex items-center"
      >
        <span class="mr-2">👥</span>
        <span>{{ $t('tasks.group') }}: {{ group }}</span>
      </div>
      <div class="flex items-center">
        <span class="mr-2">📊</span>
        <span v-if="responseStats">
          {{ $t('taskDetail.responsesProgress', {
            actual: responseStats.actual,
            expected: responseStats.expected,
          }) }}
        </span>
        <span v-else>
          {{ $t('taskDetail.totalResponses', { count: responseCount }) }}
        </span>
      </div>
      <div
        v-if="hasUserResponse"
        class="flex items-center"
      >
        <span class="mr-2">✅</span>
        <span class="text-green-600">{{ $t('taskDetail.responseAlreadySubmitted') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  group: {
    type: String,
    default: null
  },
  responseCount: {
    type: Number,
    default: 0
  },
  responseStats: {
    type: Object,
    default: null
  },
  hasUserResponse: {
    type: Boolean,
    default: false
  }
})
</script>
