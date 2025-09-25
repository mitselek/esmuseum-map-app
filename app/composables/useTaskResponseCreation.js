export const useTaskResponseCreation = () => {
  const { token } = useEntuAuth()
  const { searchEntities } = useEntuApi()

  const useClientSideCreation = ref(true)

  const checkExistingResponse = async (taskId, userId) => {
    if (!userId || !taskId) return false
    try {
      const result = await searchEntities({
        '_type.string': 'vastus',
        '_parent.reference': taskId,
        '_owner.reference': userId,
        limit: 1
      })
      return (result.entities?.length || 0) > 0
    }
    catch (error) {
      console.error('Failed to check existing response:', error)
      return false
    }
  }

  const createResponseClientSide = async (requestData) => {
    const { taskId, responses, respondentName } = requestData

    const responseData = {
      _parent: taskId,
      kirjeldus: responses[0]?.value || ''
    }

    if (respondentName) {
      responseData.vastaja = respondentName
    }

    if (responses[0]?.metadata?.locationId) {
      responseData.asukoht = responses[0].metadata.locationId
    }

    const coords = responses[0]?.metadata?.coordinates
    if (coords && coords.lat && coords.lng) {
      responseData.geopunkt = `${coords.lat},${coords.lng}`
    }

    const entuProperties = [
      { type: '_type', reference: '686917401749f351b9c82f58' },
      { type: '_inheritrights', boolean: true }
    ]

    for (const [key, value] of Object.entries(responseData)) {
      if (value !== null && value !== undefined) {
        if (key === '_parent' || key === 'asukoht') {
          entuProperties.push({ type: key, reference: value })
        }
        else if (typeof value === 'string') {
          entuProperties.push({ type: key, string: value })
        }
        else if (typeof value === 'number') {
          entuProperties.push({ type: key, number: value })
        }
        else if (typeof value === 'boolean') {
          entuProperties.push({ type: key, boolean: value })
        }
      }
    }

    // Create the entity via Entu API
    const { createEntity } = useEntuApi()
    const createdResponse = await createEntity(entuProperties)

    return {
      success: true,
      id: createdResponse._id || 'unknown',
      message: 'Response created successfully',
      submittedAt: new Date().toISOString(),
      data: createdResponse
    }
  }

  const createResponseServerSide = async (requestData) => {
    return await $fetch('/api/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: requestData
    })
  }

  const createTaskResponse = async (requestData) => {
    try {
      if (useClientSideCreation.value) {
        console.log('F015: Using client-side response creation')
        return await createResponseClientSide(requestData)
      }
      else {
        console.log('F015: Using server-side response creation')
        return await createResponseServerSide(requestData)
      }
    }
    catch (error) {
      if (useClientSideCreation.value) {
        console.error('🔴 F015: Client-side creation failed!')
        throw new Error(`Client-side response creation failed: ${error.message}`)
      }
      throw error
    }
  }

  return {
    createTaskResponse,
    checkExistingResponse,
    useClientSideCreation: readonly(useClientSideCreation)
  }
}
