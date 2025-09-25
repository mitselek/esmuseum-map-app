# F008: Answer Submission (September 8, 2025)

**Goal**  

Implement a robust, user-friendly answer submission flow for pupil tasks that unifies frontend form interactions with server-side API routes, supports file attachments, and ensures data integrity and retryability.

## Overview

F008 covers the complete flow for pupils to submit answers to tasks, including create/update semantics, file uploads, validation, optimistic UI updates, and error recovery.

## Scope

- Frontend: Task response form enhancements, progress indicators, optimistic UI, retry controls
- Server: API routes for creating and updating responses, file upload handling, validation, ownership checks
- Integration: Use `useFormPersistence` plus server-side persistence; optional background sync for offline scenarios

## API Endpoints (server)

- `POST /api/responses` — Create a new response
  - Body: { taskId, userId, text?, files?: FileMeta[], coordinates?: {lat, lng}, metadata?: {} }
  - Validation: require taskId + (text OR files OR coordinates)
  - Response: { success: true, data: Response }

- `PUT /api/responses/[id]` — Update an existing response
  - Ownership: only owner or admin
  - Upserts file references and merges text fields

- `GET /api/responses/user/[userId]?taskId=` — Get user's responses for a task

- `POST /api/files/upload` — Multipart file upload proxy to Entu

## Frontend composables

- `useAnswerSubmission` (new)
  - submit(taskId, payload) -> returns { success, response }
  - update(responseId, updates)
  - uploadFiles(files) -> returns FileMeta[]
  - handles retry/backoff and exposes progress

- Reuse: `useFormPersistence`, `useTaskWorkspace`

## UX

- Show upload progress per file
- Disable submit button while pending, allow cancel
- Optimistic update to Task list with 'Saving...' state
- Clear visual errors with retry button when network fails

## Validation & Security

- Server-side validation via Zod
- Rate limiting and size limits for uploads
- Authorization middleware to ensure user ownership

## Acceptance criteria

1. Pupils can create a response with text or files for assigned tasks.
2. Users may update their response and see merged changes.
3. File uploads are validated and proxied to Entu with progress.
4. Form auto-save integrates with server persistence without data loss.

## Small tests (manual)

- Create response with only text
- Create response with files + text
- Update existing response and confirm merge
- Simulate network failure and verify retry behavior

## Next steps

- Implement server API routes (F006) and integrate composable
- Add integration tests for `/api/responses`
- Add UI tests for optimistic updates and retry flows
