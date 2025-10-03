# Examples Directory

This directory contains example code and reference implementations that demonstrate patterns and best practices. These files are **not used in production** and serve as documentation and migration guides.

## Purpose

- Demonstrate new patterns before adoption
- Provide migration guides for major refactoring
- Show before/after comparisons
- Document best practices

## Current Examples

### `typed-composable-example.ts` (F022)
**Created**: October 2, 2025  
**Purpose**: Demonstrates TypeScript type system for Entu entities  
**Status**: ✅ Complete, reference material  
**Related**: Feature F022 - TypeScript Entity Types  

Shows how to:
- Use typed Entu entities
- Extract values with helper functions
- Implement type-safe composables
- Migrate from JavaScript to TypeScript

**Safe to delete after**: Patterns are adopted in actual composables

## Maintenance

Examples should be:
- ✅ Self-contained and documented
- ✅ Compilable and error-free
- ✅ Clearly marked as examples
- ✅ Listed in this README

Examples should NOT be:
- ❌ Imported by production code
- ❌ Part of the build output
- ❌ Included in test coverage
- ❌ Left undocumented

## Cleanup

When examples are no longer needed:
1. Verify patterns are adopted in production code
2. Check feature documentation is complete
3. Remove the example file
4. Update this README
5. Update TEMPORARY_FILES.md in root

---

**Note**: If you're looking for actual production code, check:
- `app/composables/` - Production composables
- `utils/` - Production utilities
- `types/` - Production type definitions
