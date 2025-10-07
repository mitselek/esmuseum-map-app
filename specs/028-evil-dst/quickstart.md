# Quickstart: Evil DST Feature Testing

**Feature**: F028 - Daylight Saving Time Map Schedule  
**Date**: 2025-10-07

## Prerequisites

- Dev server running (`npm run dev`)
- Browser dev console open
- Feature branch `028-evil-dst` checked out

## Manual Test Scenarios

### Scenario 1: DST Rule Detection (Time Mock Required)

**Objective**: Verify DST transition detection logic

**Steps**:

1. Open browser dev console
2. Mock system date to DST transition night:

   ```javascript
   // Last Sunday of October 2025 at 3:30 AM
   const originalDate = Date
   global.Date = class extends originalDate {
     constructor() {
       return new originalDate('2025-10-26T03:30:00+03:00')
     }
   }
   ```

3. Trigger scheduler check:

   ```javascript
   window.$scheduler.checkNow()
   ```

4. Observe console output

**Expected Outcome**:

- Console logs: `🗺️ [Scheduler] Applying rule: Evil DST Transition`
- Console logs: `[2025-10-26T03:30:00+03:00] DST activated` (timestamp)
- Map switches to "toner" style (black & white)
- Page background begins pulsating with red hue

**Validation**:

- ✓ Map tiles are black & white (toner style)
- ✓ Body element has class `evil-dst-active`
- ✓ Background color smoothly transitions between dark gray and dark red
- ✓ Pulsation cycle: ~1 second (count "one-Mississippi" = one full cycle)

### Scenario 2: Priority Override Test

**Objective**: Verify DST rule overrides other HIGH priority rules

**Steps**:

1. Mock date to Feb 24 (Independence Day) at 3:30 AM during DST transition year:

   ```javascript
   // Hypothetical: If Independence Day fell on DST transition (unlikely but possible)
   global.Date = class extends originalDate {
     constructor() {
       // This is a contrived scenario for testing priority
       return new originalDate('2025-02-24T03:30:00+02:00')
     }
   }
   ```

2. Trigger scheduler:

   ```javascript
   window.$scheduler.checkNow()
   ```

3. Check active rule:

   ```javascript
   window.$scheduler.status()
   ```

**Expected Outcome**:

- If both DST and Independence Day match, DST wins (comes first in styleRules array)
- Console shows: `✓ ACTIVE [100] Evil DST Transition`
- Style = "toner" (not "vintage")

**Note**: This scenario is mostly theoretical - Independence Day (Feb 24) and DST (late October) never overlap. Included for completeness.

### Scenario 3: Normal Night (No Activation)

**Objective**: Verify DST rule does NOT activate on regular nights

**Steps**:

1. Mock date to any normal night at 3:30 AM:

   ```javascript
   global.Date = class extends originalDate {
     constructor() {
       return new originalDate('2025-10-15T03:30:00+03:00') // Mid-October, not last Sunday
     }
   }
   ```

2. Trigger scheduler:

   ```javascript
   window.$scheduler.checkNow()
   ```

3. Check scheduler status

**Expected Outcome**:

- Console shows: `inactive [100] Evil DST Transition`
- Map uses default "voyager" style (or other active rule)
- NO red pulsation on background
- Body element does NOT have `evil-dst-active` class

### Scenario 4: Manual Style Override During DST

**Objective**: Verify manual overrides work during DST period

**Steps**:

1. Activate DST rule (mock date to DST transition, run checkNow())
2. Manually override style:

   ```javascript
   window.$map.setStyle('vintage')
   ```

3. Observe map

**Expected Outcome**:

- Map changes to "vintage" style (watercolor)
- Red pulsation CONTINUES (background effect independent of map style)
- Console logs: `🗺️ Map style changed to: Stamen Watercolor`

**Note**: Background pulsation persists until scheduler's next 5-minute check deactivates it (or until DST period ends).

### Scenario 5: DST Deactivation

**Objective**: Verify clean deactivation when DST period ends

**Steps**:

1. Activate DST (mock to 3:30 AM on transition night)
2. Wait or mock time forward to 4:01 AM (after repeated hour):

   ```javascript
   global.Date = class extends originalDate {
     constructor() {
       return new originalDate('2025-10-26T04:01:00+02:00') // After transition, back to standard time
     }
   }
   ```

3. Trigger scheduler:

   ```javascript
   window.$scheduler.checkNow()
   ```

**Expected Outcome**:

- Console logs: `🗺️ [Scheduler] Applying rule: Default Style` (or next highest priority)
- Console logs: `[2025-10-26T04:01:00+02:00] DST deactivated` (timestamp)
- Map switches away from "toner" (to "voyager" or other active rule)
- Red pulsation STOPS
- `evil-dst-active` class removed from body

### Scenario 6: Spring DST (No Activation)

**Objective**: Verify feature does NOT activate during spring "spring forward" DST

**Steps**:

1. Mock date to last Sunday of March (spring DST) at 3:30 AM:

   ```javascript
   global.Date = class extends originalDate {
     constructor() {
       return new originalDate('2025-03-30T03:30:00+02:00') // Spring DST in EU
     }
   }
   ```

2. Trigger scheduler:

   ```javascript
   window.$scheduler.checkNow()
   ```

**Expected Outcome**:

- DST rule shows as `inactive` in status
- NO "toner" style applied
- NO red pulsation
- Feature is specific to **fall** DST only (per FR-004)

## Accessibility Validation

### Photosensitivity Check

**Steps**:

1. Activate DST feature (scenario 1)
2. Use stopwatch or count seconds: "one-Mississippi, two-Mississippi..."
3. Measure time for one complete pulse cycle (dark → red → dark)

**Expected Outcome**:

- Cycle time: **~1.0 second** (acceptable range: 0.9-1.1 seconds)
- Frequency: **1 Hz** (well below 3 Hz WCAG threshold)
- ✓ SAFE for users with photosensitivity

### Color Contrast

**Steps**:

1. Activate DST feature
2. Use browser DevTools color picker on background
3. Measure RGB values at darkest and brightest points of cycle

**Expected Values**:

- Darkest: rgb(15, 15, 15) - very dark gray
- Brightest: rgb(60, 15, 15) - dark red tint
- Difference: Subtle (45 points on red channel)
- ✓ Does not interfere with map readability

## Console Debugging Commands

```javascript
// Check scheduler status (shows all rules with ETA)
window.$scheduler.status()

// Manually trigger scheduler check (useful after mocking date)
window.$scheduler.checkNow()

// Show all available map styles
window.$map.listStyles()

// Manually set style (test override behavior)
window.$map.setStyle('toner')
window.$map.setStyle('vintage')
window.$map.setStyle('default')

// Show current active style
window.$map.currentStyle()
```

## Automated Test Validation

### Run Unit Tests

```bash
npm run test:unit -- useBackgroundPulse
npm run test:unit -- useMapStyleScheduler
```

**Expected**:

- All tests pass (green checkmarks)
- Coverage >80% for composables

### Run Integration Tests

```bash
npm run test -- evil-dst-scheduler
```

**Expected**:

- DST rule activation test: PASS
- Priority override test: PASS
- Normal night deactivation test: PASS

## Known Limitations

1. **Manual date mocking required**: Cannot naturally wait for actual DST transition (occurs once per year)
2. **Browser timezone affects testing**: Tests may behave differently in non-Europe/Tallinn timezones
3. **5-minute delay**: Scheduler checks every 5 minutes, not real-time (acceptable per F024 design)
4. **Manual override persistence**: If user manually overrides, background still pulses until next check

## Success Criteria Checklist

- [ ] DST rule activates on last Sunday of October between 3-4 AM
- [ ] Map displays "toner" (black & white) style
- [ ] Background pulses red at 1.0 second cycle
- [ ] Priority 100 correctly overrides other rules
- [ ] Feature does NOT activate on spring DST
- [ ] Feature does NOT activate on regular nights at 3-4 AM
- [ ] Clean deactivation when DST period ends
- [ ] Timestamps logged to console (activation + deactivation)
- [ ] Manual style overrides still work
- [ ] No errors in console
- [ ] Pulsation is smooth (no jank)
- [ ] Accessibility: 1 Hz frequency (< 3 Hz threshold)

## Troubleshooting

### Issue: DST rule not activating

**Check**:

- Date mock is correct (last Sunday of October, hour 3)
- Scheduler has been triggered (`checkNow()` called)
- Console for errors in rule evaluation

### Issue: Background not pulsating

**Check**:

- Body element has `evil-dst-active` class (inspect in DevTools)
- CSS @keyframes defined (check Styles panel)
- No conflicting CSS overriding background color

### Issue: Wrong priority (another rule winning)

**Check**:

- DST rule listed first in styleRules array (array order matters for tie-breaking)
- Priority value is 100 (same as Independence Day)
- Rule check function `isDSTTransition()` returning true

### Issue: Tests failing with timezone errors

**Solution**:

- Use ISO 8601 format with explicit timezone: `2025-10-26T03:30:00+03:00`
- Vitest config: ensure timezone mocking is consistent
- Consider using `process.env.TZ = 'Europe/Tallinn'` in test setup

## Demo Video Script

For PR/documentation purposes:

1. Open app at 2:55 AM (simulated) on Oct 26, 2025
2. Show scheduler status: DST rule inactive
3. Fast-forward time to 3:00 AM
4. Watch scheduler trigger: Map turns black & white, background starts pulsing red
5. Check console: activation timestamp logged
6. Fast-forward to 4:01 AM
7. Watch deactivation: Map returns to default, pulsation stops
8. Console: deactivation timestamp logged

**Recommended tool**: OBS Studio with screen recording, time-lapse overlay
