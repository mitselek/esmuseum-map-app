# Feature F017: Map Header Consolidation & Respondent Attribution

## Overview

Deliver a cohesive task workspace experience by (1) attributing each submitted response to the authenticated Entu user and (2) consolidating all header controls inside the map card to eliminate duplicated chrome. The change should ensure every response contains the `vastaja` property while presenting language switching, logout, progress stats, and close actions in a single, responsive header area.

## Current Architecture Analysis

### Key Components

1. **TaskResponseForm.vue** – Handles response submission flow, location picker, and file uploads.
2. **useTaskResponseCreation.js** – Client-side helper that builds the payload for Entu response creation and orchestrates file uploads.
3. **TaskMapCard.vue** – Contains the interactive map, progress indicators, and close handler.
4. **TaskDetailPanel.vue** – Coordinates the task workspace layout and wires events between map, form, and sidebar.
5. **index.vue** – Entry page that previously hosted a standalone header with language/logout controls.

### Existing Behavior

- Response submission payload does not consistently include respondent identity; only client-authenticated flows expose the user name.
- Header controls are split between a global header (`index.vue`) and the map card (`TaskMapCard.vue`), creating duplicated UI and misaligned layout, especially on mobile.
- Map card header shows progress numbers and close control, but language selection and logout remain elsewhere.

## Problem Statement

1. **Missing Respondent Attribution** – Responses created under server-authenticated sessions lack the `vastaja` property, reducing auditability and preventing follow-up with the actual user.
2. **Fragmented Header Layout** – Users face scattered controls (language switcher, logout, progress, close) across two headers, complicating navigation and breaking visual alignment requirements from latest design feedback.

## Solution Design

### Respondent Attribution

- Source respondent name exclusively from Entu authentication (`useEntuAuth`) to enforce consistent identity regardless of auth channel.
- Normalize the name (trim, collapse blanks) and include it as `respondentName` in the request payload only when non-empty.
- Ensure the `vastaja` property is applied when the record reaches Entu, both via client-side payload build and server validation.

### Map Header Consolidation

- Remove the redundant global header from `index.vue`.
- Extend `TaskMapCard.vue` header to host:
  - Left group: response progress (`completed/total`) and close/return control.
  - Right group: language switcher buttons and logout icon.
- Maintain responsive behavior so controls wrap gracefully on narrow viewports.
- Update `TaskDetailPanel.vue` to rely solely on the map card header for close handling.

## Implementation Plan

1. **Respondent Name Wiring**
   - Update `TaskResponseForm.vue` to compute `respondentName` from Entu auth, normalize input, and pass to request payload.
   - Adjust `useTaskResponseCreation.js` to inject the `vastaja` property when `respondentName` exists.
   - Confirm server-side request validation accepts the new field and forwards it to Entu.

2. **UI Consolidation**
   - Remove header markup from `index.vue` and ensure layout still renders correctly.
   - Refactor `TaskMapCard.vue` header markup to group controls per design order.
   - Hook close emission to `TaskDetailPanel.vue` so the sidebar or workspace reacts as before.

3. **Refinement & Cleanup**
   - Strip temporary instrumentation logs added during debugging.
   - Align internationalization strings if new UI labels are required (none anticipated).

## Technical Notes

- `respondentName` is optional to handle legacy or anonymous flows but should be present for authenticated sessions.
- The header uses existing locale data from `useI18n` and auth state from `useEntuAuth`; no new dependencies are required.
- Flex layout should prioritize left/right grouping with `justify-between` while allowing `flex-wrap` for small screens.

## Testing Strategy

### Manual Scenarios

1. Submit a response while authenticated – confirm Entu record contains `vastaja` with the expected name.
2. Trigger file upload alongside submission – ensure uploads still succeed and reference the created entity.
3. Toggle languages and logout from the consolidated header – verify controls remain functional.
4. Resize to small viewport – ensure header wraps without overlapping controls.
5. Attempt submission with blank name (simulate missing auth) – confirm payload omits `respondentName` gracefully.

### Automated Checks

- Run existing Vitest suites (known alias issue persists; document workaround or follow-up if needed).
- ESLint / type checks to ensure no new linting issues introduced.

## Risk Assessment

- **Low**: Changes are additive and scoped to task workspace UI and payload composition.
- Potential regressions involve miswired events (close handler) or missing respondent names if auth state retrieval fails.
- Mitigation: Manual validation in both client-auth and server-auth contexts and quick rollback via feature flag if necessary.

## Future Enhancements

- Include respondent contact metadata (email/phone) when available for richer audit trails.
- Add telemetry to track header control interactions after consolidation.
- Provide user feedback in the UI confirming the recorded respondent identity.

---

**Next Step:** Implement the documented changes across `TaskResponseForm.vue`, `useTaskResponseCreation.js`, `TaskMapCard.vue`, and dependent layout files, then validate via manual regression testing.
