# F001: Entu OAuth Authentication

**Status:** Completed  
**Date:** July 7, 2025  
**Author:** AI Assistant & Team  

## Summary

Implemented a robust OAuth-based authentication system for the ESMuseum Map App, integrating with Entu's OAuth.ee service. This feature provides secure user authentication while restricting API key authentication to backend/maintenance tasks only.

## Motivation

- Replace the previous API key-based authentication with a more secure OAuth flow
- Improve user experience by supporting multiple authentication providers
- Separate public user authentication from backend maintenance operations
- Enhance security by eliminating direct API key exposure in the frontend

## Features Implemented

### OAuth Authentication Flow

- Integrated with Entu's OAuth.ee service for secure authentication
- Supported multiple authentication providers:
  - Google
  - Apple
  - Smart-ID
  - Mobile-ID
  - ID-Card (Estonian ID)
- Implemented proper OAuth callback handling with token extraction
- Added reliable token storage and automatic refresh mechanisms

### Backend-only API Key Authentication

- Created a separate composable `useEntuAdminAuth.js` for backend-only API key authentication
- Removed all API key authentication options from the user interface
- Added clear documentation indicating API key use is for backend/maintenance only
- Preserved API key functionality for scripting and maintenance tasks

### User Interface

- Redesigned login page with OAuth provider selection
- Added clear error messaging for authentication issues
- Implemented automatic redirection to requested pages after successful login
- Created user information display after successful authentication

### Developer Tools

- Added comprehensive documentation for authentication methods
- Implemented browser console tools for API testing and debugging
- Created developer console page with API testing capabilities
- Added detailed documentation on the OAuth flow and available authentication providers

## Technical Implementation

### Key Components

1. **Authentication Composables:**
   - `useEntuAuth.js` - Core authentication state management
   - `useEntuOAuth.js` - OAuth flow handling and provider selection
   - `useEntuAdminAuth.js` - Backend-only API key authentication

2. **API Integration:**
   - `useEntuApi.js` - API communication with automatic token handling

3. **User Interface:**
   - `login/index.vue` - User-facing login page with provider selection
   - `auth/callback.vue` - OAuth callback handler

4. **Security Measures:**
   - No API keys stored in frontend code
   - Token-based authentication with automatic refresh
   - Clear separation between user authentication and backend operations

### OAuth Flow Process

1. User selects an authentication provider on the login page
2. Application redirects to Entu's OAuth.ee service with the selected provider
3. User completes authentication with the chosen provider
4. OAuth.ee redirects back to the application with a temporary token
5. Application extracts the token and uses it to obtain a permanent JWT token
6. JWT token is stored securely and used for all API requests

## Testing

The OAuth authentication flow was thoroughly tested with all supported providers:

- Google authentication
- Apple authentication
- Smart-ID authentication
- Mobile-ID authentication
- ID-Card authentication

All providers were verified to correctly authenticate users and provide proper token exchange.

## User Experience Improvements

- Streamlined login flow with clear provider selection
- Automatic redirection to requested pages after login
- Informative error messages
- Consistent authentication state management across app sessions

## Future Enhancements

Potential improvements for future iterations:

- Implement token refresh handling for long-running sessions
- Add remember-me functionality for persistent authentication
- Enhance error handling for specific OAuth provider issues
- Create more detailed user profile information display
- Add logout confirmation dialog

## Related Documentation

- [Entu Authentication Guide](/docs/authentication/entu-authentication.md)
- [API Requests Examples](/docs/api-requests/entu.http)
- [Technical Notes](/docs/technical-notes.md)
