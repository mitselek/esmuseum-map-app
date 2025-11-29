/**
 * Location transformation utilities
 * 
 * Converts between Entu API format and normalized internal format
 */

import type { EntuLocation } from '../../types/entu'
import type { NormalizedLocation, Coordinates } from '../../types/location'

/**
 * Extract coordinates from Entu location entity
 * 
 * @param entity - Entu location entity
 * @returns Coordinates object with lat/lng, defaults to (0, 0) if missing
 */
export function extractCoordinates(entity: EntuLocation): Coordinates {
  const lat = entity.lat?.[0]?.number ?? 0
  const lng = entity.long?.[0]?.number ?? 0
  
  return { lat, lng }
}

/**
 * Normalize Entu location entity to internal format
 * 
 * Converts from Entu's array-based property format to a flat,
 * normalized structure used throughout the app.
 * 
 * @param entity - Entu location entity from API
 * @returns Normalized location for internal use
 * 
 * @example
 * ```ts
 * const entuLocation = {
 *   _id: '123',
 *   name: [{ string: 'Museum' }],
 *   lat: [{ number: 59.437 }],
 *   long: [{ number: 24.745 }]
 * }
 * 
 * const normalized = normalizeLocation(entuLocation)
 * // {
 * //   _id: '123',
 * //   name: 'Museum',
 * //   coordinates: { lat: 59.437, lng: 24.745 }
 * // }
 * ```
 */
export function normalizeLocation(entity: EntuLocation): NormalizedLocation {
  return {
    _id: entity._id,
    name: entity.name?.[0]?.string,
    description: entity.kirjeldus?.[0]?.string,
    coordinates: extractCoordinates(entity)
  }
}

/**
 * Normalize array of Entu locations
 * 
 * @param entities - Array of Entu location entities
 * @returns Array of normalized locations
 */
export function normalizeLocations(entities: EntuLocation[]): NormalizedLocation[] {
  return entities.map(normalizeLocation)
}
