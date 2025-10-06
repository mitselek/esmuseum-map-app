# F004: Smart Location Selection for Task Responses

**Status**: 🚧 In Development  
**Started**: September 5, 2025  
**Dependencies**: F003 (Pupil Dashboard)

## Overview

Enhance the task response submission system for field trip activities where students visit physical locations and document their presence.

**Primary Use Case**: Tasks like "Visit 20 points of interest during summer vacation and report each visit"

**Form Fields**:

1. **Location Selection**: Dropdown of predefined points of interest, sorted by proximity to user's current position
2. **Current Position**: Text field showing GPS coordinates, auto-filled but manually editable, with refresh button
3. **Photo Upload**: Camera integration for taking evidence photos

**Workflow**: Student arrives at location → form auto-captures GPS coordinates in "Current Position" field → system validates coordinates → location dropdown becomes available with proximity-sorted options → student selects the POI they're visiting → student can refresh GPS or edit coordinates manually → student takes photos → submits response

## User Story

> As a student on a field trip task (e.g., "During summer vacation, visit physically at least 20 points of interest and report your visits"), I want to:
>
> 1. **Select which location I'm visiting** from a proximity-sorted list of predefined points of interest
> 2. **Automatically record my actual GPS position** to prove I was physically there
> 3. **Manually adjust coordinates if needed** (in case GPS is inaccurate)
> 4. **Refresh my position** if I move around the location
> 5. **Take photos** as evidence of my visit
>
> So that I can efficiently document each visit with both the intended location and proof of physical presence.

## Technical Requirements

### Core Functionality

1. **Location Selection Field**

   - Dropdown/list of predefined points of interest from task's associated map
   - Sorted by proximity to coordinates entered in "Current Position" field
   - Shows location names and distances
   - Required field - user must select which POI they're visiting
   - **Validation**: Only enabled when Current Position field contains valid coordinates

2. **Current Position Field**

   - Text input field displaying GPS coordinates (lat,lng format)
   - Auto-filled when page loads or when user requests GPS
   - Manually editable for GPS accuracy issues
   - Refresh button to update position if user moves around
   - **Validation**: Must contain valid coordinates (lat,lng format)
   - **Dependency**: Location dropdown sorting depends on these coordinates
   - Used to prove physical presence at the location

3. **Photo Upload Integration**

   - Camera integration for taking evidence photos
   - Multiple photos per visit
   - Tied to both selected location and GPS coordinates

4. **Validation & Verification**
   - **Coordinate Validation**: Current Position field must contain valid lat,lng coordinates
   - **Location Dropdown State**: Only enabled when Current Position has valid coordinates
   - **Proximity Calculation**: All location distances calculated from Current Position coordinates
   - **Optional Proximity Warning**: Warn if selected location is unusually far from current position (yellow > 100m, red > 500m)
   - **Visual Feedback**: Show distance between selected location and current position
   - **Input Indicators**: Clear indicators when auto-GPS vs manual coordinates are used

### Data Model Integration

Based on Entu data model:

- **Task Entity** (`_type.string: 'ulesanne'`)
  - `kaart.reference` → points to associated map
- **Map Entity** (`_type.string: 'kaart'`)
  - Contains multiple location references
- **Location Entity** (`_type.string: 'asukoht'`)
  - `name.string` → location name
  - `geopunkt.string` → coordinates (lat,lng format)
  - `kirjeldus.string` → optional description

## Implementation Plan

### Phase 1: Data Loading & API Integration

- [ ] Load task's associated map
- [ ] Fetch all locations for the map
- [ ] Parse coordinate data from location entities

### Phase 2: Distance Calculation

- [ ] Implement haversine formula for distance calculation
- [ ] Create utility functions for coordinate parsing
- [ ] Sort locations by proximity to user position

### Phase 3: UI Enhancement

- [ ] Design location picker component
- [ ] Replace coordinate input with location selector
- [ ] Add distance display and location metadata
- [ ] Implement search/filter functionality

### Phase 4: User Experience

- [ ] Loading states for location data
- [ ] Error handling for GPS and API failures
- [ ] Fallback to manual coordinate entry
- [ ] Visual feedback for selection

## Technical Specifications

### Distance Calculation

```javascript
// Haversine formula implementation
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

### API Queries Required

```javascript
// Get task's map reference
const taskMap = task.properties?.kaart?.[0]?.reference;

// Load map locations
const locations = await searchEntities({
  "_type.string": "asukoht",
  "_parent.reference": mapId,
});
```

### UI Component Structure

```vue
<LocationPicker
  :locations="mapLocations"
  :userPosition="currentPosition"
  :selected="selectedLocation"
  @select="onLocationSelect"
  @manual="onManualEntry"
/>
```

## Files to Modify

### Primary Changes

- `app/pages/opilane/ulesanne/[id].vue` - Task detail page enhancement
- Create `app/components/LocationPicker.vue` - New location selection component
- Create `app/utils/distance.js` - Distance calculation utilities

### Supporting Changes

- `app/composables/useEntuApi.js` - Add location loading methods
- `app/composables/useLocation.js` - Create location utilities composable

## Success Criteria

**Functional Requirements**  

- ✅ Users can see available locations for their task
- ✅ Locations are sorted by distance from user's position
- ✅ Distance information is displayed clearly
- ✅ Location selection updates response form
- ✅ Fallback to manual coordinate entry works

**Technical Requirements**  

- ✅ Efficient API queries for location data
- ✅ Accurate distance calculations
- ✅ Responsive design for mobile devices
- ✅ Error handling for GPS and network issues
- ✅ Performance optimization for large location lists

**User Experience Requirements**  

- ✅ Intuitive location selection interface
- ✅ Clear visual feedback for selections
- ✅ Fast loading and responsive interactions
- ✅ Accessibility compliance

## Future Enhancements

### Potential Improvements

- **Map Visualization**: Show locations on interactive map
- **Location Categories**: Group locations by type or category
- **Favorites**: Allow users to save frequently used locations
- **Offline Support**: Cache location data for offline use
- **Advanced Filtering**: Search locations by name or category

### Integration Opportunities

- **Navigation**: Provide directions to selected location
- **Photos**: Associate location photos with selections
- **History**: Track user's location selection patterns
- **Analytics**: Analyze popular locations for insights

## Development Notes

### Implementation Strategy

1. Start with basic distance calculation and sorting
2. Build minimal UI for location selection
3. Integrate with existing response form
4. Add progressive enhancements (search, filters, etc.)
5. Optimize performance and add polish

### Testing Approach

- Unit tests for distance calculation functions
- Integration tests for API location loading
- User testing for location selection workflow
- Performance testing with large location datasets

### Known Challenges

- **GPS Accuracy**: Handle varying GPS precision
- **Location Data Quality**: Ensure coordinate accuracy
- **Performance**: Optimize for large numbers of locations
- **Offline Scenarios**: Graceful degradation without GPS

---

_This feature builds upon F003 (Pupil Dashboard) to provide a more sophisticated and user-friendly location selection experience for task responses._
