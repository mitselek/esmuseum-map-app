# Quickstart Guide: Estonian War Museum Authentication System

**Feature**: User Authentication System for Estonian War Museum  
**Purpose**: Validation scenarios for direct Entu authentication implementation  
**Target Audience**: Developers, QA Engineers, Product Managers

## Pre-Implementation Validation

This quickstart guide provides validation scenarios to verify the authentication system meets all specification requirements using direct Entu authentication with localStorage profile management.

## Test Environment Setup

### Prerequisites

1. **Development Environment**:

   - Nuxt 3 application running on `http://localhost:3000`
   - Entu API access configured
   - Direct Entu authentication implemented
   - LocalStorage profile management functional

2. **Test Data Requirements**:
   - Entu person entity with Estonian ID code
   - Entu person entity without Estonian ID code (international)
   - Entu group entities for educational programs
   - Existing person-group relationships via `_parent` references

### Configuration Validation

**Environment Variables**:

```bash
# Verify required Entu integration configuration
echo $NUXT_ENTU_API_URL          # Entu API base URL
echo $NUXT_ENTU_CLIENT_ID        # Entu OAuth2 client ID (public client)
echo $NUXT_PUBLIC_APP_URL        # App URL for OAuth2 callbacks

# Note: NUXT_ENTU_CLIENT_SECRET not needed for direct frontend OAuth2
# Only required if implementing server-side authorization code flow
```

**LocalStorage Profile Structure**:

```javascript
// Verify profile structure in browser developer tools
const profile = JSON.parse(localStorage.getItem('esmuseum_user_profile'));
console.log('Profile structure:', {
  person: profile.person,
  groups: profile.groups,
  authenticated_at: profile.authenticated_at,
  expires_at: profile.expires_at
});
```

## User Story Validation Scenarios

### Scenario 1: Direct Entu Authentication (Estonian Student)

**User Story**: _As an Estonian student, I want to authenticate directly with Entu using my digital identity so that I can access Museum School programs with my existing enrollment._

**Validation Steps**:

1. **Navigate to Authentication**:

   ```text
   URL: http://localhost:3000/login
   Expected: Login form with "Login with Entu" button
   ```

2. **Initiate Entu Authentication**:

   ```text
   Action: Click "Login with Entu" button
   Expected: Redirect to Entu OAuth2 authentication
   ```

3. **Complete Entu Authentication**:

   ```text
   Action: Follow Entu authentication process (Smart-ID/Mobile-ID/Estonian ID)
   Expected: OAuth2 callback with JWT token
   ```

4. **Verify Profile Fetching**:

   ```text
   Action: Check browser developer tools → Application → Local Storage
   Expected: 'esmuseum_user_profile' contains person and groups data
   ```

5. **Validate Estonian Student Detection**:

   ```javascript
   const profile = JSON.parse(localStorage.getItem('esmuseum_user_profile'));
   console.log('Student type:', profile.person.idcode ? 'ESTONIAN' : 'INTERNATIONAL');
   // Expected: 'ESTONIAN' for users with idcode field
   ```

6. **Check Program Enrollment**:

   ```javascript
   const enrolledPrograms = profile.person._parent.filter(p => p.entity_type === 'grupp');
   console.log('Enrolled programs:', enrolledPrograms);
   // Expected: Array of educational programs this student can access
   ```

**Success Criteria**:

- ✅ Direct Entu OAuth2 authentication completed
- ✅ Person entity fetched and stored in localStorage
- ✅ Associated group entities fetched and stored
- ✅ Estonian student type detected via idcode field
- ✅ Program enrollment detected via _parent relationships

### Scenario 2: International Student Authentication

**User Story**: _As an international student, I want to authenticate with Entu using my email so that I can access educational programs I'm enrolled in._

**Validation Steps**:

1. **Authenticate via Entu**:

   ```text
   Action: Complete Entu authentication flow
   Expected: Successful authentication regardless of nationality
   ```

2. **Verify International Student Detection**:

   ```javascript
   const profile = JSON.parse(localStorage.getItem('esmuseum_user_profile'));
   const isEstonian = profile.person.idcode !== undefined;
   console.log('Student type:', isEstonian ? 'ESTONIAN' : 'INTERNATIONAL');
   // Expected: 'INTERNATIONAL' for users without idcode field
   ```

3. **Check Profile Completeness**:

   ```javascript
   const person = profile.person;
   console.log('Profile:', {
     name: `${person.forename} ${person.surname}`,
     email: person.entu_user || person.email,
     groups: profile.groups.length
   });
   // Expected: Complete profile data from Entu
   ```

4. **Validate Program Access**:

   ```text
   Action: Navigate to enrolled educational program
   Expected: Access granted based on _parent relationships
   ```

**Success Criteria**:

- ✅ International student authentication working
- ✅ Student type correctly identified as non-Estonian
- ✅ Profile data complete from Entu person entity
- ✅ Program access based on existing enrollment

### Scenario 3: LocalStorage Profile Management

**User Story**: _As a student, I want my profile to be cached locally so that I can continue educational activities without repeated authentication._

**Validation Steps**:

1. **Authenticate and Store Profile**:

   ```javascript
   // After authentication, verify localStorage
   const profile = JSON.parse(localStorage.getItem('esmuseum_user_profile'));
   console.log('Stored profile:', {
     person_id: profile.person._id,
     groups_count: profile.groups.length,
     expires_at: profile.expires_at
   });
   ```

2. **Test Offline Access**:

   ```text
   Action: Disconnect from internet
   Action: Navigate between educational program pages
   Expected: Profile data available from localStorage
   Expected: Basic functionality works offline
   ```

3. **Verify Profile Expiration**:

   ```javascript
   const profile = JSON.parse(localStorage.getItem('esmuseum_user_profile'));
   const isExpired = new Date() > new Date(profile.expires_at);
   console.log('Profile expired:', isExpired);
   // Test with both valid and expired profiles
   ```

4. **Test Profile Refresh**:

   ```text
   Action: Force profile refresh when near expiration
   Expected: New authentication cycle initiated
   Expected: Fresh profile data fetched from Entu
   ```

**Success Criteria**:

- ✅ Profile stored in localStorage after authentication
- ✅ Offline functionality works with cached profile
- ✅ Profile expiration handled appropriately
- ✅ Profile refresh mechanism functional

### Scenario 4: Educational Program Access Control

**User Story**: _As a student, I want to access only the educational programs I'm enrolled in so that I can participate in my assigned activities._

**Validation Steps**:

1. **Check My Program Access**:

   ```javascript
   function isEnrolledInProgram(userProfile, groupId) {
     return userProfile.person._parent.some(parent => 
       parent.reference === groupId && parent.entity_type === "grupp"
     );
   }
   
   const profile = JSON.parse(localStorage.getItem('esmuseum_user_profile'));
   const testGroupId = "686a6c011749f351b9c83124";
   console.log('Can access program:', isEnrolledInProgram(profile, testGroupId));
   ```

2. **View My Program Information**:

   ```javascript
   function getProgramInfo(group, language = 'et') {
     const description = group.kirjeldus?.find(d => d.language === language);
     return {
       id: group._id,
       name: group.name,
       description: description ? description.string : group.kirjeldus?.[0]?.string || '',
       educator: group.grupijuht ? group.grupijuht.string : null
     };
   }
   
   const profile = JSON.parse(localStorage.getItem('esmuseum_user_profile'));
   profile.groups.forEach(group => {
     console.log('My program:', getProgramInfo(group));
   });
   ```

3. **Test Access Control**:

   ```text
   Action: Attempt to access program not in my enrollment list
   Expected: Access denied with clear message
   ```

4. **Verify Language Preferences**:

   ```javascript
   const group = profile.groups[0];
   console.log('Estonian description:', getProgramInfo(group, 'et'));
   console.log('English description:', getProgramInfo(group, 'en'));
   ```

**Success Criteria**:

- ✅ Student can see their enrolled programs
- ✅ Program information displayed clearly
- ✅ Access control prevents unauthorized program access
- ✅ Multi-language program descriptions work for student preferences

## Performance and Accessibility Validation

### Performance Requirements

**Load Time Validation**:

```bash
# Test initial page load time
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/login"
# Expected: Total time < 3 seconds (constitutional requirement)
```

**Profile Fetch Performance**:

```javascript
// Test profile loading and caching performance
console.time('Profile Load');
const profile = JSON.parse(localStorage.getItem('esmuseum_user_profile'));
console.timeEnd('Profile Load');
// Expected: Instant access from localStorage (< 10ms)
```

### Accessibility Compliance

**WCAG 2.1 AA Validation**:

1. **Keyboard Navigation**:

   ```text
   Action: Navigate entire authentication flow using only keyboard
   Expected: All interactive elements accessible via Tab/Enter
   ```

2. **Screen Reader Compatibility**:

   ```text
   Tool: Use NVDA/JAWS screen reader
   Expected: All form fields and buttons properly announced
   Expected: Error messages clearly communicated
   ```

3. **Language Support**:

   ```text
   Action: Switch between Estonian and English languages
   Expected: All authentication content properly translated
   Expected: Program descriptions shown in selected language
   ```

4. **Color Contrast**:

   ```text
   Tool: Browser contrast checking extension
   Expected: All text meets WCAG AA contrast requirements
   Expected: Error states clearly visible without color dependence
   ```

## Progressive Enhancement Validation

### No-JavaScript Functionality

**Test Without JavaScript**:

1. **Disable JavaScript in browser**
2. **Navigate to login form**
3. **Click "Login with Entu" button**
4. **Expected**: Server-side redirect to Entu OAuth2 works
5. **Expected**: Basic authentication flow functional without JavaScript

### Mobile Responsiveness

**Mobile Device Testing**:

1. **Responsive Design**:

   ```text
   Device: iPhone/Android viewport (375px width)
   Expected: Authentication forms fully functional on mobile
   Expected: Touch-friendly interface elements
   ```

2. **Touch Interactions**:

   ```text
   Action: Use authentication flow on touch device
   Expected: All buttons appropriately sized for touch
   Expected: No horizontal scrolling required
   ```

## Integration Validation

### Entu API Integration

**Test Direct API Access**:

```javascript
// Verify Entu API connectivity and response format
const testEntuApi = async () => {
  try {
    const response = await fetch(`${ENTU_API_URL}/person/${personId}`, {
      headers: { Authorization: `Bearer ${entuJwtToken}` }
    });
    const person = await response.json();
    console.log('Entu person data:', person);
    return person;
  } catch (error) {
    console.error('Entu API error:', error);
  }
};
```

### LocalStorage Persistence

**Test Storage Limits and Performance**:

```javascript
// Test localStorage capacity and performance
const testStorage = () => {
  const profile = JSON.parse(localStorage.getItem('esmuseum_user_profile'));
  const profileSize = JSON.stringify(profile).length;
  console.log('Profile size:', profileSize, 'characters');
  console.log('LocalStorage available:', 
    navigator.storage && navigator.storage.estimate ? 
    navigator.storage.estimate() : 'Unknown');
};
```

## Post-Implementation Checklist

**Constitutional Compliance**:

- [ ] Specification-first development completed
- [ ] Test-driven development approach followed
- [ ] Modular architecture implemented
- [ ] Progressive enhancement functional
- [ ] Security standards met

**Business Requirements**:

- [ ] Direct Entu authentication working
- [ ] Profile caching in localStorage functional
- [ ] Educational program access control via _parent relationships
- [ ] Estonian/international student detection working
- [ ] Multi-language program information supported

**Technical Requirements**:

- [ ] Performance targets met (<3s load, instant localStorage access)
- [ ] Accessibility compliance verified (WCAG 2.1 AA)
- [ ] Multi-language support functional (Estonian/English)
- [ ] Mobile responsiveness confirmed
- [ ] Entu API integration working
- [ ] Offline capability via localStorage confirmed

---

**Quickstart Status**: Updated for direct Entu authentication approach  
**Next Phase**: Implementation Planning  
**Usage**: Execute scenarios after direct Entu authentication implementation
