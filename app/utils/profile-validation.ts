import type { EntuUser } from '../composables/useEntuAuth'

export function isUserNameComplete (user: EntuUser | null | undefined): boolean {
  if (!user) return false
  const forename = user.forename?.trim() ?? ''
  const surname = user.surname?.trim() ?? ''
  return forename.length >= 2 && surname.length >= 2
}
