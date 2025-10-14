# F022: TypeScript Entity Types for Entu

**Status**: ✅ Completed (EXTENDED - See Note Below)  
**Created**: October 2, 2025  
**Branch**: `feature/F022-entu-entity-types`

> **📢 IMPORTANT NOTE**: This document describes the **ORIGINAL** F022 plan (creating type definitions).  
> F022 actually went **WAY BEYOND** this - we migrated **ALL 9 COMPOSABLES** to TypeScript!  
> **See the complete story**: [F022-COMPOSABLE-MIGRATION.md](./F022-COMPOSABLE-MIGRATION.md)

## Overview

Comprehensive TypeScript type system for Entu entities, providing type safety, better autocomplete, and improved developer experience across the application. Based on real sample entity data from the Entu database.

*Note: This original plan was completed AND extended to include full composable migration to TypeScript (100% type coverage achieved!)*  

## Motivation

**Problem**: The codebase was using plain JavaScript objects to represent Entu entities, leading to:

- Runtime errors from accessing undefined properties
- Poor IDE autocomplete support
- Lack of documentation about entity structure
- Difficult refactoring due to no type checking
- Unclear property access patterns (array-based properties)

**Solution**: Create a comprehensive TypeScript type system that:

- Models Entu's unique property structure (arrays of typed objects)
- Provides type-safe entity interfaces for all core entity types
- Includes helper functions for extracting values from property arrays
- Offers type guards for runtime type checking
- Documents the entity structure through types

## Implementation

### Type System Structure

#### 1. Base Property Types (`types/entu.ts`)

Entu stores all properties as arrays of objects with an `_id` and a value field:

```typescript
// String property
interface EntuStringProperty {
  _id: string;
  string: string;
  language?: string;
}

// Reference property (links to other entities)
interface EntuReferenceProperty {
  _id: string;
  reference: string;
  property_type?: string;
  string?: string; // Display text
  entity_type?: string; // Referenced entity type
  inherited?: boolean;
}

// Number, Boolean, DateTime, File, Date properties...
```

#### 2. Base Entity Interface

Common properties shared by all entities:

```typescript
interface EntuEntity {
  _id: string;
  _type: EntuReferenceProperty[];
  _parent?: EntuReferenceProperty[];
  _owner?: EntuReferenceProperty[];
  _created?: EntuDateTimeProperty[];
  _sharing?: EntuStringProperty[];
  _inheritrights?: EntuBooleanProperty[];
  // ... permissions and metadata
}
```

#### 3. Entity-Specific Interfaces

Typed interfaces for each entity type:

```typescript
// Task (ulesanne)
interface EntuTask extends EntuEntity {
  name: EntuStringProperty[];
  kaart?: EntuReferenceProperty[]; // Map reference
  grupp?: EntuReferenceProperty[]; // Group reference
  kirjeldus?: EntuStringProperty[]; // Description
  tahtaeg?: EntuDateTimeProperty[]; // Deadline
  vastuseid?: EntuNumberProperty[]; // Response count
}

// Response (vastus)
interface EntuResponse extends EntuEntity {
  valitud_asukoht?: EntuReferenceProperty[]; // Selected location reference (which location was chosen)
  vastus?: EntuStringProperty[]; // Text response
  photo?: EntuFileProperty[]; // Photo file
  seadme_gps?: EntuStringProperty[]; // Device GPS coordinates (where student was at submission)
}

// Location (asukoht)
interface EntuLocation extends EntuEntity {
  name: EntuStringProperty[];
  kirjeldus?: EntuStringProperty[];
  lat?: EntuNumberProperty[];
  long?: EntuNumberProperty[];
}

// Map (kaart), Group (grupp), Person (person)...
```

### Helper Utilities (`utils/entu-helpers.ts`)

#### Value Extraction Functions

Extract values from Entu property arrays with proper typing:

```typescript
// Generic value extractors
getStringValue(property: EntuStringProperty[], index = 0): string | undefined
getReferenceValue(property: EntuReferenceProperty[], index = 0): string | undefined
getNumberValue(property: EntuNumberProperty[], index = 0): number | undefined
getBooleanValue(property: EntuBooleanProperty[], index = 0): boolean | undefined
getDateTimeValue(property: EntuDateTimeProperty[], index = 0): string | undefined

// Array extractors
getStringValues(property: EntuStringProperty[]): string[]
getReferenceValues(property: EntuReferenceProperty[]): string[]
```

#### Entity-Specific Helpers

Convenient functions for common operations:

```typescript
// Task helpers
getTaskName(task: EntuTask): string
getTaskDescription(task: EntuTask): string | undefined
getTaskDeadline(task: EntuTask): Date | undefined
getTaskResponseCount(task: EntuTask): number
getTaskMapReference(task: EntuTask): string | undefined

// Response helpers
getResponseText(response: EntuResponse): string | undefined
getResponseLocationReference(response: EntuResponse): string | undefined
getResponseCoordinates(response: EntuResponse): { lat: number; lng: number } | undefined

// Location helpers
getLocationName(location: EntuLocation): string
getLocationCoordinates(location: EntuLocation): { lat: number; lng: number } | undefined
```

#### Type Guards

Runtime type checking:

```typescript
// Property type guards
isStringProperty(prop: EntuProperty): prop is EntuStringProperty
isReferenceProperty(prop: EntuProperty): prop is EntuReferenceProperty
isNumberProperty(prop: EntuProperty): prop is EntuNumberProperty

// Entity type guards
isTask(entity: EntuEntity): entity is EntuTask
isResponse(entity: EntuEntity): entity is EntuResponse
isLocation(entity: EntuEntity): entity is EntuLocation
```

## Usage Examples

### Before: Unsafe Property Access

```javascript
// No type safety, prone to errors
function displayTask(task) {
  // What if name is undefined? What if it's not an array?
  const title = task.name?.[0]?.string || "Untitled";

  // Is vastuseid a number or an array with number property?
  const count = task.vastuseid?.[0]?.number || 0;

  // How do we know kaart has a reference property?
  const mapId = task.kaart?.[0]?.reference;
}
```

### After: Type-Safe Access

```typescript
import type { EntuTask } from "~/types/entu";
import {
  getTaskName,
  getTaskResponseCount,
  getTaskMapReference,
} from "~/utils/entu-helpers";

function displayTask(task: EntuTask) {
  // Type-safe with autocomplete
  const title = getTaskName(task); // Always returns string
  const count = getTaskResponseCount(task); // Always returns number
  const mapId = getTaskMapReference(task); // Returns string | undefined
}
```

### Working with Responses

```typescript
import type { EntuResponse } from "~/types/entu";
import {
  getResponseText,
  getResponseCoordinates,
  getResponseLocationReference,
} from "~/utils/entu-helpers";

function processResponse(response: EntuResponse) {
  const text = getResponseText(response);
  const coords = getResponseCoordinates(response);
  const locationRef = getResponseLocationReference(response);

  if (coords) {
    console.log(`Response at ${coords.lat}, ${coords.lng}`);
  }

  // TypeScript knows coords is { lat: number; lng: number } or undefined
}
```

### Type Guards for Dynamic Content

```typescript
import type { EntuEntity } from "~/types/entu";
import { isTask, isResponse, isLocation } from "~/types/entu";
import {
  getTaskName,
  getResponseText,
  getLocationName,
} from "~/utils/entu-helpers";

function displayEntity(entity: EntuEntity) {
  if (isTask(entity)) {
    // TypeScript now knows entity is EntuTask
    return getTaskName(entity);
  }

  if (isResponse(entity)) {
    // TypeScript now knows entity is EntuResponse
    return getResponseText(entity) || "No text";
  }

  if (isLocation(entity)) {
    // TypeScript now knows entity is EntuLocation
    return getLocationName(entity);
  }
}
```

## Migration Guide

### Step 1: Import Types

```typescript
// Import entity types
import type { EntuTask, EntuResponse, EntuLocation } from "~/types/entu";

// Import helper functions
import {
  getTaskName,
  getTaskDescription,
  getResponseCoordinates,
} from "~/utils/entu-helpers";
```

### Step 2: Update Function Signatures

```typescript
// Before
export function useTaskDetail() {
  const task = ref(null);

  function loadTask(taskData) {
    task.value = taskData;
  }
}

// After
import type { EntuTask } from "~/types/entu";

export function useTaskDetail() {
  const task = ref<EntuTask | null>(null);

  function loadTask(taskData: EntuTask) {
    task.value = taskData;
  }
}
```

### Step 3: Replace Direct Property Access

```typescript
// Before
const taskName = task.value?.name?.[0]?.string || "Untitled";
const mapRef = task.value?.kaart?.[0]?.reference;

// After
import { getTaskName, getTaskMapReference } from "~/utils/entu-helpers";

const taskName = task.value ? getTaskName(task.value) : "Untitled";
const mapRef = task.value ? getTaskMapReference(task.value) : undefined;
```

### Step 4: Use Type Guards

```typescript
// Before
if (entity._type?.[0]?.string === "ulesanne") {
  // Process as task
}

// After
import { isTask } from "~/types/entu";

if (isTask(entity)) {
  // TypeScript knows entity is EntuTask
  const name = getTaskName(entity);
}
```

## Benefits Realized

### 1. Type Safety

```typescript
// Compiler catches errors
function processTask(task: EntuTask) {
  const invalid = task.invalidProperty; // ❌ TypeScript error
  const name = getTaskName(task); // ✅ Type-safe
}
```

### 2. Better Autocomplete

IDE shows all available properties and helper functions with documentation.

### 3. Refactoring Safety

When entity structure changes, TypeScript highlights all affected code.

### 4. Self-Documenting

Types serve as inline documentation:

```typescript
interface EntuTask extends EntuEntity {
  /** Task name */
  name: EntuStringProperty[];

  /** Associated map reference */
  kaart?: EntuReferenceProperty[];

  /** Number of responses submitted */
  vastuseid?: EntuNumberProperty[];
}
```

### 5. Reduced Runtime Errors

Type checking catches errors at compile time instead of runtime.

## Files Created

- `types/entu.ts` (450+ lines)

  - Base property types
  - Base entity interface
  - Entity-specific interfaces (Task, Response, Location, Map, Group, Person)
  - Type guards
  - Utility types

- `utils/entu-helpers.ts` (400+ lines)
  - Value extraction functions
  - Entity-specific helpers
  - Common entity helpers
  - Type-safe coordinate parsing

## Future Enhancements

### Phase 2: Complete Migration

- [ ] Migrate all composables to use typed entities
- [ ] Update components to use helper functions
- [ ] Add types to API response handlers
- [ ] Type Entu API client functions

### Phase 3: Advanced Types

- [ ] Generic type for property arrays: `EntuProp<T>`
- [ ] Builder pattern for creating entities
- [ ] Validation schemas using Zod or similar
- [ ] Code generation from `model.json`

### Phase 4: Documentation

- [ ] Generate API documentation from types
- [ ] Interactive type explorer
- [ ] Migration tooling (codemod scripts)

## Testing

### Type Checking

```bash
# Verify types compile without errors
npm run typecheck

# Or with Nuxt
nuxi typecheck
```

### Manual Verification

```typescript
// Create test file to verify types work correctly
import type { EntuTask } from "~/types/entu";
import { getTaskName, getTaskMapReference } from "~/utils/entu-helpers";

// Sample entity from ulesanne.sample.json
const task: EntuTask = {
  _id: "68bab85d43e4daafab199988",
  _type: [
    { _id: "...", reference: "...", string: "ulesanne", entity_type: "entity" },
  ],
  name: [{ _id: "...", string: "proovikas" }],
  kaart: [{ _id: "...", reference: "68823f8b5d95233e69c29a07", string: "..." }],
  vastuseid: [{ _id: "...", number: 25 }],
};

// Verify helpers work
const name = getTaskName(task); // "proovikas"
const mapRef = getTaskMapReference(task); // "68823f8b5d95233e69c29a07"
```

## Related Features

- **F001**: Initial Entu entity type definitions
- **F013**: Enhanced response creation with location data
- **F015**: Client-side entity operations

## References

- Sample entities: `.copilot-workspace/model/*.sample.json`
- Data model documentation: `.copilot-workspace/model/model.md`
- Entu API documentation: (internal)

## Contributors

- Initial implementation based on real sample data analysis
- Types cover all core entity types used in the application
