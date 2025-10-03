/**
 * TypeScript type definitions for Entu entities
 * Based on sample data from .copilot-workspace/model/
 * 
 * Entu entities follow a specific pattern where all properties are arrays of objects
 * containing an _id and a value field (string, reference, number, boolean, datetime, etc.)
 */

// ============================================================================
// Base Property Types
// ============================================================================

/**
 * Base structure for all Entu property values
 */
export interface EntuPropertyBase {
  _id: string
}

/**
 * String property value
 */
export interface EntuStringProperty extends EntuPropertyBase {
  string: string
  language?: string
}

/**
 * Reference property value - links to another entity
 */
export interface EntuReferenceProperty extends EntuPropertyBase {
  reference: string
  property_type?: string
  string?: string
  entity_type?: string
  inherited?: boolean
}

/**
 * Number property value
 */
export interface EntuNumberProperty extends EntuPropertyBase {
  number: number
}

/**
 * Boolean property value
 */
export interface EntuBooleanProperty extends EntuPropertyBase {
  boolean: boolean
}

/**
 * DateTime property value
 */
export interface EntuDateTimeProperty extends EntuPropertyBase {
  datetime: string
  reference?: string
  property_type?: string
  string?: string
  entity_type?: string
}

/**
 * File property value
 */
export interface EntuFileProperty extends EntuPropertyBase {
  filename: string
  filesize: number
  filetype: string
}

/**
 * Date property value (date without time)
 */
export interface EntuDateProperty extends EntuPropertyBase {
  date: string
}

/**
 * Union type for all property value types
 */
export type EntuProperty = 
  | EntuStringProperty 
  | EntuReferenceProperty 
  | EntuNumberProperty 
  | EntuBooleanProperty 
  | EntuDateTimeProperty 
  | EntuFileProperty
  | EntuDateProperty

// ============================================================================
// Base Entity Interface
// ============================================================================

/**
 * Base interface for all Entu entities
 * Contains common system properties that all entities have
 */
export interface EntuEntity {
  /** Unique entity identifier */
  _id: string
  
  /** Entity type definition */
  _type: EntuReferenceProperty[]
  
  /** Parent entity references (folder, database, or other parent) */
  _parent?: EntuReferenceProperty[]
  
  /** Owner references (users or database who own this entity) */
  _owner?: EntuReferenceProperty[]
  
  /** Creation metadata */
  _created?: EntuDateTimeProperty[]
  
  /** Sharing level (private, domain, public) */
  _sharing?: EntuStringProperty[]
  
  /** Whether entity inherits rights from parent */
  _inheritrights?: EntuBooleanProperty[]
  
  /** Entities that can view this entity */
  _viewer?: EntuReferenceProperty[]
  
  /** Entities that can expand/view details of this entity */
  _expander?: EntuReferenceProperty[]
  
  /** Entities that can edit this entity */
  _editor?: EntuReferenceProperty[]
  
  /** Inherited viewer permissions from parent */
  _parent_viewer?: EntuReferenceProperty[]
  
  /** Inherited expander permissions from parent */
  _parent_expander?: EntuReferenceProperty[]
  
  /** Inherited editor permissions from parent */
  _parent_editor?: EntuReferenceProperty[]
  
  /** Inherited owner permissions from parent */
  _parent_owner?: EntuReferenceProperty[]
  
  /** Reference properties that link to this entity */
  _reference?: EntuReferenceProperty[]
  
  /** Thumbnail URL for entities with images */
  _thumbnail?: string
}

// ============================================================================
// Entity-Specific Interfaces
// ============================================================================

/**
 * Task entity (ulesanne)
 * Educational assignments that can be assigned to groups with deadlines and map associations
 */
export interface EntuTask extends EntuEntity {
  /** Task name */
  name: EntuStringProperty[]
  
  /** Associated map reference */
  kaart?: EntuReferenceProperty[]
  
  /** Assigned group reference */
  grupp?: EntuReferenceProperty[]
  
  /** Task description */
  kirjeldus?: EntuStringProperty[]
  
  /** Deadline for task completion */
  tahtaeg?: EntuDateTimeProperty[]
  
  /** Number of responses submitted */
  vastuseid?: EntuNumberProperty[]
}

/**
 * Response entity (vastus)
 * Submissions and responses to assignments, can include location data and photos
 */
export interface EntuResponse extends EntuEntity {
  /** Location reference */
  asukoht?: EntuReferenceProperty[]
  
  /** Response description/text */
  kirjeldus?: EntuStringProperty[]
  
  /** Response photo */
  photo?: EntuFileProperty[]
  
  /** GPS coordinates (lat,lng format) */
  geopunkt?: EntuStringProperty[]
}

/**
 * Location entity (asukoht)
 * Geographical points with coordinates and descriptions
 */
export interface EntuLocation extends EntuEntity {
  /** Location name */
  name: EntuStringProperty[]
  
  /** Location description */
  kirjeldus?: EntuStringProperty[]
  
  /** Latitude coordinate */
  lat?: EntuNumberProperty[]
  
  /** Longitude coordinate */
  long?: EntuNumberProperty[]
}

/**
 * Map entity (kaart)
 * Geographical content containers that hold multiple locations
 */
export interface EntuMap extends EntuEntity {
  /** Map name */
  name: EntuStringProperty[]
  
  /** Map URL (external link to Google Maps, etc.) */
  url?: EntuStringProperty[]
  
  /** Map description */
  kirjeldus?: EntuStringProperty[]
}

/**
 * Group entity (grupp)
 * User organization for managing task assignments
 */
export interface EntuGroup extends EntuEntity {
  /** Group name */
  name: EntuStringProperty[]
  
  /** Group description */
  kirjeldus?: EntuStringProperty[]
  
  /** Group leader/teacher reference */
  grupijuht?: EntuReferenceProperty[]
}

/**
 * Person entity (person)
 * Comprehensive person management with authentication
 */
export interface EntuPerson extends EntuEntity {
  /** Full name */
  name?: EntuStringProperty[]
  
  /** First name */
  forename?: EntuStringProperty[]
  
  /** Last name */
  surname?: EntuStringProperty[]
  
  /** Email address */
  email?: EntuStringProperty[]
  
  /** Entu user account email */
  entu_user?: EntuStringProperty[]
  
  /** Estonian personal identification code */
  idcode?: EntuStringProperty[]
  
  /** Profile photo */
  photo?: EntuFileProperty[]
  
  /** API key for programmatic access */
  entu_api_key?: EntuStringProperty[]
  
  /** Birth date */
  birthdate?: EntuDateProperty[]
  
  /** Address */
  address?: EntuStringProperty[]
  
  /** City */
  city?: EntuStringProperty[]
  
  /** County */
  county?: EntuStringProperty[]
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Helper type to extract the first element from an Entu property array
 */
export type FirstProperty<T extends any[]> = T extends [infer First, ...any[]] ? First : T[0] | undefined

/**
 * Helper type to get the value type from an Entu property array
 */
export type PropertyValue<T> = T extends EntuStringProperty[] 
  ? string 
  : T extends EntuReferenceProperty[]
  ? string
  : T extends EntuNumberProperty[]
  ? number
  : T extends EntuBooleanProperty[]
  ? boolean
  : T extends EntuDateTimeProperty[]
  ? string
  : T extends EntuFileProperty[]
  ? EntuFileProperty
  : T extends EntuDateProperty[]
  ? string
  : never

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a property is a string property
 */
export function isStringProperty(prop: EntuProperty): prop is EntuStringProperty {
  return 'string' in prop
}

/**
 * Type guard to check if a property is a reference property
 */
export function isReferenceProperty(prop: EntuProperty): prop is EntuReferenceProperty {
  return 'reference' in prop
}

/**
 * Type guard to check if a property is a number property
 */
export function isNumberProperty(prop: EntuProperty): prop is EntuNumberProperty {
  return 'number' in prop
}

/**
 * Type guard to check if a property is a boolean property
 */
export function isBooleanProperty(prop: EntuProperty): prop is EntuBooleanProperty {
  return 'boolean' in prop
}

/**
 * Type guard to check if a property is a datetime property
 */
export function isDateTimeProperty(prop: EntuProperty): prop is EntuDateTimeProperty {
  return 'datetime' in prop
}

/**
 * Type guard to check if a property is a file property
 */
export function isFileProperty(prop: EntuProperty): prop is EntuFileProperty {
  return 'filename' in prop && 'filesize' in prop && 'filetype' in prop
}

/**
 * Type guard to check if an entity is a task
 */
export function isTask(entity: EntuEntity): entity is EntuTask {
  return entity._type?.[0]?.string === 'ulesanne'
}

/**
 * Type guard to check if an entity is a response
 */
export function isResponse(entity: EntuEntity): entity is EntuResponse {
  return entity._type?.[0]?.string === 'vastus'
}

/**
 * Type guard to check if an entity is a location
 */
export function isLocation(entity: EntuEntity): entity is EntuLocation {
  return entity._type?.[0]?.string === 'asukoht'
}

/**
 * Type guard to check if an entity is a map
 */
export function isMap(entity: EntuEntity): entity is EntuMap {
  return entity._type?.[0]?.string === 'kaart'
}

/**
 * Type guard to check if an entity is a group
 */
export function isGroup(entity: EntuEntity): entity is EntuGroup {
  return entity._type?.[0]?.string === 'grupp'
}

/**
 * Type guard to check if an entity is a person
 */
export function isPerson(entity: EntuEntity): entity is EntuPerson {
  return entity._type?.[0]?.string === 'person'
}
