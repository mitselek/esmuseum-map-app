/**
 * Composable for task scoring mechanism - tracks user progress
 * Provides "X of Y" scoring where X = unique locations visited, Y = expected responses
 */
import { computed, readonly, ref, watch } from 'vue'
import { useEntuApi } from './useEntuApi'
import { useEntuAuth } from './useEntuAuth'

export function useTaskScoring(taskData) {
    const { searchEntities } = useEntuApi()
    const { user } = useEntuAuth()

    // Reactive state
    const userResponses = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Extract expected response count from task data
    const expectedResponses = computed(() => {
        if (!taskData?.value?.vastuseid?.[0]?.number) {
            return 0
        }
        return taskData.value.vastuseid[0].number
    })

    // Extract unique visited locations from user responses
    const visitedLocations = computed(() => {
        if (!userResponses.value?.length) {
            return new Set()
        }

        const locations = new Set()
        userResponses.value.forEach((response) => {
            if (response.asukoht?.[0]?.reference) {
                locations.add(response.asukoht[0].reference)
            }
        })

        return locations
    })

    // Calculate scoring
    const uniqueLocationsCount = computed(() => visitedLocations.value.size)
    const totalExpected = computed(() => expectedResponses.value)
    const progressText = computed(() => `${uniqueLocationsCount.value} of ${totalExpected.value}`)
    const progressPercent = computed(() => {
        if (totalExpected.value === 0) return 0
        return Math.round((uniqueLocationsCount.value / totalExpected.value) * 100)
    })

    // Check if a specific location has been visited
    const isLocationVisited = (locationRef) => {
        return visitedLocations.value.has(locationRef)
    }

    // Fetch user responses for the current task
    const fetchUserResponses = async () => {
        if (!user?.value?._id || !taskData?.value?._id) {
            console.warn('Missing user ID or task ID for scoring')
            return
        }

        loading.value = true
        error.value = null

        try {
            const params = {
                '_type.string': 'vastus',
                '_parent.reference': taskData.value._id,
                '_owner.reference': user.value._id
            }

            const response = await searchEntities(params)
            userResponses.value = response?.entities || []
        }
        catch (err) {
            console.error('Failed to fetch user responses:', err)
            error.value = 'Failed to load scoring data'
            userResponses.value = []
        }
        finally {
            loading.value = false
        }
    }

    // Add a response optimistically (for immediate UI updates)
    const addResponseOptimistically = (locationRef, responseData = {}) => {
        if (!locationRef) return

        // Check if we already have a response for this location
        const existingResponse = userResponses.value.find((r) =>
            r.asukoht?.[0]?.reference === locationRef
        )

        if (!existingResponse) {
            // Add optimistic response
            const optimisticResponse = {
                _id: `temp-${Date.now()}`,
                _type: [{ string: 'vastus' }],
                _parent: [{ reference: taskData.value._id }],
                _owner: [{ reference: user.value._id }],
                asukoht: [{ reference: locationRef }],
                ...responseData
            }

            userResponses.value.push(optimisticResponse)
        }
    }

    // Remove optimistic response (if real submission fails)
    const removeOptimisticResponse = (tempId) => {
        const index = userResponses.value.findIndex((r) => r._id === tempId)
        if (index > -1) {
            userResponses.value.splice(index, 1)
        }
    }

    // Watch for task changes and refetch
    watch(() => taskData?.value?._id, (newTaskId) => {
        if (newTaskId) {
            fetchUserResponses()
        }
    }, { immediate: true })

    // Watch for user changes and refetch
    watch(() => user?.value?._id, (newUserId) => {
        if (newUserId && taskData?.value?._id) {
            fetchUserResponses()
        }
    })

    return {
        // State
        userResponses: readonly(userResponses),
        loading: readonly(loading),
        error: readonly(error),

        // Computed scoring data
        uniqueLocationsCount,
        totalExpected,
        progressText,
        progressPercent,
        visitedLocations,

        // Methods
        isLocationVisited,
        fetchUserResponses,
        addResponseOptimistically,
        removeOptimisticResponse
    }
}
