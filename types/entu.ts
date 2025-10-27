/**
 * TypeScript type definitions for Entu entities
 * Based on sample data from .copilot-workspace/model/
 *
 * Entu entities follow a specific pattern where all properties are arrays of objects
 * containing an _id and a value field (string, reference, number, boolean, datetime, etc.)
 *
 * **Type Safety**: All entity IDs (_id, reference) use the branded EntuEntityId type
 * to prevent mixing entity IDs with regular strings.
 *
 * **Entity ID Conversion**:
 * - Use `toEntuEntityId(str)` to safely convert and validate strings
 * - Use `isEntuEntityId(str)` for type guards and narrowing
 * - Use `as EntuEntityId` for test fixtures and known-valid literals
 *
 * **Property Type Guards**:
 * Use type guards for runtime property type narrowing and safer property access:
 * 
 * @example
 * // Type narrowing with property guards
 * function processProperty(prop: EntuProperty) {
 *   if (isStringProperty(prop)) {
 *     console.log(prop.string)  // TypeScript knows this exists
 *     if (prop.markdown) {
 *       // Render as markdown
 *     }
 *   } else if (isNumberProperty(prop)) {
 *     console.log(prop.number)
 *     if (prop.decimals) {
 *       // Format with specific decimal places
 *     }
 *   } else if (isReferenceProperty(prop)) {
 *     const entityId: EntuEntityId = prop.reference
 *     // Load referenced entity
 *   }
 * }
 *
 * **Schema Type Mapping**:
 * Entu schema types map to TypeScript interfaces as follows:
 * 
 * | Schema Type | Interface            | Value Field | Notes                    |
 * |-------------|---------------------|-------------|--------------------------|
 * | string      | EntuStringProperty  | string      | Single-line text         |
 * | text        | EntuStringProperty  | string      | Multi-line, markdown opt |
 * | number      | EntuNumberProperty  | number      | Numeric values           |
 * | boolean     | EntuBooleanProperty | boolean     | True/false               |
 * | reference   | EntuReferenceProperty| reference  | Entity ID reference      |
 * | datetime    | EntuDateTimeProperty | datetime   | ISO 8601 datetime        |
 * | date        | EntuDateProperty    | date        | ISO 8601 date            |
 * | file        | EntuFileProperty    | filename, filesize, filetype | File metadata |
 */

// ============================================================================
// Branded Types for Type Safety
// ============================================================================

/**
 * Branded type for Entu entity IDs (MongoDB ObjectIds)
 *
 * Entu entity IDs are 24-character hexadecimal strings representing MongoDB ObjectIds.
 * This branded type provides compile-time type safety to prevent mixing entity IDs
 * with regular strings.
 *
 * Format: 24-character hexadecimal string (case-insensitive)
 * Example: "6889db9a5d95233e69c2b490"
 *
 * Usage:
 * ```typescript
 * const entityId: EntuEntityId = toEntuEntityId("6889db9a5d95233e69c2b490")
 * const taskId: string = "some-id" // Cannot be assigned to EntuEntityId without conversion
 * ```
 *
 * Constitutional Alignment: Type Safety First (Principle I)
 */
export type EntuEntityId = string & { readonly __brand: 'EntuEntityId' }

/**
 * Validation regex for MongoDB ObjectId format (24-character hexadecimal)
 */
const ENTU_ENTITY_ID_REGEX = /^[a-f0-9]{24}$/i

/**
 * Type guard to check if a string is a valid Entu entity ID
 *
 * @param value - String to validate
 * @returns True if value is a valid 24-character hex string
 *
 * @example
 * ```typescript
 * if (isEntuEntityId(someString)) {
 *   // TypeScript knows someString is EntuEntityId here
 *   const id: EntuEntityId = someString
 * }
 * ```
 */
export function isEntuEntityId (value: string): value is EntuEntityId {
  return ENTU_ENTITY_ID_REGEX.test(value)
}

/**
 * Safely convert a string to EntuEntityId with validation
 *
 * Validates the input string matches MongoDB ObjectId format (24-character hex).
 * Throws an error if validation fails.
 *
 * @param value - String to convert
 * @returns Branded EntuEntityId
 * @throws {Error} If value is not a valid 24-character hex string
 *
 * @example
 * ```typescript
 * try {
 *   const entityId = toEntuEntityId("6889db9a5d95233e69c2b490") // ✅ Valid
 *   const invalidId = toEntuEntityId("invalid") // ❌ Throws Error
 * } catch (error) {
 *   console.error("Invalid entity ID:", error.message)
 * }
 * ```
 */
export function toEntuEntityId (value: string): EntuEntityId {
  if (!isEntuEntityId(value)) {
    throw new Error(
      `Invalid Entu entity ID format: "${value}". Expected 24-character hexadecimal string.`,
    )
  }
  return value
}

// ============================================================================
// Base Property Types
// ============================================================================

/**
 * Base structure for all Entu property values
 */
export interface EntuPropertyBase {
  _id: EntuEntityId
}

/**
 * String property value
 * 
 * Handles both 'string' (single-line) and 'text' (multi-line) schema types.
 * Both types use the 'string' field in API responses.
 */
export interface EntuStringProperty extends EntuPropertyBase {
  propertyType?: 'string' | 'text'
  string: string
  language?: string
  markdown?: boolean
}

/**
 * Reference property value - links to another entity
 */
export interface EntuReferenceProperty extends EntuPropertyBase {
  propertyType?: 'reference'
  reference: EntuEntityId
  property_type?: string
  string?: string
  entity_type?: string
  inherited?: boolean
}

/**
 * Number property value
 */
export interface EntuNumberProperty extends EntuPropertyBase {
  propertyType?: 'number'
  number: number
  decimals?: number
}

/**
 * Boolean property value
 */
export interface EntuBooleanProperty extends EntuPropertyBase {
  propertyType?: 'boolean'
  boolean: boolean
}

/**
 * DateTime property value
 */
export interface EntuDateTimeProperty extends EntuPropertyBase {
  propertyType?: 'datetime'
  datetime: string
  reference?: EntuEntityId
  property_type?: string
  string?: string
  entity_type?: string
}

/**
 * File property value
 */
export interface EntuFileProperty extends EntuPropertyBase {
  propertyType?: 'file'
  filename: string
  filesize: number
  filetype: string
}

/**
 * Date property value (date without time)
 */
export interface EntuDateProperty extends EntuPropertyBase {
  propertyType?: 'date'
  date: string
}

/**
 * Union type for all property value types
 */
export type EntuProperty
  = | EntuStringProperty
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
  _id: EntuEntityId

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
  /** Selected location reference (which location the student chose to respond about) */
  valitud_asukoht?: EntuReferenceProperty[]

  /** Response text/answer */
  vastus?: EntuStringProperty[]

  /** Response photo */
  photo?: EntuFileProperty[]

  /** Device GPS coordinates at submission time (where the student was physically located) */
  seadme_gps?: EntuStringProperty[]
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
 * Entu API response wrapper for single entity
 * The API returns entities wrapped in an "entity" property
 */
export interface EntuEntityResponse<T extends EntuEntity = EntuEntity> {
  entity: T
}

/**
 * Entu API response wrapper for entity list
 */
export interface EntuEntityListResponse<T extends EntuEntity = EntuEntity> {
  entities: T[]
  count?: number
}

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

// ============================================================================
// Property Type Guards
// ============================================================================

/**
 * Type guard for string/text properties
 * 
 * Checks for presence of 'string' field while excluding reference and datetime
 * properties which also have optional string fields.
 * 
 * @param prop - Property to check
 * @returns True if prop is a string/text property
 * 
 * @example
 * if (isStringProperty(prop)) {
 *   console.log(prop.string) // TypeScript knows this exists
 *   if (prop.markdown) {
 *     // Handle markdown rendering
 *   }
 * }
 */
export function isStringProperty (prop: EntuProperty): prop is EntuStringProperty {
  return 'string' in prop && !('reference' in prop) && !('datetime' in prop)
}

/**
 * Type guard for reference properties
 * 
 * Checks for presence of 'reference' field while excluding datetime properties
 * which also have optional reference fields.
 * 
 * @param prop - Property to check
 * @returns True if prop is a reference property
 */
export function isReferenceProperty (prop: EntuProperty): prop is EntuReferenceProperty {
  return 'reference' in prop && !('datetime' in prop)
}

/**
 * Type guard for number properties
 * 
 * Checks for presence of 'number' field while excluding boolean properties
 * which might coexist in complex scenarios.
 * 
 * @param prop - Property to check
 * @returns True if prop is a number property
 */
export function isNumberProperty (prop: EntuProperty): prop is EntuNumberProperty {
  return 'number' in prop && !('boolean' in prop)
}

/**
 * Type guard for boolean properties
 * 
 * @param prop - Property to check
 * @returns True if prop is a boolean property
 */
export function isBooleanProperty (prop: EntuProperty): prop is EntuBooleanProperty {
  return 'boolean' in prop
}

/**
 * Type guard for datetime properties
 * 
 * @param prop - Property to check
 * @returns True if prop is a datetime property
 */
export function isDateTimeProperty (prop: EntuProperty): prop is EntuDateTimeProperty {
  return 'datetime' in prop
}

/**
 * Type guard for date properties
 * 
 * @param prop - Property to check
 * @returns True if prop is a date property
 */
export function isDateProperty (prop: EntuProperty): prop is EntuDateProperty {
  return 'date' in prop
}

/**
 * Type guard for file properties
 * 
 * @param prop - Property to check
 * @returns True if prop is a file property
 */
export function isFileProperty (prop: EntuProperty): prop is EntuFileProperty {
  return 'filename' in prop && 'filesize' in prop && 'filetype' in prop
}

/**
 * Type guard to check if an entity is a task
 */
export function isTask (entity: EntuEntity): entity is EntuTask {
  return entity._type?.[0]?.string === 'ulesanne'
}

/**
 * Type guard to check if an entity is a response
 */
export function isResponse (entity: EntuEntity): entity is EntuResponse {
  return entity._type?.[0]?.string === 'vastus'
}

/**
 * Type guard to check if an entity is a location
 */
export function isLocation (entity: EntuEntity): entity is EntuLocation {
  return entity._type?.[0]?.string === 'asukoht'
}

/**
 * Type guard to check if an entity is a map
 */
export function isMap (entity: EntuEntity): entity is EntuMap {
  return entity._type?.[0]?.string === 'kaart'
}

/**
 * Type guard to check if an entity is a group
 */
export function isGroup (entity: EntuEntity): entity is EntuGroup {
  return entity._type?.[0]?.string === 'grupp'
}

/**
 * Type guard to check if an entity is a person
 */
export function isPerson (entity: EntuEntity): entity is EntuPerson {
  return entity._type?.[0]?.string === 'person'
}
