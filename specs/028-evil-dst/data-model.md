# Data Model: Evil DST Map Schedule

**Feature**: F028 - Daylight Saving Time Map Schedule  
**Date**: 2025-10-07

## Composables

### useBackgroundPulse

**Purpose**: Manage red pulsating background effect for DST transition visual treatment

**Location**: `app/composables/useBackgroundPulse.ts`

**Input**: None

**Returns**:

```typescript
{
  isDSTActive: Ref<boolean>         // Current state of DST pulsation
  activatePulse: () => void          // Enable red pulsating background
  deactivatePulse: () => void        // Disable background pulsation
}
```

**State**:

- `isDSTActive`: Reactive boolean tracking whether DST pulsation is currently active

**Methods**:

- `activatePulse()`: Adds 'evil-dst-active' CSS class to document.body, sets isDSTActive = true
- `deactivatePulse()`: Removes CSS class from body, sets isDSTActive = false

**Side Effects**:

- Manipulates document.body.classList
- Triggers CSS animation (@keyframes evil-dst-pulse)

### useMapStyleScheduler (Modified)

**Purpose**: Extended with DST transition rule

**Location**: `app/composables/useMapStyleScheduler.ts` (existing file)

**New Functions Added**:

```typescript
{
  getLastSundayOfOctober: (year: number) => Date  // Calculate DST transition date
  isDSTTransition: () => boolean                   // Check if currently in DST repeated hour
}
```

**New Rule Added to styleRules Array**:

```typescript
{
  id: 'dst-transition'
  name: 'Evil DST Transition'
  description: 'Black & white toner + red pulse during fall DST transition (3-4 AM repeated hour)'
  styleId: 'toner'
  priority: 100
  check: isDSTTransition
}
```

**Integration**:

- `applyScheduledStyle()` modified to call useBackgroundPulse when DST rule active
- Logging timestamps per FR-008 when DST rule activates/deactivates

## Types

### DSTTransitionInfo (New Interface)

**Location**: `types/dst.ts` (new file)

```typescript
export interface DSTTransitionInfo {
  transitionDate: Date      // Last Sunday of October for given year
  startTime: Date          // 3:00 AM on transition date
  endTime: Date            // 4:00 AM standard time (after transition)
  isActive: boolean        // Whether currently in repeated hour
}
```

**Usage**: Return type for DST calculation utility functions (if needed for debugging)

### StyleRule (Existing Interface - No Changes)

**Location**: `app/composables/useMapStyleScheduler.ts`

```typescript
export interface StyleRule {
  id: string
  name: string
  description: string
  styleId: string
  priority: number
  check: () => boolean | Promise<boolean>
}
```

**Note**: DST rule follows this existing pattern, no interface changes needed

## Global Styles

### CSS Animation

**Location**: `app/assets/tailwind.css` or new `app/assets/evil-dst.css`

```css
@keyframes evil-dst-pulse {
  0%, 100% {
    background-color: rgb(15, 15, 15); /* Very dark gray base */
  }
  50% {
    background-color: rgb(60, 15, 15); /* Dark red tint */
  }
}

.evil-dst-active {
  animation: evil-dst-pulse 1.0s ease-in-out infinite;
}
```

**Applied to**: `document.body` element via JavaScript class manipulation

## Component Modifications

### No New Components

This feature does not require new Vue components. Integration happens at composable level.

**Modified Behavior**:

- `InteractiveMap.vue`: No changes (uses useMapStyles, which is updated by scheduler)
- `App.vue` (root): Body element will receive 'evil-dst-active' class when DST rule activates

## Data Flow

```text
┌──────────────────────────────────────────────┐
│  Scheduler (5-minute interval)               │
│  checks: isDSTTransition()                   │
└─────────────┬────────────────────────────────┘
              │
              ▼
      [Is it last Sunday Oct, 3-4 AM?]
              │
    ┌─────────┴─────────┐
    │ Yes               │ No
    ▼                   ▼
┌───────────────┐   ┌────────────────┐
│ Priority 100  │   │ Check other    │
│ DST Rule      │   │ rules          │
└───────┬───────┘   └────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ setStyle('toner')                │
│ +                                │
│ activatePulse() → add CSS class  │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Map displays black & white       │
│ Body background pulses red       │
│ Log: "[timestamp] DST activated" │
└──────────────────────────────────┘
```

## State Management

### Global State (Existing)

- `currentStyle` (ref) in useMapStyles - managed by scheduler
- `currentRule` (ref) in useMapStyleScheduler - tracks active rule ID

### New Global State

- `isDSTActive` (ref) in useBackgroundPulse - tracks background pulsation state

### State Synchronization

When DST rule activates:

1. Scheduler updates `currentRule.value = 'dst-transition'`
2. Scheduler calls `setStyle('toner')` → updates `currentStyle.value`
3. Scheduler calls `activatePulse()` → updates `isDSTActive.value` + adds CSS class

When DST rule deactivates:

1. Scheduler switches to next highest priority rule
2. Scheduler calls `deactivatePulse()` → removes CSS class

## Testing Structure

### Unit Tests

**File**: `tests/composable/useBackgroundPulse.spec.ts`

- Test activatePulse adds class
- Test deactivatePulse removes class
- Test isDSTActive ref updates

**File**: `tests/composable/useMapStyleScheduler.spec.ts` (add to existing)

- Test getLastSundayOfOctober(2025) = Oct 26, 2025
- Test isDSTTransition() with mocked dates
- Test DST rule priority 100 wins over other rules

### Integration Tests

**File**: `tests/integration/evil-dst-scheduler.spec.ts`

- Mock system time to DST transition
- Assert scheduler applies 'toner' style
- Assert body has 'evil-dst-active' class
- Assert console logs activation timestamp

## Performance Considerations

### CSS Animation Performance

- GPU-accelerated (uses transform/opacity implicitly via color interpolation)
- 1.0s cycle = 60 frames = ~16.67ms per frame (well within 60fps budget)
- No JavaScript animation loop (set-and-forget)

### Scheduler Performance

- DST check adds ~0.5ms to existing 10ms budget (negligible)
- Date calculations cached within 5-minute interval
- No network requests, all client-side

### Memory Impact

- 1 new ref (isDSTActive): 8 bytes
- 1 new rule object: ~200 bytes
- CSS class string: ~20 bytes
- **Total**: <300 bytes additional memory

## Accessibility

### Photosensitivity Safety

- 1.0 second pulse cycle = 1 Hz frequency
- WCAG 2.1 guideline: Avoid flashing >3 Hz
- **Status**: ✓ SAFE (well below 3 Hz threshold)

### Color Contrast

- Dark base: rgb(15, 15, 15) - very dark gray
- Red tint: rgb(60, 15, 15) - subtle red increase
- **Status**: Does not interfere with map readability (toner style is black & white, high contrast)

### User Control

- No explicit control provided (easter egg nature)
- User can manually override via console: `window.$map.setStyle('default')`
- Manual override persists per F024 behavior

## Dependencies Summary

### Existing Dependencies (Reused)

- SunCalc (for future astronomical calculations if needed)
- useMapStyles (for style management)
- useMapStyleScheduler (extended with DST rule)

### New Dependencies

- None! Pure JavaScript Date API + CSS animations

## File Locations Summary

**New Files**:

- `app/composables/useBackgroundPulse.ts` (~40 lines)
- `types/dst.ts` (~10 lines, optional)
- `tests/composable/useBackgroundPulse.spec.ts` (~80 lines)
- `tests/integration/evil-dst-scheduler.spec.ts` (~100 lines)

**Modified Files**:

- `app/composables/useMapStyleScheduler.ts` (+60 lines)
- `app/assets/tailwind.css` or `app/assets/evil-dst.css` (+15 lines)
- `tests/composable/useMapStyleScheduler.spec.ts` (+50 lines, add DST tests)

**Total Code**: ~200-250 new lines, ~60 modified lines
