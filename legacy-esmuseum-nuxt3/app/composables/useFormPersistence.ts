/**
 * Form persistence composable for task responses
 * Handles auto-save, state restoration, and seamless form data management
 */

export interface FormData {
  textResponse?: string;
  files?: File[];
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  manualCoordinates?: {
    latitude?: string;
    longitude?: string;
  };
  timestamp?: number;
}

export const useFormPersistence = (taskId: string) => {
  const { saveUserResponse, loadUserResponse } = useTaskWorkspace();

  // Form state
  const formData = ref<FormData>({});
  const isDirty = ref(false);
  const autoSaveTimeout = ref<NodeJS.Timeout | null>(null);
  const isSaving = ref(false);
  const lastSaved = ref<Date | null>(null);

  // Load form data for current task
  const loadFormData = async () => {
    const savedData = await loadUserResponse(taskId);
    if (savedData) {
      formData.value = { ...savedData };
      isDirty.value = false;
      lastSaved.value = savedData.timestamp
        ? new Date(savedData.timestamp)
        : null;
    } else {
      formData.value = {};
      isDirty.value = false;
      lastSaved.value = null;
    }
  };

  // Save form data
  const saveFormData = async (immediate = false) => {
    if (!isDirty.value && !immediate) return;

    isSaving.value = true;

    try {
      const dataToSave: FormData = {
        ...formData.value,
        timestamp: Date.now(),
      };

      await saveUserResponse(taskId, dataToSave);
      isDirty.value = false;
      lastSaved.value = new Date();
    } catch (error) {
      console.error("Failed to save form data:", error);
    } finally {
      isSaving.value = false;
    }
  };

  // Auto-save with debouncing
  const scheduleAutoSave = () => {
    if (autoSaveTimeout.value) {
      clearTimeout(autoSaveTimeout.value);
    }

    autoSaveTimeout.value = setTimeout(() => {
      saveFormData();
    }, 2000); // Auto-save after 2 seconds of inactivity
  };

  // Update form field and trigger auto-save
  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    formData.value[field] = value;
    isDirty.value = true;
    scheduleAutoSave();
  };

  // Clear form data
  const clearFormData = () => {
    formData.value = {};
    isDirty.value = false;
    if (autoSaveTimeout.value) {
      clearTimeout(autoSaveTimeout.value);
    }
  };

  // Get auto-save status message
  const autoSaveStatus = computed(() => {
    if (isSaving.value) {
      return "Saving...";
    }
    if (isDirty.value) {
      return "Unsaved changes";
    }
    if (lastSaved.value) {
      const now = new Date();
      const diffMs = now.getTime() - lastSaved.value.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 1) {
        return "Saved just now";
      } else if (diffMinutes === 1) {
        return "Saved 1 minute ago";
      } else {
        return `Saved ${diffMinutes} minutes ago`;
      }
    }
    return "";
  });

  // Cleanup on unmount
  onUnmounted(() => {
    if (autoSaveTimeout.value) {
      clearTimeout(autoSaveTimeout.value);
    }
    // Save immediately before unmounting if there are unsaved changes
    if (isDirty.value) {
      saveFormData(true);
    }
  });

  // Watch for task changes
  watch(
    () => taskId,
    async (newTaskId) => {
      if (newTaskId) {
        await loadFormData();
      }
    },
    { immediate: true }
  );

  return {
    // State
    formData: readonly(formData),
    isDirty: readonly(isDirty),
    isSaving: readonly(isSaving),
    lastSaved: readonly(lastSaved),
    autoSaveStatus,

    // Actions
    updateField,
    saveFormData,
    loadFormData,
    clearFormData,
  };
};
