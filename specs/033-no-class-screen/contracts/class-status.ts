/**
 * Contract: GET /api/onboard/class-status?userId=<person id> (spec 033, #61)
 *
 * 200 { status: 'in-class' | 'no-class' }
 * 400 { status: 'unknown', error }  -- missing userId
 * 500 { status: 'unknown', error }  -- Entu lookup failed
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

/** True when any of the person's grupp parents is one of the class ids. */
export type IsClassMember = (personParents: EntuParentRef[], classIds: Set<string>) => boolean

export interface NoClassNoticeInput {
  initialized: boolean
  loading: boolean
  error: string | null
  taskCount: number
  searchQuery: string
  joinPending: boolean
  classStatus: ClassStatus
}

/** True only when every input says the person is known to be in no class (FR-001, FR-004-006). */
export type ShouldShowNoClassNotice = (input: NoClassNoticeInput) => boolean
