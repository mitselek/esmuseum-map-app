/**
 * Utility functions for working with Entu entities
 * These helpers extract values from Entu property arrays with proper typing
 */

import type {
  EntuEntity,
  EntuStringProperty,
  EntuReferenceProperty,
  EntuNumberProperty,
  EntuBooleanProperty,
  EntuDateTimeProperty,
  EntuFileProperty,
  EntuTask,
  EntuResponse,
  EntuLocation,
  EntuMap,
  EntuGroup,
  EntuPerson
} from '../types/entu'

// ============================================================================
// Value Extraction Helpers
// ============================================================================

/**
 * Extract string value from Entu property array
 * @param property Array of string properties
 * @param index Index of the property to extract (default: 0)
 * @returns The string value or undefined if not found
 */
export function getStringValue(
  property: EntuStringProperty[] | undefined,
  index: number = 0
): string | undefined {
  return property?.[index]?.string
}

/**
 * Extract all string values from Entu property array
 * @param property Array of string properties
 * @returns Array of string values
 */
export function getStringValues(
  property: EntuStringProperty[] | undefined
): string[] {
  return property?.map(p => p.string).filter(Boolean) || []
}

/**
 * Extract reference ID from Entu property array
 * @param property Array of reference properties
 * @param index Index of the property to extract (default: 0)
 * @returns The reference ID or undefined if not found
 */
export function getReferenceValue(
  property: EntuReferenceProperty[] | undefined,
  index: number = 0
): string | undefined {
  return property?.[index]?.reference
}

/**
 * Extract reference with display string from Entu property array
 * @param property Array of reference properties
 * @param index Index of the property to extract (default: 0)
 * @returns Object with reference ID and display string, or undefined if not found
 */
export function getReferenceWithString(
  property: EntuReferenceProperty[] | undefined,
  index: number = 0
): { reference: string; string?: string; entity_type?: string } | undefined {
  const ref = property?.[index]
  if (!ref) return undefined
  return {
    reference: ref.reference,
    string: ref.string,
    entity_type: ref.entity_type
  }
}

/**
 * Extract all reference IDs from Entu property array
 * @param property Array of reference properties
 * @returns Array of reference IDs
 */
export function getReferenceValues(
  property: EntuReferenceProperty[] | undefined
): string[] {
  return property?.map(p => p.reference).filter(Boolean) || []
}

/**
 * Extract number value from Entu property array
 * @param property Array of number properties
 * @param index Index of the property to extract (default: 0)
 * @returns The number value or undefined if not found
 */
export function getNumberValue(
  property: EntuNumberProperty[] | undefined,
  index: number = 0
): number | undefined {
  return property?.[index]?.number
}

/**
 * Extract boolean value from Entu property array
 * @param property Array of boolean properties
 * @param index Index of the property to extract (default: 0)
 * @returns The boolean value or undefined if not found
 */
export function getBooleanValue(
  property: EntuBooleanProperty[] | undefined,
  index: number = 0
): boolean | undefined {
  return property?.[index]?.boolean
}

/**
 * Extract datetime value from Entu property array
 * @param property Array of datetime properties
 * @param index Index of the property to extract (default: 0)
 * @returns The datetime string or undefined if not found
 */
export function getDateTimeValue(
  property: EntuDateTimeProperty[] | undefined,
  index: number = 0
): string | undefined {
  return property?.[index]?.datetime
}

/**
 * Extract datetime as Date object from Entu property array
 * @param property Array of datetime properties
 * @param index Index of the property to extract (default: 0)
 * @returns The Date object or undefined if not found
 */
export function getDateTimeAsDate(
  property: EntuDateTimeProperty[] | undefined,
  index: number = 0
): Date | undefined {
  const datetime = getDateTimeValue(property, index)
  return datetime ? new Date(datetime) : undefined
}

/**
 * Extract file property from Entu property array
 * @param property Array of file properties
 * @param index Index of the property to extract (default: 0)
 * @returns The file property or undefined if not found
 */
export function getFileProperty(
  property: EntuFileProperty[] | undefined,
  index: number = 0
): EntuFileProperty | undefined {
  return property?.[index]
}

/**
 * Extract all file properties from Entu property array
 * @param property Array of file properties
 * @returns Array of file properties
 */
export function getFileProperties(
  property: EntuFileProperty[] | undefined
): EntuFileProperty[] {
  return property || []
}

// ============================================================================
// Entity-Specific Helpers
// ============================================================================

/**
 * Get task name from task entity
 */
export function getTaskName(task: EntuTask): string {
  return getStringValue(task.name) || 'Untitled Task'
}

/**
 * Get task description from task entity
 */
export function getTaskDescription(task: EntuTask): string | undefined {
  return getStringValue(task.kirjeldus)
}

/**
 * Get task deadline from task entity
 */
export function getTaskDeadline(task: EntuTask): Date | undefined {
  return getDateTimeAsDate(task.tahtaeg)
}

/**
 * Get task response count from task entity
 */
export function getTaskResponseCount(task: EntuTask): number {
  return getNumberValue(task.vastuseid) || 0
}

/**
 * Get task map reference from task entity
 */
export function getTaskMapReference(task: EntuTask): string | undefined {
  return getReferenceValue(task.kaart)
}

/**
 * Get task group reference from task entity
 */
export function getTaskGroupReference(task: EntuTask): string | undefined {
  return getReferenceValue(task.grupp)
}

/**
 * Get response text from response entity
 */
export function getResponseText(response: EntuResponse): string | undefined {
  return getStringValue(response.kirjeldus)
}

/**
 * Get response location reference from response entity
 */
export function getResponseLocationReference(response: EntuResponse): string | undefined {
  return getReferenceValue(response.asukoht)
}

/**
 * Get response coordinates from response entity
 */
export function getResponseCoordinates(response: EntuResponse): { lat: number; lng: number } | undefined {
  const geopunkt = getStringValue(response.geopunkt)
  if (!geopunkt) return undefined
  
  const coords = geopunkt.split(',').map(coord => parseFloat(coord.trim()))
  const lat = coords[0]
  const lng = coords[1]
  
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return undefined
  
  return { lat, lng }
}

/**
 * Get response photo from response entity
 */
export function getResponsePhoto(response: EntuResponse): EntuFileProperty | undefined {
  return getFileProperty(response.photo)
}

/**
 * Get location name from location entity
 */
export function getLocationName(location: EntuLocation): string {
  return getStringValue(location.name) || 'Unnamed Location'
}

/**
 * Get location description from location entity
 */
export function getLocationDescription(location: EntuLocation): string | undefined {
  return getStringValue(location.kirjeldus)
}

/**
 * Get location coordinates from location entity
 */
export function getLocationCoordinates(location: EntuLocation): { lat: number; lng: number } | undefined {
  const lat = getNumberValue(location.lat)
  const lng = getNumberValue(location.long)
  
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) return undefined
  
  return { lat, lng }
}

/**
 * Get map name from map entity
 */
export function getMapName(map: EntuMap): string {
  return getStringValue(map.name) || 'Unnamed Map'
}

/**
 * Get map URL from map entity
 */
export function getMapUrl(map: EntuMap): string | undefined {
  return getStringValue(map.url)
}

/**
 * Get group name from group entity
 */
export function getGroupName(group: EntuGroup): string {
  return getStringValue(group.name) || 'Unnamed Group'
}

/**
 * Get group description from group entity
 */
export function getGroupDescription(group: EntuGroup): string | undefined {
  return getStringValue(group.kirjeldus)
}

/**
 * Get group leader reference from group entity
 */
export function getGroupLeaderReference(group: EntuGroup): string | undefined {
  return getReferenceValue(group.grupijuht)
}

/**
 * Get person full name from person entity
 */
export function getPersonFullName(person: EntuPerson): string {
  // Try name field first (computed full name)
  const fullName = getStringValue(person.name)
  if (fullName) return fullName
  
  // Fallback to forename + surname
  const forename = getStringValue(person.forename)
  const surname = getStringValue(person.surname)
  
  if (forename && surname) return `${forename} ${surname}`
  if (forename) return forename
  if (surname) return surname
  
  return 'Unnamed Person'
}

/**
 * Get person email from person entity
 */
export function getPersonEmail(person: EntuPerson): string | undefined {
  return getStringValue(person.email)
}

/**
 * Get person ID code from person entity
 */
export function getPersonIdCode(person: EntuPerson): string | undefined {
  return getStringValue(person.idcode)
}

/**
 * Get person photo from person entity
 */
export function getPersonPhoto(person: EntuPerson): EntuFileProperty | undefined {
  return getFileProperty(person.photo)
}

// ============================================================================
// Common Entity Helpers
// ============================================================================

/**
 * Get entity type string from any entity
 */
export function getEntityType(entity: EntuEntity): string | undefined {
  return getStringValue(entity._type as EntuStringProperty[])
}

/**
 * Get entity ID
 */
export function getEntityId(entity: EntuEntity): string {
  return entity._id
}

/**
 * Get entity parent reference
 */
export function getEntityParentReference(entity: EntuEntity): string | undefined {
  return getReferenceValue(entity._parent)
}

/**
 * Get entity owner reference
 */
export function getEntityOwnerReference(entity: EntuEntity): string | undefined {
  return getReferenceValue(entity._owner)
}

/**
 * Get entity creation date
 */
export function getEntityCreatedDate(entity: EntuEntity): Date | undefined {
  return getDateTimeAsDate(entity._created)
}

/**
 * Check if entity has public sharing
 */
export function isEntityPublic(entity: EntuEntity): boolean {
  return entity._sharing?.some((s: EntuStringProperty) => s.string === 'public') || false
}

/**
 * Check if entity has domain sharing
 */
export function isEntityDomainShared(entity: EntuEntity): boolean {
  return entity._sharing?.some((s: EntuStringProperty) => s.string === 'domain') || false
}

/**
 * Check if entity is private
 */
export function isEntityPrivate(entity: EntuEntity): boolean {
  return entity._sharing?.some((s: EntuStringProperty) => s.string === 'private') || false
}
