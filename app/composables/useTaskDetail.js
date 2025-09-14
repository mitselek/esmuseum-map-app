// Composable for task detail panel functionality
export const useTaskDetail = () => {
  const { t } = useI18n()

  // Task data helpers
  const getTaskTitle = (task) => {
    // Handle both data structures: task.name (string) or task.name[0].string (array format)
    if (typeof task?.name === 'string') {
      return task.name || t('taskDetail.noTitle', 'Untitled Task')
    }
    return task?.name?.[0]?.string || t('taskDetail.noTitle', 'Untitled Task')
  }

  const getTaskDescription = (task) => {
    return task?.description?.[0]?.string || task?.description || null
  }

  const getResponseCount = (task) => {
    // Handle Entu array format for response count
    if (task?.vastuseid && Array.isArray(task.vastuseid) && task.vastuseid[0]?.number !== undefined) {
      return task.vastuseid[0].number
    }
    // Fallback for direct number
    if (typeof task?.responseCount === 'number') {
      return task.responseCount
    }
    return 0
  }

  // Permission checking
  const checkTaskPermissions = async (taskId) => {
    const { token } = useEntuAuth()

    if (!token.value) {
      return { hasPermission: false, error: 'Not authenticated' }
    }

    try {
      const permissionData = await $fetch(`/api/tasks/${taskId}/permissions`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      return {
        hasPermission: permissionData.success && permissionData.hasPermission,
        error: null
      }
    }
    catch (error) {
      return {
        hasPermission: false,
        error: error.message
      }
    }
  }

  // Location utilities
  const getLocationCoordinates = (location) => {
    // Extract coordinates from location object
    if (location?.coordinates) {
      return location.coordinates
    }
    if (location?.lat && location?.lng) {
      return `${location.lat},${location.lng}`
    }
    return null
  }

  const parseCoordinates = (coordString) => {
    if (!coordString || typeof coordString !== 'string') return null

    try {
      const parts = coordString.split(',').map((s) => s.trim())
      if (parts.length !== 2) return null

      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])

      if (isNaN(lat) || isNaN(lng)) return null
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null

      return { lat, lng }
    }
    catch {
      return null
    }
  }

  // Geolocation functionality
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error(t('taskDetail.geolocationNotSupported')))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          resolve(coords)
        },
        (error) => {
          let errorMessage = t('taskDetail.geolocationError', { error: error.message })

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'User denied geolocation permission'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
          }

          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  // Task locations management
  const loadTaskLocations = async (task, userPosition = null) => {
    if (!task) {
      return []
    }

    try {
      const { loadMapLocations, sortByDistance } = useLocation()

      // Debug: Log the task structure to understand the data format
      console.log('Loading locations for task:', task)
      console.log('Task keys:', Object.keys(task))
      console.log('Task kaart field:', task.kaart)

      // Extract map ID from task - use reference field for actual map entity
      // 'kaart' is Estonian for 'map' and is typically an array in Entu
      const mapId = task.kaart?.[0]?.reference || task.kaart?.[0]?._id || task.kaart?.[0]?.id
        || task.kaart?._id || task.kaart?.id || task.kaart
        || task.map?.[0]?.reference || task.map?.[0]?._id || task.map?.[0]?.id
        || task.map?._id || task.map?.id || task.mapId || task.map

      console.log('Extracted mapId:', mapId)

      if (!mapId) {
        console.warn('No map ID found for task')
        return []
      }

      const locations = await loadMapLocations(mapId)
      console.log('Loaded locations:', locations)

      // Always process locations to extract coordinates, sort by distance if we have user position
      const processedLocations = sortByDistance(locations, userPosition)
      console.log('Processed locations:', processedLocations)
      return processedLocations
    }
    catch (error) {
      console.error('Error loading task locations:', error)
      return []
    }
  }

  // Task response stats
  // Import the proper response stats composable
  const { getTaskResponseStats: getProperTaskResponseStats } = useTaskResponseStats()

  const getTaskResponseStats = async (task) => {
    return await getProperTaskResponseStats(task)
  }

  // Load existing response data
  const loadExistingResponse = async (taskId) => {
    if (!taskId) return null

    try {
      const { token } = useEntuAuth()
      if (!token.value) return null

      const response = await $fetch(`/api/tasks/${taskId}/response`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      return response.success ? response.response : null
    }
    catch (error) {
      console.warn('Failed to load existing response:', error)
      return null
    }
  }

  /**
   * Handle task selection and initialization
   * @param {Object} task - The selected task
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} Task initialization result
   */
  const initializeTask = async (task, options = {}) => {
    const {
      responseFormRef,
      getCurrentLocation,
      needsLocation,
      checkPermissions,
      loadTaskLocations: loadLocations,
      setStats,
      resetState
    } = options

    if (!task) {
      // No task selected, reset states
      if (resetState) {
        resetState()
      }
      return { success: false, reason: 'no_task' }
    }

    const taskId = task._id || task.id
    if (!taskId) {
      return { success: false, reason: 'no_task_id' }
    }

    try {
      const { token } = useEntuAuth()

      // Check permissions first
      if (checkPermissions) {
        await checkPermissions(taskId)
      }

      // Load task response stats
      try {
        const stats = await getTaskResponseStats(task)
        if (setStats) {
          setStats(stats)
        }
      }
      catch (error) {
        console.warn('Failed to load task response stats:', error)
        if (setStats) {
          setStats(null)
        }
      }

      // Load task locations
      if (loadLocations) {
        await loadLocations()
      }

      // Handle authentication and response loading
      if (token.value) {
        try {
          // Try to fetch existing response
          const responseData = await $fetch(`/api/responses/${taskId}`, {
            headers: {
              Authorization: `Bearer ${token.value}`
            }
          })

          if (responseData.success && responseData.response) {
            // Existing response found
            return {
              success: true,
              hasExistingResponse: true,
              response: responseData.response
            }
          }
          else {
            // No existing response - handle auto-geolocation
            await handleAutoGeolocation(needsLocation, getCurrentLocation, responseFormRef)
            return { success: true, hasExistingResponse: false }
          }
        }
        catch (error) {
          console.log('No existing response found or error loading:', error)
          // Handle auto-geolocation for new response
          await handleAutoGeolocation(needsLocation, getCurrentLocation, responseFormRef)
          return { success: true, hasExistingResponse: false }
        }
      }
      else {
        // Not authenticated
        console.log('Not authenticated')
        return { success: true, authenticated: false }
      }
    }
    catch (error) {
      console.error('Error initializing task:', error)
      return { success: false, error }
    }
  }

  /**
   * Handle auto-geolocation for tasks that need location
   */
  const handleAutoGeolocation = async (needsLocation, getCurrentLocation, responseFormRef) => {
    if (needsLocation?.value && getCurrentLocation) {
      try {
        await getCurrentLocation(responseFormRef)
      }
      catch (error) {
        console.log('Auto-geolocation failed:', error)
        // Continue without location - user can set manually
      }
    }
  }

  return {
    // Task data helpers
    getTaskTitle,
    getTaskDescription,
    getResponseCount,

    // Permission checking
    checkTaskPermissions,

    // Location utilities
    getLocationCoordinates,
    parseCoordinates,
    getCurrentPosition,
    loadTaskLocations,

    // Response management
    getTaskResponseStats,
    loadExistingResponse,

    // Task initialization
    initializeTask,
    handleAutoGeolocation
  }
}
