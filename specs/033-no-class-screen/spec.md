# Feature Specification: "Not in a class yet" screen

**Feature Branch**: `033-no-class-screen`
**Created**: 2026-11-04
**Status**: Draft
**Input**: Forge issue #61, "New users get no access rights automatically". Decision (Mihkel,
2026-11-04): a logged-in person who belongs to no class gets a clear screen telling them to ask
their teacher for the class link; no automatic default class.

## Context

A person gets tasks only by joining a class through the class link (`/signup/<groupId>`). A
person who logs in any other way (a plain login, or an account made on entu.app) belongs to no
class and can reach no task. Today they see the empty task list, "Hetkel pole ühtegi ülesannet
määratud", with no hint what to do. At the ESM presentation on 2026-10-30, 3 of 9 new persons
ended up like this. The as-is map is on #61.

## User Scenarios & Testing _(mandatory)_

### Primary User Story

A student opens the app, logs in, and is in no class. Instead of an empty list they see a
message saying they are not in a class yet and should ask their teacher for the class link.
They ask, open the link, join the class, and from then on see their class's tasks.

### Acceptance Scenarios

1. **Given** a logged-in person in no class and with no tasks, **When** the task workspace
   opens, **Then** they see the "not in a class yet" message and not the empty task list.
2. **Given** that message is showing, **When** the person reads it, **Then** it tells them to
   ask their teacher for the class link, and that opening the link adds them to the class.
3. **Given** a person who belongs to at least one class, **When** the workspace opens, **Then**
   they see the normal workspace, also when their class has no tasks yet (the existing "no
   tasks assigned yet" text).
4. **Given** a person in no class who can still see tasks (a teacher or an admin), **When** the
   workspace opens, **Then** they see the normal workspace and their tasks.
5. **Given** the app language is et, en, uk or lv, **When** the message shows, **Then** it is in
   that language.
6. **Given** a person who just joined a class through the link, **When** they land on the
   workspace, **Then** they do not see the message, even while the join is still being
   confirmed.

### Edge Cases

- The join from a class link fails (today the home page only logs it): the person is in no
  class, so they see this message. That is correct and better than today's empty list; the
  message's advice (open the link again) also covers it.
- Class membership cannot be determined (network error): show the normal workspace with its
  existing error handling, never this message. The message must only appear when the person
  is known to be in no class.
- A person whose name is incomplete is sent to `/profile` first, as now; the message shows
  after that, on the workspace.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: When a logged-in person belongs to no class and has no tasks, the task workspace
  MUST show the "not in a class yet" message in place of the empty task list.
- **FR-002**: The message MUST say that the person is not in a class yet, that they should ask
  their teacher for the class link, and that opening the link adds them to the class.
- **FR-003**: The message MUST be available in et, en, uk and lv.
- **FR-004**: A person who belongs to at least one class, or who has at least one task, MUST
  see the normal workspace.
- **FR-005**: The message MUST NOT appear while a class join from a link is still in progress
  or being confirmed.
- **FR-006**: When class membership cannot be determined, the system MUST NOT show the message.

### Key Entities

- **Person**: the logged-in user. A member of a class when the class is among their parents.
- **Class (grupp)**: what a person joins through the class link.
- **Task (ulesanne)**: reachable by a person only through a right on the task naming them.

## Assumptions

- "No tasks" is the deciding second condition, so teachers and admins, who lead classes but
  need not be members of one, never see the message.
- Proposed message text (et), to be confirmed by the product owner (Eli Pilve):
  "Sa ei kuulu veel ühtegi klassi. Küsi õpetajalt klassi liitumislinki. Lingi avamisel lisatakse
  sind klassi ja siia ilmuvad sinu ülesanded."
- Translations to uk and lv want a native speaker's check, as with earlier strings.

## Out of Scope

- Adding people to a default class automatically (decided against, 2026-11-04).
- Showing why a failed class join failed, and retrying it on the spot (Path A's silent failure;
  its own issue if wanted).
- Any change in Entu: rights, webhooks, schema.

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

## Success Criteria

- A person in no class sees the message on every workspace load, in their language: 0 of them
  see the bare empty list.
- 0 persons in at least one class, and 0 persons with tasks, see the message.
- Of the people a teacher sends the class link after seeing the message, all reach their tasks
  without anyone changing rights by hand.
