/**
 * Entu API Constants
 *
 * Centralized constants for Entu entity types and IDs to avoid magic strings
 * throughout the codebase.
 *
 * Created: October 3, 2025 (Phase 1 refactoring)
 */

/**
 * Entu entity type strings used in API queries
 * Usage: searchEntities({ '_type.string': ENTU_TYPES.VASTUS })
 */
export const ENTU_TYPES = {
  VASTUS: 'vastus', // Response entity
  TASK: 'ülesanne', // Task entity
  LOCATION: 'asukoht', // Location entity
  MAP: 'kaart', // Map entity
  GROUP: 'grupp', // Group entity
  ENTITY: 'entity' // Generic entity type (for metadata)
} as const

/**
 * Entu entity type IDs (reference UUIDs)
 * Usage: { type: '_type', reference: ENTU_TYPE_IDS.VASTUS }
 */
export const ENTU_TYPE_IDS = {
  VASTUS: '686917401749f351b9c82f58' // Response entity type ID
} as const

/**
 * Entu property names used in entity creation and queries
 * Usage: responseData[ENTU_PROPERTIES.KIRJELDUS] = 'description'
 */
export const ENTU_PROPERTIES = {
  // Response entity properties
  KIRJELDUS: 'kirjeldus', // Description/response text
  VASTAJA: 'vastaja', // Respondent name
  GEOPUNKT: 'geopunkt', // Geographic point (lat,lng)
  ASUKOHT: 'asukoht', // Location reference

  // Location entity properties
  NAME_STRING: 'name.string', // Location name
  LAT_NUMBER: 'lat.number', // Latitude
  LONG_NUMBER: 'long.number', // Longitude
  KIRJELDUS_STRING: 'kirjeldus.string', // Description string

  // System properties
  PARENT: '_parent', // Parent entity reference
  TYPE_STRING: '_type.string', // Entity type string
  INHERIT_RIGHTS: '_inheritrights' // Inherit parent rights
} as const

/**
 * Type for valid Entu type strings
 */
export type EntuTypeString = typeof ENTU_TYPES[keyof typeof ENTU_TYPES]

/**
 * Type for valid Entu type IDs
 */
export type EntuTypeId = typeof ENTU_TYPE_IDS[keyof typeof ENTU_TYPE_IDS]
