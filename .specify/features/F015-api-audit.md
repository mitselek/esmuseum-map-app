# Server API Endpoints Audit

## Comprehensive Usage Analysis

### Authentication Endpoints (4 files)

- `/api/auth/status` - Used in `app/composables/useServerAuth.ts` (line 14)
- `/api/auth/start` - Used in `app/composables/useServerAuth.ts` (line 38)
- `/api/auth/logout` - Used in `app/composables/useServerAuth.ts` (line 50)
- `/api/auth/callback` - Server-only OAuth callback handler (no frontend calls)

### User/Profile Endpoints (1 file)

- `/api/user/profile` - Used in:
  - `app/pages/auth-test.vue` (line 144)
  - `app/composables/useTaskWorkspace.ts` (line 56)
  - `tests/api/auth-routes.test.ts` (multiple test cases)

### Task Endpoints (4 files)

- `/api/tasks/search` - Used in `app/composables/useTaskWorkspace.ts` (line 76)
- `/api/tasks/[taskId]/permissions` - Used in `app/composables/useTaskDetail.js` (line 39)
- `/api/tasks/[taskId]/response` - Used in `app/composables/useTaskDetail.js` (line 190)
- `/api/tasks/[taskId]/responses/count` - Used in `app/composables/useTaskResponseStats.ts` (line 21)
- `/api/tasks/[id]` - Server exists but NO frontend usage found

### Response Endpoints (4 files)

- `/api/responses` (POST) - Used in `app/components/TaskResponseForm.vue` (line 195)
- `/api/responses/user` - Used in `app/composables/useCompletedTasks.js` (line 25)
- `/api/responses/[taskId]` - Used in `app/composables/useTaskDetail.js` (line 265)
- `/api/responses/[id]` (PUT) - Server exists but NO frontend usage found

### Other Endpoints (3 files)

- `/api/locations/[mapId]` - Used in `app/composables/useLocation.js` (line 10)
- `/api/upload` (POST) - Used in `app/components/TaskFileUpload.vue` (line 280)

## Usage Pattern Summary

### High Usage (Critical for Migration)

1. **useServerAuth.ts** - 3 auth endpoints (start, status, logout)
2. **useTaskDetail.js** - 3 task endpoints (permissions, response, responses/taskId)
3. **useTaskWorkspace.ts** - 2 endpoints (tasks/search, user/profile)

### Medium Usage

- **TaskResponseForm.vue** - 1 endpoint (responses POST)
- **useCompletedTasks.js** - 1 endpoint (responses/user)
- **useTaskResponseStats.ts** - 1 endpoint (tasks/responses/count)
- **TaskFileUpload.vue** - 1 endpoint (upload POST)
- **useLocation.js** - 1 endpoint (locations)

### Low Usage

- **auth-test.vue** - 1 endpoint (user/profile) - test page only

### Unused Server Endpoints

- `/api/tasks/[id]` - No frontend usage found
- `/api/responses/[id]` (PUT) - No frontend usage found

## All Endpoints Inventory

### Authentication (4 files) - ALL WILL BE REMOVED

- `auth/callback.get.ts` - OAuth callback handler **[USED]**
- `auth/logout.post.ts` - Server-side logout **[USED]**
- `auth/start.post.ts` - OAuth initiation **[USED]**
- `auth/status.get.ts` - Auth status check **[USED]**

### Tasks (4 files) - NEED CLIENT-SIDE REPLACEMENT

- `tasks/[id].get.ts` - Get single task **[UNUSED]**
- `tasks/search.get.ts` - Search tasks **[USED]**
- `tasks/[taskId]/permissions.get.ts` - Check task permissions **[USED]**
- `tasks/[taskId]/responses/count.get.ts` - Get response count **[USED]**

### Responses (4 files) - NEED CLIENT-SIDE REPLACEMENT

- `responses.post.ts` - Create response **[USED]**
- `responses/[id].put.ts` - Update response **[UNUSED]**
- `responses/[taskId].get.ts` - Get responses for task **[USED]**
- `responses/user.get.ts` - Get user's responses **[USED]**

### Other (3 files) - EVALUATE EACH

- `user/profile.get.ts` - Get user profile **[USED]**
- `upload.post.ts` - File upload **[USED]**
- `locations/[mapId].get.ts` - Get map locations **[USED]**

## Migration Strategy by Endpoint

### Detailed Migration Plan: One API at a Time

**Iteration Process Per Endpoint:**

1. **Choose target API** - Select next endpoint from priority order
2. **Implement in frontend** - Add client-side equivalent in composables
3. **Archive server endpoint** - Move to `archived-F015-endpoints/` folder
4. **Test functionality** - Verify client-side version works
5. **Remove obsolete tests** - Update/remove server-side API tests
6. **Cleanup** - Remove imports, update types, clean dead code
7. **Test cleanup** - Full app testing to ensure no regressions. Ask for feedback from local dev environment. Tell, what specifically should still work
8. **Git cycle** - `git status → add → status → commit` with descriptive message

### Priority Order for Migration

**Phase 1: Quick Wins (Low Risk)**  

1. **Delete unused endpoints first** - `tasks/[id].get.ts`, `responses/[id].put.ts`
2. **`/api/locations/[mapId]`** - Single usage, likely static data
3. **`/api/responses/user`** - Single usage in useCompletedTasks.js

**Phase 2: Core Data Endpoints (Medium Risk)**  

1. **`/api/tasks/search`** - Core functionality but single usage
2. **`/api/user/profile`** - Multiple usage but straightforward Entu call
3. **`/api/responses/[taskId]`** - Task detail dependency
4. **`/api/tasks/[taskId]/permissions`** - Permissions check
5. **`/api/tasks/[taskId]/responses/count`** - Stats functionality

**Phase 3: Complex Operations (Higher Risk)**  

1. **`/api/responses` (POST)** - Response creation, critical flow
2. **`/api/upload` (POST)** - File handling, needs investigation
3. **Authentication endpoints** - Complete auth system replacement

### Naming Convention for Archived Endpoints

**Proposed structure:**

```text
server/
  archived-F015-endpoints/
    auth/
    tasks/
    responses/
    user/
    locations/
    upload.post.ts
```

**Alternative naming options:**

- `deprecated-F015-apis/`
- `legacy-F015-server-apis/`
- `pre-client-migration/`

### Detailed Strategy by Category

#### Delete Immediately (Phase 1)

- `tasks/[id].get.ts` - **[UNUSED]** - Safe to delete
- `responses/[id].put.ts` - **[UNUSED]** - Safe to delete

#### Convert to Client-Side Entu Calls

- `/api/user/profile` → Direct Entu API `/api/property` call
- `/api/tasks/search` → Direct Entu API `/api/entity` with query
- `/api/responses` → Direct Entu API `/api/entity` POST
- `/api/responses/user` → Direct Entu API `/api/entity` with user filter
- `/api/responses/[taskId]` → Direct Entu API `/api/entity` with task filter
- `/api/tasks/[taskId]/permissions` → Direct Entu API permission check
- `/api/tasks/[taskId]/responses/count` → Client-side counting of responses

#### Needs Investigation

- `/api/upload.post.ts` - File upload to Entu API `/api/file`
- `/api/locations/[mapId].get.ts` - Map data source (static vs Entu)

#### Remove Entirely (Authentication)

- All `/api/auth/` endpoints - Replace with enhanced `useEntuAuth`

### Risk Assessment Per Endpoint

**Low Risk (Start Here):**

- Unused endpoints deletion
- `/api/locations/[mapId]` - Single usage
- `/api/responses/user` - Single usage

**Medium Risk:**

- `/api/tasks/search` - Core but isolated
- `/api/user/profile` - Multiple usage but standard
- Stats/count endpoints - Non-critical features

**High Risk (Do Last):**

- `/api/responses` POST - Critical user flow
- `/api/upload` - Complex file handling
- Authentication system - Core app functionality

## Affected Frontend Files

### Will Need Updates

- `app/composables/useServerAuth.ts` - Remove or replace with `useEntuAuth`
- `app/composables/useTaskWorkspace.ts` - Replace `/api/tasks/search` and `/api/user/profile`
- `app/composables/useCompletedTasks.js` - Replace `/api/responses/user`
- `app/components/TaskResponseForm.vue` - Replace `/api/responses` POST
- `app/pages/auth-test.vue` - Replace `/api/user/profile`

### Existing Client-Side (Keep/Enhance)

- `app/composables/useEntuAuth.js` - Main client-side auth
- `app/composables/useEntuApi.js` - Direct Entu API calls

## Next Steps

1. ✅ Audit complete
2. Rename server APIs with `refactor-F015-` prefix
3. Enhance client-side composables for missing functionality
4. Update frontend to use client-side calls
5. Remove server APIs after successful migration
