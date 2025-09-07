<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="border-b bg-white shadow-sm">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold text-gray-900">
            {{ $t('appName') }}
          </h1>
          <div class="flex items-center space-x-4">
            <!-- Language Switcher -->
            <div class="flex items-center space-x-2">
              <button
                v-for="lang in availableLanguages"
                :key="lang.code"
                class="text-lg transition-transform hover:scale-110"
                :title="lang.name"
                @click="switchLanguage(lang.code)"
              >
                {{ lang.flag }}
              </button>
            </div>
            <button
              class="text-sm text-gray-600 hover:text-gray-900"
              @click="logout"
            >
              {{ $t('logout') }}
            </button>
          </div>
        </div>
        <p
          v-if="user"
          class="mt-1 text-sm text-gray-600"
        >
          {{ $t('hello') }}, {{ user.displayname || user.name || $t('student') }}!
        </p>
      </div>
    </header>

    <!-- Loading State -->
    <div
      v-if="pending"
      class="flex items-center justify-center py-8"
    >
      <div class="size-8 animate-spin rounded-full border-b-2 border-blue-600" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-4"
    >
      <div class="rounded-lg border border-red-200 bg-red-50 p-4">
        <p class="text-red-800">
          {{ $t('errors.loadingData', { error }) }}
        </p>
        <button
          class="mt-2 text-sm text-red-600 underline hover:text-red-800"
          @click="refreshTasks"
        >
          {{ $t('tasks.retry') }}
        </button>
      </div>
    </div>

    <!-- Task List -->
    <main
      v-else
      class="space-y-3 p-4"
    >
      <!-- No tasks message -->
      <div
        v-if="!tasks.length"
        class="py-8 text-center"
      >
        <div class="mb-2 text-lg text-gray-400">
          📝
        </div>
        <p class="text-gray-600">
          {{ $t('tasks.noTasks') }}
        </p>
      </div>

      <!-- Task Cards -->
      <div
        v-else
        class="space-y-3"
      >
        <div
          v-for="task in tasks"
          :key="task._id"
          class="cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-colors active:bg-gray-50"
          @click="openTask(task)"
        >
          <!-- Task Header -->
          <div class="mb-2 flex items-start justify-between">
            <h3 class="text-base font-medium leading-tight text-gray-900">
              {{ getTaskTitle(task) }}
            </h3>
            <div class="ml-2 shrink-0">
              <span
                :class="getStatusBadgeClass(task)"
                class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
              >
                {{ getStatusText(task) }}
              </span>
            </div>
          </div>

          <!-- Task Description -->
          <p
            v-if="getTaskDescription(task)"
            class="mb-3 line-clamp-2 text-sm text-gray-600"
          >
            {{ getTaskDescription(task) }}
          </p>

          <!-- Task Metadata -->
          <div class="flex items-center justify-between text-xs text-gray-500">
            <div class="flex items-center space-x-3">
              <span v-if="getResponseCount(task) > 0">
                📊 {{ getResponseCount(task) }} {{ $t('tasks.responses') }}
              </span>
              <span v-if="getTaskGroup(task)">
                👥 {{ getTaskGroup(task) }}
              </span>
            </div>
            <span class="text-blue-600">→</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'pupil-auth'
})

// Composables
const { user, logout: authLogout, token } = useEntuAuth()
const { t, locale } = useI18n()

// Language configuration
const allLanguages = [
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' }
]

// Computed property for available languages (excluding current)
const availableLanguages = computed(() => {
  return allLanguages.filter((lang) => lang.code !== locale.value)
})

// Language switching method
const switchLanguage = (langCode) => {
  locale.value = langCode
}

// Reactive data
const tasks = ref([])
const userGroups = ref([])
const pending = ref(true)
const error = ref(null)

// Methods
const logout = async () => {
  await authLogout()
  await navigateTo('/login')
}

const refreshTasks = async () => {
  pending.value = true
  error.value = null
  await loadTasks()
  pending.value = false
}

const loadTasks = async () => {
  try {
    pending.value = true
    error.value = null

    console.log(t('tasks.loadingTasks'), user.value)

    // Wait for user to be loaded if it's not available yet
    if (!user.value) {
      console.log(t('tasks.userNotLoaded'))
      // Give the auth composable a moment to load from localStorage
      await new Promise((resolve) => setTimeout(resolve, 100))

      if (!user.value) {
        console.error(t('tasks.userStillNotAvailable'))
        error.value = t('tasks.userDataNotAvailable')
        return
      }
    }

    // Try to load all tasks without group filtering
    console.log(t('tasks.foundTasks'))
    try {
      const allTasksResponse = await $fetch('/api/tasks/search', {
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        query: {
          '_type.string': 'ulesanne'
        }
      })

      if (allTasksResponse?.entities?.length > 0) {
        console.log(t('tasks.foundTasks'))
        tasks.value = allTasksResponse.entities
        return
      }
      else {
        console.log(t('tasks.noTasksInSystem'))
      }
    }
    catch (taskError) {
      console.error(t('tasks.errorLoadingTasks'), taskError)
    }

    // Get user's groups first
    await getUserGroups()

    console.log(t('userGroups.userGroupsFound'), userGroups.value)

    if (userGroups.value.length === 0) {
      console.log(t('userGroups.userHasNoGroups'))
      tasks.value = []
      return
    }

    // Fetch tasks for each group the user belongs to
    const allTasks = []

    for (const group of userGroups.value) {
      console.log(t('userGroups.fetchingTasksForGroup', { name: group.name, id: group._id }))
      try {
        // Query tasks assigned to this specific group via server API
        console.log(t('userGroups.loadingTasksViaServerApi', { id: group._id }))
        const taskResponse = await $fetch('/api/tasks/search', {
          headers: {
            Authorization: `Bearer ${token.value}`
          },
          query: {
            '_type.string': 'ulesanne',
            'grupp.reference': group._id
          }
        })

        console.log(t('userGroups.tasksFoundForGroup', { name: group.name }), taskResponse)

        if (taskResponse?.entities?.length > 0) {
          allTasks.push(...taskResponse.entities)
        }
      }
      catch (groupError) {
        console.error(t('userGroups.errorFetchingTasksForGroup', { name: group.name }), groupError)
      }
    }

    console.log(t('userGroups.allTasksFound'), allTasks)
    tasks.value = allTasks
  }
  catch (err) {
    console.error(t('tasks.errorLoadingTasks'), err)
    error.value = t('tasks.failed')
  }
  finally {
    pending.value = false
  }
}

const getUserGroups = async () => {
  try {
    console.log(t('userGroups.getUserGroups'), user.value)

    if (!user.value?.email && !user.value?._id) {
      console.warn(t('userGroups.noUserEmailOrId'), user.value)
      userGroups.value = []
      return
    }

    const userId = user.value._id

    if (!userId) {
      console.warn(t('userGroups.noUserId'))
      userGroups.value = []
      return
    }

    console.log(t('userGroups.usingUserId'), userId)

    // Get current user's full profile to access parent groups via server API
    const userProfileResponse = await $fetch('/api/user/profile', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
    const userProfile = userProfileResponse.entity

    console.log(t('userGroups.userProfileLoaded'), Object.keys(userProfile))

    // Filter parent relationships to find groups directly
    const groupParents = userProfile._parent?.filter((parent) => parent.entity_type === 'grupp') || []

    console.log(t('userGroups.groupParentsFound'), groupParents)

    if (groupParents.length === 0) {
      console.log(t('userGroups.noGroupMemberships'))
      userGroups.value = []
      return
    }

    // Extract group IDs and details from parent relationships
    const groups = groupParents.map((parent) => ({
      _id: parent.reference,
      id: parent.reference,
      name: parent.string || 'Nimetu grupp',
      role: 'member' // Could enhance this based on relationship type
    }))

    console.log(t('userGroups.userGroupsFound'), groups)
    userGroups.value = groups

    if (groups.length === 0) {
      console.warn(t('userGroups.userHasNoGroups'))
    }
    else {
      console.log(t('userGroups.userHasGroups'), groups.map((g) => g.name))
    }
  }
  catch (err) {
    console.warn(t('userGroups.errorFetchingUserGroups'), err)
    // If we can't determine groups, set empty array
    userGroups.value = []
  }
}

const getTaskTitle = (task) => {
  return task.properties?.title?.[0]?.value
    || task.properties?.name?.[0]?.value
    || task.properties?.pealkiri?.[0]?.value
    || t('taskDetail.noTitle')
}

const getTaskDescription = (task) => {
  return task.properties?.description?.[0]?.value
    || task.properties?.kirjeldus?.[0]?.value
    || task.properties?.sisu?.[0]?.value
    || null
}

const getResponseCount = (task) => {
  return task.properties?.vastuseid?.[0]?.value || 0
}

const getTaskGroup = (task) => {
  // Extract group name from grupp reference
  const gruppRef = task.properties?.grupp?.[0]
  if (gruppRef?.reference_id) {
    return gruppRef.reference_displayname || t('tasks.group')
  }
  return null
}

const getStatusText = (_task) => {
  // TODO: Implement status logic based on user's responses
  // For now, show as "Ootel" (Pending)
  return t('tasks.pending')
}

const getStatusBadgeClass = (_task) => {
  // TODO: Implement dynamic status colors
  // For now, use pending state styling
  return 'bg-yellow-100 text-yellow-800'
}

const openTask = (task) => {
  navigateTo(`/ulesanne/${task._id}`)
}

// Load tasks on mount
onMounted(async () => {
  await loadTasks()
  pending.value = false
})

// Set page title
useHead({
  title: computed(() => t('appName'))
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
