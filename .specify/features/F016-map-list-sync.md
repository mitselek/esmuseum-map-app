# Feature F016: Map-List Location Synchronization

## Overview

Implement two-way synchronization between the interactive map and location selection list to create a seamless user experience where selecting a location in one interface automatically updates the other.

## Current Architecture Analysis

### Components Involved

1. **TaskDetailPanel.vue** - Main coordinator that contains both map and form
2. **TaskMapCard.vue** - Contains the InteractiveMap and handles map interactions
3. **InteractiveMap.vue** - The actual map component with location markers
4. **TaskResponseForm.vue** - Contains the LocationPicker for list selection
5. **LocationPicker.vue** - The location selection list component

### Current Event Flow

```text
TaskDetailPanel
├── TaskMapCard
│   ├── InteractiveMap (@location-click → onLocationClick)
│   └── Manual location override
└── TaskResponseForm
    └── LocationPicker (@select → onLocationSelect)
```

### Current Data Flow

- **Map clicks**: `InteractiveMap` → `@location-click` → `TaskMapCard.onLocationClick` → `@location-click` → `TaskDetailPanel.onMapLocationClick`
- **List selection**: `LocationPicker` → `@select` → `TaskResponseForm.locationSelect` → `@location-select` → `TaskDetailPanel.onLocationSelect`

### Current State Management

The `TaskDetailPanel` already manages:

- `selectedLocation` - Currently selected location from either source
- `taskLocations` - Available locations for both map and list
- Event handlers for both map and list selections

## Problem Statement

Currently, the map and list operate independently:

- Clicking a location on the map doesn't select it in the list
- Selecting a location in the list doesn't highlight it on the map
- Users must manually correlate between the two interfaces

## Solution Design

### Approach: Enhanced State Synchronization

Since `TaskDetailPanel` already coordinates both components, we can enhance the existing architecture without major restructuring.

### Implementation Plan

#### Phase 1: Analyze Current Selection State

1. **Examine current `selectedLocation` handling**

   - How is it currently used by each component?
   - What data structure does it contain?
   - How do we identify locations across components?

2. **Identify location matching strategy**
   - Use location coordinates for matching
   - Handle potential precision differences
   - Ensure robust identification

#### Phase 2: Enhance Map → List Sync

1. **Update `onMapLocationClick` in TaskDetailPanel**

   - When map location is clicked, ensure it becomes the `selectedLocation`
   - This should automatically flow to LocationPicker via props

2. **Verify LocationPicker responds to prop changes**
   - Ensure LocationPicker highlights the selected location when `selectedLocation` prop updates
   - Add visual feedback for selected item in list

#### Phase 3: Enhance List → Map Sync

1. **Update `onLocationSelect` in TaskDetailPanel**

   - When list location is selected, ensure it becomes the `selectedLocation`
   - This should automatically flow to InteractiveMap via props

2. **Enhance InteractiveMap to show selection**
   - Add visual highlighting for selected location marker
   - Consider different marker styles or animations
   - Optionally center/zoom to selected location

#### Phase 4: Add Visual Enhancements

1. **Map marker states**

   - Default state: Regular marker
   - Selected state: Highlighted/enlarged marker
   - Hover state: Subtle highlight

2. **List item states**
   - Default state: Regular list item
   - Selected state: Highlighted background
   - Focus/keyboard navigation support

## Technical Implementation Details

### Location Identification Strategy

```typescript
// Use coordinates as the primary matching key
const isSameLocation = (loc1, loc2) => {
  if (!loc1 || !loc2) return false;
  const coords1 = getLocationCoordinates(loc1);
  const coords2 = getLocationCoordinates(loc2);

  // Allow small precision differences (≈1 meter tolerance)
  const tolerance = 0.00001; // ~1 meter
  return (
    Math.abs(coords1.lat - coords2.lat) < tolerance &&
    Math.abs(coords1.lng - coords2.lng) < tolerance
  );
};
```

### Component Updates Required

#### TaskDetailPanel.vue

- Enhance `onMapLocationClick` to ensure proper state propagation
- Enhance `onLocationSelect` to ensure proper state propagation
- Add location comparison utilities

#### InteractiveMap.vue

- Add `selectedLocation` prop
- Add visual highlighting for selected marker
- Emit location clicks with full location data

#### LocationPicker.vue

- Ensure `selectedLocation` prop properly highlights list items
- Add visual feedback for selected state

### Event Flow After Implementation

```text
User clicks map location:
InteractiveMap → TaskMapCard → TaskDetailPanel.onMapLocationClick
→ selectedLocation updated → LocationPicker highlights item

User selects list item:
LocationPicker → TaskResponseForm → TaskDetailPanel.onLocationSelect
→ selectedLocation updated → InteractiveMap highlights marker
```

## Success Criteria

### Functional Requirements

1. ✅ **Map → List**: Clicking location on map selects it in list
2. ✅ **List → Map**: Selecting location in list highlights it on map
3. ✅ **Visual Feedback**: Clear indication of selected location in both interfaces
4. ✅ **Consistency**: Same location appears selected in both components
5. ✅ **Performance**: No noticeable lag in synchronization

### User Experience Goals

- **Intuitive**: Users immediately understand the connection
- **Responsive**: Changes are instant and obvious
- **Accessible**: Works with keyboard navigation
- **Mobile-friendly**: Touch interactions work smoothly

## Testing Strategy

### Manual Testing

1. Test map click → list selection sync
2. Test list selection → map highlight sync
3. Test with different location types
4. Test on mobile devices
5. Test keyboard navigation

### Scenarios to Test

- Empty location list
- Single location
- Multiple locations close together
- Locations with same names but different coordinates
- Edge cases (invalid coordinates, missing data)

## Risk Assessment

### Low Risk

- Existing architecture supports this enhancement
- No breaking changes to current APIs
- Incremental improvement to existing functionality

### Considerations

- Location matching precision (coordinate differences)
- Performance with large location lists
- Mobile touch/scroll interactions

## Future Enhancements (Out of Scope)

- Map clustering for many locations
- Location search/filtering
- Keyboard shortcuts for selection
- Location bookmarking/favorites

## Implementation Steps

1. **Document current behavior** - Understand existing selection flow
2. **Create location matching utility** - Robust coordinate comparison
3. **Enhance TaskDetailPanel coordination** - Improve state propagation
4. **Update InteractiveMap visual feedback** - Selected marker highlighting
5. **Update LocationPicker visual feedback** - Selected item highlighting
6. **Test synchronization** - Verify both directions work
7. **Polish user experience** - Smooth animations, proper focus management

---

**Next Step**: Begin implementation by examining current selection behavior and creating the location matching utility.
