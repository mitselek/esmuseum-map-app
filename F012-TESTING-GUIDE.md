# F012 Scoring Mechanism - Testing Guide

## Overview
The F012 "zero-of-twentyfive" scoring mechanism has been fully implemented. This guide helps you test all aspects of the feature.

## Test Environment
- Development server: https://localhost:3000
- Authentication required: Yes (Entu OAuth)

## Testing Steps

### 1. Basic Scoring Display
**Objective**: Verify the progress indicator shows correctly

**Steps**:
1. Navigate to `/kaardid` (Maps page)
2. Login with Entu OAuth if needed
3. Select any task from the list
4. Look for the progress indicator in the TaskMapCard component

**Expected Results**:
- Progress text displays as "X of Y" format (e.g., "2 of 25")
- Progress percentage shows correctly (e.g., "8%")
- Progress bar reflects the percentage visually

### 2. Map Marker Colors
**Objective**: Test visited location visualization

**Steps**:
1. On a task detail page with the interactive map
2. Observe the location markers on the map
3. Note the color differences

**Expected Results**:
- **Green markers**: Locations you have already visited/submitted responses for
- **Red markers**: Locations you haven't visited yet
- Marker colors update dynamically based on your progress

### 3. Response Submission & Optimistic Updates
**Objective**: Test real-time scoring updates

**Steps**:
1. Click on a red (unvisited) marker on the map
2. Fill out the response form that appears
3. Submit the response
4. Observe the changes immediately after submission

**Expected Results**:
- Progress indicator updates immediately (e.g., "2 of 25" becomes "3 of 25")
- Progress percentage recalculates (e.g., 8% becomes 12%)
- The marker you just responded to turns from red to green
- Changes happen without page refresh or API refetch

### 4. Unique Location Counting
**Objective**: Verify scoring counts unique locations only

**Test Scenario**: Submit multiple responses for the same location

**Steps**:
1. Submit a response for location A
2. Submit another response for the same location A
3. Check if the progress counter increases by 1 or 2

**Expected Result**:
- Progress should increase by only 1 (unique location counting)
- Multiple responses to same location don't inflate the score

### 5. Multi-language Support
**Objective**: Test scoring in different languages

**Steps**:
1. Change language to Estonian (et)
2. Check progress indicator text
3. Change to Ukrainian (uk)
4. Check progress indicator text again

**Expected Results**:
- Progress text translates correctly in all languages
- "X of Y" format maintained in appropriate language
- Map tooltips show "Külastatud" (et) or equivalent in other languages

### 6. Error Handling
**Objective**: Test graceful degradation

**Test Scenarios**:
1. **No internet connection**: Disconnect and try to submit
2. **Invalid task data**: Navigate to non-existent task
3. **API errors**: Simulate server errors

**Expected Results**:
- App doesn't crash on network errors
- Progress indicators show reasonable defaults (0 of 0, 0%)
- Error states are handled gracefully

## Key Components to Verify

### TaskMapCard.vue
- [ ] Progress indicator displays correctly
- [ ] Percentage calculation is accurate
- [ ] Integration with map component works

### InteractiveMap.vue  
- [ ] Green/red marker system functions
- [ ] Visited locations show green markers
- [ ] Unvisited locations show red markers
- [ ] Marker clicks trigger response forms

### TaskDetailPanel.vue
- [ ] Coordinates response submissions with scoring
- [ ] Optimistic updates work immediately
- [ ] Event handling between components functions

### useTaskScoring.js Composable
- [ ] Fetches user responses correctly
- [ ] Counts unique locations accurately
- [ ] Provides reactive progress data
- [ ] Handles optimistic updates properly

## Performance Validation

### Load Times
- [ ] Initial page load with scoring data < 2 seconds
- [ ] Map marker color calculation doesn't block UI
- [ ] Response submission feedback is immediate

### Memory Usage
- [ ] No memory leaks during extended use
- [ ] Reactive data updates efficiently
- [ ] Component cleanup on navigation

## API Integration Testing

### Entu API Calls
- [ ] User responses fetched correctly on task load
- [ ] Response submission creates new entities
- [ ] Authentication tokens handled properly

### Data Structure Validation
- [ ] Response entities have correct structure
- [ ] Location references match expected format
- [ ] Task data includes vastuseid count

## Browser Compatibility
Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox  
- [ ] Safari (if available)
- [ ] Mobile browsers

## Accessibility Testing
- [ ] Progress indicators are screen reader accessible
- [ ] Map markers have appropriate labels
- [ ] Color differences don't rely solely on color (for colorblind users)

## Success Criteria
✅ All progress indicators show accurate "X of Y" format
✅ Map markers correctly reflect visited/unvisited status  
✅ Optimistic updates work immediately after response submission
✅ Unique location counting prevents score inflation
✅ Multi-language support functions correctly
✅ Error handling prevents crashes
✅ Performance remains responsive during all operations

## Troubleshooting

### Common Issues
1. **Markers not changing color**: Check browser console for API errors
2. **Progress not updating**: Verify authentication and task data structure
3. **Slow performance**: Check network tab for excessive API calls

### Debug Information
- Browser Developer Tools → Console for errors
- Network tab to verify API calls
- Vue DevTools to inspect reactive state
- Check `useTaskScoring` composable state in Vue DevTools

---

## Implementation Summary
The F012 scoring mechanism provides:
- Real-time progress tracking with "X of Y" display
- Visual map feedback with green/red markers
- Optimistic UI updates for immediate feedback
- Unique location counting for accurate scoring
- Multi-language support
- Robust error handling

Test thoroughly and report any issues or unexpected behavior!