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

/** Longest account shown under the logout link before it is cut with an ellipsis */
export const ACCOUNT_DISPLAY_CHARS = 20

const shorten = (value: string, maxChars?: number): string => {
  const chars = Array.from(value)
  if (!maxChars || chars.length <= maxChars) return value
  return chars.slice(0, maxChars).join('') + '…'
}

export const formatSessionIdentity = ({ name, account }: SessionIdentity, maxAccountChars?: number): string => {
  return [name, shorten(account, maxAccountChars)].filter(Boolean).join(' · ')
}
