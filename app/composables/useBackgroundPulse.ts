/**
 * Background Pulse Composable
 * Feature F028 - Evil DST Map Schedule
 * 
 * Manages red pulsating background effect during DST "fall back" transition
 * when the hour from 3:00 AM to 4:00 AM repeats twice (last Sunday of October)
 */

/**
 * useBackgroundPulse composable
 * 
 * Provides methods to activate/deactivate a red pulsating background effect
 * by manipulating the document.body CSS class. The animation itself is defined
 * in app/assets/tailwind.css as @keyframes evil-dst-pulse.
 * 
 * @returns Object with isDSTActive ref and activate/deactivate methods
 * 
 * @example
 * ```typescript
 * const { isDSTActive, activatePulse, deactivatePulse } = useBackgroundPulse()
 * 
 * // Activate during DST transition
 * activatePulse()
 * console.log(isDSTActive.value) // true
 * 
 * // Deactivate after transition
 * deactivatePulse()
 * console.log(isDSTActive.value) // false
 * ```
 */
export function useBackgroundPulse() {
  /**
   * Reactive state tracking whether DST background pulsation is currently active
   */
  const isDSTActive = ref<boolean>(false)

  /**
   * Activate the red pulsating background effect
   * 
   * Adds the 'evil-dst-active' CSS class to document.body, which triggers
   * the @keyframes evil-dst-pulse animation (1.0 second heartbeat rhythm).
   * Updates isDSTActive ref to true.
   */
  const activatePulse = (): void => {
    if (!import.meta.client) return // SSR safety check

    isDSTActive.value = true
    document.body.classList.add('evil-dst-active')
  }

  /**
   * Deactivate the background pulsation effect
   * 
   * Removes the 'evil-dst-active' CSS class from document.body, stopping
   * the animation. Updates isDSTActive ref to false.
   */
  const deactivatePulse = (): void => {
    if (!import.meta.client) return // SSR safety check

    isDSTActive.value = false
    document.body.classList.remove('evil-dst-active')
  }

  return {
    isDSTActive,
    activatePulse,
    deactivatePulse
  }
}
