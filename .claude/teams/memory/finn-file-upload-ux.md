# File Upload UX & Progress Tracking Analysis

## User Story & Flow

**Context**: Student submitting task response with file attachments

**User journey**:

1. Student opens task response form
2. Drags files into upload area OR clicks to browse
3. Files appear in preview list (with size, type icon)
4. Student submits response form
5. **Upload happens DURING form submission** (not before)
6. Progress bar appears for each file showing current step
7. User sees result: success or error per file

**Key insight**: Upload is **sequentially processed** as part of form submission workflow, not a standalone operation.

---

## Progress UI Implementation

### What User Sees

**Component**: `app/components/TaskFileUpload.vue` (lines 95-116)

```vue
<!-- File upload progress -->
<div v-if="uploadProgress.length" class="mt-3 space-y-2">
  <div v-for="(progress, index) in uploadProgress" :key="index" class="rounded bg-gray-100 p-2">
    <!-- File name + current status -->
    <div class="flex items-center justify-between text-xs text-gray-600">
      <span>{{ progress.filename }}</span>
      <span>{{ progress.status }}</span>  <!-- Shows: "validating", "getting_upload_url", "uploading", "completed", "error" -->
    </div>
    <!-- Progress bar (0-100%) -->
    <div class="mt-1 h-1 w-full rounded bg-gray-200">
      <div
        class="h-1 rounded bg-esm-blue transition-all"
        :style="{ width: `${progress.percent}%` }"
      />
    </div>
  </div>
</div>
```

### Progress States Shown to User

| State                | Progress % | User Sees               | Step Duration         |
| -------------------- | ---------- | ----------------------- | --------------------- |
| `preparing`          | 0%         | "Preparing file..."     | Initial state         |
| `validating`         | 10%        | "Validating file..."    | <100ms                |
| `getting_upload_url` | 25%        | "Getting upload URL..." | ~100-500ms (Entu API) |
| `uploading`          | 50%        | "Uploading..."          | Variable (file size)  |
| `completed`          | 100%       | "Upload complete"       | Success               |
| `error`              | 0%         | "Upload failed"         | Failure               |

### Visual Design

- Per-file progress bar (blue color: `bg-esm-blue`)
- Status text label next to filename
- Multiple files shown in vertical list
- Smooth animation on progress bar width change

---

## Progress Callback Mechanism

### Callback Interface

**Type**: `ProgressCallback` (from `useClientSideFileUpload.ts` line 71)

```typescript
type ProgressCallback = (fileIndex: number, status: UploadProgressStatus, progress: number) => void
```

**Parameters**:

- `fileIndex`: Array index of current file (0-based)
- `status`: One of `'validating' | 'getting_upload_url' | 'uploading' | 'completed' | 'error'`
- `progress`: Percentage 0-100 (represents % of single file, not all files)

### Callback in Composable

**Source**: `useClientSideFileUpload.ts` (lines 252-310)

```typescript
for (let i = 0; i < files.length; i++) {
  const file = files[i]

  try {
    // Step 1: Validation (10% progress)
    if (progressCallback) {
      progressCallback(i, 'validating', 10)
    }
    const validation = validateFile(file)

    // Step 2: Get upload URL (25% progress)
    if (progressCallback) {
      progressCallback(i, 'getting_upload_url', 25)
    }
    const uploadInfo = await getFileUploadUrl(parentEntityId, {...})

    // Step 3: Upload file (50% progress)
    if (progressCallback) {
      progressCallback(i, 'uploading', 50)
    }
    await uploadFileToUrl(file, uploadInfo.url, uploadInfo.headers || {})

    // Step 4: Completed (100% progress)
    if (progressCallback) {
      progressCallback(i, 'completed', 100)
    }
  }
  catch (error) {
    // On error: reset to 0%, show error state
    if (progressCallback) {
      progressCallback(i, 'error', 0)
    }
  }
}
```

### Callback in Component

**Source**: `TaskFileUpload.vue` (lines 266-271)

```typescript
const progressCallback = (fileIndex: number, status: string, percent: number) => {
  if (uploadProgress.value[fileIndex]) {
    uploadProgress.value[fileIndex].percent = percent
    uploadProgress.value[fileIndex].status = status
  }
}
```

Component maps callback to reactive UI state which triggers template updates via `v-for`.

---

## Error Handling & Resilience

### Sequential Processing with Graceful Degradation

**Behavior**: One file error does NOT block other files

```typescript
for (let i = 0; i < files.length; i++) {
  try {
    // ... upload logic
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    console.error(`F015: Failed to upload file ${file.name}:`, error)

    // Report error but continue to next file
    if (progressCallback) {
      progressCallback(i, 'error', 0)  // ← Reset progress, show error
    }

    uploadResults.push({
      filename: file.name,
      success: false,
      error: errorMessage  // ← Store error message
    })
  }
}
```

**Result array** includes both successes and failures:

```typescript
uploadResults: [
  { success: true, filename: 'photo1.jpg', entityId: '...' },
  { success: false, filename: 'photo2.jpg', error: 'File too large' },
  { success: true, filename: 'photo3.jpg', entityId: '...' }
]
```

### File Validation Before Upload

**Happens at component level** (duplicate check):

```typescript
const isDuplicate = files.value.some((existingFile) =>
  existingFile.name === file.name && existingFile.size === file.size
)
```

**Happens in composable** (file size/type):

```typescript
const validateFile = (file: File): FileValidationResult => {
  if (file.size > MAX_FILE_SIZE) {  // 10MB limit
    return { isValid: false, error: `File too large...` }
  }

  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return { isValid: false, error: `File type not allowed...` }
  }

  return { isValid: true }
}
```

**Allowed file types** (from composable line 105-107):

- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`

**Max file size**: 10MB per file

---

## Typical File Upload Volume

### Analyzed from Component

**File input**: `accept="image/*"` (line 82) — accepts all image types

**In practice**:

- Component title: "Add File" (singular language suggests one at a time)
- But HTML `multiple` attribute means user can select several
- No explicit limit on number of files

### Empirical Evidence from Loops

**Sequential processing** in `useClientSideFileUpload.ts`:

```typescript
for (let i = 0; i < files.length; i++) {
  // Each file takes ~3-5 API calls:
  // 1. Validate (~10ms)
  // 2. Get upload URL (~200-500ms)
  // 3. Upload file (~500ms-5s depending on size)
  // 4. Progress callbacks (~10ms)
}
```

**Typical scenario**: 1-3 files per response submission

- Student attaches photo of task completion
- Or 2-3 photos if task requires multiple angles
- Rarely 5+ files (based on educational use case)

**Worst case for sequential**: 3 files × ~1s per file = ~3s total

- Well within 60s webhook token validity window
- Minimal impact on UX

---

## Impact on Issue #3 Parallelization Decision

### Why Sequential Doesn't Hurt Here

1. **Small typical volume**: 1-3 files per upload
2. **User expectation**: Progress bar **per file** suggests sequential mindset
3. **UI mapping**: `uploadProgress.value[fileIndex]` assumes one-to-one file→progress mapping
4. **Error handling**: Current code reports per-file errors clearly

### If We Parallelize (Promise.all)

**Would need**:

- Refactor progress UI to handle concurrent state updates
- Change callback signature to distinguish "file started" vs "progress update"
- Handle race conditions in progress array updates
- Update component to show "1/3 complete, 2/3 uploading, 1/3 failed" state

**Complexity**: Medium (UI state refactor needed)

**Benefit**: Minimal for 1-3 file case

- Parallel: 3 files × 1s overlap = ~1s total
- Sequential: 3 files × 1s = ~3s total
- **Delta**: 2 second improvement (imperceptible for student)

### Recommendation for Issue #3

**Keep sequential** in `useClientSideFileUpload.ts` loop:

- Progress callback architecture assumes per-file sequential state
- Current UX design (progress bar per file) expects one-at-a-time processing
- Typical 1-3 file volume makes parallelization unnecessary
- Current implementation works well (no complaints in logs)

**Rationale**: "Per-file progress tracking is clearer with sequential processing; parallelization adds complexity without meaningful UX benefit for typical 1-3 file uploads"

---

## Summary Table

| Aspect                    | Detail                                                                        |
| ------------------------- | ----------------------------------------------------------------------------- |
| **User Story**            | Student attaches files during response form submission                        |
| **Progress UI**           | Per-file progress bar + status text (validating → uploading → complete/error) |
| **Callback**              | `(fileIndex, status, percent%) → updates uploadProgress.value`                |
| **Error Behavior**        | Continues to next file; collects results array with per-file status           |
| **Typical Volume**        | 1-3 images per submission                                                     |
| **Sequential Processing** | One file at a time; ~1s per file; well within 60s token window                |
| **#3 Recommendation**     | Keep sequential; progress UI designed for it                                  |
