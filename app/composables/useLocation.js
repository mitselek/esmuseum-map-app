/**
 * Modular Location Composable
 * Combines specialized location composables for comprehensive location functionality
 * @file useLocationModular.js
 */

import { useGeolocation } from './useGeolocation.js'
import { useLocationData } from './useLocationData.js'
import { useLocationFormatting } from './useLocationFormatting.js'

/**
 * Main location composable
 * Provides comprehensive location functionality through modular composables
 */
export function useLocation () {
  const geolocationComposable = useGeolocation()
  const locationDataComposable = useLocationData()
  const locationFormattingComposable = useLocationFormatting()

  return {
    ...geolocationComposable,
    ...locationDataComposable,
    ...locationFormattingComposable
  }
}
