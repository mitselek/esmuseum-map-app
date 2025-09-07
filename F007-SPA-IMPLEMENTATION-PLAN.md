# F007 SPA Implementation Plan

## 🎯 Goal

Replace the current multi-page task list with a unified SPA that preserves the current header functionality (language switcher + auth) while providing the TaskWorkspace experience.

## 📋 Implementation Steps

### Phase 1: Create New SPA Root Page

1. **Backup Current Page**: Keep current `index.vue` as `index-old.vue`
2. **Create New SPA Page**: Build new `index.vue` combining:
   - Current header (language switcher + logout)
   - TaskWorkspace component
   - Authentication middleware
   - User loading states

### Phase 2: Header Integration

Extract header into reusable component:

```vue
app/components/AppHeader.vue ├── Language switcher (🇪🇪 🇺🇸 🇺🇦) ├── User greeting
├── Logout functionality └── App title
```

### Phase 3: Layout Structure

New `index.vue` structure:

```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Keep existing header -->
    <AppHeader />

    <!-- Loading state for initial data -->
    <div v-if="pending">...</div>

    <!-- Error state -->
    <div v-else-if="error">...</div>

    <!-- Main SPA -->
    <div v-else class="h-[calc(100vh-theme(spacing.16))]">
      <TaskWorkspace />
    </div>
  </div>
</template>
```

### Phase 4: State Integration

Connect current data loading logic with TaskWorkspace:

- Move `loadTasks()` logic to `useTaskWorkspace`
- Integrate user group loading
- Preserve error handling and retry functionality

### Phase 5: URL Management

Update TaskWorkspace to handle:

- Root URL `/` shows first available task
- Task selection via `/?task=taskId`
- Browser back/forward navigation
- Bookmarkable task URLs

## 🔧 Technical Details

### AppHeader Component

```vue
// app/components/AppHeader.vue
<template>
  <header class="border-b bg-white shadow-sm">
    <div class="px-4 py-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-900">
          {{ $t("appName") }}
        </h1>
        <div class="flex items-center space-x-4">
          <!-- Language Switcher -->
          <LanguageSwitcher />

          <!-- Logout Button -->
          <LogoutButton />
        </div>
      </div>

      <!-- User Greeting -->
      <UserGreeting v-if="user" :user="user" />
    </div>
  </header>
</template>
```

### New Index Page

```vue
// app/pages/index.vue
<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <!-- Initial Loading -->
    <LoadingState v-if="initialLoading" />

    <!-- Error State -->
    <ErrorState v-else-if="error" :error="error" @retry="retryLoad" />

    <!-- Main SPA -->
    <div v-else class="h-[calc(100vh-theme(spacing.16))]">
      <TaskWorkspace />
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});

const { user } = useEntuAuth();
const { tasks, loading, error, loadTasks, selectFirstTask } =
  useTaskWorkspace();

// Initial loading state
const initialLoading = ref(true);

// Load data on mount
onMounted(async () => {
  try {
    await loadTasks();
    selectFirstTask(); // Auto-select first task for better UX
  } catch (err) {
    console.error("Failed to load initial data:", err);
  } finally {
    initialLoading.value = false;
  }
});

// Retry functionality
const retryLoad = async () => {
  initialLoading.value = true;
  await loadTasks();
  initialLoading.value = false;
};

// Page title
useHead({
  title: computed(() => t("appName")),
});
</script>
```

### Enhanced useTaskWorkspace

Update composable to handle all data loading:

```typescript
// app/composables/useTaskWorkspace.ts
export const useTaskWorkspace = () => {
  // ... existing state ...

  // Move loadTasks logic from current index.vue
  const loadTasks = async () => {
    // Current task loading logic
    // Group membership logic
    // Error handling
  };

  const selectFirstTask = () => {
    if (tasks.value.length > 0 && !selectedTask.value) {
      selectTask(tasks.value[0]._id);
    }
  };

  return {
    // ... existing exports ...
    loadTasks,
    selectFirstTask,
  };
};
```

## 🎯 Benefits

1. **Unified Experience**: Single page with no navigation delays
2. **Preserved UX**: Keep familiar header and auth flow
3. **Enhanced Productivity**: Instant task switching with form persistence
4. **Mobile Optimized**: Responsive sidebar/overlay design
5. **Bookmarkable**: Direct links to specific tasks

## 🚀 Implementation Order

1. Create `AppHeader` component (extract from current index.vue)
2. Update `useTaskWorkspace` with data loading logic
3. Create new `index.vue` with SPA structure
4. Test integration and fix any issues
5. Remove old page components if no longer needed

## 📱 Mobile Considerations

- Header height: 64px (4rem)
- TaskWorkspace height: `calc(100vh - 4rem)`
- Touch-friendly sidebar overlay
- Gesture support for task switching

## 🔄 Migration Strategy

1. **Phase 1**: Build components alongside existing page
2. **Phase 2**: Test SPA functionality on `/test-f007`
3. **Phase 3**: Replace root page when ready
4. **Phase 4**: Remove old components and routes

This plan preserves all current functionality while delivering the complete F007 SPA experience!
