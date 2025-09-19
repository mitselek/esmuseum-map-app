/**
 * Task Loading and Management Composable
 * Handles task fetching from Entu API and group management
 * @file useTaskLoading.ts
 */

/**
 * Task loading composable
 * Provides task fetching functionality from user groups
 */
export function useTaskLoading () {
  const { user, token } = useEntuAuth()
  const { searchEntities, getEntity } = useEntuApi()

  /**
   * Load tasks for the current user from their groups
   */
  const loadTasks = async () => {
    const currentUser = user.value as any
    if (!currentUser?._id) {
      console.warn('No user ID available for loading tasks')
      return []
    }

    if (!token.value) {
      console.warn('No authentication token available')
      return []
    }

    try {
      // Get user groups using client-side API (F015 migration)
      if (!(user.value as any)?._id) {
        console.warn('No user ID available for profile lookup')
        return []
      }
      const userProfileResponse = await getEntity((user.value as any)._id)

      const userProfile = userProfileResponse.entity
      const groupParents
        = userProfile._parent?.filter(
          (parent: any) => parent.entity_type === 'grupp'
        ) || []

      if (groupParents.length === 0) {
        console.warn('No parent groups found for user')
        return []
      }

      const allTasks: any[] = []

      // Load tasks from each group
      for (const parentGroup of groupParents) {
        try {
          // Client-side version (F015 migration)
          const groupTasks = await searchEntities({
            '_type.string': 'ulesanne',
            'grupp.reference': parentGroup.reference,
            limit: 1000
          })

          if (groupTasks.entities && groupTasks.entities.length > 0) {
            allTasks.push(
              ...groupTasks.entities.map((task: any) => ({
                ...task,
                groupId: parentGroup.reference,
                groupName: parentGroup.string || 'Unknown Group'
              }))
            )
          }
        }
        catch (err) {
          console.error(
            `Failed to load tasks for group ${parentGroup.reference}:`,
            err
          )
        }
      }

      return allTasks
    }
    catch (err: unknown) {
      console.error('Failed to load tasks:', err)
      throw new Error(
        err instanceof Error ? err.message : 'Failed to load tasks'
      )
    }
  }

  return {
    loadTasks
  }
}
