/**
 * GET /api/tasks/[id]
 * Get enhanced task details with user-specific data
 */

import { validateEntityId, validateLocationQuery, calculateDistance, createSuccessResponse } from '../../utils/validation'
import { withAuth, checkTaskPermission, type AuthenticatedUser, extractBearerToken } from '../../utils/auth'
import { getEntuEntity, searchEntuEntities, getEntuApiConfig } from '../../utils/entu'

interface LocationWithDistance {
  id: string
  name: string
  coordinates: {
    lat: number
    lng: number
  }
  distance?: number
  address?: string
  description?: string
}

interface TaskResponse {
  task: any
  userResponse?: any
  responseCount: number
  locations: LocationWithDistance[]
  permissions: {
    canRespond: boolean
    canViewResponses: boolean
  }
}

export default defineEventHandler(async (event) => {
  return withAuth(event, async (event: any, user: AuthenticatedUser) => {
    // Only allow GET method
    assertMethod(event, 'GET')

    // Get and validate task ID from URL
    const taskId = validateEntityId(getRouterParam(event, 'id'))
    
    // Get query parameters for location distance calculation
    const query = getQuery(event)
    const locationQuery = validateLocationQuery(query)

    try {
      const apiConfig = getEntuApiConfig(extractBearerToken(event))

      // Check if user has permission to access this task
      const hasPermission = await checkTaskPermission(user, taskId, apiConfig)
      
      if (!hasPermission) {
        throw createError({
          statusCode: 403,
          statusMessage: 'You do not have permission to access this task'
        })
      }

  // Get task details
  const taskResult = await getEntuEntity(taskId, apiConfig)
  const taskEntity: any = (taskResult && (taskResult as any).entity) ? (taskResult as any).entity : taskResult
      
  if (!taskEntity) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Task not found'
        })
      }

      // Get user's existing response for this task
      let userResponse = null
      try {
  const userResponseResult = await searchEntuEntities({
          '_type.string': 'vastus',
          'ulesanne._id': taskId,
          'kasutaja._id': user._id,
          limit: 1,
          props: 'vastused,esitamisaeg,muutmisaeg,staatus'
        }, apiConfig)

        if (userResponseResult.entities && userResponseResult.entities.length > 0) {
          userResponse = userResponseResult.entities[0]
        }
      } catch (error) {
        console.warn('Could not load user response:', error)
      }

      // Get response count for this task
      let responseCount = 0
      try {
        const responseCountResult = await searchEntuEntities({
          '_type.string': 'vastus',
          'ulesanne._id': taskId,
          limit: 1,
          props: '_id'
        }, apiConfig)
        responseCount = responseCountResult.count || 0
      } catch (error) {
        console.warn('Could not get response count:', error)
      }

      // Get task locations by map (kaart) like the frontend
      const locations: LocationWithDistance[] = []
      try {
        // Try to obtain a map reference from multiple possible shapes
        const rawKaart = (taskEntity as any).kaart || (taskEntity as any).properties?.kaart
        let mapReference: string | undefined

        if (typeof rawKaart === 'string') {
          mapReference = rawKaart
        } else if (Array.isArray(rawKaart) && rawKaart.length > 0) {
          const first = rawKaart[0]
          mapReference = first?.reference || first?._id || first?.id || first?.value || first?.string
        } else if (rawKaart && typeof rawKaart === 'object') {
          mapReference = rawKaart.reference || rawKaart._id || rawKaart.id || rawKaart.value || rawKaart.string
        }

  if (mapReference && typeof mapReference === 'string') {
          // Query locations that belong to this map
          const search = await searchEntuEntities({
            '_type.string': 'asukoht',
            '_parent.reference': mapReference,
            limit: 1000
          }, apiConfig)

          const ents = search?.entities || []
          for (const loc of ents) {
            // Extract coordinates similar to the frontend logic
            const geopunkt = loc?.properties?.geopunkt?.[0]?.value || loc?.geopunkt
            let coords = geopunkt ? parseCoordinates(String(geopunkt)) : null

            if (!coords) {
              const lat = loc?.lat?.[0]?.number
                || loc?.properties?.lat?.[0]?.value
                || loc?.properties?.lat?.[0]?.number
              const lng = loc?.long?.[0]?.number
                || loc?.properties?.long?.[0]?.value
                || loc?.properties?.long?.[0]?.number
              if (lat != null && lng != null) {
                coords = { lat: Number(lat), lng: Number(lng) }
              }
            }

            if (coords) {
              const locationItem: LocationWithDistance = {
                id: loc._id || loc.id,
                name: loc?.name?.[0]?.string
                  || loc?.properties?.name?.[0]?.value
                  || loc?.properties?.nimi?.[0]?.value
                  || loc?.nimi
                  || 'Unknown Location',
                coordinates: coords,
                address: loc?.properties?.address?.[0]?.value
                  || loc?.properties?.aadress?.[0]?.value,
                description: loc?.properties?.description?.[0]?.value
                  || loc?.properties?.kirjeldus?.[0]?.value
              }

              if (locationQuery.lat !== undefined && locationQuery.lng !== undefined) {
                locationItem.distance = calculateDistance(
                  locationQuery.lat,
                  locationQuery.lng,
                  coords.lat,
                  coords.lng
                )
              }

              locations.push(locationItem)
            }
          }

          if (locationQuery.lat !== undefined && locationQuery.lng !== undefined) {
            locations.sort((a, b) => (a.distance || 0) - (b.distance || 0))
          }
        }
      } catch (error) {
        console.warn('Could not process task locations:', error)
      }

      // Determine user permissions
  const permissions = {
        canRespond: !userResponse, // Can respond if no response exists yet
        canViewResponses: Boolean(user.groups && user.groups.length > 0) // Basic permission check
      }

      // Build response
      const response: TaskResponse = {
        task: {
          id: taskEntity._id,
          title: taskEntity.pealkiri || taskEntity.nimi || taskEntity.title,
          description: taskEntity.kirjeldus || taskEntity.description,
          instructions: taskEntity.juhend || taskEntity.instructions,
          type: taskEntity._type,
          created: taskEntity._created,
          modified: taskEntity._modified,
          // Include other relevant task fields
          ...taskEntity
        },
        userResponse,
        responseCount,
        locations,
        permissions
      }

      return createSuccessResponse(response)

    } catch (error: any) {
      console.error('Failed to get enhanced task data:', error)
      
      // Re-throw known errors
      if (error?.statusCode) {
        throw error
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to get task data'
      })
    }
  })
})

// Helper function to parse coordinate strings (e.g., "59.4370,24.7536")
function parseCoordinates(coordString: string): { lat: number; lng: number } | null {
  try {
    const parts = coordString.split(',')
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null
    
    const lat = parseFloat(parts[0].trim())
    const lng = parseFloat(parts[1].trim())
    
    if (isNaN(lat) || isNaN(lng)) return null
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
    
    return { lat, lng }
  } catch {
    return null
  }
}
