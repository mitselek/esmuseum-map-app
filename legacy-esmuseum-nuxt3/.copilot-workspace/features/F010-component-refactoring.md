# F010: Component Refactoring & Code Organization (September 13, 2025)

**Status**: 🚧 Planning

## Problem Statement

The application currently has two large monolithic components that have grown beyond maintainable sizes during rapid development:

- **TaskDetailPanel.vue**: 887 lines (target: ~150 lines)
- **TaskSidebar.vue**: 341 lines (target: ~120 lines)

These components contain multiple responsibilities and make the codebase harder to maintain, test, and extend. Breaking them into focused, reusable components will improve code quality and developer experience.

## Current State Analysis

### TaskDetailPanel.vue (887 lines)

**Existing Structure:**

- Empty state display (lines 3-32)
- Task header with title/description (lines 38-97)
- Location management section (lines 114-283)
- Permission handling logic (lines 290-329)
- Form submission coordination
- Already uses some extracted components: TaskInfoCard, TaskResponseForm, FileUpload

**Issues:**

- Too many responsibilities in one component
- Complex location logic mixed with UI rendering
- Permission checks scattered throughout
- Difficult to test individual features

### TaskSidebar.vue (341 lines)

**Existing Structure:**

- Header with search/filter (lines 3-41)
- Loading/error states (lines 42-72)
- Task list rendering (lines 73-219)
- Response stats caching logic
- Search and filtering functionality

**Issues:**

- Task list item logic embedded in parent component
- Complex stats caching mixed with rendering
- Search functionality tightly coupled to component
- Repetitive task item rendering code

### Existing Foundation

The app already has good patterns established:

- **6 task components** in app/components/task/ (831 lines total)
- **TaskResponseForm.vue** (325 lines) - largest extracted component
- **Clear component organization** with proper folder structure
- **Established prop interfaces** and state management patterns

## Proposed Component Architecture

### Phase 1: TaskSidebar Refactoring (341 → ~120 lines)

#### Components to Extract

##### 1. TaskSidebarHeader.vue (~40 lines)

Search input, task count display with proper event handling.

**Props:**

- searchQuery: string (v-model)
- taskCount: number

##### 2. TaskListItem.vue (~100 lines)

Individual task card with all metadata and interaction handling.

**Props:**

- task: TaskEntity
- isSelected: boolean
- responseStats?: ResponseStats

**Emits:**

- select(task: TaskEntity)

##### 3. useTaskSearch.ts (Composable)

Search and filtering logic extracted into reusable composable.

##### 4. useTaskListStats.ts (Composable)

Response stats caching logic for performance optimization.

### Phase 2: TaskDetailPanel Refactoring (887 → ~150 lines)

#### TaskDetailPanel Components to Extract

##### 1. TaskEmptyState.vue (~30 lines)

No task selected display with proper messaging and icons.

##### 2. TaskHeader.vue (~80 lines)

Task title, description, and close button functionality.

**Props:**

- task: TaskEntity
- showCloseButton?: boolean

**Emits:**

- close()

##### 3. TaskLocationManager.vue (~180 lines)

Complete location handling logic including GPS and manual selection.

**Props:**

- task: TaskEntity
- currentLocation?: GeolocationPosition
- selectedLocation?: Location

**Emits:**

- locationChange(location: Location)

##### 4. TaskPermissionGate.vue (~50 lines)

Permission checking and messaging with slot-based content rendering.

**Props:**

- task: TaskEntity
- user: UserEntity

## Technical Implementation Strategy

### Naming Conventions

- **Prefix**: All task-related components start with Task
- **Suffix**: Descriptive of main responsibility (Header, ListItem, Manager)
- **Folder**: Continue using app/components/task/ for task-specific components

### Props Interface Standards

Task entity interfaces will be consistent across all components with proper TypeScript typing.

### State Management Approach

- **Preserve existing patterns**: Continue using useTaskWorkspace for global state
- **Component-specific state**: Use local reactive state for UI-only concerns
- **Composables for logic**: Extract reusable logic into composables
- **Props for data flow**: Clear parent-to-child data flow with props/emits

## Migration Plan

### Step 1: TaskSidebar Refactoring

1. **Extract TaskListItem.vue** - Create component with task display logic
2. **Extract TaskSidebarHeader.vue** - Move search input and task count display
3. **Create useTaskSearch composable** - Extract search and filtering logic
4. **Create useTaskListStats composable** - Extract response stats caching logic
5. **Refactor TaskSidebar.vue** - Remove extracted logic and implement new components

### Step 2: TaskDetailPanel Refactoring

1. **Extract TaskEmptyState.vue** - Simple extraction with no dependencies
2. **Extract TaskHeader.vue** - Move title/description display
3. **Extract TaskLocationManager.vue** - Complex component with multiple responsibilities
4. **Extract TaskPermissionGate.vue** - Move permission checking logic
5. **Refactor TaskDetailPanel.vue** - Remove all extracted logic and implement composition

### Step 3: Testing & Validation

1. **Component Unit Tests** - Test individual component functionality
2. **Integration Testing** - Test component composition and data flow
3. **Performance Testing** - Compare bundle sizes and rendering performance

## Success Criteria

- [ ] **TaskSidebar Refactored**: 341 lines → ~120 lines in main component
- [ ] **TaskDetailPanel Refactored**: 887 lines → ~150 lines in main component
- [ ] **New Components Created**: 8-10 focused components under 100 lines each
- [ ] **Composables Extracted**: 2-3 reusable logic composables
- [ ] **Functionality Preserved**: 100% feature parity maintained
- [ ] **Testing Complete**: All components tested and validated
- [ ] **Performance Maintained**: No regression in app performance
- [ ] **Documentation Updated**: Component usage and patterns documented

## Benefits

### Immediate Benefits

1. **Maintainability**: Smaller, focused components easier to understand and modify
2. **Testability**: Individual components can be unit tested in isolation
3. **Reusability**: Components like TaskListItem can be used in other contexts
4. **Developer Experience**: Easier to find and modify specific functionality

### Long-term Benefits

1. **Scalability**: Easier to add new features without increasing complexity
2. **Team Collaboration**: Multiple developers can work on different components
3. **Performance**: Potential for component-level optimization and caching
4. **Code Quality**: Enforces separation of concerns and clean architecture

## Timeline

- **Week 1**: TaskSidebar refactoring and testing
- **Week 2**: TaskDetailPanel refactoring and testing
- **Week 3**: Additional components, optimization, and documentation
- **Week 4**: Final testing, performance validation, and documentation

## Files to be Created

### New Components

- app/components/task/TaskSidebarHeader.vue
- app/components/task/TaskListItem.vue
- app/components/task/TaskEmptyState.vue
- app/components/task/TaskHeader.vue
- app/components/task/TaskLocationManager.vue
- app/components/task/TaskPermissionGate.vue

### New Composables

- app/composables/useTaskSearch.ts
- app/composables/useTaskListStats.ts

### Modified Files

- app/components/TaskSidebar.vue (341 → ~120 lines)
- app/components/TaskDetailPanel.vue (887 → ~150 lines)

## Next Steps

1. Start with TaskSidebar refactoring (smaller scope, clearer separation)
2. Extract TaskListItem.vue first (most reusable component)
3. Test thoroughly before proceeding to TaskDetailPanel
4. Maintain full functionality throughout the process
