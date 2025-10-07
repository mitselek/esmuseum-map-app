/**
 * Contract for DST transition information
 * Optional type for debugging and testing
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
   * End of repeated hour period (4:00 AM standard time)
   */
  endTime: Date

  /**
   * Whether currently within the repeated hour window
   */
  isActive: boolean
}
