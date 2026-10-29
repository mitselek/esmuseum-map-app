/**
 * Task response submission steps, kept free of Vue so the outcome is testable (#59).
 * A failed create is reported, never swallowed; files that did not upload are
 * flagged so the student learns the response was saved without them.
 */

export interface ResponseFileResult {
  success: boolean
  entityId?: string
}

export interface SubmissionSteps<R> {
  create: () => Promise<R>
  uploadFiles: (response: R) => Promise<ResponseFileResult[]>
}

export type SubmissionOutcome<R>
  = | { status: 'submitted', response: R, fileReferences: string[], filesFailed: boolean }
    | { status: 'failed', message: string }

export const runResponseSubmission = async <R>(steps: SubmissionSteps<R>): Promise<SubmissionOutcome<R>> => {
  let response: R
  try {
    response = await steps.create()
  }
  catch (error) {
    return { status: 'failed', message: error instanceof Error ? error.message : String(error) }
  }

  let results: ResponseFileResult[]
  try {
    results = await steps.uploadFiles(response)
  }
  catch {
    return { status: 'submitted', response, fileReferences: [], filesFailed: true }
  }

  const fileReferences = results
    .filter((result) => result.success && result.entityId)
    .map((result) => result.entityId!)

  return {
    status: 'submitted',
    response,
    fileReferences,
    filesFailed: results.some((result) => !result.success)
  }
}
