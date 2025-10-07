/**
 * Contract for DST transition detection functions
 * Added to useMapStyleScheduler composable
 */

/**
 * Calculate the last Sunday of October for a given year
 * This is the date when EU daylight saving time ends
 * 
 * @param year - The year to calculate for (e.g., 2025)
 * @returns Date object representing the last Sunday of October at midnight
 */
export type GetLastSundayOfOctober = (year: number) => Date

/**
 * Check if the current time is during the DST "fall back" transition
 * The repeated hour (3:00 AM - 4:00 AM occurs twice) on last Sunday of October
 * 
 * @returns true if currently in the repeated hour period, false otherwise
 */
export type IsDSTTransition = () => boolean

/**
 * DST rule configuration for styleRules array
 */
export interface DSTStyleRule {
  id: 'dst-transition'
  name: 'Evil DST Transition'
  description: 'Black & white toner + red pulse during fall DST transition (3-4 AM repeated hour)'
  styleId: 'toner'
  priority: 100  // HIGH priority - overrides all other rules
  check: IsDSTTransition
}
