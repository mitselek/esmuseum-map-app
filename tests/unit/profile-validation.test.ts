/**
 * Unit tests for profile-validation.ts
 *
 * isUserNameComplete: returns true only when both forename and surname are
 * present and at least 2 characters long after trimming.
 *
 * Design note on whitespace: a name of "  " (spaces only) is not a real name,
 * so the implementation trims before checking length.
 */
import { describe, it, expect } from 'vitest'
import { isUserNameComplete } from '../../app/utils/profile-validation'

describe('isUserNameComplete', () => {
  it('returns false for undefined user', () => {
    expect(isUserNameComplete(undefined)).toBe(false)
  })

  it('returns false for null user', () => {
    expect(isUserNameComplete(null)).toBe(false)
  })

  it('returns false when forename is undefined', () => {
    expect(isUserNameComplete({ _id: 'u1', forename: undefined, surname: 'Kask' })).toBe(false)
  })

  it('returns false when surname is undefined', () => {
    expect(isUserNameComplete({ _id: 'u1', forename: 'Mihkel', surname: undefined })).toBe(false)
  })

  it('returns false when forename is empty string', () => {
    expect(isUserNameComplete({ _id: 'u1', forename: '', surname: 'Kask' })).toBe(false)
  })

  it('returns false when surname is empty string', () => {
    expect(isUserNameComplete({ _id: 'u1', forename: 'Mihkel', surname: '' })).toBe(false)
  })

  it('returns false when forename is 1 char (boundary)', () => {
    expect(isUserNameComplete({ _id: 'u1', forename: 'X', surname: 'Kask' })).toBe(false)
  })

  it('returns false when surname is 1 char (boundary)', () => {
    expect(isUserNameComplete({ _id: 'u1', forename: 'Mihkel', surname: 'P' })).toBe(false)
  })

  it('returns true when both forename and surname are exactly 2 chars (boundary)', () => {
    expect(isUserNameComplete({ _id: 'u1', forename: 'Xy', surname: 'Xy' })).toBe(true)
  })

  it('returns true for normal full name', () => {
    expect(isUserNameComplete({ _id: 'u1', forename: 'Mihkel', surname: 'Putrinš' })).toBe(true)
  })

  it('returns false when forename is only whitespace (trims before length check)', () => {
    expect(isUserNameComplete({ _id: 'u1', forename: '  ', surname: 'Kask' })).toBe(false)
  })

  it('returns false when surname is only whitespace (trims before length check)', () => {
    expect(isUserNameComplete({ _id: 'u1', forename: 'Mihkel', surname: '  ' })).toBe(false)
  })

  it('returns false when forename pads to 2 chars only with spaces (e.g. " X")', () => {
    // " X" trims to "X" (1 char) — not complete
    expect(isUserNameComplete({ _id: 'u1', forename: ' X', surname: 'Kask' })).toBe(false)
  })
})
