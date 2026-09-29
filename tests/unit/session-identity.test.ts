/**
 * Who is signed in, as shown next to the logout link (#57).
 */
import { describe, it, expect } from 'vitest'
import { getSessionIdentity, formatSessionIdentity } from '../../app/utils/session-identity'

describe('getSessionIdentity', () => {
  it('prefers displayname and the login identity email', () => {
    const identity = getSessionIdentity(
      { _id: 'p1', displayname: 'Mari Maasikas', forename: 'Mari', surname: 'M', email: 'person@example.com' },
      { token: 't', user: { email: 'login@example.com' } }
    )
    expect(identity).toEqual({ name: 'Mari Maasikas', account: 'login@example.com' })
  })

  it('falls back to forename and surname, then name', () => {
    expect(getSessionIdentity({ _id: 'p1', forename: 'Mari', surname: 'Maasikas' }, null).name).toBe('Mari Maasikas')
    expect(getSessionIdentity({ _id: 'p1', name: 'Mari' }, null).name).toBe('Mari')
  })

  it('falls back to the person email when the login email is missing', () => {
    expect(getSessionIdentity({ _id: 'p1', email: 'person@example.com' }, { token: 't' }).account).toBe('person@example.com')
  })

  it('treats blank values as missing', () => {
    expect(getSessionIdentity({ _id: 'p1', displayname: '  ', forename: '', surname: '' }, null)).toEqual({ name: '', account: '' })
  })

  it('handles no user at all', () => {
    expect(getSessionIdentity(null, null)).toEqual({ name: '', account: '' })
  })
})

describe('formatSessionIdentity', () => {
  it('joins name and account', () => {
    expect(formatSessionIdentity({ name: 'Mari Maasikas', account: 'mari@example.com' })).toBe('Mari Maasikas · mari@example.com')
  })

  it('shows only what is known, without a stray separator', () => {
    expect(formatSessionIdentity({ name: '', account: 'mari@example.com' })).toBe('mari@example.com')
    expect(formatSessionIdentity({ name: 'Mari', account: '' })).toBe('Mari')
    expect(formatSessionIdentity({ name: '', account: '' })).toBe('')
  })
})
