# Response Count Configuration Issue

**Date**: October 28, 2025  
**Status**: REQUIRES ENTU CONFIGURATION UPDATE

## Problem

After changing the response entity structure (commit 824dde5, 7d70683), responses now reference their task via the `ulesanne` property instead of being children via `_parent`. However, the `vastuseid` (response count) computed field on task entities still counts responses using the old `_parent.reference` relationship.

## Current Behavior

- **Response Creation**: ✅ Creates responses with `ulesanne.reference = taskId` (correct)
- **Response Queries**: ✅ Queries use `'ulesanne.reference': taskId` (correct)
- **Response Count**: ❌ Entu's `vastuseid` field counts `_parent.reference = taskId` (incorrect)

## What Needs to Be Fixed

The `vastuseid` computed field in Entu's task entity type configuration needs to be updated:

**OLD Configuration** (incorrect):

```text
Property: vastuseid
Type: Computed/Aggregation
Query: Count entities where _type.string=vastus AND _parent.reference={this._id}
```

**NEW Configuration** (correct):

```text
Property: vastuseid
Type: Computed/Aggregation  
Query: Count entities where _type.string=vastus AND ulesanne.reference={this._id}
```

## Impact

- Task list shows "0 / X responses" even when responses exist
- Progress bars show 0% completion
- Teachers cannot see accurate response counts

## Workaround Options

### Option 1: Client-Side Counting (Recommended)

Add a composable to count responses client-side:

```typescript
// composables/useTaskResponseCount.ts
export const useTaskResponseCount = () => {
  const { searchEntities } = useEntuApi()
  
  const countResponses = async (taskId: string): Promise<number> => {
    try {
      const result = await searchEntities({
        '_type.string': 'vastus',
        'ulesanne.reference': taskId,
        limit: 0 // We only need the count
      })
      return result.count || 0
    } catch (error) {
      console.error('Failed to count responses:', error)
      return 0
    }
  }
  
  return { countResponses }
}
```

### Option 2: Use Existing `vastuseid` with Caveat

Continue using `getTaskResponseCount(task)` from entu-helpers, but document that it only counts responses created before the structural change.

## Resolution Steps

1. **Contact Entu Administrator** to update the `vastuseid` field configuration
2. **Test Configuration** by creating a new response and verifying the count updates
3. **Remove This Document** once Entu configuration is fixed

## Related Files

- `utils/entu-helpers.ts` - Contains `getTaskResponseCount()` helper
- `app/composables/useTaskResponseCreation.ts` - Creates responses with `ulesanne` reference
- `app/composables/useTaskDetail.ts` - Queries responses by `ulesanne` reference
- `types/entu.ts` - Documents response structure change

## Code Already Updated

✅ Response creation uses `ulesanne` reference  
✅ Response queries use `ulesanne.reference`  
✅ Type definitions document new structure  
❌ Entu computed field still uses old structure (EXTERNAL CONFIGURATION)
