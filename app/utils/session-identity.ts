/**
 * Who is signed in, as shown next to the logout link (#57)
 */

import type { EntuUser, EntuAuthResponse } from '~/composables/useEntuAuth'

export interface SessionIdentity {
  /** Person's display name, or '' when the profile has no name yet */
  name: string
  /** Email of the login identity, or '' when unknown */
  account: string
}

const clean = (value: string | undefined): string => value?.trim() ?? ''

export const getSessionIdentity = (
  user: EntuUser | null,
  authResponse: EntuAuthResponse | null
): SessionIdentity => {
  const fullName = [clean(user?.forename), clean(user?.surname)].filter(Boolean).join(' ')

  return {
    name: clean(user?.displayname) || fullName || clean(user?.name),
    account: clean(authResponse?.user?.email) || clean(user?.email)
  }
}

export const formatSessionIdentity = ({ name, account }: SessionIdentity): string => {
  return [name, account].filter(Boolean).join(' · ')
}
