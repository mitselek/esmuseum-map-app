# Feature Specification: Daylight Saving Time Map Schedule

**Feature Branch**: `028-evil-dst`  
**Created**: 2025-10-07  
**Status**: Draft  
**Input**: User description: "add a new map schedule for two hours each year when 3 AM to 4 AM gets counted twice"

## Execution Flow (main)

```text
1. Parse user description from Input
   ✓ Feature understood: DST transition handling
2. Extract key concepts from description
   ✓ Actors: System scheduler, map users
   ✓ Actions: Detect DST transition, apply special map style
   ✓ Data: Time zone info, DST transition dates
   ✓ Constraints: Only during fall-back transition (repeated hour)
3. For each unclear aspect:
   → [RESOLVED] Which map style to use during this period
   → [RESOLVED] Estonia-specific DST transitions
4. Fill User Scenarios & Testing section
   ✓ Clear user flow identified
5. Generate Functional Requirements
   ✓ All requirements testable
6. Identify Key Entities
   ✓ DST Rule entity
7. Run Review Checklist
   ✓ No implementation details
   ✓ No remaining clarifications needed
8. Return: SUCCESS (spec ready for planning)
```

---

## Clarifications

### Session 2025-10-07

- Q: Which specific map style should be used during the DST transition period? → A: toner with app background color pulsating in red hues
- Q: What priority level should the DST rule have and why? → A: High - DST is rare (once/year) and should override most other rules including historical commemorations
- Q: What specific information should be logged when the DST rule activates/deactivates? → A: Minimal - Just timestamps of activation/deactivation
- Q: What should happen if the scheduler fails to detect the DST transition or the style change fails to apply? → A: Log only - Log error but don't alert user, continue with current style
- Q: What is the acceptable pulsation rate/frequency for the red background effect? → A: heartbeat rhythm 1.0 sec

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing

### Primary User Story

As a **map application user**, during the annual daylight saving time transition when clocks "fall back" (the hour from 3:00 AM to 4:00 AM repeats twice), I want the map to display a special visual style that acknowledges this temporal anomaly, so that the application feels responsive to this unique moment in time.

### Acceptance Scenarios

1. **Given** it is the fall DST transition night in Estonia, **When** the clock reaches 3:00 AM for the first time, **Then** the map automatically switches to a special "time loop" style
2. **Given** the map is showing the DST special style, **When** the repeated 3:00 AM - 4:00 AM period ends, **Then** the map automatically reverts to the default or scheduled style
3. **Given** it is NOT a DST transition period, **When** the clock shows 3:00 AM - 4:00 AM on any normal night, **Then** the map displays normal scheduled styles
4. **Given** it is the spring DST transition night when clocks "spring forward" (3:00 AM skipped), **When** the clock jumps from 2:59 AM to 4:00 AM, **Then** the map does NOT activate the special DST style (only fall-back transition applies)
5. **Given** another rule is active during DST transition (e.g., Independence Day or full moon Thursday), **When** rule priorities are evaluated, **Then** the DST rule (HIGH priority) takes precedence and displays toner style with red pulsating background

### Edge Cases

- What happens when the DST transition date changes year-to-year? (Answer: System must calculate DST dates dynamically each year based on EU regulations)
- How does the system handle if someone manually overrides the map style during the DST period? (Answer: Manual overrides take precedence)
- What if the user's browser timezone doesn't match Estonia? (Answer: Schedule based on Europe/Tallinn timezone regardless of user's local time)
- What happens during the last Sunday of October at exactly 4:00 AM when DST ends? (Answer: Special style ends, return to default/scheduled)
- What if DST detection or style application fails? (Answer: Log error silently and continue with current style - no user notification needed for this easter egg feature)

## Requirements

### Functional Requirements

- **FR-001**: System MUST detect the annual daylight saving time "fall back" transition in Estonia (Europe/Tallinn timezone)
- **FR-002**: System MUST activate a special map style during the repeated hour period (3:00 AM to 4:00 AM occurs twice)
- **FR-003**: System MUST calculate DST transition dates dynamically based on EU regulations (last Sunday of October at 4:00 AM)
- **FR-004**: System MUST NOT activate the special style during spring DST transition (when clocks spring forward)
- **FR-005**: System MUST deactivate the special style when the repeated hour period ends (at 4:00 AM standard time)
- **FR-006**: The DST rule MUST have HIGH priority level in the rule priority system, overriding all other scheduled events (including historical commemorations and astronomical events) due to its rarity (occurs only once per year)
- **FR-007a**: The red pulsating background effect MUST use a heartbeat rhythm at 1.0 second per cycle, be subtle enough to avoid photosensitivity issues, and not interfere with map usability
- **FR-008**: System MUST log DST rule activation and deactivation events with timestamps (minimal logging: activation timestamp and deactivation timestamp only)
- **FR-009**: System MUST handle the two-hour duration correctly (repeated 3-4 AM = 2 hours total)
- **FR-010**: System MUST work correctly regardless of user's local timezone (always based on Europe/Tallinn)
- **FR-011**: If DST detection or style application fails, system MUST log the error and gracefully continue with the current active style without alerting the user

### Non-Functional Requirements

- **NFR-001**: DST detection should be accurate and not rely on hardcoded dates
- **NFR-002**: Rule evaluation should remain performant (no degradation from existing 5-minute check interval)
- **NFR-003**: The feature should be maintainable and follow existing map scheduler patterns
- **NFR-004**: Code should include clear documentation explaining DST logic for future developers

### Key Entities

- **DST Schedule Rule**: Represents the special scheduling rule for daylight saving time transitions
  - Trigger condition: Last Sunday of October, 3:00 AM - 4:00 AM (repeated)
  - Active duration: 2 hours (the repeated hour)
  - Map style: Distinctive visual style (specific style TBD during planning)
  - Priority level: HIGH (overrides all other rules due to once-per-year rarity and temporal significance)
  - Timezone: Europe/Tallinn (UTC+2/+3)

---

## Review & Acceptance Checklist

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

### Dependencies and Assumptions

**Dependencies**:

- Existing map style scheduler system (F024)
- Existing rule priority system
- Existing astronomical calculation utilities (can be extended for DST)

**Assumptions**:

- Estonia follows standard EU DST regulations (last Sunday of October)
- The map style scheduler checks are frequent enough to catch the transition
- Special map style for DST theme is available or can be selected from existing styles
- Users will discover this feature organically (no explicit notification required)

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (and resolved)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

## Additional Context

### Why This Feature Matters

Daylight saving time transitions are unique temporal anomalies where time literally repeats itself (fall) or jumps forward (spring). The fall transition when 3:00 AM - 4:00 AM occurs twice annually creates a rare moment that most people sleep through and never consciously experience. By acknowledging this with a special map style, the application:

1. **Honors temporal uniqueness**: Celebrates rare moments in the calendar
2. **Cultural awareness**: Recognizes a shared European time-keeping practice
3. **Easter egg discovery**: Creates delight for users who happen to be using the app during these hours
4. **Completes the temporal theme**: Adds to existing astronomical and historical commemorations

### Design Considerations

The chosen visual treatment reflects the "evil" nature of DST:

- **Map style: "toner"** (black & white vintage print) - Creates stark, timeless aesthetic suggesting temporal disruption
- **Background effect: Red pulsating hues** - Evokes danger, urgency, and the "evil" nature of time manipulation
- **Pulsation timing: Heartbeat rhythm at 1.0 second per cycle** - Creates urgent, rhythmic pulse that suggests temporal anomaly without being overwhelming
- **Combined effect** - The monochrome map against pulsating red background creates an unsettling, attention-grabbing experience appropriate for this temporal anomaly

**Accessibility considerations**: 1.0 second heartbeat rhythm is slow enough to avoid triggering photosensitivity issues while still being noticeable and creating the desired "evil" atmosphere

Suggested style candidates (to be decided during planning):

- "toner" (black & white) - suggests timelessness
- Custom "time-loop" style if one exists
- "dark-matter" (if available) - emphasizes the nighttime nature

### Success Metrics

- Feature activates automatically during DST fall-back transition
- No performance degradation to existing scheduler
- Clean integration with existing rule priority system
- Code passes all tests and follows project constitution principles
