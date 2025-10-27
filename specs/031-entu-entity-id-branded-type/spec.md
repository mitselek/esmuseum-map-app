# Feature Specification: EntuEntityId Branded Type

**Feature ID**: 031

**Status**: Implementation

**Priority**: Medium (Type Safety Improvement)

**Created**: 2025-10-27

## Overview

Implement a branded type for Entu entity IDs to provide compile-time type safety and prevent accidental mixing of MongoDB ObjectIds with regular strings.

## Problem Statement

Currently, all Entu entity IDs (`_id` and `reference` fields) are typed as `string`, which allows:

- Accidental assignment of arbitrary strings to entity ID fields
- No compile-time validation of MongoDB ObjectId format (24-character hex)
- Potential runtime errors from invalid IDs passed to Entu API
- Loss of semantic meaning in type system (any string looks like an ID)

**Example of current issue**:

```typescript
const taskId: string = "invalid-id" // No error
const response = await entuApi.getEntity(taskId) // Runtime failure
```

## Goals

1. Create `EntuEntityId` branded type for compile-time type safety
2. Prevent mixing entity IDs with regular strings at type level
3. Provide validation functions for runtime checks (24-char hex format)
4. Update all Entu type definitions to use branded type
5. Maintain zero runtime cost (branded types are compile-time only)

## Non-Goals

- Changing runtime behavior of existing code
- Adding runtime validation to all entity ID usage (only at conversion points)
- Modifying Entu API responses (server-side remains unchanged)
- Backwards compatibility with code that treats IDs as plain strings

## Technical Requirements

### Branded Type Definition

```typescript
export type EntuEntityId = string & { readonly __brand: 'EntuEntityId' }
```

**Properties**:

- Based on `string` primitive (compatible with JSON serialization)
- Intersection with unique brand object prevents accidental assignment
- `readonly` prevents brand modification
- Zero runtime overhead (erased during compilation)

### Validation Pattern

MongoDB ObjectId format: 24-character hexadecimal string

**Regex**: `/^[a-f0-9]{24}$/i`

**Examples** (from production data):

- ✅ `6889db9a5d95233e69c2b490`
- ✅ `66b6245c7efc9ac06a437b97`
- ✅ `ABCDEF1234567890ABCDEF12` (case-insensitive)
- ❌ `invalid-id` (not hex)
- ❌ `6889db9a5d95233e69c2b49` (23 chars, too short)

### Conversion Functions

**Type Guard** (for narrowing):

```typescript
export function isEntuEntityId(value: string): value is EntuEntityId
```

**Safe Conversion** (with validation):

```typescript
export function toEntuEntityId(value: string): EntuEntityId // throws on invalid
```

**Unsafe Conversion** (trust caller):

```typescript
export function unsafeToEntuEntityId(value: string): EntuEntityId // no validation
```

### Type Updates

Apply `EntuEntityId` to all fields containing entity IDs:

**Base Types**:

- `EntuPropertyBase._id: EntuEntityId`
- `EntuReferenceProperty.reference: EntuEntityId`
- `EntuDateTimeProperty.reference?: EntuEntityId`
- `EntuEntity._id: EntuEntityId`

**All entity-specific interfaces** inherit from `EntuEntity`, automatically gaining typed `_id`.

## Implementation Strategy

### Phase 1: Add Branded Type to types/entu.ts

1. Add branded type definition after file header
2. Add three conversion functions (guard, safe, unsafe)
3. Add JSDoc documentation with examples
4. Update file header to mention type safety pattern

### Phase 2: Update Type Definitions

1. Replace `_id: string` → `_id: EntuEntityId` in all interfaces
2. Replace `reference: string` → `reference: EntuEntityId`
3. Replace `reference?: string` → `reference?: EntuEntityId`

### Phase 3: Add Tests

Create `tests/types/entu-entity-id.test.ts`:

- Test valid MongoDB ObjectIds (24-char hex)
- Test invalid formats (too short, too long, invalid chars)
- Test case-insensitivity
- Test all three conversion functions

### Phase 4: Fix Type Errors

Run `npx tsc --noEmit` and fix errors:

- **API responses**: Use `unsafeToEntuEntityId()` (IDs from Entu are trusted)
- **User input**: Use `toEntuEntityId()` or `isEntuEntityId()` (requires validation)
- **Query params**: Convert route/query params from `string` to `EntuEntityId`

### Phase 5: Validation

1. Run full type check: `npx tsc --noEmit`
2. Run tests: `npm test tests/types/entu-entity-id.test.ts`
3. Run full test suite: `npm test`
4. Manual testing: Verify app still works

## Usage Patterns

### Pattern 1: API Responses (Trusted Source)

```typescript
// Entu API returns validated IDs
const response = await $fetch<EntuEntityResponse<EntuTask>>(url)
const taskId = unsafeToEntuEntityId(response.entity._id) // Safe: from database
```

### Pattern 2: User Input (Requires Validation)

```typescript
// Form input needs validation
try {
  const locationId = toEntuEntityId(userInput.locationId)
  // Use locationId safely
} catch (error) {
  showError('Invalid location ID format')
}
```

### Pattern 3: Type Narrowing

```typescript
// Check if string is valid entity ID
if (isEntuEntityId(maybeId)) {
  // TypeScript knows maybeId is EntuEntityId here
  const entity = await fetchEntity(maybeId)
}
```

## Testing Strategy

### Unit Tests

File: `tests/types/entu-entity-id.test.ts`

**Test Cases**:

1. Valid IDs: 24-char hex (lowercase, uppercase, mixed)
2. Invalid IDs: Too short, too long, invalid characters, empty string
3. Type guard: Correct boolean returns, type narrowing works
4. Safe conversion: Accepts valid, throws on invalid
5. Unsafe conversion: Never throws (intentionally unsafe)

### Integration Testing

Manual verification:

1. App loads without type errors
2. Task list fetches and displays
3. Response submission works
4. Map locations load correctly
5. Authentication flow succeeds

## Constitutional Compliance

**Type Safety First (Principle I)**: ✅

- Eliminates ambiguous `string` usage for entity IDs
- Provides validation functions to prevent runtime errors
- Zero usage of `any` type
- Full TypeScript strict mode compliance

**Test-First Development (Principle III)**: ✅

- Tests written before type updates
- Test suite covers valid/invalid cases

**Observable Development (Principle IV)**: ✅

- Clear error messages in validation functions
- JSDoc examples show proper error handling

## Success Metrics

1. **Type Safety**: TypeScript compiler catches entity ID misuse at compile-time
2. **Zero Runtime Cost**: No performance impact (branded types are erased)
3. **Code Coverage**: 100% test coverage for conversion functions
4. **Migration Complete**: All `_id` and `reference` fields use `EntuEntityId`

## Timeline Estimate

- Phase 1: Add branded type (30 minutes)
- Phase 2: Update type definitions (15 minutes)
- Phase 3: Add tests (30 minutes)
- Phase 4: Fix type errors (1-2 hours, depending on usage)
- Phase 5: Validation (30 minutes)

**Total**: 3-4 hours

## Approval

- [x] Technical Review: Branded type pattern approved
- [x] Constitutional Review: Aligns with Type Safety First principle
- [x] Ready for Implementation
