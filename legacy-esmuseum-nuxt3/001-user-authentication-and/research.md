# Research Report: Estonian War Museum Authentication System

**Feature**: User Authentication System for Estonian War Museum  
**Research Date**: 2025-01-26  
**Research Phase**: Phase 0 Complete

## Estonian Digital Identity Integration

### Authentication Approach Decision

Hybrid authentication approach supporting both Estonian digital identity and traditional email/password credentials.

### Rationale for Hybrid Approach

- Educational programs serve both Estonian students (with national digital ID) and international students
- Estonian digital identity provides higher security and compliance with local standards
- Traditional authentication ensures accessibility for international educational programs
- Museums must accommodate diverse visitor demographics

### Alternative Approaches Considered

1. **Estonian-only authentication**: Excluded due to international student accessibility requirements
2. **Traditional-only authentication**: Excluded due to Estonian digital standards compliance needs
3. **Single Sign-On (SSO) only**: Excluded due to complexity and educational institution integration requirements

### Technical Implementation Notes

- TARA (Estonian government authentication service) integration for Estonian digital identity
- Support for Estonian ID card, Smart-ID, and Mobile-ID authentication methods
- OAuth 2.0 / OpenID Connect for international authentication providers
- Session management designed for educational activity persistence

## Legacy Implementation Analysis

### Legacy Reference Strategy

Reference legacy Estonian digital identity patterns from `legacy-esmuseum-nuxt3/` without direct code copying.

### Strategic Rationale

- Constitutional requirement for fresh implementation maintaining independence
- Legacy code provides proven patterns for Estonian digital identity flows
- Avoid technical debt while leveraging institutional knowledge
- Ensure constitutional compliance with modular architecture principles

### Key Patterns Identified

1. **TARA Service Integration**: Estonian government authentication service connection patterns
2. **Multi-language Support**: Estonian/English language switching for authentication flows
3. **Session Management**: Educational workflow session persistence across activities
4. **Error Handling**: User-friendly error messages for authentication failures
5. **Mobile Optimization**: Touch-friendly authentication interfaces for museum visitors

### Implementation Guidance

- Use legacy patterns as architectural reference, not code source
- Adapt session management patterns for current Nuxt 3 architecture
- Apply internationalization patterns to new Vue 3 composition API approach
- Reference error handling strategies for educational user experience

## Current Implementation Strategy

### Simplified Authentication Flow

The current implementation uses a streamlined approach:

1. **Entu Authentication**: Authenticate user via existing Entu OAuth2/JWT flow
2. **Fetch User Profile**: Retrieve person entity and associated group entities from Entu API
3. **Local Storage**: Store user profile (person + groups) in browser localStorage
4. **Session Management**: Use stored profile for educational program access

### Implementation Rationale

- **Minimal Integration**: Work with existing Entu structure without modifications
- **Offline Capability**: LocalStorage enables offline access to user profile
- **Performance**: Reduce API calls by caching user data locally
- **Simplicity**: Single authentication source (Entu) with local data management

### Technical Flow

**Authentication Process**:

```javascript
// 1. Entu OAuth2 authentication
const authResult = await entuAuth.authenticate();

// 2. Fetch person entity
const personData = await entuApi.getPerson(authResult.user_id);

// 3. Fetch associated groups
const groupsData = await Promise.all(
  personData._parent.map(parent => 
    parent.entity_type === 'grupp' ? entuApi.getGroup(parent.reference) : null
  )
);

// 4. Store complete user profile
const userProfile = {
  person: personData,
  groups: groupsData.filter(Boolean),
  authenticated_at: new Date().toISOString(),
  expires_at: calculateExpiration(authResult.expires_in)
};

localStorage.setItem('esmuseum_user_profile', JSON.stringify(userProfile));
```

**User Profile Structure**:

```typescript
// Import from single source of truth
import type { UserProfile, EntuPerson, EntuGroup } from './types'

// Complete type-safe profile structure
const userProfile: UserProfile = {
  person: personData,     // EntuPerson interface
  groups: groupsData,     // EntuGroup[] interface
  authenticated_at: new Date().toISOString(),
  expires_at: calculateExpiration(authResult.expires_in)
}
```

**Type Definitions**: See `types.ts` for complete interface definitions

### Educational Program Detection

**Student Type Detection**:

```typescript
import { isEstonianStudent, type EntuPerson, type StudentType } from './types'

function getStudentType(person: EntuPerson): StudentType {
  return isEstonianStudent(person) ? 'ESTONIAN' : 'INTERNATIONAL'
}

function getStudentName(person: EntuPerson): string {
  return `${person.forename} ${person.surname}`
}
```

**Program Enrollment**:

```typescript
import { isEnrolledInProgram, type UserProfile, type EntuGroup } from './types'

function getEnrolledPrograms(userProfile: UserProfile): EntuGroup[] {
  return userProfile.groups.filter(group => 
    isEnrolledInProgram(userProfile, group._id)
  )
}

// Use built-in type guard
const hasAccess = isEnrolledInProgram(userProfile, groupId)
```

**Program Information**:

```typescript
import type { EntuGroup, ProgramInfo, SupportedLanguage } from './types'

function getProgramInfo(group: EntuGroup, language: SupportedLanguage = 'et'): ProgramInfo {
  const description = group.kirjeldus?.find(d => d.language === language)
  return {
    id: group._id,
    name: group.name,
    description: description?.string || group.kirjeldus?.[0]?.string || '',
    educator: group.grupijuht?.string || null,
    language
  }
}
```

### Local Storage Management

**Profile Caching Strategy**:

- Store complete user profile after successful authentication
- Check expiration before using cached data
- Refresh profile data when accessing educational programs
- Clear profile on logout or expiration

**Storage Implementation**:

```typescript
import type { UserProfile } from './types'

// Store profile with type safety
function storeUserProfile(profile: UserProfile): void {
  localStorage.setItem('esmuseum_user_profile', JSON.stringify(profile))
}

// Get cached profile with type safety
function getCachedUserProfile(): UserProfile | null {
  const cached = localStorage.getItem('esmuseum_user_profile')
  if (!cached) return null
  
  try {
    const profile: UserProfile = JSON.parse(cached)
    if (new Date() > new Date(profile.expires_at)) {
      localStorage.removeItem('esmuseum_user_profile')
      return null
    }
    return profile
  } catch (error) {
    localStorage.removeItem('esmuseum_user_profile')
    return null
  }
}

// Clear profile
function clearUserProfile(): void {
  localStorage.removeItem('esmuseum_user_profile')
}
```

## Performance and Security Requirements

### Security and Performance Strategy

Token-based authentication with refresh mechanisms, optimized for 3-second constitutional load time requirement.

### Performance Strategy Rationale

- Constitutional performance requirement: <3 seconds initial load time
- Educational sessions require persistence across multiple tasks/activities
- Security standards must meet GDPR and Estonian data protection requirements
- Mobile-first approach for museum field activities

### Security Implementation Strategy

**Authentication Security**:

- JWT tokens with short expiration (15 minutes) and refresh token rotation
- Secure HTTP-only cookies for token storage
- CSRF protection for all authentication endpoints
- Rate limiting for authentication attempts

**Educational Data Protection**:

- GDPR-compliant personal data handling for student information
- Estonian data protection standards for educational institutions
- Secure storage of educational progress and submissions
- Access logging for educational program administration

**Performance Optimization**:

- Lazy loading of authentication components
- Progressive enhancement for core authentication without JavaScript
- Optimized bundle size for mobile connections
- Caching strategies for frequently accessed educational content

### Compliance Requirements

1. **GDPR Compliance**: Student data collection, processing, and retention policies
2. **Estonian Standards**: Digital identity integration with national infrastructure
3. **Educational Standards**: Appropriate data protection for minor students
4. **Accessibility Standards**: WCAG 2.1 AA compliance for diverse learners

## Technology Stack Decisions

### Technology Selection

TypeScript 5.x with Nuxt 3, Vue 3 composition API, and Vitest for testing framework.

### Technology Rationale

- Existing project technology stack provides solid foundation
- TypeScript ensures type safety for authentication flows
- Vue 3 composition API aligns with modular architecture principles
- Vitest provides fast test execution for TDD workflow

### Testing Strategy

- **Unit Tests**: Individual authentication functions and composables
- **Integration Tests**: Authentication flow end-to-end scenarios
- **Contract Tests**: API endpoint request/response validation
- **Accessibility Tests**: WCAG 2.1 AA compliance verification
- **Performance Tests**: 3-second load time validation

### Development Workflow

- TDD approach: Tests written before implementation
- Progressive enhancement: Core functionality without JavaScript first
- Mobile-first responsive design for museum field usage
- Internationalization support for Estonian/English languages

---

**Research Status**: COMPLETE  
**Next Phase**: Design & Contracts (Phase 1)  
**Constitutional Compliance**: Verified - all decisions align with ESMuseum Constitution v1.1.0
