/**
 * DST (Daylight Saving Time) Transition Types
 * Feature F028 - Evil DST Map Schedule
 */

/**
 * Information about the DST "fall back" transition in Estonia
 * When clocks go back 1 hour (4 AM → 3 AM) on last Sunday of October
 */
export interface DSTTransitionInfo {
  /**
   * The date of DST transition (last Sunday of October)
   */
  transitionDate: Date

  /**
   * Start of repeated hour period (3:00 AM local time)
   */
  startTime: Date

  /**
   * End of repeated hour period (4:00 AM standard time, after transition)
   */
  endTime: Date

  /**
   * Whether currently within the repeated hour window
   */
  isActive: boolean
}
