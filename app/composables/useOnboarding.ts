/**
 * Student Onboarding Composable (FEAT-001)
 *
 * Manages the student group joining flow:
 * 1. Call server endpoint to assign student to group
 * 2. Poll Entu API to confirm membership
 * 3. Handle timeout and errors
 *
 * @see specs/030-student-onboarding-flow/spec.md
 */

import { ref, onUnmounted } from 'vue'
import type { OnboardingState, GroupAssignmentResponse } from '../../types/onboarding'

export function useOnboarding () {
  const state = ref<OnboardingState>({
    isWaiting: false,
    error: null,
    hasTimedOut: false
  })

  let pollingInterval: NodeJS.Timeout | null = null
  const POLLING_INTERVAL_MS = 2000 // 2 seconds
  const POLLING_TIMEOUT_MS = 30000 // 30 seconds

  /**
   * Join a group by calling the server endpoint
   * @param groupId Entu group ID
   * @param userId Entu user ID (from auth token)
   * @returns Promise<GroupAssignmentResponse>
   */
  async function joinGroup (groupId: string, userId: string): Promise<GroupAssignmentResponse> {
    try {
      state.value.isWaiting = true
      state.value.error = null
      state.value.hasTimedOut = false

      const response = await $fetch<GroupAssignmentResponse>('/api/onboard/join-group', {
        method: 'POST',
        body: {
          groupId,
          userId
        }
      })

      if (!response.success) {
        state.value.error = response.error || 'Failed to join group'
        state.value.isWaiting = false
      }
      else {
        // Success: reset isWaiting (will be set again during polling if needed)
        state.value.isWaiting = false
      }

      return response
    }
    catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      state.value.error = errorMessage
      state.value.isWaiting = false

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Poll the server to check if the user has been added to the group
   * Checks every 2 seconds for up to 30 seconds
   *
   * @param groupId Entu group ID
   * @param userId Entu user ID
   * @returns Promise<boolean> - true if membership confirmed, false if timeout
   */
  async function pollGroupMembership (groupId: string, userId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now()

      pollingInterval = setInterval(async () => {
        try {
          // Check membership via server endpoint
          const response = await $fetch<{ isMember: boolean }>(
            `/api/onboard/check-membership?groupId=${groupId}&userId=${userId}`
          )

          if (response.isMember) {
            cleanup()
            state.value.isWaiting = false
            resolve(true)
            return
          }
        }
        catch (error: unknown) {
          // Continue polling on errors (network issues, etc.)
          console.warn('Polling error:', error)
        }

        // Check for timeout AFTER polling attempt
        const elapsed = Date.now() - startTime

        if (elapsed >= POLLING_TIMEOUT_MS) {
          cleanup()
          state.value.hasTimedOut = true
          state.value.isWaiting = false
          state.value.error = 'Timeout: Could not confirm group membership'
          resolve(false)
          return
        }
      }, POLLING_INTERVAL_MS)
    })
  }

  /**
   * Clean up polling interval
   */
  function cleanup () {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  /**
   * Reset state (for testing or re-trying)
   */
  function reset () {
    cleanup()
    state.value = {
      isWaiting: false,
      error: null,
      hasTimedOut: false
    }
  }

  // Cleanup on unmount
  if (import.meta.client) {
    onUnmounted(() => {
      cleanup()
    })
  }

  return {
    state,
    joinGroup,
    pollGroupMembership,
    cleanup,
    reset
  }
}
