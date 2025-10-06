# F005: Form Submission & Response Management

**Status**: 🚧 Planning  
**Priority**: High  
**Estimated Effort**: Medium  
**Dependencies**: F003 (Pupil Dashboard), F004 (Smart Location Selection)

## Overview

Complete the task response submission system with proper data persistence, file uploads, and response management. This feature ensures students can successfully submit their task responses and manage them over time.

## User Stories

### Primary User Stories

**As a student, I want to:**

- Submit my task response with text, files, and location data
- See confirmation when my response is successfully submitted
- Edit and update my response before the deadline
- View my submitted responses and their status
- Handle submission errors gracefully

**As a teacher, I want to:**

- Receive student responses in a structured format
- Access submitted files and location data
- Track response submission status and timestamps

## Technical Requirements

### Phase 1: Response Entity Management ✅ (Planned)

**Response Data Model (vastus entity)**:

- `text`: Text response content
- `geopunkt`: Location coordinates (from F004)
- `file`: Uploaded file attachment
- `ulesanne`: Reference to task entity
- `person`: Reference to student user
- `created`: Submission timestamp
- `modified`: Last update timestamp

**Entity Relationships**:

- `vastus` → `ulesanne` (many-to-one)
- `vastus` → `person` (many-to-one)
- Support for multiple responses per student per task (drafts/revisions)

### Phase 2: Data Persistence ✅ (Planned)

**Create Response**:

- Use Entu API `createEntity` for new submissions
- Handle validation and error cases
- Generate proper entity structure with relationships

**Update Response**:

- Use Entu API `updateEntity` for existing responses
- Preserve original creation timestamp
- Update modification timestamp

**Load Existing Response**:

- Query existing `vastus` entities for current user/task
- Populate form with existing data for editing
- Handle multiple responses (show latest or all)

### Phase 3: File Upload Integration ✅ (Planned)

**File Upload Process**:

- Get upload URL from Entu API (`getFileUploadUrl`)
- Upload file to Entu's file storage
- Associate uploaded file with response entity
- Support common file types (images, PDF, documents)

**File Management**:

- Display uploaded files in response form
- Allow file replacement/removal
- Handle upload progress and errors
- Validate file size and type restrictions

### Phase 4: Error Handling & UX ✅ (Planned)

**Form Validation**:

- Require either text response or file upload
- Validate coordinate format and location selection
- Handle network connectivity issues

**User Feedback**:

- Success notifications for submissions
- Error messages with retry options
- Loading states during submission
- Confirmation dialogs for destructive actions

**Edge Cases**:

- Duplicate submissions prevention
- Session timeout handling
- Partial submission recovery
- Offline submission queuing (future enhancement)

## Implementation Plan

### Step 1: Entity Structure Setup

- [ ] Define `vastus` entity schema in data model
- [ ] Test entity creation and relationships via data explorer
- [ ] Validate property types and constraints

### Step 2: Response Loading & Population

- [ ] Implement `loadUserResponse()` in task detail page
- [ ] Query existing responses for current user/task
- [ ] Populate form fields with existing response data
- [ ] Handle cases where no response exists yet

### Step 3: Form Submission Logic

- [ ] Complete `submitResponse()` function implementation
- [ ] Handle both create and update scenarios
- [ ] Integrate with file upload process
- [ ] Add proper error handling and user feedback

### Step 4: File Upload Implementation

- [ ] Integrate file upload with Entu API
- [ ] Handle upload progress and file validation
- [ ] Associate uploaded files with response entities
- [ ] Display uploaded files in form

### Step 5: Response Management UI

- [ ] Show existing response status in task list
- [ ] Add response editing/updating capabilities
- [ ] Implement response history (if needed)
- [ ] Add response deletion (if required)

## Acceptance Criteria

### Core Functionality

- ✅ Students can submit task responses with text, files, and location
- ✅ Form data persists correctly to Entu entities
- ✅ Existing responses load and populate form fields
- ✅ Students can update their responses before deadline
- ✅ File uploads work reliably with proper validation

### User Experience

- ✅ Clear success/error feedback for all submission states
- ✅ Loading states prevent duplicate submissions
- ✅ Form validation guides users to complete requirements
- ✅ Graceful error recovery with retry mechanisms

### Data Integrity

- ✅ Response entities link correctly to tasks and users
- ✅ Timestamps track creation and modification accurately
- ✅ File associations maintain proper references
- ✅ Coordinate data formats match location selection

## Technical Architecture

### API Integration

```javascript
// Response creation
await createEntity({
  _type: "vastus",
  text: responseText,
  geopunkt: coordinates,
  ulesanne: { reference: taskId },
  person: { reference: userId },
});

// File upload
const uploadUrl = await getFileUploadUrl(responseId, {
  file: selectedFile,
});
await uploadFile(uploadUrl, fileData);
```

### Form State Management

```javascript
const responseForm = ref({
  text: "",
  file: null,
  geopunkt: "",
  existingResponse: null,
});

const submitResponse = async () => {
  const isUpdate = !!responseForm.value.existingResponse;

  if (isUpdate) {
    await updateEntity(responseForm.value.existingResponse._id, formData);
  } else {
    await createEntity(formData);
  }
};
```

### Error Handling Strategy

```javascript
const handleSubmissionError = (error) => {
  if (error.code === "NETWORK_ERROR") {
    showRetryPrompt();
  } else if (error.code === "VALIDATION_ERROR") {
    showValidationErrors(error.details);
  } else {
    showGenericError(error.message);
  }
};
```

## Risk Assessment

### High Risk

- **File upload reliability**: Network issues during large file uploads
- **Data consistency**: Ensuring response-task-user relationships are correct
- **Concurrent editing**: Multiple browser tabs/sessions

### Medium Risk

- **Form state management**: Complex form with multiple data types
- **API rate limiting**: Multiple rapid submissions
- **Validation complexity**: Coordinating client and server validation

### Low Risk

- **UI responsiveness**: Form submission feedback
- **Basic functionality**: Text response submission

## Testing Strategy

### Unit Tests

- Response entity creation and updates
- Form validation logic
- File upload utilities
- Error handling functions

### Integration Tests

- End-to-end submission flow
- File upload with Entu API
- Response loading and editing
- Error recovery scenarios

### User Testing

- Complete task submission workflow
- File upload with various file types
- Location selection with response submission
- Response editing and updates

## Future Enhancements

### Phase 2 Considerations

- **Response versioning**: Track revision history
- **Draft auto-save**: Prevent data loss
- **Offline submission**: Queue submissions for later
- **Rich text editor**: Enhanced text formatting
- **Collaborative responses**: Team submission support

### Performance Optimization

- **Lazy loading**: Load responses only when needed
- **File compression**: Optimize upload sizes
- **Caching strategy**: Cache user responses locally
- **Progress indicators**: Better upload feedback

## Dependencies

### Completed Features

- **F003**: Task detail page structure and navigation
- **F004**: Location selection and coordinate handling

### External Dependencies

- **Entu API**: Entity CRUD operations and file upload
- **Vue 3**: Reactive form state management
- **Browser APIs**: File handling and form validation

### Internal Dependencies

- **Authentication**: Valid user session for response attribution
- **Task loading**: Proper task entity structure
- **Location data**: Coordinate format compatibility

## Success Metrics

### Functional Metrics

- **Submission success rate**: >95% of valid submissions complete
- **Response loading time**: <2 seconds for existing responses
- **File upload success**: >90% success rate for supported file types
- **Data integrity**: 100% correct task-user-response relationships

### User Experience Metrics

- **Form completion rate**: Students complete submissions
- **Error recovery rate**: Users successfully retry after errors
- **Response update usage**: Students utilize editing functionality
- **User satisfaction**: Positive feedback on submission process

## Notes

This feature completes the core student workflow: authentication → task browsing → location selection → response submission. The implementation should prioritize reliability and user feedback, as this is the culmination of the student's task engagement process.

The form submission system should be robust enough to handle various edge cases while maintaining a simple, intuitive interface that encourages completion and accurate responses.
