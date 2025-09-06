# F006: Server API Routes for Form Submission

**Feature ID**: F006  
**Status**: 🚧 Planning  
**Started**: September 6, 2025  
**Target Completion**: September 7, 2025  

## Overview

Transform the current direct Entu API integration into a proper server-side API architecture using Nuxt 3 server routes. This will improve security, error handling, validation, and overall maintainability of the form submission system.

## Problem Statement

Currently, form submissions happen directly from Vue components to the Entu API:

- **Security Issues**: API tokens exposed to client-side
- **Limited Validation**: No server-side validation or sanitization
- **Poor Error Handling**: Generic error messages from direct API calls
- **No Caching**: Every request hits Entu API directly
- **File Upload Complexity**: Client-side file handling with limited control

## Solution Architecture

### Server API Structure

```text
server/
├── api/
│   ├── responses/
│   │   ├── index.post.ts          # Create new response
│   │   ├── [id].put.ts            # Update existing response
│   │   ├── [id].get.ts            # Get response by ID
│   │   └── user/[userId].get.ts   # Get user's responses for task
│   ├── tasks/
│   │   ├── [id].get.ts            # Enhanced task details
│   │   ├── [id]/responses.get.ts  # Task responses (admin)
│   │   └── [id]/locations.get.ts  # Task locations with distances
│   ├── files/
│   │   ├── upload.post.ts         # File upload handling
│   │   └── [id].get.ts            # File serving/proxy
│   └── auth/
│       ├── validate.post.ts       # Token validation
│       └── refresh.post.ts        # Token refresh
```

## Implementation Plan

### Phase 1: Response Management API (Day 1)

#### POST `/api/responses`
**Purpose**: Create new task response

**Request Format**:
```typescript
interface CreateResponseRequest {
  taskId: string
  text?: string
  geopunkt?: string
  file?: File
}
```

**Validation Rules**:
- At least one of `text` or `file` must be provided
- `taskId` must be valid and accessible to user
- `geopunkt` must be valid coordinates if provided
- File size limits and type validation

**Response Format**:
```typescript
interface CreateResponseResponse {
  success: true
  data: {
    responseId: string
    timestamp: string
    taskId: string
    fileReference?: string
  }
}
```

#### PUT `/api/responses/[id]`
**Purpose**: Update existing response

**Authorization**: User can only update their own responses

**Request Format**:
```typescript
interface UpdateResponseRequest {
  text?: string
  geopunkt?: string
  file?: File
  removeFile?: boolean
}
```

#### GET `/api/responses/user/[userId]`
**Purpose**: Get user's response for specific task

**Query Parameters**:
- `taskId`: Required - filter responses for specific task

**Response Format**:
```typescript
interface GetUserResponseResponse {
  success: true
  data: {
    response?: UserResponse
    hasResponse: boolean
    submittedAt?: string
    lastModified?: string
  }
}
```

### Phase 2: Enhanced Task API (Day 1-2)

#### GET `/api/tasks/[id]`
**Purpose**: Get task details with user-specific data

**Enhancement Features**:
- Include user's existing response if any
- Add computed response statistics
- Include location data sorted by user distance
- Permission validation for task access

**Response Format**:
```typescript
interface GetTaskResponse {
  success: true
  data: {
    task: TaskEntity
    userResponse?: UserResponse
    responseCount: number
    locations: LocationWithDistance[]
    permissions: {
      canRespond: boolean
      canViewResponses: boolean
    }
  }
}
```

#### GET `/api/tasks/[id]/locations`
**Purpose**: Get task locations with distance calculations

**Query Parameters**:
- `lat`: User latitude for distance calculation
- `lng`: User longitude for distance calculation

**Features**:
- Server-side distance calculation
- Location sorting by proximity
- Caching for performance
- Include location metadata

### Phase 3: File Management API (Day 2)

#### POST `/api/files/upload`
**Purpose**: Handle file uploads to Entu storage

**Features**:
- Multipart form data processing
- File type validation (images, PDF, Word docs)
- File size limits (configurable)
- Progress tracking support
- Integration with Entu file storage API

**Security Measures**:
- File type verification by content, not just extension
- Virus scanning integration (future)
- Rate limiting per user
- Storage quota management

**Response Format**:
```typescript
interface FileUploadResponse {
  success: true
  data: {
    fileId: string
    filename: string
    size: number
    mimeType: string
    url?: string
  }
}
```

### Phase 4: Authentication API (Day 2-3)

#### POST `/api/auth/validate`
**Purpose**: Validate user token and return user info

**Features**:
- Token verification against Entu
- User data extraction and formatting
- Permission calculation
- Rate limiting for security

#### POST `/api/auth/refresh`
**Purpose**: Refresh expired authentication tokens

**Features**:
- Seamless token renewal
- Updated user data sync
- Error handling for invalid refresh attempts

## Technical Implementation Details

### Error Handling Strategy

**Standardized Error Responses**:
```typescript
interface APIError {
  success: false
  error: {
    code: string // Machine-readable error code
    message: string // Human-readable error message
    details?: any // Additional error context
    field?: string // Field-specific validation errors
  }
  timestamp: string
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `FILE_TOO_LARGE`: File exceeds size limit
- `INVALID_FILE_TYPE`: Unsupported file format
- `RATE_LIMITED`: Too many requests
- `ENTU_ERROR`: Upstream Entu API error

### Validation Framework

**Using Zod for Type-Safe Validation**:
```typescript
import { z } from 'zod'

const CreateResponseSchema = z.object({
  taskId: z.string().min(1),
  text: z.string().optional(),
  geopunkt: z.string().regex(/^-?\d+\.?\d*,-?\d+\.?\d*$/).optional(),
  file: z.instanceof(File).optional()
}).refine(data => data.text || data.file, {
  message: "Either text or file must be provided"
})
```

### Security Measures

**Rate Limiting**:
- 100 requests per minute per user for general API calls
- 10 file uploads per minute per user
- 5 authentication requests per minute per IP

**Authorization Middleware**:
```typescript
export async function requireAuth(event: H3Event) {
  const token = getCookie(event, 'auth_token') || getHeader(event, 'authorization')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  const user = await validateToken(token)
  event.context.user = user
  return user
}
```

**CORS Configuration**:
- Restrict origins to frontend domain
- Allow credentials for cookie-based auth
- Proper preflight handling

## Frontend Integration

### New Composable: `useTaskResponseAPI`

```javascript
export const useTaskResponseAPI = () => {
  const { data: user } = useEntuAuth()
  
  const submitResponse = async (taskId, responseData) => {
    try {
      const response = await $fetch('/api/responses', {
        method: 'POST',
        body: {
          taskId,
          ...responseData
        }
      })
      return response
    } catch (error) {
      throw new APIError(error)
    }
  }

  const updateResponse = async (responseId, updates) => {
    return await $fetch(`/api/responses/${responseId}`, {
      method: 'PUT',
      body: updates
    })
  }

  const getUserResponse = async (taskId) => {
    if (!user.value?._id) return null
    
    return await $fetch(`/api/responses/user/${user.value._id}`, {
      query: { taskId }
    })
  }

  const uploadFile = async (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)

    return await $fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
      onUploadProgress: onProgress
    })
  }

  return {
    submitResponse,
    updateResponse,
    getUserResponse,
    uploadFile
  }
}
```

### Enhanced Error Handling

```javascript
class APIError extends Error {
  constructor(fetchError) {
    const errorData = fetchError.data || {}
    super(errorData.error?.message || 'Unknown API error')
    
    this.code = errorData.error?.code
    this.field = errorData.error?.field
    this.details = errorData.error?.details
    this.statusCode = fetchError.statusCode
  }

  isValidationError() {
    return this.code === 'VALIDATION_ERROR'
  }

  isAuthError() {
    return this.code === 'UNAUTHORIZED' || this.code === 'FORBIDDEN'
  }
}
```

## Benefits

### 1. **Security Improvements**
- Server-side token handling
- Request validation and sanitization
- Rate limiting and abuse prevention
- File upload security controls

### 2. **Better User Experience**
- Structured error messages
- Progress indicators for file uploads
- Consistent loading states
- Offline capability preparation

### 3. **Performance Optimization**
- Response caching strategies
- Optimized database queries
- Reduced client-server round trips
- Computed data on server-side

### 4. **Maintainability**
- Centralized business logic
- Type-safe API contracts
- Easier testing and debugging
- Clear separation of concerns

### 5. **Scalability**
- Easy to add middleware
- Monitoring and logging points
- Database optimization opportunities
- Caching layer integration

## Testing Strategy

### Unit Tests
- API endpoint logic testing
- Validation schema testing
- Error handling scenarios
- Authentication middleware

### Integration Tests
- End-to-end form submission flow
- File upload with different file types
- Error response handling
- Rate limiting behavior

### Performance Tests
- Response time under load
- File upload performance
- Concurrent user scenarios
- Memory usage optimization

## Success Criteria

- [ ] All form submissions go through server API routes
- [ ] File uploads work with progress indication
- [ ] Structured error handling provides clear user feedback
- [ ] Performance is equal or better than direct API calls
- [ ] API endpoints are fully documented with OpenAPI/Swagger
- [ ] Integration tests cover all critical paths
- [ ] Zero security vulnerabilities in API layer
- [ ] Response times under 200ms for non-file operations

## Migration Plan

### Phase 1: Parallel Implementation
- Implement server API routes alongside existing direct calls
- Add feature flags to switch between implementations
- Comprehensive testing in development environment

### Phase 2: Gradual Migration
- Replace form submission endpoints first
- Migrate file upload functionality
- Switch authentication validation
- Monitor performance and error rates

### Phase 3: Cleanup
- Remove direct Entu API calls from frontend
- Clean up unused composables and utilities
- Update documentation and examples

## Risk Assessment

### High Risk
- **Breaking Changes**: Existing form submissions could fail
- **Performance Impact**: Additional server layer could slow responses
- **File Upload Complexity**: Large file handling and edge cases

### Medium Risk
- **Authentication Issues**: Token validation complexity
- **Error Handling**: Ensuring all error scenarios are covered
- **Caching Strategy**: Balancing performance vs data freshness

### Low Risk
- **API Design**: Well-established patterns reduce design risk
- **Documentation**: Clear specifications reduce integration issues

## Monitoring and Metrics

### Key Performance Indicators
- API response times (target: <200ms for non-file operations)
- Error rates by endpoint (target: <1% for normal operations)
- File upload success rates (target: >99%)
- User satisfaction with error messages

### Monitoring Setup
- Server-side logging for all API calls
- Error tracking with stack traces
- Performance monitoring with alerts
- User feedback collection for error scenarios

## Future Enhancements

### Phase 4: Advanced Features (Future)
- Real-time collaboration on responses
- Response draft auto-saving
- Advanced file processing (image optimization, PDF text extraction)
- Webhooks for response notifications
- Analytics and reporting API

### Phase 5: Optimization (Future)
- GraphQL API for flexible data fetching
- Database caching layer
- CDN integration for file serving
- Advanced rate limiting with user tiers
