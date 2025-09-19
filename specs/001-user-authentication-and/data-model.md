# Data Model: Estonian War Museum Authentication System

**Feature**: User Authentication System for Estonian War Museum  
**Design Date**: 2025-01-26  
**Phase**: 1 - Design & Contracts (Entu-First Approach)

## Entities Overview

The authentication system works exclusively with existing Entu entities through direct API integration:

1. **Entu Person Entity**: Existing user profiles (read-only, accessed via API)
2. **Entu Group Entity**: Existing group structure (read-only, accessed via API)
3. **Frontend Cache**: Temporary localStorage for profile data (client-side only)
4. **Authentication State**: Client-side composable state management

## Existing Entu Entity Structure

### Entu Person Entity (Read-Only)

**Purpose**: Existing Entu person entities provide all necessary user data for educational programs.

**Available Fields** (from your actual data):

```json
{
  "_id": "66b6245c7efc9ac06a437b97",
  "_type": "person",
  "entu_user": "mihkel.putrinsh@gmail.com",
  "email": "mihkel.putrinsh@gmail.com",
  "forename": "Mihkel", 
  "surname": "Putrinš",
  "idcode": "37204030303",
  "_parent": [
    {
      "reference": "686a6c011749f351b9c83124",
      "string": "esimene klass",
      "entity_type": "grupp"
    }
  ],
  "photo": {
    "filename": "michelek.webp",
    "filesize": 436144,
    "filetype": "image/webp"
  },
  "_created": "2024-08-09T14:14:52.460Z"
}
```

**Educational Program Integration**:

- **Student Identity**: `forename` + `surname` + `email`
- **Estonian Student Detection**: `idcode` field presence
- **Program Enrollment**: `_parent` array contains group references
- **Authentication**: `entu_user` email for Entu authentication flow
- **Profile Image**: `photo` object for student identification

**Relationships** (already exist):

- Many-to-many with Groups via `_parent` array
- Authentication via `entu_user` field

### Entu Group Entity (Read-Only)

**Purpose**: Existing Entu group entities represent educational programs without modification.

**Available Fields** (from your actual data):

```json
{
  "_id": "686a6c011749f351b9c83124",
  "_type": "grupp",
  "name": "esimene klass",
  "kirjeldus": [
    {"string": "proovigrupp", "language": "et"},
    {"string": "test group", "language": "en"}
  ],
  "grupijuht": {
    "reference": "66b6245c7efc9ac06a437b97",
    "string": "Mihkel Putrinš",
    "entity_type": "person"
  },
  "_parent": [
    {
      "reference": "66b6245c7efc9ac06a437ba0",
      "string": "esmuuseum",
      "entity_type": "database"
    }
  ]
}
```

**Educational Program Integration**:

- **Program Name**: `name` field ("esimene klass")
- **Multi-language Descriptions**: `kirjeldus` array with et/en languages
- **Program Leader/Educator**: `grupijuht` reference to person entity
- **Program Hierarchy**: `_parent` for program organization
- **Student Enrollment**: Detected via person's `_parent` references to this group

**Relationships** (already exist):

- One-to-many with Persons via person's `_parent` references
- Many-to-one with Person via `grupijuht` (educator relationship)

## Minimal New Entities (ESMuseum Database Only)

### Educational Session

**Purpose**: Temporary session state for educational activities - stored separately from Entu.

**Fields**:

- `id`: Unique session identifier (UUID)
- `entu_person_id`: Reference to Entu person entity (no foreign key constraint)
- `entu_group_id`: Reference to Entu group entity (no foreign key constraint)
- `session_type`: Type of educational session (`MAP_ACTIVITY` | `TASK_COMPLETION` | `PROGRAM_ACCESS`)
- `activity_data`: Current activity state (JSON)
- `progress_data`: Activity progress tracking (JSON)
- `location_data`: GPS/location information (JSON, nullable)
- `started_at`: Session start timestamp
- `last_activity_at`: Most recent activity timestamp
- `expires_at`: Session expiration timestamp
- `status`: Session status (`ACTIVE` | `PAUSED` | `COMPLETED` | `EXPIRED`)

**Purpose**: Tracks temporary educational activity state without modifying Entu entities.

**Relationships**: References only (no foreign keys to avoid Entu dependency)

### Security Event

**Purpose**: Audit logging for educational program access and security monitoring.

**Fields**:

- `id`: Unique event identifier (UUID)
- `entu_person_id`: Reference to Entu person (nullable, no foreign key)
- `session_id`: Reference to Educational Session (foreign key, nullable)
- `event_type`: Type of security event (enum)
- `event_description`: Human-readable event description
- `ip_address`: Client IP address
- `user_agent`: Client user agent string
- `metadata`: Additional event data (JSON)
- `severity`: Event severity level (`low` | `medium` | `high` | `critical`)
- `created_at`: Event occurrence timestamp

**Event Types**:

- `ENTU_AUTH_SUCCESS`: Successful Entu authentication
- `PROGRAM_ACCESS_GRANTED`: Educational program access granted
- `PROGRAM_ACCESS_DENIED`: Educational program access denied
- `ACTIVITY_STARTED`: Educational activity started
- `ACTIVITY_COMPLETED`: Educational activity completed
- `SESSION_EXPIRED`: Educational session expired
- `SUSPICIOUS_ACTIVITY`: Unusual access patterns

**Purpose**: Complete audit trail without storing personal data (references Entu IDs only).

## Educational Program Logic (Using Existing Data)

### Student Detection

```javascript
// Determine if person is Estonian student
function isEstonianStudent(person) {
  return person.idcode !== undefined && person.idcode !== null;
}

// Get student display name
function getStudentName(person) {
  return `${person.forename} ${person.surname}`;
}

// Get student primary email
function getStudentEmail(person) {
  return person.entu_user || person.email;
}
```

### Program Enrollment Detection

```javascript
// Check if person is enrolled in specific program
function isEnrolledInProgram(person, groupId) {
  return person._parent?.some(parent => 
    parent.reference === groupId && parent.entity_type === "grupp"
  );
}

// Get all programs for student
function getStudentPrograms(person) {
  return person._parent?.filter(parent => 
    parent.entity_type === "grupp"
  ) || [];
}
```

### Program Information Extraction

```javascript
// Get program name from group
function getProgramName(group) {
  return group.name;
}

// Get program description in preferred language
function getProgramDescription(group, language = 'et') {
  const desc = group.kirjeldus?.find(d => d.language === language);
  return desc ? desc.string : group.kirjeldus?.[0]?.string || '';
}

// Get program educator
function getProgramEducator(group) {
  return group.grupijuht ? {
    id: group.grupijuht.reference,
    name: group.grupijuht.string
  } : null;
}
```

## Data Relationships

```text
Educational Session (1) ←→ (N) Security Event
Educational Session → Entu Person (reference only)
Educational Session → Entu Group (reference only)

Entu Person ←→ Entu Group (via _parent relationships, managed by Entu)
```

## Integration Strategy

### Authentication Flow

1. **Entu Authentication**: Use existing Entu OAuth2/JWT flow
2. **Session Creation**: Create Educational Session referencing Entu person/group IDs
3. **Program Access**: Validate enrollment via Entu person `_parent` array
4. **Activity Tracking**: Store progress in Educational Session, not in Entu

### Data Access Pattern

1. **Read Entu Data**: Query existing person/group entities via API (read-only)
2. **Cache Profile Data**: Store essential profile info in localStorage for offline access
3. **Manage Auth State**: Handle authentication flow through frontend composables
4. **No Database Required**: All data sourced from Entu API, cached locally only

### Validation Rules

- **Entu Entity References**: Always validate Entu IDs exist before caching
- **Program Enrollment**: Check person `_parent` array for group membership
- **Cache Management**: Implement expiration and refresh policies
- **Data Privacy**: Store minimal data in localStorage, reference Entu IDs only

---

**Design Status**: ✅ COMPLETE  
**Next Artifact**: Integration Tests (`tests/integration/`)  
**Constitutional Compliance**: Modular entities with clear interfaces (Principle III)  
**Integration Approach**: Direct Entu API integration with client-side caching only
