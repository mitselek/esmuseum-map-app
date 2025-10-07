/**
 * Contract for useBackgroundPulse composable
 * Manages red pulsating background effect during DST transition
 */

export interface UseBackgroundPulseReturn {
  /**
   * Reactive boolean indicating if DST pulsation is currently active
   */
  isDSTActive: import('vue').Ref<boolean>

  /**
   * Activate the red pulsating background effect
   * Adds 'evil-dst-active' class to document.body
   */
  activatePulse: () => void

  /**
   * Deactivate the background pulsation effect
   * Removes 'evil-dst-active' class from document.body
   */
  deactivatePulse: () => void
}

/**
 * Composable function signature
 */
export type UseBackgroundPulse = () => UseBackgroundPulseReturn
