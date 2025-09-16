# Archived F015 Server Endpoints

This directory contains server API endpoints that have been migrated to client-side implementations as part of Feature F015 (Client-Side Architecture Migration).

## Migration Process

Each endpoint follows this workflow:

1. Implement client-side equivalent in frontend composables
2. Test parallel implementation thoroughly
3. Switch frontend to use client-side version
4. Move server endpoint here to archived-F015-endpoints/
5. Clean up and test
6. Git commit with descriptive message

## Directory Structure

- `auth/` - Authentication endpoints (OAuth flow, session management)
- `tasks/` - Task-related endpoints (search, permissions, etc.)
- `responses/` - Response management endpoints (CRUD operations)
- `user/` - User profile and data endpoints
- `locations/` - Map and location data endpoints
- Root level files for standalone endpoints (upload.post.ts, etc.)

## Deletion Timeline

These archived endpoints will be deleted after:

1. ✅ All frontend code confirmed working with client-side versions
2. ✅ All tests updated and passing
3. ✅ Production deployment successful
4. ✅ 1-2 week observation period with no issues

**Target deletion date: ~2 weeks after final endpoint migration**  

## Original Endpoints Documentation

See `.copilot-workspace/features/F015-api-audit.md` for complete documentation of original usage patterns and migration strategy.
