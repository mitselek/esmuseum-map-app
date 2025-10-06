# F011 - Interactive Map Display

## Summary

Replace the placeholder TaskMapCard component with a real interactive map that displays the user's current location and the 5 closest unvisited task locations, with smart zoom to fit all locations in view.

## User Story

As a museum visitor using the ESM Map App, I want to see an interactive map showing my current location and nearby unvisited task locations, so that I can visualize the geographical context and plan my route efficiently.

## Technical Requirements

### Core Functionality

- **Interactive Map**: Replace `TaskMapCard.vue` placeholder with real map using Leaflet.js
- **User Location**: Display user's GPS position with distinctive marker (📍)
- **Task Locations**: Show location markers for tasks with geographical data
- **Unvisited Filter**: Only display locations that haven't been completed by the user
- **5-Closest Logic**: Limit display to the 5 nearest unvisited locations
- **Smart Zoom**: Automatically calculate zoom level and center to fit all displayed locations

### Integration Points

- **GPS Service**: Leverage existing `useLocation()` composable for user position
- **Location Data**: Use existing location loading from `loadTaskLocations()`
- **Distance Calculation**: Utilize `utils/distance.js` for sorting and filtering
- **Task System**: Integrate with task completion status to filter unvisited locations

### Technical Implementation

#### Dependencies

```bash
npm install leaflet @vue-leaflet/vue-leaflet
```

#### Component Architecture

```text
InteractiveMap.vue (new)
├── Map container with Leaflet
├── User location marker
├── Task location markers
├── Auto-zoom calculation
└── Location popups

TaskMapCard.vue (updated)
├── Replace placeholder with InteractiveMap
└── Pass props: locations, userPosition, completedTasks
```

#### Data Flow

1. TaskDetailPanel loads task locations via `loadTaskLocations()`
2. Filter locations to unvisited using task completion status
3. Sort by distance and take closest 5 using `sortLocationsByDistance()`
4. Pass filtered locations to InteractiveMap component
5. Map calculates bounds and sets appropriate zoom level
6. Display user marker + location markers with popups

### User Experience

- **Visual Clarity**: Distinct markers for user vs task locations
- **Information**: Clickable location markers with name/description popups
- **Responsive**: Map adjusts to container size and device type
- **Performance**: Efficient rendering with location limits
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Acceptance Criteria

1. ✅ Map displays when task has location data (`hasMapData = true`)
2. ✅ User's GPS location appears as distinctive marker
3. ✅ Only unvisited task locations are shown (max 5 closest)
4. ✅ Map automatically zooms to fit all displayed locations
5. ✅ Location markers show name/description when clicked
6. ✅ Map is responsive and works on mobile devices
7. ✅ Graceful fallback when GPS permission denied
8. ✅ Loading states during location fetch and map initialization

### Technical Considerations

- **Bundle Size**: Leaflet is lightweight (~40KB) and suitable for production
- **No API Keys**: Uses OpenStreetMap tiles, no external service costs
- **Performance**: Limit to 5 locations prevents map clutter and performance issues
- **Offline Support**: Basic map tiles can be cached for offline viewing
- **Error Handling**: Graceful degradation when location services unavailable

### Related Features

- **F004**: Smart Location Selection (GPS integration)
- **F008**: Answer Submission (location context for responses)
- **F010**: Component Refactoring (clean component architecture)

### Implementation Priority

**High** - This enhances the core user experience by providing geographical context for task locations, making the app more intuitive and useful for museum visitors navigating physical spaces.

## File Changes

- Create: `app/components/InteractiveMap.vue`
- Update: `app/components/TaskMapCard.vue`
- Update: `app/components/TaskDetailPanel.vue` (integration)
- Update: `package.json` (add Leaflet dependencies)
