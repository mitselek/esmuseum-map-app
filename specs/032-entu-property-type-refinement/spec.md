# F032: Entu Property Type Refinement

**Status**: Draft  
**Created**: 2025-10-27  
**Branch**: `032-entu-property-type-refinement`

## Problem Statement

Our current Entu type system has **7 property types** defined and covers all Entu API property types. However, the types lack runtime type narrowing capabilities and don't expose the schema-level `type` discriminator field that exists in Entu's property definitions.

### Current Property Types

```typescript
export type EntuProperty =
  | EntuStringProperty      // "string" and "text" schema types
  | EntuReferenceProperty   // "reference"
  | EntuNumberProperty      // "number"
  | EntuBooleanProperty     // "boolean"
  | EntuDateTimeProperty    // "datetime"
  | EntuFileProperty        // "file"
  | EntuDateProperty;       // "date"
```

### Entu API Property Types (Verified)

Analysis of `raw-property-definitions.json` confirms 8 schema types:

- `string` - Single-line text (uses `string` field in API)
- `text` - Multi-line text (also uses `string` field in API, UI hint only)
- `number` - Numeric values
- `boolean` - True/false values
- `reference` - Entity references
- `datetime` - Date with time
- `date` - Date only
- `file` - File uploads

**Key Finding**: Both `string` and `text` schema types use the `string` field in API responses. The distinction is for UI rendering (input vs textarea), not data structure. Our `EntuStringProperty` correctly handles both.

### Issues

1. **No runtime type guards**: Cannot narrow property types in conditional logic
2. **Missing discriminator field**: Schema `type` field not exposed in TypeScript interfaces
3. **Unclear property identification**: No standard way to determine property value type at runtime

## Goals

1. Add type discriminator field to all property interfaces
2. Create type guard functions for runtime type narrowing
3. Document schema type to interface mapping
4. Maintain backwards compatibility (non-breaking changes)

## Technical Requirements

### 1. Add Optional Type Discriminator Field

Add an optional `propertyType` field to match Entu schema definitions. This field indicates the schema type and aids in type narrowing.

**Note**: Cannot use `type` as field name since it conflicts with existing usage in some property interfaces.

```typescript
export interface EntuStringProperty extends EntuPropertyBase {
  propertyType?: 'string' | 'text'  // Both schema types use string field
  string: string
  language?: string
  markdown?: boolean  // Present when propertyType is 'text'
}

export interface EntuNumberProperty extends EntuPropertyBase {
  propertyType?: 'number'
  number: number
  decimals?: number  // From schema metadata
}

export interface EntuBooleanProperty extends EntuPropertyBase {
  propertyType?: 'boolean'
  boolean: boolean
}

export interface EntuReferenceProperty extends EntuPropertyBase {
  propertyType?: 'reference'
  reference: EntuEntityId
  property_type?: string
  string?: string
  entity_type?: string
  inherited?: boolean
}

export interface EntuDateTimeProperty extends EntuPropertyBase {
  propertyType?: 'datetime'
  datetime: string
  reference?: EntuEntityId
  property_type?: string
  string?: string
  entity_type?: string
}

export interface EntuDateProperty extends EntuPropertyBase {
  propertyType?: 'date'
  date: string
}

export interface EntuFileProperty extends EntuPropertyBase {
  propertyType?: 'file'
  filename: string
  filesize: number
  filetype: string
}
```

### 2. Add Type Guard Functions

Type guards enable runtime type narrowing and safer property access:

```typescript
/**
 * Type guard for string/text properties
 * Checks for presence of 'string' field
 */
export function isStringProperty(prop: EntuProperty): prop is EntuStringProperty {
  return 'string' in prop && !('reference' in prop) && !('datetime' in prop)
}

/**
 * Type guard for number properties
 */
export function isNumberProperty(prop: EntuProperty): prop is EntuNumberProperty {
  return 'number' in prop && !('boolean' in prop)
}

/**
 * Type guard for boolean properties
 */
export function isBooleanProperty(prop: EntuProperty): prop is EntuBooleanProperty {
  return 'boolean' in prop
}

/**
 * Type guard for reference properties
 */
export function isReferenceProperty(prop: EntuProperty): prop is EntuReferenceProperty {
  return 'reference' in prop && !('datetime' in prop)
}

/**
 * Type guard for datetime properties
 */
export function isDateTimeProperty(prop: EntuProperty): prop is EntuDateTimeProperty {
  return 'datetime' in prop
}

/**
 * Type guard for date properties
 */
export function isDateProperty(prop: EntuProperty): prop is EntuDateProperty {
  return 'date' in prop
}

/**
 * Type guard for file properties
 */
export function isFileProperty(prop: EntuProperty): prop is EntuFileProperty {
  return 'filename' in prop
}
```

### 3. Schema Type Mapping Documentation

Document which Entu schema types map to which TypeScript interfaces:

| Schema Type | TypeScript Interface | Value Field | Notes |
|-------------|---------------------|-------------|-------|
| `string` | `EntuStringProperty` | `string` | Single-line text |
| `text` | `EntuStringProperty` | `string` | Multi-line text, may have `markdown: true` |
| `number` | `EntuNumberProperty` | `number` | Numeric values, may have `decimals` |
| `boolean` | `EntuBooleanProperty` | `boolean` | True/false |
| `reference` | `EntuReferenceProperty` | `reference` | Entity ID reference |
| `datetime` | `EntuDateTimeProperty` | `datetime` | ISO 8601 datetime string |
| `date` | `EntuDateProperty` | `date` | ISO 8601 date string |
| `file` | `EntuFileProperty` | `filename`, `filesize`, `filetype` | File metadata |

## Implementation Plan

### Phase 1: Add Discriminator Fields (20 min)

- Add optional `propertyType` field to all property interfaces
- Add `markdown` field to `EntuStringProperty`
- Add `decimals` field to `EntuNumberProperty`
- Document fields as optional for backwards compatibility

### Phase 2: Add Type Guards (30 min)

- Implement 7 type guard functions
- Export from `types/entu.ts`
- Handle overlapping field names (reference + datetime, number + boolean)

### Phase 3: Testing (45 min)

- Create test suite for all property types
- Test type narrowing with type guards
- Verify real Entu API data samples
- Test with and without discriminator fields

### Phase 4: Documentation (15 min)

- Update type documentation
- Add usage examples
- Document schema type mapping table

## Success Criteria

- All 7 property interfaces have optional `propertyType` field
- Type guards work correctly for narrowing
- Real API data validates against types
- TypeScript compilation: 0 errors
- All existing tests passing
- New test suite: 100% coverage of property types

## Testing Strategy

```typescript
// Test data from real API - string property (text schema type)
const textProperty: EntuStringProperty = {
  _id: '686a6c041749f351b9c8312c' as EntuEntityId,
  propertyType: 'text',
  string: 'proovigrupp',
  language: 'en',
  markdown: true
}

// Test type narrowing
function processProperty(prop: EntuProperty) {
  if (isStringProperty(prop)) {
    // TypeScript knows prop.string exists
    console.log(prop.string)
    if (prop.markdown) {
      // Render as markdown
    }
  } else if (isNumberProperty(prop)) {
    // TypeScript knows prop.number exists
    console.log(prop.number)
  } else if (isReferenceProperty(prop)) {
    // TypeScript knows prop.reference exists
    const entityId: EntuEntityId = prop.reference
  }
}

// Test without discriminator (backwards compatible)
const legacyProperty: EntuStringProperty = {
  _id: '686a6c041749f351b9c8312c' as EntuEntityId,
  string: 'legacy value',
  language: 'et'
  // No propertyType field - still valid
}
```

## Migration Impact

**Backwards Compatible**: Yes

- `propertyType` field is optional (not required)
- `markdown` and `decimals` fields are optional metadata
- Type guards are new exports (additive)
- All existing interfaces remain unchanged

**Breaking Changes**: None

## Timeline

**Estimated**: 1.5-2 hours  
**Deadline**: N/A (enhancement)

## Dependencies

- F031 (EntuEntityId branded type) - Merged

## Notes

### Schema Type Investigation Results

From analysis of `raw-property-definitions.json` and sample entity data:

**Key Finding**: Both `string` and `text` schema types use the `string` field in actual API responses. The distinction exists only in the schema definitions for UI rendering purposes.

Example from `grupp.sample.json` where `kirjeldus` is defined as type `text` in schema:

```json
{
  "kirjeldus": [
    {
      "_id": "686a6c041749f351b9c8312c",
      "string": "proovigrupp",
      "language": "en"
    }
  ]
}
```

The property uses `string` field despite being a `text` type in the schema. The schema metadata (from `raw-property-definitions.json`) indicates this should render as a textarea:

```json
{
  "name": [{ "string": "kirjeldus" }],
  "type": [{ "string": "text" }],
  "markdown": [{ "boolean": true }]
}
```

This confirms our `EntuStringProperty` interface correctly handles both schema types.

### Verified Property Types

All 8 schema types confirmed in production data:

1. `string` - Single-line text fields
2. `text` - Multi-line text fields (uses `string` field)
3. `number` - Numeric values with optional decimals
4. `boolean` - True/false flags
5. `reference` - Entity references with IDs
6. `datetime` - ISO timestamps
7. `date` - Date-only values
8. `file` - File metadata (filename, filesize, filetype)

### Future Enhancements

Once property type guards are in place:

1. Add validation functions for property values
2. Generate TypeScript types from Entu schema API
3. Add property metadata helpers (mandatory, multilingual, readonly, etc.)
4. Create property value extraction utilities
