/**
 * Which account is signed in, as shown under the logout link (#57)
 */

import type { EntuUser, EntuAuthResponse } from '~/composables/useEntuAuth'

/** Longest account shown under the logout link before it is cut with an ellipsis */
export const ACCOUNT_DISPLAY_CHARS = 20

const clean = (value: string | undefined): string => value?.trim() ?? ''

/** Email of the login identity, falling back to the person email; '' when unknown */
export const getSessionAccount = (
  user: EntuUser | null,
  authResponse: EntuAuthResponse | null
): string => {
  return clean(authResponse?.user?.email) || clean(user?.email)
}

export const shortenAccount = (account: string): string => {
  const chars = Array.from(account)
  if (chars.length <= ACCOUNT_DISPLAY_CHARS) return account
  return chars.slice(0, ACCOUNT_DISPLAY_CHARS).join('') + '…'
}
