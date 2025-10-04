# F023.1 - Optimistic Updates After Response Submission

**Status:** In Progress  
**Branch:** `feature/F023.1-optimistic-updates`  
**Parent:** F023 UX Improvements  
**Priority:** Medium  
**Complexity:** High

## Overview

Replace the current page reload (`window.location.reload()`) after response submission with a smooth, optimistic update flow that provides instant feedback and maintains app state.

## Current Behavior (Problem)

**File:** `app/components/TaskDetailPanel.vue` (lines 232-236)

```javascript
const handleResponseSubmitted = (_responseData: unknown): void => {
  // Reload the page to ensure fresh data
  setTimeout(() => {
    window.location.reload();
  }, 500); // Small delay to let the submission complete
};
```

**Issues:**

- ❌ Page flash/reload disrupts user experience
- ❌ Loses scroll position and UI state
- ❌ Shows loading spinner during reload
- ❌ No immediate feedback during submission
- ❌ Can't show success/error states gracefully

## Target Behavior (Solution)

### User Flow

1. User fills form and clicks submit
2. **Show modal:** "Submitting response..."
3. **Optimistic update:** Increment progress (17/27 → 18/27)
4. **Reset form:** Clear text, remove file, deselect location
5. **Refetch task:** Get updated task data from API
6. **Update UI:** Show new progress, mark location as visited
7. **Close modal:** Show success state
8. No page reload, maintains scroll position

### Error Handling

- Show error modal if submission fails
- Revert optimistic updates
- Keep form data for retry

## Implementation Plan

### Phase 1: Create Submission Modal Component

**File:** `app/components/TaskSubmissionModal.vue` (new)

```vue
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  >
    <div class="rounded-lg bg-white p-6 shadow-xl">
      <!-- Submitting state -->
      <div v-if="status === 'submitting'">
        <div class="flex items-center gap-3">
          <div
            class="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
          ></div>
          <p class="text-lg">{{ $t("taskDetail.submitting") }}</p>
        </div>
      </div>

      <!-- Success state -->
      <div v-else-if="status === 'success'">
        <div class="flex items-center gap-3 text-green-600">
          <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-lg">{{ $t("taskDetail.submitSuccess") }}</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="status === 'error'">
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-3 text-red-600">
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <p class="text-lg">{{ $t("taskDetail.submitError") }}</p>
          </div>
          <p class="text-sm text-gray-600">{{ errorMessage }}</p>
          <button
            @click="$emit('retry')"
            class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {{ $t("taskDetail.retry") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
  status: "submitting" | "success" | "error";
  errorMessage?: string;
}

defineProps<Props>();

defineEmits<{
  retry: [];
  close: [];
}>();
</script>
```

### Phase 2: Add i18n Translations

**File:** `.config/i18n.config.ts`

```typescript
// Add to et, en, uk translations:
taskDetail: {
  submitting: 'Saadan vastust...',  // 'Submitting response...' / 'Надсилання відповіді...'
  submitSuccess: 'Vastus saadetud!',  // 'Response submitted!' / 'Відповідь надіслано!'
  submitError: 'Viga saatmisel',  // 'Submission error' / 'Помилка надсилання'
  retry: 'Proovi uuesti',  // 'Retry' / 'Спробувати знову'
}
```

### Phase 3: Create Optimistic Update Logic

**File:** `app/composables/useOptimisticTaskUpdate.ts` (new)

```typescript
export const useOptimisticTaskUpdate = () => {
  const { selectedTask } = useTaskWorkspace();
  const { loadCompletedTasks } = useCompletedTasks();

  /**
   * Optimistically increment response count
   */
  const incrementResponseCount = () => {
    if (!selectedTask.value) return;

    // Update vastuseid count
    if (selectedTask.value.vastuseid?.[0]) {
      selectedTask.value.vastuseid[0].number += 1;
    }
  };

  /**
   * Revert optimistic update
   */
  const revertResponseCount = () => {
    if (!selectedTask.value) return;

    if (selectedTask.value.vastuseid?.[0]) {
      selectedTask.value.vastuseid[0].number -= 1;
    }
  };

  /**
   * Refetch task data from API
   */
  const refetchTask = async () => {
    if (!selectedTask.value?._id) return;

    const { getEntity } = useEntuApi();
    const taskData = await getEntity(selectedTask.value._id);

    // Update selected task with fresh data
    if (taskData?.entity) {
      Object.assign(selectedTask.value, taskData.entity);
    }

    // Reload completed tasks to update visited locations
    await loadCompletedTasks();
  };

  return {
    incrementResponseCount,
    revertResponseCount,
    refetchTask,
  };
};
```

### Phase 4: Update TaskDetailPanel

**File:** `app/components/TaskDetailPanel.vue`

**Changes:**

1. Import modal and composable
2. Add modal state (isOpen, status, errorMessage)
3. Replace `handleResponseSubmitted` implementation
4. Add modal component to template

```typescript
// Add imports
import TaskSubmissionModal from "./TaskSubmissionModal.vue";
import { useOptimisticTaskUpdate } from "../composables/useOptimisticTaskUpdate";

// Add modal state
const showSubmissionModal = ref(false);
const submissionStatus = ref<"submitting" | "success" | "error">("submitting");
const submissionError = ref<string>("");

// Add optimistic update composable
const { incrementResponseCount, revertResponseCount, refetchTask } =
  useOptimisticTaskUpdate();

// Replace handleResponseSubmitted
const handleResponseSubmitted = async (
  responseData: unknown
): Promise<void> => {
  try {
    // Show submitting modal
    showSubmissionModal.value = true;
    submissionStatus.value = "submitting";

    // Optimistic update: increment count immediately
    incrementResponseCount();

    // Reset form (emit event to TaskResponseForm)
    if (responseFormRef.value?.resetForm) {
      responseFormRef.value.resetForm();
    }

    // Wait a moment for submission to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Refetch task data to get actual state
    await refetchTask();

    // Show success
    submissionStatus.value = "success";

    // Auto-close after 1.5 seconds
    setTimeout(() => {
      showSubmissionModal.value = false;
    }, 1500);
  } catch (error) {
    console.error("Response submission failed:", error);

    // Revert optimistic update
    revertResponseCount();

    // Show error
    submissionStatus.value = "error";
    submissionError.value =
      error instanceof Error ? error.message : "Unknown error";
  }
};

// Handle retry
const handleRetry = () => {
  showSubmissionModal.value = false;
  // Form keeps data for retry
};
```

**Template:**

```vue
<!-- Add modal component -->
<TaskSubmissionModal
  :is-open="showSubmissionModal"
  :status="submissionStatus"
  :error-message="submissionError"
  @retry="handleRetry"
  @close="showSubmissionModal = false"
/>
```

### Phase 5: Add Reset Method to TaskResponseForm

**File:** `app/components/TaskResponseForm.vue`

```typescript
// Expose reset method
defineExpose({
  setLocation,
  resetForm: () => {
    responseForm.text = "";
    responseForm.geopunkt = null;
    responseForm.file = null;
    selectedLocation.value = null;
    if (fileUploadRef.value) {
      fileUploadRef.value.clearFiles();
    }
  },
});
```

## Testing Checklist

### Happy Path

- [ ] Click submit → modal shows "Submitting..."
- [ ] Progress increments immediately (17/27 → 18/27)
- [ ] Form clears (text, file, location)
- [ ] Modal changes to "Success!" with checkmark
- [ ] Modal auto-closes after 1.5s
- [ ] No page reload
- [ ] Scroll position maintained
- [ ] Visited locations updated (checkmark on location)

### Error Path

- [ ] Network error → shows error modal
- [ ] Error modal shows error message
- [ ] Click "Retry" → modal closes, form data preserved
- [ ] Optimistic update reverted
- [ ] Can resubmit successfully

### Edge Cases

- [ ] Submit while offline → graceful error
- [ ] Submit duplicate response → API error handled
- [ ] Rapid submit clicks → prevented by modal state
- [ ] Navigate away during submission → cancels properly

## Performance Considerations

- ✅ No full page reload (faster UX)
- ✅ Optimistic updates provide instant feedback
- ✅ Single API call for refetch (efficient)
- ✅ Modal auto-closes (doesn't require user action)

## Security Considerations

- ✅ Optimistic update is cosmetic only (server is source of truth)
- ✅ Refetch validates actual state from server
- ✅ Error handling prevents inconsistent state

## Rollback Plan

If issues arise:

1. Revert to `window.location.reload()`
2. Keep modal for "Submitting..." feedback only
3. Reload after modal closes

## Success Metrics

- **Before:** Page reload takes ~500ms, disrupts UX
- **After:** Instant feedback, smooth updates, no disruption
- **User satisfaction:** Improved perceived performance

## Dependencies

- None (uses existing Entu API and composables)

## Timeline

- **Phase 1-2:** 1 hour (modal + i18n)
- **Phase 3:** 1 hour (optimistic update logic)
- **Phase 4:** 1 hour (integrate into TaskDetailPanel)
- **Phase 5:** 30 min (form reset method)
- **Testing:** 1 hour
- **Total:** ~4.5 hours

## Notes

- Modal design should match app's existing design system
- Consider adding loading state to form submit button as additional feedback
- Auto-close timing (1.5s) can be adjusted based on user feedback
- Error messages should be translated and user-friendly
