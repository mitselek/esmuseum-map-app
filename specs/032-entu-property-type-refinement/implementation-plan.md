# F032 Implementation Plan

## Overview

Add type discriminators and type guards to Entu property types for better runtime type narrowing.

## Task Breakdown

### Task 1: Setup (5 min)

- Create branch `032-entu-property-type-refinement`
- Verify current type definitions in `types/entu.ts`

### Task 2: Add Discriminator Fields (15 min)

**File**: `types/entu.ts`

Update each interface:

- `EntuStringProperty`: Add `propertyType?: 'string' | 'text'` and `markdown?: boolean`
- `EntuNumberProperty`: Add `propertyType?: 'number'` and `decimals?: number`
- `EntuBooleanProperty`: Add `propertyType?: 'boolean'`
- `EntuReferenceProperty`: Add `propertyType?: 'reference'`
- `EntuDateTimeProperty`: Add `propertyType?: 'datetime'`
- `EntuDateProperty`: Add `propertyType?: 'date'`
- `EntuFileProperty`: Add `propertyType?: 'file'`

**Commit**: "feat: Add optional propertyType discriminator to Entu property interfaces"

### Task 3: Add Type Guards (25 min)

**File**: `types/entu.ts`

Add 7 type guard functions after property definitions:

1. `isStringProperty(prop: EntuProperty): prop is EntuStringProperty`
2. `isNumberProperty(prop: EntuProperty): prop is EntuNumberProperty`
3. `isBleanProperty(prop: EntuProperty): prop is EntuBooleanProperty`
4. `isReferenceProperty(prop: EntuProperty): prop is EntuReferenceProperty`
5. `isDateTimeProperty(prop: EntuProperty): prop is EntuDateTimeProperty`
6. `isDateProperty(prop: EntuProperty): prop is EntuDateProperty`
7. `isFileProperty(prop: EntuProperty): prop is EntuFileProperty`

**Important**: Handle overlapping fields:

- String vs Reference/DateTime: Check `!('reference' in prop) && !('datetime' in prop)`
- Number vs Boolean: Check `!('boolean' in prop)`
- Reference vs DateTime: Check `!('datetime' in prop)`

**Commit**: "feat: Add type guard functions for Entu property types"

### Task 4: Create Test Suite (40 min)

**File**: `tests/types/entu-property-guards.test.ts`

Test structure:

```typescript
describe("Entu Property Type Guards", () => {
  describe("isStringProperty", () => {
    it("identifies string properties");
    it("identifies text properties with markdown");
    it("rejects reference properties with string field");
    it("rejects datetime properties with string field");
  });

  describe("isNumberProperty", () => {
    it("identifies number properties");
    it("identifies number properties with decimals");
    it("rejects boolean properties");
  });

  describe("isBooleanProperty", () => {
    it("identifies boolean properties");
  });

  describe("isReferenceProperty", () => {
    it("identifies reference properties");
    it("rejects datetime properties with reference field");
  });

  describe("isDateTimeProperty", () => {
    it("identifies datetime properties");
    it("identifies datetime with reference field");
  });

  describe("isDateProperty", () => {
    it("identifies date properties");
  });

  describe("isFileProperty", () => {
    it("identifies file properties");
  });

  describe("type narrowing", () => {
    it("narrows to correct type in conditionals");
    it("works without propertyType field (backwards compat)");
  });

  describe("real API data", () => {
    it("handles grupp kirjeldus (text type)");
    it("handles vastus photo (file type)");
    it("handles reference with string field");
  });
});
```

Use real data from `docs/model/*.sample.json`

**Commit**: "test: Add comprehensive tests for Entu property type guards"

### Task 5: Validation (10 min)

- Run TypeScript compiler: `npx tsc --noEmit`
- Run new tests: `npm test tests/types/entu-property-guards.test.ts`
- Run full test suite: `npm test`
- Check for type errors in examples: `npx tsx examples/test-f022-types.ts`

**Commit**: "fix: Address any issues from validation" (if needed)

### Task 6: Documentation (10 min)

**File**: `types/entu.ts` (update file header)

Add usage section:

```typescript
/**
 * Type Guards:
 * - Use isStringProperty(), isNumberProperty(), etc. for runtime type narrowing
 * - Example:
 *   if (isStringProperty(prop)) {
 *     console.log(prop.string)  // TypeScript knows this exists
 *   }
 */
```

Add schema mapping table to comments.

**Commit**: "docs: Add type guard usage documentation to entu.ts"

### Task 7: Create Summary (5 min)

**File**: `specs/032-entu-property-type-refinement/implementation-summary.md`

Document:

- Changes made
- Test results
- Examples
- Migration notes (none needed - backwards compatible)

**Commit**: "docs: Add F032 implementation summary"

## Commits Summary

1. `feat: Add optional propertyType discriminator to Entu property interfaces`
2. `feat: Add type guard functions for Entu property types`
3. `test: Add comprehensive tests for Entu property type guards`
4. `fix: Address any issues from validation` (conditional)
5. `docs: Add type guard usage documentation to entu.ts`
6. `docs: Add F032 implementation summary`

## Total Estimated Time

- Task 1: 5 min
- Task 2: 15 min
- Task 3: 25 min
- Task 4: 40 min
- Task 5: 10 min
- Task 6: 10 min
- Task 7: 5 min

**Total**: 110 minutes (1h 50min)

## Success Checklist

- [ ] All 7 property interfaces have optional `propertyType` field
- [ ] All 7 type guard functions implemented and exported
- [ ] Test suite covers all property types
- [ ] Test suite includes real API data samples
- [ ] TypeScript compilation: 0 errors
- [ ] All existing tests still passing
- [ ] New tests: 100% passing
- [ ] Documentation updated
- [ ] Implementation summary created

## Risk Mitigation

**Risk**: Type guard logic might have edge cases
**Mitigation**: Test with real API data from `docs/model/*.sample.json`

**Risk**: Breaking changes to existing code
**Mitigation**: All fields are optional, test existing examples

**Risk**: Overlapping field names cause false positives
**Mitigation**: Explicit exclusion checks in type guards
