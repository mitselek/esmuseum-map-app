# Optimization Opportunities Index

**Created**: October 3, 2025  
**Purpose**: Track potential improvements discovered during refactoring

---

## 🔍 Discovered During Phase 1 (Magic Strings & Event Logs)

### 1. **EventDebugPanel.vue may be obsolete**
- **File**: `app/components/EventDebugPanel.vue`
- **Issue**: Debug component that captures console logs for mobile debugging
- **Consideration**: Is this still actively used? Could be removed if not needed in production
- **Impact**: Medium (removes ~300+ lines if obsolete)
- **Action**: Verify with team if still needed

### 2. **useLocation.js has excessive debug logging**
- **File**: `app/composables/useLocation.js`
- **Issue**: 12 `🔍 [EVENT]` debug logs for permission detection
- **Note**: Some may be useful for iOS permission quirks debugging
- **Action**: Review if all are necessary after stable behavior confirmed

### 3. **index.vue has redundant page initialization log**
- **File**: `app/pages/index.vue`
- **Issue**: `console.log('🚀 [EVENT] index.vue - Script setup started')`
- **Action**: Remove after confirming page loads correctly

### 4. **Variable naming inconsistency found (FIXED)**
- **File**: `app/composables/useTaskDetail.js` line 311-320
- **Issue**: Variable named `responses` but referenced as `userResponse`
- **Status**: ✅ Fixed during Phase 1
- **Lesson**: Look for similar patterns in other files

---

## 🎯 To Be Discovered During Phase 2 (useTaskDetail Migration)

### 5. **Duplicate logic in useTaskDetail.js**
- **File**: `app/composables/useTaskDetail.js`
- **Issue**: Custom extraction logic duplicates `utils/entu-helpers.ts`
  - `getTaskTitle()` → should use `getTaskName()`
  - `getTaskDescription()` → duplicates helper
  - `getResponseCount()` → should use `getTaskResponseCount()`
- **Impact**: ~50-100 lines can be removed
- **Action**: Replace during TypeScript migration (Phase 2)

---

## 📋 Future Investigation Needed

### 6. **useLocation.js permission detection complexity**
- **Observation**: Very complex iOS permission workaround logic
- **Question**: Can this be simplified with modern APIs?
- **Action**: Research if iOS quirks still exist in current versions

### 7. **Response entity search patterns**
- **Observation**: Three files search for responses with similar patterns
- **Question**: Could create a shared `searchUserResponses()` utility?
- **Action**: Consider after more composables migrated to TypeScript

---

## ✅ Completed Optimizations

- **Magic strings extracted** to `app/constants/entu.ts` (3 files updated)
- **Variable naming bug fixed** in useTaskDetail.js
- **Event tracking logs cleaned** (useTaskWorkspace, useTaskDetail, index.vue)

---

**Last Updated**: October 3, 2025  
**Next Review**: After Phase 2 (useTaskDetail migration)
