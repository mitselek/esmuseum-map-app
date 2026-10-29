/**
 * A failed task response submission must reach the student (#59):
 * a failed create is reported as failed, and files that did not upload
 * are flagged instead of dropped silently.
 */
import { describe, it, expect, vi } from 'vitest'
import { runResponseSubmission } from '../../app/utils/response-submission'

const created = { id: 'resp-1', data: {} }

describe('runResponseSubmission', () => {
  it('reports submitted with file references when everything succeeds', async () => {
    const outcome = await runResponseSubmission({
      create: async () => created,
      uploadFiles: async () => [{ success: true, entityId: 'file-1' }]
    })

    expect(outcome).toEqual({
      status: 'submitted',
      response: created,
      fileReferences: ['file-1'],
      filesFailed: false
    })
  })

  it('reports failed with the error message when creating the response throws', async () => {
    const uploadFiles = vi.fn()
    const outcome = await runResponseSubmission({
      create: async () => { throw new Error('Failed to fetch') },
      uploadFiles
    })

    expect(outcome).toEqual({ status: 'failed', message: 'Failed to fetch' })
    expect(uploadFiles).not.toHaveBeenCalled()
  })

  it('reports failed with a fallback message when a non-Error is thrown', async () => {
    const outcome = await runResponseSubmission({
      create: async () => { throw 'boom' },
      uploadFiles: async () => []
    })

    expect(outcome).toEqual({ status: 'failed', message: 'boom' })
  })

  it('flags filesFailed when the upload throws, keeping the response submitted', async () => {
    const outcome = await runResponseSubmission({
      create: async () => created,
      uploadFiles: async () => { throw new Error('upload proxy 502') }
    })

    expect(outcome).toEqual({
      status: 'submitted',
      response: created,
      fileReferences: [],
      filesFailed: true
    })
  })

  it('flags filesFailed when any single file comes back unsuccessful', async () => {
    const outcome = await runResponseSubmission({
      create: async () => created,
      uploadFiles: async () => [
        { success: true, entityId: 'file-1' },
        { success: false }
      ]
    })

    expect(outcome).toEqual({
      status: 'submitted',
      response: created,
      fileReferences: ['file-1'],
      filesFailed: true
    })
  })

  it('passes the created response to the upload step', async () => {
    const uploadFiles = vi.fn(async () => [])
    await runResponseSubmission({ create: async () => created, uploadFiles })

    expect(uploadFiles).toHaveBeenCalledWith(created)
  })
})
