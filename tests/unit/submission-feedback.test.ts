/**
 * The "response submitted" confirmation must stay on screen long enough
 * to be noticed (#53: users missed it at 1.5 s).
 */
import { describe, it, expect } from 'vitest'
import { SUBMISSION_SUCCESS_DISPLAY_MS } from '../../app/constants/ui'

describe('submission success feedback', () => {
  it('stays visible for 3 seconds', () => {
    expect(SUBMISSION_SUCCESS_DISPLAY_MS).toBe(3000)
  })
})
