/**
 * Main task detail composable - modular architecture
 * Combines functionality from specialized composables for task detail management
 *
 * This composable maintains backward compatibility while using a modular approach
 * for better maintainability and testing.
 */
/**
 * Modular Task Detail Composable
 * Combines specialized composables for comprehensive task detail functionality
 * @file useTaskDetailModular.js
 */

import { useTaskData } from './useTaskData.js'
import { useTaskPermissions } from './useTaskPermissions.js'
import { useTaskLocation } from './useTaskLocation.js'
import { useTaskResponse } from './useTaskResponse.js'

/**
 * Main task detail composable
 * Provides comprehensive task detail functionality through modular composables
 */
export function useTaskDetail () {
  // Import specialized composables
  const taskDataComposable = useTaskData()
  const permissionsComposable = useTaskPermissions()
  const locationComposable = useTaskLocation()
  const responseComposable = useTaskResponse()

  return {
    // Re-export all functionality from specialized composables
    ...taskDataComposable,
    ...permissionsComposable,
    ...locationComposable,
    ...responseComposable
  }
}
