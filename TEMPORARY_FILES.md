# Temporary Files Index

This file tracks temporary, experimental, and example files created during development sessions. These files can be safely deleted once their purpose is served or migrated into production code.

## Naming Conventions

### Temporary Files

- **Examples**: `examples/*.ts` - Example/demo code, not used in production
- **Experiments**: Files with `.experiment.ts` suffix
- **Drafts**: Files with `.draft.ts` or `.wip.ts` suffix
- **Tests**: Files with `.test.ts` or `.spec.ts` that aren't part of the test suite

### Permanent Files (Keep)

- `types/*.ts` - Production type definitions
- `utils/*.ts` - Production utilities
- `app/composables/*.ts` - Production composables
- `app/components/*.vue` - Production components
- `.copilot-workspace/features/*.md` - Feature documentation

## Current Temporary Files

### F022: TypeScript Entity Types (Oct 2-3, 2025)

#### Examples (Can be deleted after migration)

- [x] `examples/typed-composable-example.ts`
  - **Purpose**: Migration guide showing before/after patterns
  - **Status**: Reference material, not used in production
  - **Action**: Keep as documentation, or move to docs folder
  - **Safe to delete**: After migration patterns are adopted in real code

#### Experimental Files

- None currently

#### Draft Files

- None currently

## Cleanup Guidelines

### When to Clean Up

1. After feature is merged to main
2. After patterns are adopted in production code
3. After examples are no longer needed for reference
4. When documentation is complete

### How to Clean Up

```bash
# List all example files
find examples -type f -name "*.ts"

# Remove specific example (after confirmation)
git rm examples/typed-composable-example.ts
git commit -m "chore: Remove example file after migration"

# Or move to documentation
mkdir -p docs/examples
git mv examples/typed-composable-example.ts docs/examples/
```

### Before Deleting, Ask

- [ ] Has the pattern been adopted in real code?
- [ ] Is there documentation that replaces this example?
- [ ] Does anyone else need this for reference?
- [ ] Should this be moved to docs instead?

## Archive

Files that were temporary and have been cleaned up:

### (None yet)

---

**Last Updated**: October 3, 2025
**Maintained by**: Development team
**Review frequency**: After each feature merge
