/**
 * Class membership and the "not in a class yet" notice (spec 033, #61).
 * A class is a grupp under the classes root; every person also has an
 * all-users grupp parent, which is not a class.
 */

export type ClassStatus = 'unknown' | 'in-class' | 'no-class'

export interface ClassStatusResponse {
  status: ClassStatus
  error?: string
}

/** One `_parent` entry of an Entu entity, as the API returns it. */
export interface EntuParentRef {
  reference?: string
  entity_type?: string
}

export interface NoClassNoticeInput {
  initialized: boolean
  loading: boolean
  error: string | null
  taskCount: number
  searchQuery: string
  joinPending: boolean
  classStatus: ClassStatus
}

/** True when any of the person's grupp parents is one of the class ids. */
export const isClassMember = (personParents: EntuParentRef[], classIds: Set<string>): boolean =>
  personParents.some((parent) =>
    parent.entity_type === 'grupp' && !!parent.reference && classIds.has(parent.reference))

/** True only when every input says the person is known to be in no class (FR-001, FR-004-006). */
export const shouldShowNoClassNotice = (input: NoClassNoticeInput): boolean =>
  input.initialized
  && !input.loading
  && !input.error
  && input.taskCount === 0
  && input.searchQuery === ''
  && !input.joinPending
  && input.classStatus === 'no-class'
