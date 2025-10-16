# TypeScript Constitutional Compliance Audit

**Purpose**: Audit codebase for TypeScript type safety compliance, ensuring all data structures are protected by interfaces

**Target AI**: GitHub Copilot (model-agnostic)

**Use Case**: Improve type safety, eliminate undocumented `any` types, ensure proper interface definitions

---

## Constitutional Context

**CRITICAL**: This project has Constitutional Principle I: Type Safety First

Read `.specify/memory/constitution.md` Principle I before starting:

- Avoid `any` type - every usage must be documented
- When `any` is necessary:
  - Add comment explaining why
  - Document plan for removal OR justification to keep
  - Prefer type guards over type casts
- Document JavaScript boundaries clearly
- Use strict TypeScript configuration

Type safety is not just compilation - it's documentation and correctness.

---

## Workflow

### Phase 0: Setup GitHub Labels

**Check if required labels exist**:

```bash
gh label list | grep -E "refactor|type-safety|technical-debt"
```

**Create labels if missing**:

The project's `scripts/create-github-labels.sh` already includes most labels we need.

If you want more granular filtering beyond the existing labels:

```bash
# TypeScript label (more specific than type-safety)
gh label create "typescript" --description "TypeScript type safety improvements" --color "007acc" --force

# Constitutional compliance umbrella label (covers all principles)
gh label create "constitutional-compliance" --description "Enforces project constitutional principles" --color "fbca04" --force
```

### Phase 1: Discovery

**Find all `any` usage**:

```bash
grep -rn ": any\|as any\|any\[\|<any>" --include="*.ts" --include="*.vue" app/ server/ types/
```

**Document findings**:

- Total `any` count
- Breakdown by file/directory
- Categorize by type (see Phase 2)

**Create GitHub Issue**:

After discovery, create a tracking issue:

```markdown
Title: [REFACTOR] TypeScript Constitutional Compliance Audit

**Type**: Refactoring
**Priority**: High
**Constitutional Principle**: Type Safety First (Principle I)

## Summary

Systematic audit to eliminate undocumented `any` types and ensure all data structures are protected by interfaces.

## Discovery Results

- Total `any` usage found: [Count]
- Files affected: [Count]
- Estimated effort: [Hours/Days]

## Scope

- [ ] Phase 1: Discovery (Complete)
- [ ] Phase 2: Categorization
- [ ] Phase 3: Create Missing Interfaces
- [ ] Phase 4: Replace `any` with Interfaces
- [ ] Phase 5: Validation
- [ ] Phase 6: Documentation
- [ ] Phase 7: Constitutional Validation

## Constitutional Requirements

Per `.specify/memory/constitution.md` Principle I:
- Avoid `any` type - every usage must be documented
- Prefer type guards over type casts
- Document JavaScript boundaries clearly
- Use strict TypeScript configuration

## Breakdown by Priority

Will be updated after Phase 2 categorization.

## References

- Constitution: `.specify/memory/constitution.md`
- Audit Guide: `docs/prompts/typescript-compliance-audit.md`
```

Label with: `refactor`, `type-safety`, `technical-debt`

### Phase 2: Categorization

**Priority levels**:

**CRITICAL (Fix first)**:

- API request/response types
- Composable return values
- Component props/emits
- Server route handlers
- External service interfaces

**HIGH**:

- Function parameters in business logic
- Complex object transformations
- State management types
- Utility function signatures

**MEDIUM**:

- Type assertions (`as any`)
- Vue template type assertions
- Third-party library workarounds

**LOW (Document only)**:

- Error catches (`catch (error: any)`)
- Truly dynamic reflection
- Third-party callbacks with unknown signatures

**VIOLATIONS (Must fix)**:

- Lazy typing in new code
- `any` without documentation
- Type safety bypasses without justification

**Update GitHub Issue**:

After categorization, update the main issue with breakdown:

```markdown
## Breakdown by Priority

### CRITICAL (Fix first) - [Count] instances
- [ ] API request/response types ([Count])
- [ ] Composable return values ([Count])
- [ ] Component props/emits ([Count])
- [ ] Server route handlers ([Count])

### HIGH - [Count] instances
- [ ] Function parameters ([Count])
- [ ] State management ([Count])
- [ ] Utility functions ([Count])

### MEDIUM - [Count] instances
- [ ] Type assertions ([Count])
- [ ] Third-party workarounds ([Count])

### LOW (Document only) - [Count] instances
- [ ] Error catches ([Count])
- [ ] Dynamic reflection ([Count])

### VIOLATIONS - [Count] instances
- [ ] Undocumented `any` ([Count])
- [ ] Type safety bypasses ([Count])
```

**Create Sub-Issues (if needed)**:

For large categories (>10 instances), create focused sub-issues:

```markdown
Title: [REFACTOR] TypeScript: Fix CRITICAL priority `any` types

**Type**: Refactoring
**Priority**: High
**Parent Issue**: #[Parent issue number]

## Scope

Fix CRITICAL priority `any` usage:

- [ ] `app/composables/useTaskWorkspace.ts` - globalTasks type
- [ ] `server/api/tasks.get.ts` - response type
- [ ] `app/components/TaskDetailPanel.vue` - location prop type
- [etc.]

## Acceptance Criteria

- All CRITICAL `any` replaced with proper interfaces
- All tests passing
- TypeScript compilation successful
- Changes committed with constitutional reference

## Estimated Effort

[Hours/Days]
```

Label with: `refactor`, `type-safety`

### Phase 3: Create Missing Interfaces

**For each untyped data structure**:

1. **Analyze the structure**
   - What properties?
   - What types?
   - Optional properties?

2. **Choose location**
   - `types/entu.ts` - Entu entities
   - `types/onboarding.ts` - Onboarding flow
   - `types/[feature].ts` - Feature-specific
   - Inline if file-specific

3. **Define interface with JSDoc**

   ```typescript
   /**
    * [Description]
    * [Usage context]
    */
   export interface TypeName {
     /** Property description */
     propertyName: PropertyType

     /** Optional property */
     optionalProperty?: OptionalType
   }
   ```

4. **Add type guard if needed**

   ```typescript
   export function isTypeName(value: unknown): value is TypeName {
     return (
       typeof value === 'object' &&
       value !== null &&
       'requiredProperty' in value
     )
   }
   ```

### Phase 4: Replace `any` with Interfaces

Work in priority order: CRITICAL → HIGH → MEDIUM → LOW

**For each replacement**:

1. Identify actual type from runtime usage
2. Create or reference interface
3. Replace `any` with interface
4. Handle TypeScript errors (fix interface or implementation)
5. Update related code
6. Run tests

**For documented exceptions**:

```typescript
// Constitutional: [Reason any/unknown is necessary]
catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  logger.error({ error: message })
}
```

### Phase 5: Validation

**Run checks**:

```bash
npx nuxi typecheck
npm test
grep -rn ": any\|as any" --include="*.ts" --include="*.vue" app/ server/ types/ | wc -l
```

**Verify**:

- All TypeScript errors resolved
- All tests passing
- `any` count significantly reduced
- Each remaining `any` documented

**Update GitHub Issues**:

- Check off completed items in main issue and sub-issues
- Close completed sub-issues
- Update progress in main issue description

### Phase 6: Document

Create `docs/typescript-compliance-audit-[DATE].md`:

```markdown
# TypeScript Constitutional Compliance Audit

**Date**: [Date]
**Status**: Complete

## Summary

- Initial `any` count: [Count]
- Final `any` count: [Count]
- Reduction: [Percentage]%
- New interfaces: [Count]

## Constitutional Compliance

- [X] All `any` usage documented
- [X] Data boundaries have interfaces
- [X] Strict mode enabled
- [X] Type guards at boundaries

## New Interfaces

1. **[Name]** (`types/[file].ts`) - [Purpose]

## Replacements

1. **[File]** - `any` → `[Interface]`

## Documented Exceptions

1. **[File:line]** - [Reason] (Constitutional: [Reference])
```

Link this audit report in the GitHub issue as final documentation.

**Close GitHub Issue**:

Update main issue with final summary and close:

```markdown
## Audit Complete

**Final Results**:
- Initial `any` count: [Count]
- Final `any` count: [Count]
- Reduction: [Percentage]%
- New interfaces created: [Count]
- Sub-issues closed: [Count]

**Constitutional Compliance**: Verified

All remaining `any` usage is documented with constitutional justification.

**Documentation**: `docs/typescript-compliance-audit-[DATE].md`
```

### Phase 7: Constitutional Validation

**Verify compliance**:

- [X] Type Safety First: All `any` documented
- [X] Type guards used over type casts
- [X] JavaScript boundaries documented
- [X] Strict TypeScript configuration
- [X] Composable return types explicit
- [X] All tests passing
- [X] Type-safe logging

---

## Common Patterns

### API Response

**Before**:

```typescript
const response = await $fetch('/api/tasks')
const tasks: any[] = response.tasks
```

**After**:

```typescript
import type { EntuTask } from '~/types/entu'

interface TasksResponse {
  tasks: EntuTask[]
  count: number
}

const response = await $fetch<TasksResponse>('/api/tasks')
const tasks: EntuTask[] = response.tasks
```

### Component Props

**Before**:

```vue
<script setup>
defineProps({
  task: Object
})
</script>
```

**After**:

```vue
<script setup lang="ts">
import type { EntuTask } from '~/types/entu'

interface Props {
  task: EntuTask
}

defineProps<Props>()
</script>
```

### Composable Returns

**Before**:

```typescript
export function useTaskManager() {
  const tasks = ref([])
  return { tasks, loadTasks }
}
```

**After**:

```typescript
import type { EntuTask } from '~/types/entu'
import type { Ref } from 'vue'

interface TaskManagerReturn {
  tasks: Ref<EntuTask[]>
  loadTasks: () => Promise<void>
}

export function useTaskManager(): TaskManagerReturn {
  const tasks = ref<EntuTask[]>([])
  return { tasks, loadTasks }
}
```

### Error Handling

**Before**:

```typescript
catch (error: any) {
  logger.error(error)
}
```

**After**:

```typescript
// Constitutional: Error type unknown at catch boundary
catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  logger.error({ error: message })
}
```

### Dynamic Data

**Before**:

```typescript
function processWebhook(payload: any) {
  if (payload.entityId) return payload.entityId
}
```

**After**:

```typescript
interface WebhookPayload {
  entityId?: string
}

function isWebhookPayload(value: unknown): value is WebhookPayload {
  return typeof value === 'object' && value !== null && 'entityId' in value
}

function processWebhook(payload: unknown): string | null {
  if (!isWebhookPayload(payload)) {
    throw new Error('Invalid webhook payload')
  }
  return payload.entityId ?? null
}
```

---

## Markdown Formatting

When generating output:

- Blank line before/after headings
- Blank line before/after lists
- Blank line before/after code blocks
- No trailing spaces
- No emojis in formal docs (use [FIX], [REFACTOR] instead)

---

## Tips

- Start with API boundaries (CRITICAL priority)
- Work in small batches, test frequently
- Use existing interfaces from `types/` directory
- Prefer `unknown` over `any` (forces type checking)
- Write type guards for runtime safety
- Document all exceptions with constitutional reference
- Run `npx nuxi typecheck` often
- Some `any` is legitimate - just document it

**GitHub Issue Workflow**:

- Create main tracking issue after Phase 1 (Discovery)
- Update with priority breakdown after Phase 2 (Categorization)
- Create sub-issues for large categories (>10 instances)
- Link sub-issues to main issue with "Parent Issue: #[number]"
- Check off items as you complete them
- Close sub-issues when their scope is complete
- Update main issue with final summary before closing
- Link audit report in issue for permanent documentation

**Commit Message Format**:

```text
[REFACTOR] TypeScript: Replace any with [InterfaceName] in [component/module]

- Define [InterfaceName] interface in types/[file].ts
- Replace [count] any usage with proper types
- Add type guard for runtime validation

Constitutional: Type Safety First (Principle I)
Closes #[issue-number]
```

---

**Version**: 1.0.0 | **Created**: 2025-10-16 | **For**: ES Museum Map App
