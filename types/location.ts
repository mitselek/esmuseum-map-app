/**
 * Location type definitions
 * 
 * This module provides canonical types for working with location data
 * throughout the application, bridging Entu API format and normalized
 * internal representations.
 */

import type { EntuLocation } from './entu'

/**
 * Coordinates in standard lat/lng format
 */
export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Normalized location format used internally by components
 * 
 * This is the standard format for locations throughout the app.
 * All components should use this format for props, state, and rendering.
 */
export interface NormalizedLocation {
  /** Entu entity ID */
  _id: string

  /** Entu reference field (if available) */
  reference?: string

  /** Location name */
  name?: string

  /** Location description */
  description?: string

  /** GPS coordinates */
  coordinates: Coordinates

  /** Distance from user (meters) - added by geolocation service */
  distance?: number
}

/**
 * Type alias for task locations
 * 
 * Use this type in components that work with task locations.
 * It's an alias to NormalizedLocation for semantic clarity.
 */
export type TaskLocation = NormalizedLocation

/**
 * Re-export EntuLocation for convenience
 * This is the format returned by Entu API
 */
export type { EntuLocation }
