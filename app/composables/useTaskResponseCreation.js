/**
 * Composable for creating task responses
 * Supports both server-side (legacy) and client-side (F015) approaches with feature flags
 */
export const useTaskResponseCreation = () => {
  const { token, user } = useEntuAuth()
  const { createEntity, searchEntities, getEntity } = useEntuApi()

  // Feature flag - controls whether to use client-side or server-side response creation
  // TODO: Make this configurable via runtime config or user preferences
  const useClientSideCreation = ref(true) // Start with client-side for testing

  /**
   * Check if user has permission to respond to a task (client-side implementation)
   */
  const checkTaskPermission = async (taskId) => {
    if (!user.value || !user.value._id || !taskId) {
      return false
    }

    try {
      // Get task entity with user permissions
      const task = await getEntity(taskId)
      
      if (!task) {
        console.warn(`Task not found: ${taskId}`)
        return false
      }

      // Check if user is in task permissions (_owner, _editor, _expander arrays)
      const userId = user.value._id
      const hasOwnerAccess = task._owner?.some((owner) => owner._id === userId)
      const hasEditorAccess = task._editor?.some((editor) => editor._id === userId)
      const hasExpanderAccess = task._expander?.some((expander) => expander._id === userId)

      return hasOwnerAccess || hasEditorAccess || hasExpanderAccess
    } catch (error) {
      console.error('Failed to check task permission:', error)
      return false
    }
  }

  /**
   * Check if user already has a response for this task (client-side implementation)
   */
  const checkExistingResponse = async (taskId) => {
    if (!user.value || !user.value._id || !taskId) {
      return false
    }

    try {
      const responsesResult = await searchEntities({
        '_type.string': 'vastus',
        '_parent._id': taskId,
        '_owner._id': user.value._id,
        limit: 1
      })

      return (responsesResult.entities?.length || 0) > 0
    } catch (error) {
      console.error('Failed to check existing response:', error)
      return false
    }
  }

  /**
   * Create response using client-side Entu API (F015 implementation)
   */
  const createResponseClientSide = async (requestData) => {
    if (!user.value || !user.value._id) {
      throw new Error('User not authenticated')
    }

    const { taskId, responses } = requestData

    // Validate task ID format
    if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
      throw new Error('Invalid task ID format')
    }

    // Check permissions
    const hasPermission = await checkTaskPermission(taskId)
    if (!hasPermission) {
      throw new Error('You do not have permission to respond to this task')
    }

    // Check for existing response
    const hasExistingResponse = await checkExistingResponse(taskId)
    if (hasExistingResponse) {
      throw new Error('Response already exists for this task. Use PUT to update.')
    }

    // Prepare response data for Entu
    const responseData = {
      _parent: taskId,
      _type: 'vastus',
      kirjeldus: responses[0]?.value || ''
    }

    // Add location reference if provided
    const locationId = responses[0]?.metadata?.locationId
    if (locationId) {
      responseData.asukoht = locationId
    }

    // Add coordinates if provided
    const coordinates = responses[0]?.metadata?.coordinates
    if (coordinates && coordinates.lat && coordinates.lng) {
      responseData.geopunkt = `${coordinates.lat},${coordinates.lng}`
    }

    // Create the response in Entu
    const createdResponse = await createEntity(responseData)
    
    console.log('[CLIENT] Created response from Entu API directly', createdResponse)

    return {
      success: true,
      id: createdResponse._id || 'unknown',
      message: 'Response created successfully',
      submittedAt: new Date().toISOString(),
      data: createdResponse
    }
  }

  /**
   * Create response using server-side API (legacy implementation)
   */
  const createResponseServerSide = async (requestData) => {
    if (!token.value) {
      throw new Error('Not authenticated')
    }

    const response = await $fetch('/api/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: requestData
    })

    console.log('[SERVER] Created response via server API', response)
    return response
  }

  /**
   * Main response creation function with feature flag support
   */
  const createTaskResponse = async (requestData) => {
    try {
      if (useClientSideCreation.value) {
        console.log('F015: Using client-side response creation')
        return await createResponseClientSide(requestData)
      } else {
        console.log('F015: Using server-side response creation (legacy)')
        return await createResponseServerSide(requestData)
      }
    } catch (error) {
      console.error('Response creation failed:', error)
      
      // If client-side fails, optionally fall back to server-side
      if (useClientSideCreation.value && error.message !== 'You do not have permission to respond to this task') {
        console.warn('F015: Client-side creation failed, falling back to server-side')
        try {
          return await createResponseServerSide(requestData)
        } catch (fallbackError) {
          console.error('F015: Server-side fallback also failed:', fallbackError)
          throw fallbackError
        }
      }
      
      throw error
    }
  }

  return {
    createTaskResponse,
    checkTaskPermission,
    checkExistingResponse,
    useClientSideCreation: readonly(useClientSideCreation),
    
    // For debugging/admin purposes
    setClientSideCreation: (enabled) => {
      useClientSideCreation.value = enabled
      console.log(`F015: Response creation mode: ${enabled ? 'client-side' : 'server-side'}`)
    }
  }
}