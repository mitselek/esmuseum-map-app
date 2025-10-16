/**
 * Type definitions for student onboarding flow (FEAT-001)
 */

/**
 * State for the onboarding process
 */
export interface OnboardingState {
  /** Whether the user is currently waiting for group assignment */
  isWaiting: boolean
  /** Error message if something went wrong, null if no error */
  error: string | null
  /** Whether the onboarding process has timed out */
  hasTimedOut: boolean
}

/**
 * Request body for group assignment endpoint
 */
export interface GroupAssignmentRequest {
  /** Entu group entity ID */
  groupId: string
  /** Authenticated user's Entu person ID */
  userId: string
}

/**
 * Response from group assignment endpoint
 */
export interface GroupAssignmentResponse {
  /** Whether the operation was successful */
  success: boolean
  /** Optional success message */
  message?: string
  /** Optional error message if success is false */
  error?: string
}
