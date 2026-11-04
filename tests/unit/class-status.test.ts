/**
 * Who sees the "not in a class yet" message (spec 033, #61).
 * A class is a grupp under the classes root; every person also has an
 * all-users grupp parent, which is not a class.
 */
import { describe, it, expect } from 'vitest'
import { isClassMember, shouldShowNoClassNotice } from '../../utils/class-status'
import type { NoClassNoticeInput } from '../../utils/class-status'

const classIds = new Set(['class-1', 'class-2'])
const allUsers = { reference: 'all-users', entity_type: 'grupp' }
const personsMenu = { reference: 'persons-menu', entity_type: 'menu' }

describe('isClassMember', () => {
  it('is true when a grupp parent is a class', () => {
    expect(isClassMember([allUsers, personsMenu, { reference: 'class-2', entity_type: 'grupp' }], classIds)).toBe(true)
  })

  it('is false when the only grupp parent is the all-users group', () => {
    expect(isClassMember([allUsers, personsMenu], classIds)).toBe(false)
  })

  it('is false for a menu parent that happens to carry a class id', () => {
    expect(isClassMember([{ reference: 'class-1', entity_type: 'menu' }], classIds)).toBe(false)
  })

  it('is false with no parents', () => {
    expect(isClassMember([], classIds)).toBe(false)
  })

  it('ignores a parent without entity_type or reference', () => {
    expect(isClassMember([{ reference: 'class-1' }, { entity_type: 'grupp' }], classIds)).toBe(false)
  })
})

describe('shouldShowNoClassNotice', () => {
  const show: NoClassNoticeInput = {
    initialized: true,
    loading: false,
    error: null,
    taskCount: 0,
    searchQuery: '',
    joinPending: false,
    classStatus: 'no-class'
  }

  it('shows when the person is known to be in no class and has no tasks', () => {
    expect(shouldShowNoClassNotice(show)).toBe(true)
  })

  it.each<[string, Partial<NoClassNoticeInput>]>([
    ['tasks not loaded yet', { initialized: false }],
    ['tasks still loading', { loading: true }],
    ['task loading failed', { error: 'Failed to fetch' }],
    ['the person has tasks', { taskCount: 1 }],
    ['a search is active', { searchQuery: 'kaart' }],
    ['a class join is pending', { joinPending: true }],
    ['the person is in a class', { classStatus: 'in-class' }],
    ['class status is unknown', { classStatus: 'unknown' }]
  ])('does not show when %s', (_case, change) => {
    expect(shouldShowNoClassNotice({ ...show, ...change })).toBe(false)
  })
})
