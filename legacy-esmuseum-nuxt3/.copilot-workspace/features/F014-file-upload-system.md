# F014 - File Upload System

## Overview

Complete file upload functionality for task responses, allowing users to attach images to their submissions. Files are uploaded directly to response entities in Entu following the proper API workflow.

## Implementation Status

✅ **COMPLETED** - Fully functional file upload system integrated with task response submission.

## Architecture

### Components

1. **TaskFileUpload.vue** - Main file upload component

   - Drag & drop interface with visual feedback
   - File validation (type, size, duplicates)
   - Upload progress tracking
   - Multi-file support

2. **TaskResponseForm.vue** - Integration point

   - Orchestrates response creation + file upload workflow
   - Handles authentication and error states
   - Manages form submission sequence

3. **Server API** - Backend upload handling
   - `/api/upload.post.ts` - File upload endpoint
   - `server/utils/entu.ts` - Entu API utilities
   - Authentication and permission validation

## Technical Implementation

### Upload Workflow

The system follows a **2-step workflow** aligned with Entu's file upload pattern:

1. **Response Creation**

   - User submits task response form
   - System creates response (vastus) entity in Entu
   - Response entity becomes the target for file uploads

2. **File Upload**
   - Request upload metadata from Entu (POST to response entity)
   - Upload file using returned presigned URL
   - File becomes `photo` property on response entity

### API Integration

#### Client-Side (TaskFileUpload.vue)

```typescript
const uploadFiles = async (parentEntityId: string): Promise<UploadResult[]> => {
  // Get authentication token
  const { token } = useEntuAuth();

  // Create FormData with files
  const formData = new FormData();
  formData.append("parentEntityId", parentEntityId);
  files.value.forEach((file) => {
    formData.append("file", file);
  });

  // Upload via server API with authentication
  const { data } = await $fetch("/api/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    body: formData,
  });
};
```

#### Server-Side (/api/upload.post.ts)

```typescript
// 1. Request upload metadata from Entu
const uploadMetadata = await getFileUploadUrl(
  parentEntityId,
  {
    type: "photo",
    filename: field.filename,
    filesize: field.data.length,
    filetype: field.type,
  },
  apiConfig
);

// 2. Upload file to provided URL
const uploadInfo = uploadMetadata.properties[0].upload;
await uploadFileToUrl(uploadInfo.url, field.data, uploadInfo.headers || {});
```

### File Validation

**Client-side validation:**

- File size limit: 10MB maximum
- Allowed types: images only (JPEG, PNG, GIF, WebP)
- Duplicate detection by name/size comparison

**File type mapping:**

- Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

### Response Entity Structure

Files are attached as `photo` properties on response (vastus) entities:

```json
{
  "entity": {
    "_id": "68c767a385a9d472cca35d93",
    "_type": "vastus",
    "photo": [
      {
        "_id": "68c7334385a9d472cca35cfa",
        "filename": "example.jpg",
        "filesize": 5578478,
        "filetype": "image/jpeg"
      }
    ]
  }
}
```

## User Experience

### Drag & Drop Interface

- **Visual feedback**: Border color changes on drag over
- **File preview**: Shows selected files with icons and sizes
- **Progress tracking**: Real-time upload progress bars
- **Error handling**: Clear error messages for validation failures

### File Type Icons

- 🖼️ Images (JPEG, PNG, GIF, WebP)

### Multilingual Support

Translations provided for Estonian, English, and Ukrainian:

```typescript
// Estonian
dragDropFiles: "Lohista failid siia või klõpsa valimiseks";
uploadComplete: "✅ Üleslaaditud";

// English
dragDropFiles: "Drag & drop files here or click to select";
uploadComplete: "✅ Uploaded";

// Ukrainian
dragDropFiles: "Перетягніть файли сюди або клацніть для вибору";
uploadComplete: "✅ Завантажено";
```

## Security & Permissions

### Authentication

- All upload requests require Bearer token authentication
- Token validation through `withAuth` middleware
- User permissions checked before file operations

### Entity Permissions

- Files uploaded to user's own response entities (which they own)
- Cannot upload to task entities (users only have read access)
- Proper inheritance of entity rights (`_inheritrights: true`)

### File Safety

- Server-side validation of file types and sizes
- Entu handles file storage and access control
- No direct file system access

## Error Handling

### Common Error Scenarios

1. **Authentication Errors**

   ```text
   [auth] No Authorization header found in request
   → Fix: Ensure Bearer token is included in upload requests
   ```

2. **Permission Errors**

   ```text
   User not in _owner nor _editor property
   → Fix: Upload to response entity (user-owned) not task entity
   ```

3. **File Validation Errors**
   - File too large (>10MB)
   - Unsupported file type
   - Network/upload failures

### Error Recovery

- Upload failures don't prevent form submission
- Individual file errors reported to user
- Partial upload success is handled gracefully

## Integration Points

### Form Submission Sequence

1. **User completes form** (text, location selection)
2. **Response entity created** via `/api/responses`
3. **Files uploaded** to new response entity (if any selected)
4. **Success confirmation** with file attachment status

### Component Communication

```typescript
// TaskResponseForm.vue orchestrates the workflow
const response = await $fetch('/api/responses', { ... }) // Create response
const uploadResults = await fileUploadRef.value.uploadFiles(response.data.id) // Upload files

// TaskFileUpload.vue emits events
emit('upload-complete', uploadResults)
emit('upload-error', error)
```

## Configuration

### File Upload Limits

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp'
]
```

### Entu API Configuration

```typescript
// server/utils/entu.ts
export function getEntuApiConfig(token: string): EntuApiOptions {
  return {
    token,
    apiUrl: "https://entu.app",
    accountName: "esmuuseum",
  };
}
```

## Testing

### Manual Testing Scenarios

1. **Happy Path**

   - Select/drag multiple files
   - Verify upload progress
   - Confirm files attached to response

2. **Validation Testing**

   - Upload oversized files (>10MB)
   - Upload unsupported file types
   - Test duplicate file handling

3. **Error Scenarios**
   - Network interruption during upload
   - Authentication token expiry
   - Entu API unavailability

### Automated Testing Considerations

- Mock file selection/drag events
- Test upload progress tracking
- Validate error handling paths
- Test form integration workflow

## Performance Considerations

### Upload Optimization

- Files uploaded after response creation (not before)
- Individual file progress tracking
- Graceful handling of partial failures

### Memory Management

- Files processed individually (not batched)
- Progress tracking prevents UI blocking
- Proper cleanup of file references

## Future Enhancements

### Potential Improvements

1. **File Preview**

   - Image thumbnails before upload
   - Document preview capability

2. **Upload Resume**

   - Resume interrupted uploads
   - Chunk-based upload for large files

3. **Batch Operations**

   - Multiple file selection improvements
   - Bulk upload progress aggregation

4. **Enhanced Validation**
   - Content-based file type detection
   - Malware scanning integration

## Dependencies

### Client Dependencies

- Vue 3 Composition API
- Nuxt 3 `$fetch` for HTTP requests
- TypeScript for type safety

### Server Dependencies

- H3 for request handling
- Entu API integration
- Authentication middleware

### External Services

- Entu.app for entity storage
- Entu file storage service
- OAuth authentication system

## Troubleshooting

### Common Issues

1. **Files not appearing in Entu**

   - Check entity permissions
   - Verify upload completed successfully
   - Confirm correct entity ID used

2. **Upload progress stuck**

   - Check network connectivity
   - Verify Entu API availability
   - Check file size limits

3. **Authentication failures**
   - Refresh authentication token
   - Check token expiry
   - Verify OAuth configuration

### Debug Information

- Upload progress logged to console
- Entu API responses logged
- Error details preserved in responses

## Documentation References

- [Entu API Documentation](https://github.com/entu/api)
- [File Upload Specification](./file-upload-spec.md)
- [Response Entity Model](../model/vastus.sample.json)

---

**Implementation Date:** September 15, 2025  
**Status:** Production Ready ✅  
**Maintainer:** ESMuseum Development Team
