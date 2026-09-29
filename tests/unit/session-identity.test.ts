/**
 * Which account is signed in, as shown under the logout link (#57).
 */
import { describe, it, expect } from 'vitest'
import { getSessionAccount, shortenAccount } from '../../app/utils/session-identity'

describe('getSessionAccount', () => {
  it('prefers the login identity email', () => {
    expect(getSessionAccount(
      { _id: 'p1', email: 'person@example.com' },
      { token: 't', user: { email: 'login@example.com' } }
    )).toBe('login@example.com')
  })

  it('falls back to the person email when the login email is missing', () => {
    expect(getSessionAccount({ _id: 'p1', email: 'person@example.com' }, { token: 't' })).toBe('person@example.com')
  })

  it('treats blank values as missing', () => {
    expect(getSessionAccount({ _id: 'p1', email: '  ' }, { token: 't', user: { email: '' } })).toBe('')
  })

  it('handles no user at all', () => {
    expect(getSessionAccount(null, null)).toBe('')
  })
})

describe('shortenAccount', () => {
  it('keeps the first 20 characters and adds an ellipsis', () => {
    expect(shortenAccount('mari.maasikas@example.com')).toBe('mari.maasikas@exampl…')
  })

  it('leaves 20 characters or fewer untouched', () => {
    expect(shortenAccount('exactly20chars@ab.ee')).toBe('exactly20chars@ab.ee')
    expect(shortenAccount('')).toBe('')
  })
})
