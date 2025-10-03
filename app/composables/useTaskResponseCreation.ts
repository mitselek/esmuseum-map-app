import { ENTU_TYPES, ENTU_TYPE_IDS, ENTU_PROPERTIES } from '../constants/entu'
import type { Ref } from 'vue'

/**
 * Response metadata containing location and coordinates
 */
interface ResponseMetadata {
  locationId?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

/**
 * Individual response item from form
 */
interface ResponseItem {
  value: string
  metadata?: ResponseMetadata
}

/**
 * Request data structure for creating a task response
 */
interface TaskResponseRequest {
  taskId: string
  responses: ResponseItem[]
  respondentName?: string
}

/**
 * Entu property definition for entity creation
 */
interface EntuProperty {
  type: string
  reference?: string
  string?: string
  number?: number
  boolean?: boolean
}

/**
 * Response data object with Entu property keys
 */
interface ResponseData {
  [key: string]: string | number | boolean | undefined
}

/**
 * Created response result
 */
interface CreateResponseResult {
  success: boolean
  id: string
  message: string
  submittedAt: string
  data: any
}

/**
 * Return type for useTaskResponseCreation composable
 */
export interface UseTaskResponseCreationReturn {
  createTaskResponse: (requestData: TaskResponseRequest) => Promise<CreateResponseResult>
  checkExistingResponse: (taskId: string, userId: string) => Promise<boolean>
  useClientSideCreation: Readonly<Ref<boolean>>
}

/**
 * Composable for creating task responses via Entu API
 * Handles both client-side and server-side creation paths
 */
export const useTaskResponseCreation = (): UseTaskResponseCreationReturn => {
  const { token } = useEntuAuth()
  const { searchEntities } = useEntuApi()

  const useClientSideCreation = ref<boolean>(true)

  /**
   * Check if user has already submitted a response for this task
   */
  const checkExistingResponse = async (taskId: string, userId: string): Promise<boolean> => {
    if (!userId || !taskId) return false
    
    try {
      const result = await searchEntities({
        [ENTU_PROPERTIES.TYPE_STRING]: ENTU_TYPES.VASTUS,
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

  /**
   * Create response directly via Entu API (client-side)
   */
  const createResponseClientSide = async (requestData: TaskResponseRequest): Promise<CreateResponseResult> => {
    const { taskId, responses, respondentName } = requestData

    const responseData: ResponseData = {
      [ENTU_PROPERTIES.PARENT]: taskId,
      [ENTU_PROPERTIES.KIRJELDUS]: responses[0]?.value || ''
    }

    if (respondentName) {
      responseData[ENTU_PROPERTIES.VASTAJA] = respondentName
    }

    if (responses[0]?.metadata?.locationId) {
      responseData[ENTU_PROPERTIES.ASUKOHT] = responses[0].metadata.locationId
    }

    const coords = responses[0]?.metadata?.coordinates
    if (coords && coords.lat && coords.lng) {
      responseData[ENTU_PROPERTIES.GEOPUNKT] = `${coords.lat},${coords.lng}`
    }

    const entuProperties: EntuProperty[] = [
      { type: '_type', reference: ENTU_TYPE_IDS.VASTUS },
      { type: '_inheritrights', boolean: true }
    ]

    for (const [key, value] of Object.entries(responseData)) {
      if (value !== null && value !== undefined) {
        if (key === ENTU_PROPERTIES.PARENT || key === ENTU_PROPERTIES.ASUKOHT) {
          entuProperties.push({ type: key, reference: value as string })
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

  /**
   * Create response via server API endpoint (server-side)
   */
  const createResponseServerSide = async (requestData: TaskResponseRequest): Promise<CreateResponseResult> => {
    return await $fetch('/api/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: requestData
    })
  }

  /**
   * Create a task response using the selected creation method
   */
  const createTaskResponse = async (requestData: TaskResponseRequest): Promise<CreateResponseResult> => {
    try {
      if (useClientSideCreation.value) {
        return await createResponseClientSide(requestData)
      }
      else {
        return await createResponseServerSide(requestData)
      }
    }
    catch (error) {
      if (useClientSideCreation.value) {
        console.error('Client-side response creation failed:', error)
        throw new Error(`Client-side response creation failed: ${(error as Error).message}`)
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
