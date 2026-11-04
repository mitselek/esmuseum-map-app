/**
 * Class Status Composable (spec 033, #61)
 *
 * Asks the server once per user whether the person is in a class, for the
 * "not in a class yet" notice. Any failure leaves the status 'unknown', which
 * never shows the notice.
 *
 * @see specs/033-no-class-screen/plan.md
 */
import { ref } from 'vue'
import type { ClassStatus, ClassStatusResponse } from '~~/utils/class-status'

// Module-level: one answer per user for the whole session
const status = ref<ClassStatus>('unknown')
const checkedUserId = ref<string | null>(null)

export function useClassStatus () {
  const log = useClientLogger('useClassStatus')

  async function ensureClassStatus (userId: string): Promise<void> {
    if (checkedUserId.value === userId) return
    checkedUserId.value = userId
    status.value = 'unknown'

    try {
      const res = await $fetch<ClassStatusResponse>(`/api/onboard/class-status?userId=${userId}`)
      if (checkedUserId.value === userId) {
        status.value = res.status
      }
    }
    catch (error) {
      log.warn('Class status check failed:', error)
    }
  }

  return { classStatus: status, ensureClassStatus }
}
