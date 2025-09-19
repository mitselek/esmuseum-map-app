/**
 * Location Data Management Composable
 * Handles loading and processing location data from Entu API
 * @file useLocationData.js
 */

/**
 * Location data management composable
 * Provides functions for loading map locations and task-related location data
 */
export function useLocationData () {
  /**
     * Load locations for a specific map
     */
  const loadMapLocations = async (mapId) => {
    if (!mapId) {
      throw new Error('Map ID is required')
    }

    if (!/^[0-9a-fA-F]{24}$/.test(mapId)) {
      throw new Error('Invalid map ID format')
    }

    const { searchEntities } = useEntuApi()

    try {
      const searchResult = await searchEntities({
        '_type.string': 'asukoht',
        '_parent.reference': mapId,
        limit: 10000,
        props: 'name.string,lat.number,long.number,kirjeldus.string'
      })

      const locations = searchResult?.entities || []

      console.log(`[CLIENT] Loaded ${locations.length} locations for map ${mapId}`, {
        requestedLimit: 10000,
        actualCount: locations.length,
        searchResultCount: searchResult?.count,
        optimizedWithProps: true
      })

      return locations
    }
    catch (error) {
      console.error('Error loading map locations (client-side):', error)
      throw new Error('Asukohtade laadimine ebaõnnestus')
    }
  }

  /**
     * Load task's map and its locations
     */
  const loadTaskLocations = async (task) => {
    if (!task) {
      throw new Error('Task is required')
    }

    let mapReference = task.kaart?.[0]?.reference
      || task.entity?.properties?.kaart?.[0]?.reference
      || task.entity?.kaart?.[0]?.reference
      || task.kaart

    if (typeof mapReference === 'object' && mapReference !== null) {
      mapReference = mapReference.reference || mapReference._id || mapReference.id
    }

    if (!mapReference || typeof mapReference !== 'string') {
      return []
    }

    return await loadMapLocations(mapReference)
  }

  /**
     * Sort locations by distance from user
     */
  const sortByDistance = (locations, position = null) => {
    const { userPosition } = useGeolocation()
    const pos = position || userPosition.value
    return sortLocationsByDistance(locations, pos)
  }

  /**
     * Get sorted locations with distance info
     */
  const getSortedLocations = (locations) => {
    const { userPosition } = useGeolocation()
    return computed(() => {
      return sortByDistance(locations, userPosition.value)
    })
  }

  return {
    loadMapLocations,
    loadTaskLocations,
    sortByDistance,
    getSortedLocations
  }
}
