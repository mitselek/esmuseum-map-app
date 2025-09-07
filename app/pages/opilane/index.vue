<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="border-b bg-white shadow-sm">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold text-gray-900">
            Minu ülesanded
          </h1>
          <button
            class="text-sm text-gray-600 hover:text-gray-900"
            @click="logout"
          >
            Logi välja
          </button>
        </div>
        <p
          v-if="user"
          class="mt-1 text-sm text-gray-600"
        >
          Tere, {{ user.displayname || user.name || 'õpilane' }}!
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
          Viga andmete laadimisel: {{ error }}
        </p>
        <button
          class="mt-2 text-sm text-red-600 underline hover:text-red-800"
          @click="refreshTasks"
        >
          Proovi uuesti
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
          Hetkel pole ühtegi ülesannet määratud
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
                📊 {{ getResponseCount(task) }} vastust
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

    console.log('Loading tasks - user:', user.value)

    // Wait for user to be loaded if it's not available yet
    if (!user.value) {
      console.log('User not loaded yet, waiting...')
      // Give the auth composable a moment to load from localStorage
      await new Promise((resolve) => setTimeout(resolve, 100))

      if (!user.value) {
        console.error('User still not available after waiting')
        error.value = 'Kasutaja andmed ei ole saadaval'
        return
      }
    }

    // Get user's groups first
    await getUserGroups()

    console.log('User groups for task filtering:', userGroups.value)

    if (userGroups.value.length === 0) {
      console.log('No user groups, setting empty tasks')
      tasks.value = []
      return
    }

    // Fetch tasks for each group the user belongs to
    const allTasks = []

    for (const group of userGroups.value) {
      console.log('Fetching tasks for group:', group.name, 'ID:', group._id)
      try {
        // Query tasks assigned to this specific group via server API
        console.log('Loading tasks via server API for group:', group._id)
        const taskResponse = await $fetch('/api/tasks/search', {
          headers: {
            Authorization: `Bearer ${token.value}`
          },
          query: {
            '_type.string': 'ulesanne',
            'grupp.reference': group._id
          }
        })
        console.log('Server API tasks response:', taskResponse)

        console.log(`Tasks found for group ${group.name}:`, taskResponse)

        if (taskResponse?.entities?.length > 0) {
          allTasks.push(...taskResponse.entities)
        }
      }
      catch (groupError) {
        console.error(`Error fetching tasks for group ${group.name}:`, groupError)
      }
    }

    console.log('All tasks found:', allTasks)
    tasks.value = allTasks
  }
  catch (err) {
    console.error('Error loading tasks:', err)
    error.value = 'Failed to load tasks'
  }
  finally {
    pending.value = false
  }
}

const getUserGroups = async () => {
  try {
    console.log('getUserGroups called - user:', user.value)

    if (!user.value?.email && !user.value?._id) {
      console.warn('No user email or ID available - user:', user.value)
      userGroups.value = []
      return
    }

    const userId = user.value._id

    if (!userId) {
      console.warn('No user ID available')
      userGroups.value = []
      return
    }

    console.log('Using user ID:', userId)

    // Get current user's full profile to access parent groups via server API
    const userProfileResponse = await $fetch('/api/user/profile', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
    const userProfile = userProfileResponse.entity

    console.log('🔍 DEBUG: Full userProfileResponse:', userProfileResponse)
    console.log('🔍 DEBUG: userProfile keys:', Object.keys(userProfile))
    console.log('🔍 DEBUG: userProfile._parent exists?', !!userProfile._parent)
    console.log('🔍 DEBUG: userProfile._parent length:', userProfile._parent?.length)
    console.log('🔍 DEBUG: userProfile._parent content:', userProfile._parent)

    // Filter parent relationships to find groups directly
    const groupParents = userProfile._parent?.filter((parent) => parent.entity_type === 'grupp') || []

    console.log('Group parents found:', groupParents)

    if (groupParents.length === 0) {
      console.log('User has no group memberships')
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

    console.log('Filtered groups:', groups)
    console.log('User groups found:', groups)
    userGroups.value = groups

    // Debug: Log if user has groups
    if (groups.length === 0) {
      console.warn('❌ User has no groups - no tasks will be loaded')
    }
    else {
      console.log('✅ User has groups, will load tasks:', groups.map((g) => g.name))
    }
  }
  catch (err) {
    console.warn('Error fetching user groups:', err)
    // If we can't determine groups, set empty array
    userGroups.value = []
  }
}

const getTaskTitle = (task) => {
  return task.properties?.title?.[0]?.value
    || task.properties?.name?.[0]?.value
    || task.properties?.pealkiri?.[0]?.value
    || 'Nimetu ülesanne'
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
    return gruppRef.reference_displayname || 'Grupp'
  }
  return null
}

const getStatusText = (_task) => {
  // TODO: Implement status logic based on user's responses
  // For now, show as "Ootel" (Pending)
  return 'Ootel'
}

const getStatusBadgeClass = (_task) => {
  // TODO: Implement dynamic status colors
  // For now, use pending state styling
  return 'bg-yellow-100 text-yellow-800'
}

const openTask = (task) => {
  navigateTo(`/opilane/ulesanne/${task._id}`)
}

// Load tasks on mount
onMounted(async () => {
  await loadTasks()
  pending.value = false
})

// Set page title
useHead({
  title: 'Minu ülesanded'
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
