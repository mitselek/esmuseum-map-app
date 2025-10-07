# Research: Evil DST Map Schedule

**Feature**: F028 - Daylight Saving Time Map Schedule  
**Date**: 2025-10-07  
**Status**: Complete

## Research Areas

### 1. DST Transition Detection

**Decision**: Use JavaScript `Date` API with timezone-aware calculations for Europe/Tallinn

**Rationale**:

- EU DST rules: Last Sunday of October at 4:00 AM (clock goes back to 3:00 AM)
- JavaScript Date handles timezone transitions automatically when using `toLocaleString()` with timeZone option
- No need for external library beyond existing SunCalc (already used in F024)
- Can detect repeated hour by checking if UTC offset changes

**Algorithm**:

```typescript
// Find last Sunday of October
function getLastSundayOfOctober(year: number): Date {
  // Start at Oct 31 and work backwards to find Sunday
  let date = new Date(year, 9, 31); // October = month 9
  while (date.getDay() !== 0) {
    // 0 = Sunday
    date.setDate(date.getDate() - 1);
  }
  return date;
}

// Check if currently in DST transition (3 AM - 4 AM repeated hour)
function isDSTTransition(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const lastSunday = getLastSundayOfOctober(year);

  // Check if today is the DST transition day
  if (now.toDateString() !== lastSunday.toDateString()) {
    return false;
  }

  // Check if time is between 3 AM and 4 AM (local time)
  const hour = now.getHours();
  return hour === 3; // Both occurrences of 3-4 AM
}
```

**Alternatives Considered**:

- **Hardcode dates**: Rejected - EU can change DST rules, violates NFR-001
- **Use moment-timezone**: Rejected - adds 65KB bundle, overkill for single calculation
- **Parse IANA timezone database**: Rejected - too complex, Date API sufficient

**Vue/Nuxt Patterns**:

- Implement as pure function in useMapStyleScheduler
- Use existing ref/computed pattern from F024
- No server-side logic needed (client-only feature)

### 2. Background Pulsation Implementation

**Decision**: CSS animation with Vue reactive class binding

**Rationale**:

- CSS animations are GPU-accelerated (performant)
- 1.0 second cycle easy to implement with `@keyframes`
- Vue's reactive classes enable clean on/off control
- No RAF (requestAnimationFrame) loops needed
- Accessibility-safe timing per clarification

**CSS Pattern**:

```css
@keyframes evil-dst-pulse {
  0%,
  100% {
    background-color: rgb(15, 15, 15); /* Dark base */
  }
  50% {
    background-color: rgb(60, 15, 15); /* Red tint */
  }
}

.evil-dst-active {
  animation: evil-dst-pulse 1s ease-in-out infinite;
}
```

**Vue Integration**:

```typescript
// useBackgroundPulse composable
export function useBackgroundPulse() {
  const isDSTActive = ref(false);

  const activatePulse = () => {
    isDSTActive.value = true;
    document.body.classList.add("evil-dst-active");
  };

  const deactivatePulse = () => {
    isDSTActive.value = false;
    document.body.classList.remove("evil-dst-active");
  };

  return { isDSTActive, activatePulse, deactivatePulse };
}
```

**Alternatives Considered**:

- **GSAP/animation library**: Rejected - adds dependency, CSS sufficient
- **JS setTimeout loop**: Rejected - less performant, more code
- **Canvas-based effect**: Rejected - overkill, accessibility concerns
- **Tailwind utility classes**: Rejected - can't do smooth 1s pulse, need custom keyframes

**Vue/Nuxt Patterns**:

- Use Nuxt plugin to apply global styles
- Composable manages state, CSS handles animation
- Clean separation: logic in composable, presentation in CSS

### 3. Existing Scheduler Integration

**Decision**: Add DST rule to styleRules array in useMapStyleScheduler with priority 100 (same as Independence Day)

**Rationale**:

- F024 established StyleRule interface pattern
- Priority system already implemented (high=100, med=80, low=0)
- Clarification specifies HIGH priority to override all other rules
- Since both DST and Independence Day are priority 100, order in array matters (DST should come first)

**Implementation Pattern**:

```typescript
const styleRules: StyleRule[] = [
  {
    id: "dst-transition",
    name: "Evil DST Transition",
    description:
      "Black & white toner + red pulse during fall DST transition (3-4 AM repeated hour)",
    styleId: "toner",
    priority: 100, // HIGH - overrides all other rules
    check: isDSTTransition,
  },
  {
    id: "independence-day", // Existing rule, now priority 100 < DST
    name: "Estonian Independence Day",
    // ... existing config
    priority: 100,
  },
  // ... other rules
];
```

**Integration Points**:

1. **Rule evaluation**: Existing `evaluateRules()` function handles priority sorting
2. **Style application**: Existing `applyScheduledStyle()` calls `setStyle()`
3. **Background effect**: New hook in `applyScheduledStyle()` to call `activatePulse()` / `deactivatePulse()`
4. **Logging**: Add timestamp logging per FR-008 (minimal logging)

**Alternatives Considered**:

- **Separate scheduler**: Rejected - duplication, coordination issues
- **Plugin-based rules**: Rejected - premature abstraction, YAGNI
- **Priority 101**: Rejected - breaks existing scale, use array order for ties

**Vue/Nuxt Patterns**:

- Maintain existing 5-minute interval from F024
- Reuse existing SunCalc integration
- Follow existing console.log format for scheduler events

### 4. Testing Strategy

**Decision**: Unit tests for DST logic, integration test for scheduler behavior

**Test Files**:

```text
tests/
├── composable/
│   ├── useMapStyleScheduler.spec.ts (modify existing)
│   └── useBackgroundPulse.spec.ts (new)
└── integration/
    └── evil-dst-scheduler.spec.ts (new)
```

**Test Scenarios**:

**Unit Tests (useBackgroundPulse)**:

- `activatePulse()` adds 'evil-dst-active' class to body
- `deactivatePulse()` removes class
- `isDSTActive` ref updates correctly

**Unit Tests (useMapStyleScheduler - DST functions)**:

- `getLastSundayOfOctober(2025)` returns Oct 26, 2025
- `isDSTTransition()` returns true when mocked to DST night + 3 AM hour
- `isDSTTransition()` returns false on normal nights
- `isDSTTransition()` returns false on spring DST (March)

**Integration Test**:

- Mock Date to last Sunday of October, 3:15 AM
- Call `applyScheduledStyle()`
- Assert: current style = 'toner'
- Assert: body has 'evil-dst-active' class
- Assert: console.log called with timestamp

**Mocking Pattern**:

```typescript
import { vi } from "vitest";

// Mock Date to DST transition
vi.useFakeTimers();
vi.setSystemTime(new Date("2025-10-26T03:15:00+03:00")); // Last Sunday Oct, 3:15 AM EEST
```

**Alternatives Considered**:

- **E2E tests**: Rejected - can't reliably trigger DST in browser
- **Visual regression**: Rejected - pulsation is temporal, hard to capture
- **Manual QA only**: Rejected - violates constitution test-first principle

**Vue/Nuxt Patterns**:

- Use @nuxt/test-utils for composable testing
- Use vitest fakeTimers for date mocking
- Follow existing F024 test patterns

## Research Summary

All technical unknowns resolved:

✅ **DST Detection**: JavaScript Date API with last-Sunday-of-October calculation  
✅ **Background Pulsation**: CSS @keyframes with Vue class binding  
✅ **Scheduler Integration**: Extend existing styleRules array, priority 100  
✅ **Testing Approach**: Unit tests for logic, integration test for behavior  
✅ **Performance**: CSS animations (GPU-accelerated), no runtime overhead  
✅ **Accessibility**: 1.0s pulse cycle is safe (slow enough for photosensitivity guidelines)

## Dependencies

- **Existing**: SunCalc (already in F024 for astronomical calculations)
- **New**: None! Pure JavaScript Date API + CSS animations

## Risks & Mitigations

| Risk                                      | Impact | Mitigation                                                    |
| ----------------------------------------- | ------ | ------------------------------------------------------------- |
| EU changes DST rules                      | High   | Dynamic calculation (not hardcoded), easy to update algorithm |
| Browser timezone mismatches               | Medium | Force Europe/Tallinn calculations (per FR-010)                |
| CSS animation performance on old devices  | Low    | Pulsation is non-critical, graceful degradation acceptable    |
| DST transition only happens once per year | Low    | Robust test mocking ensures correctness                       |

## Next Steps

Proceed to Phase 1: Design & Contracts
