# F024 - Map Style Scheduler (Easter Egg)

## Overview

Implement an intelligent map style scheduler that automatically changes the map appearance based on:

- **Astronomical events** (moon phases, sunrise/sunset)
- **Historical commemorations** (Estonian national days)
- **Day of week patterns** (full-moon Thursdays)

This creates a dynamic, living experience where the map subtly changes to reflect special moments in time.

## Problem Statement

Currently, the map uses a single static style (OpenStreetMap). While we've implemented console commands to switch styles manually, we want the map to automatically adapt based on meaningful temporal contexts:

1. The map should feel "alive" and responsive to time
2. Users should discover these changes organically
3. The changes should honor Estonian culture and history
4. The experience should be subtle and elegant, not overwhelming

## Goals

### Primary Goals

- ✅ Create a rule-based scheduler for automatic map style switching
- ✅ Implement astronomical calculations (moon phases, sun events)
- ✅ Support historical date commemorations
- ✅ Make the system extensible for future rules
- ✅ Design for eventual Entu configuration entity

### Secondary Goals

- Console logging for debugging/discovery
- Smooth transitions between styles
- Persistence of manual overrides
- ~~User notification of style changes (subtle)~~ _Deferred - notification translation complexity_

## Requirements

### Functional Requirements

**FR-1: Default Style**  

- Map uses "voyager" style by default
- Clean, colorful, modern aesthetic

**FR-2: Full Moon Thursday Rule**  

- **Trigger**: Every Thursday during a full moon
- **Active Time**: Moonrise to moonset
- **Style**: "toner" (black & white vintage print)
- **Priority**: Medium

**FR-3: Estonian Independence Day Rule**  

- **Date**: February 24
- **Active Time**: Sunrise to sunset
- **Style**: "vintage" (artistic watercolor)
- **Priority**: High (overrides moon rule)

**FR-4: Victory Day Rule**  

- **Date**: June 23 (Battle of Võnnu victory, 1919)
- **Active Time**: All day (00:00 - 23:59)
- **Style**: "terrain" (natural military-style map)
- **Priority**: High

**FR-5: Rule Priority System**  

- Rules have priority levels: High, Medium, Low
- Higher priority rules override lower priority
- If multiple same-priority rules match, use most specific

**FR-6: Astronomical Calculations**  

- Accurate moon phase calculation
- Sunrise/sunset times for Tallinn, Estonia (59.437°N, 24.754°E)
- Moonrise/moonset times for Tallinn
- Consider timezone (Europe/Tallinn, UTC+2/+3)

### Non-Functional Requirements

**NFR-1: Performance**  

- Rule evaluation should be fast (<10ms)
- Check rules every 5 minutes (not every second)
- Cache astronomical calculations

**NFR-2: Maintainability**  

- Rules should be easy to add/modify
- Clear separation between rule logic and style application
- Well-documented code

**NFR-3: Future-Proofing**  

- Design system to be configurable via Entu entities
- Support for JSON rule definitions
- Extensible rule types

## Technical Design

### Architecture

```text
┌──────────────────────────────────────────┐
│  InteractiveMap.vue                      │
│  - Uses getCurrentStyle() from composable│
└─────────────┬────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  useMapStyles.ts                        │
│  - Manages current style state          │
│  - Exposes console commands             │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  useMapStyleScheduler.ts (NEW)          │
│  - Evaluates rules every 5 minutes      │
│  - Calculates active style              │
│  - Updates useMapStyles state           │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Astronomical Calculations              │
│  - Moon phase (SunCalc library?)        │
│  - Sunrise/sunset                       │
│  - Moonrise/moonset                     │
└─────────────────────────────────────────┘
```

### Data Structures

```typescript
// Rule definition
interface MapStyleRule {
  id: string;
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  style: string; // Map style ID
  condition: RuleCondition;
  active: boolean; // Can be disabled
}

// Rule conditions
type RuleCondition =
  | DateRangeCondition
  | AstronomicalCondition
  | CustomCondition;

interface DateRangeCondition {
  type: "date-range";
  month: number; // 1-12
  day: number; // 1-31
  startTime?: string; // 'sunrise' | 'HH:MM'
  endTime?: string; // 'sunset' | 'HH:MM'
}

interface AstronomicalCondition {
  type: "astronomical";
  event: "full-moon" | "new-moon" | "first-quarter" | "last-quarter";
  dayOfWeek?: number; // 0-6 (0=Sunday, 4=Thursday)
  startTime?: string; // 'moonrise' | 'sunrise' | 'HH:MM'
  endTime?: string; // 'moonset' | 'sunset' | 'HH:MM'
}

interface CustomCondition {
  type: "custom";
  evaluator: (now: Date) => boolean;
}
```

### Rule Definitions

```typescript
const MAP_STYLE_RULES: MapStyleRule[] = [
  {
    id: "independence-day",
    name: "Estonian Independence Day",
    description: "Vintage style on Feb 24 (sunrise to sunset)",
    priority: "high",
    style: "vintage",
    condition: {
      type: "date-range",
      month: 2,
      day: 24,
      startTime: "sunrise",
      endTime: "sunset",
    },
    active: true,
  },

  {
    id: "victory-day",
    name: "Victory Day",
    description: "Terrain style on Jun 23 (Battle of Võnnu)",
    priority: "high",
    style: "terrain",
    condition: {
      type: "date-range",
      month: 6,
      day: 23,
      startTime: "00:00",
      endTime: "23:59",
    },
    active: true,
  },

  {
    id: "full-moon-thursday",
    name: "Full Moon Thursday",
    description: "Black & white on Thursdays during full moon",
    priority: "medium",
    style: "toner",
    condition: {
      type: "astronomical",
      event: "full-moon",
      dayOfWeek: 4, // Thursday
      startTime: "moonrise",
      endTime: "moonset",
    },
    active: true,
  },
];
```

### Astronomical Libraries

**Option 1: SunCalc**  

- ✅ Lightweight (11kb)
- ✅ Moon phase, sunrise/sunset, moonrise/moonset
- ✅ No dependencies
- ❌ Last update 2021
- npm: `suncalc`

**Option 2: Astronomy Engine**  

- ✅ Very accurate
- ✅ Actively maintained
- ✅ Comprehensive
- ❌ Larger size (50kb+)
- npm: `astronomy-engine`

**Decision**: Start with SunCalc for simplicity, can upgrade later if needed.

## Implementation Plan

### Phase 1: Foundation (30 min)

1. ✅ Install SunCalc library
2. ✅ Create `useMapStyleScheduler.ts` composable
3. ✅ Implement basic rule evaluation
4. ✅ Add astronomical calculations helper

### Phase 2: Rule System (45 min)

1. ✅ Define rule data structures
2. ✅ Implement date-range condition evaluator
3. ✅ Implement astronomical condition evaluator
4. ✅ Implement priority resolution
5. ✅ Add rule testing utilities

### Phase 3: Integration (30 min)

1. ✅ Integrate scheduler with `useMapStyles`
2. ✅ Add timer/interval for rule checking (5 min intervals)
3. ✅ Add console logging for debugging
4. ✅ Test all three rules

### Phase 4: Polish (30 min)

1. ✅ Add transition effects
2. ~~✅ Add user notification (subtle toast?)~~ _Deferred - translation complexity_
3. ✅ Add manual override support
4. ✅ Add persistence to localStorage

### Phase 5: Documentation (15 min)

1. ✅ Add code documentation
2. ✅ Update README with easter egg info
3. ✅ Create Entu entity specification for future

**Total Estimated Time**: ~2.5 hours

## Testing Strategy

### Manual Testing

**Test 1: Default Style**  

- Open app → Should show "voyager" style
- Check console: "🗺️ Map scheduler initialized"

**Test 2: Independence Day (Feb 24)**  

- Set system date to Feb 24, 8:00 (before sunrise)
- Style should be "voyager"
- Set system date to Feb 24, 10:00 (after sunrise)
- Style should change to "vintage"
- Set system date to Feb 24, 22:00 (after sunset)
- Style should revert to "voyager"

**Test 3: Victory Day (Jun 23)**  

- Set system date to Jun 23, any time
- Style should be "terrain" all day

**Test 4: Full Moon Thursday**  

- Find next full moon Thursday date
- Set system date to that Thursday before moonrise
- Style should be "voyager"
- Change time to after moonrise
- Style should change to "toner"
- Change time to after moonset
- Style should revert to "voyager"

**Test 5: Priority Resolution**  

- If Independence Day falls on a full moon Thursday
- Style should be "vintage" (higher priority)

**Test 6: Manual Override**  

- Set style manually via console: `window.$map.setStyle('darkMatter')`
- Should override scheduler
- Refresh page → scheduler should resume

### Automated Testing

```typescript
// Unit tests for rule evaluator
describe("MapStyleScheduler", () => {
  test("evaluates independence day rule correctly", () => {
    const date = new Date("2025-02-24T12:00:00+02:00");
    const result = evaluateRules(date);
    expect(result.style).toBe("vintage");
  });

  test("handles full moon thursday", () => {
    // Mock date to full moon Thursday
    const date = mockFullMoonThursday();
    const result = evaluateRules(date);
    expect(result.style).toBe("toner");
  });

  test("respects priority order", () => {
    // If multiple rules match, high priority wins
    const date = mockMultipleRuleMatch();
    const result = evaluateRules(date);
    expect(result.rule.priority).toBe("high");
  });
});
```

## Future Enhancements

### Phase 2 (Future)

1. **Entu Configuration Entity**

   ```yaml
   Entity Type: map-style-rule
   Properties:
     - nimi (name): Text
     - kirjeldus (description): Text
     - prioriteet (priority): Select (kõrge/keskmine/madal)
     - stiil (style): Select (default/vintage/toner/etc)
     - tingimus (condition): JSON
     - aktiivne (active): Boolean
   ```

2. **User Preferences**

   - Allow users to disable scheduler
   - Allow users to favorite specific styles
   - Remember user's last manual selection

3. **More Rules**

   - Midsummer (Jaanipäev, Jun 24) - special style
   - First snow of winter - special style
   - Solar eclipses - special style
   - Historical battle anniversaries

4. **Smooth Transitions**

   - Fade between styles instead of instant switch
   - Animate tile layer opacity

5. **Discovery Hints** _(Future consideration)_
   - Subtle notification when style changes (needs translation strategy)
   - "Did you notice?" tooltip
   - Achievement system

## Success Metrics

- ✅ Rules evaluate correctly for all test cases
- ✅ Performance: Rule evaluation < 10ms
- ✅ No console errors
- ✅ Smooth user experience (no jarring changes)
- ✅ Users discover and enjoy the feature organically

## Notes

**Estonian Historical Context:**

- Feb 24, 1918: Estonian Declaration of Independence
- Jun 23, 1919: Victory Day (Battle of Võnnu, defeated German forces)
- These are important national holidays in Estonia

**Full Moon Thursdays:**

- Adds mystical/magical element
- Thursday has significance in various cultures
- Full moon is visually striking - black & white style enhances this

**Location Context:**

- Tallinn coordinates: 59.437°N, 24.754°E
- Timezone: Europe/Tallinn (EET/EEST, UTC+2/+3)
- Sunrise/sunset times vary significantly (summer: 03:00-22:00, winter: 09:00-15:00)

## Related Files

- `/app/composables/useMapStyles.ts` - Map style management
- `/app/composables/useMapStyleScheduler.ts` - NEW - Rule scheduler
- `/app/components/InteractiveMap.vue` - Map component
- `/app/plugins/map-console.client.ts` - Console commands

## References

- [SunCalc Library](https://github.com/mourner/suncalc)
- [Astronomy Engine](https://github.com/cosinekitty/astronomy)
- [Estonian Public Holidays](https://en.wikipedia.org/wiki/Public_holidays_in_Estonia)
- [Moon Phase Calculations](https://en.wikipedia.org/wiki/Lunar_phase)
