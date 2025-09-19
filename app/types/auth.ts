/**
 * TypeScript Type Definitions for Estonian War Museum Authentication System
 * 
 * Single source of truth for all data contracts and interfaces
 * These types match the actual Entu entity structure exactly
 */

// =============================================================================
// ENTU ENTITY INTERFACES (Read-Only)
// =============================================================================

/**
 * Entu Person Entity
 * Source: Actual Entu person entity structure
 * Usage: Student profiles, authentication, enrollment detection
 */
export interface EntuPerson {
  /** Entu entity identifier */
  _id: string
  
  /** Entity type - always "person" */
  _type: "person"
  
  /** Email address linked to Entu authentication */
  entu_user: string
  
  /** Primary email address */
  email: string
  
  /** First name */
  forename: string
  
  /** Last name */
  surname: string
  
  /** Estonian personal identification code (optional - indicates Estonian vs International student) */
  idcode?: string
  
  /** Parent entity references - includes group enrollments */
  _parent: Array<{
    /** Referenced entity ID */
    reference: string
    /** Entity type (grupp for educational groups) */
    entity_type: string
    /** Human-readable name of referenced entity */
    string: string
  }>
  
  /** Profile image data (optional) */
  photo?: {
    /** Image filename */
    filename: string
    /** File size in bytes */
    filesize: number
    /** MIME type */
    filetype: string
  }
  
  /** Entity creation timestamp */
  _created: string
}

/**
 * Entu Group Entity 
 * Source: Actual Entu group entity structure
 * Usage: Educational groups, course information, access control
 */
export interface EntuGroup {
  /** Entu entity identifier */
  _id: string
  
  /** Entity type - always "grupp" */
  _type: "grupp"
  
  /** Group/class name */
  name: string
  
  /** Multi-language descriptions */
  kirjeldus: Array<{
    /** Description text */
    string: string
    /** Language code (et/en) */
    language: string
  }>
  
  /** Group leader/teacher (optional) */
  grupijuht?: {
    /** Reference to person entity */
    reference: string
    /** Leader's name */
    string: string
    /** Entity type */
    entity_type: string
  }
  
  /** Parent entity references (optional) */
  _parent?: Array<{
    reference: string
    entity_type: string
    string: string
  }>
}

// =============================================================================
// APPLICATION INTERFACES (ESMuseum Specific)
// =============================================================================

/**
 * Complete User Profile 
 * Cached in localStorage after authentication
 * Combines Entu person + associated groups for offline access
 */
export interface UserProfile {
  /** Entu person entity */
  person: EntuPerson
  
  /** Entu groups this person is enrolled in */
  groups: EntuGroup[]
  
  /** Profile cache timestamp */
  authenticated_at: string
  
  /** Profile expiration timestamp */
  expires_at: string
}

/**
 * Student Type Classification
 * Based on presence of Estonian ID code
 */
export type StudentType = 'ESTONIAN' | 'INTERNATIONAL'

/**
 * Processed Group Information
 * Extracted from EntuGroup for display purposes
 */
export interface GroupInfo {
  /** Group ID (group._id) */
  id: string
  
  /** Group name */
  name: string
  
  /** Group description in selected language */
  description: string
  
  /** Teacher name (or null if not assigned) */
  teacher: string | null
  
  /** Selected language for description */
  language: string
}

/**
 * Authentication Result
 * Returned by authentication composables
 */
export interface AuthResult {
  /** Whether authentication was successful */
  success: boolean
  
  /** User profile if authentication succeeded */
  userProfile?: UserProfile
  
  /** Error message if authentication failed */
  error?: string
  
  /** Error code for specific error types */
  code?: string
  
  /** Source of the profile data */
  source?: 'cache' | 'entu' | 'validated'
}

/**
 * Educational Event for Logging
 * Minimal data structure for activity tracking
 */
export interface EducationalEvent {
  /** Unique event identifier */
  id: string
  
  /** Type of educational event */
  event_type: 'ACTIVITY_STARTED' | 'ACTIVITY_COMPLETED' | 'GROUP_ACCESS' | 'TASK_SUBMISSION' | 'LOCATION_CAPTURED'
  
  /** Reference to Entu person ID */
  entu_person_id: string
  
  /** Reference to Entu group ID (optional) */
  entu_group_id?: string
  
  /** Activity-specific data */
  activity_data?: Record<string, any>
  
  /** GPS location data (optional) */
  location_data?: {
    latitude: number
    longitude: number
    accuracy: number
  }
  
  /** Event timestamp */
  created_at: string
}

// =============================================================================
// UTILITY TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if person is Estonian student
 */
export function isEstonianStudent(person: EntuPerson): boolean {
  return person.idcode !== undefined && person.idcode !== null
}

/**
 * Type guard to check if user is enrolled in specific group
 */
export function isEnrolledInGroup(profile: UserProfile, groupId: string): boolean {
  return profile.person._parent.some(parent => 
    parent.reference === groupId && parent.entity_type === "grupp"
  )
}

// =============================================================================
// API RESPONSE INTERFACES
// =============================================================================

/**
 * Profile Validation API Response
 */
export interface ProfileValidationResponse {
  /** Whether the profile is still valid */
  valid: boolean
  
  /** Entu person ID from JWT token */
  entu_person_id: string
  
  /** List of group IDs user has access to */
  groups_access?: string[]
}

/**
 * Educational Event API Response
 */
export interface EducationalEventResponse {
  /** Generated event ID */
  event_id: string
  
  /** Event processing status */
  status: 'LOGGED' | 'VALIDATED'
  
  /** Processing message */
  message?: string
}

/**
 * Standard Error Response
 */
export interface ErrorResponse {
  /** Error code */
  error: string
  
  /** Human-readable error message */
  message: string
  
  /** Additional error details */
  details?: Record<string, any>
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Supported languages */
export const SUPPORTED_LANGUAGES = ['et', 'en'] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

/** Educational event types */
export const EVENT_TYPES = [
  'ACTIVITY_STARTED',
  'ACTIVITY_COMPLETED', 
  'GROUP_ACCESS',
  'TASK_SUBMISSION',
  'LOCATION_CAPTURED'
] as const
export type EventType = typeof EVENT_TYPES[number]

/** Student types */
export const STUDENT_TYPES = ['ESTONIAN', 'INTERNATIONAL'] as const