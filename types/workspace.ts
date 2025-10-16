/**
 * Type definitions for task workspace and form management
 * Created for TypeScript Constitutional Compliance Audit (Issue #14)
 */

/**
 * User response data structure for task submissions
 * Used in useTaskWorkspace for form persistence
 */
export interface UserResponseData {
  /** Text response content */
  textResponse?: string
  
  /** Uploaded file references */
  files?: File[]
  
  /** GPS coordinates captured during response */
  coordinates?: {
    latitude?: number
    longitude?: number
  }
  
  /** Manually entered coordinates */
  manualCoordinates?: {
    latitude?: string
    longitude?: string
  }
  
  /** Timestamp of last save */
  timestamp?: number
  
  /** Selected location reference (for location-based responses) */
  selectedLocationId?: string
  
  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Uploaded file structure from multipart form data
 * Used in server upload proxy
 */
export interface UploadedFile {
  /** Field name from form data */
  name?: string
  
  /** Original filename */
  filename?: string
  
  /** MIME type */
  type?: string
  
  /** File data buffer */
  data: Buffer
}

/**
 * Headers for DigitalOcean Spaces upload
 * Compatible with fetch HeadersInit
 */
export type UploadHeaders = Record<string, string>
