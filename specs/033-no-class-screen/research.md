# Research: "Not in a class yet" screen

Data read from Entu `esmuuseum` on 2026-11-04 with Laidoner's key (ids only).

## 1. What counts as a class

- **Decision**: a class is a `grupp` whose `_parent` is the classes root group ("Klassid",
  `…1969d8`). The root's id is read from Entu's schema: the `grupp` entity type's
  `default_parent`.
- **Rationale**: all 13 visible classes hang under "Klassid", and `grupp.default_parent` is
  "Klassid", so new classes land there too. 35 of 42 persons also have a second `grupp` parent
  (`…1969ed`, an all-users group not visible to Laidoner); the 3 class-less persons from
  2026-10-30 have it. "Has any `grupp` parent" would call them class members.
- **Alternatives considered**:
  - any `grupp` parent: wrong, see above;
  - exclude the all-users group by a hard-coded id: breaks on the next such group;
  - a group with a `grupijuht` (leader): the four infopäev groups have none;
  - a new runtime config value for the root: works, but duplicates what the schema already says.

## 2. Where the check runs

- **Decision**: a server endpoint, `GET /api/onboard/class-status?userId=…`, using the manager
  key, like `check-membership`.
- **Rationale**: the person can read their own record, but not necessarily every group in it
  (the all-users group is hidden even to an owner of persons and groups), so a client-side check
  would end in "unknown" for exactly the people who need the message.
- **Alternatives considered**: client-side GET of each parent group (fails as above); returning
  the class list (the client needs only yes/no).

## 3. When the message may show

- **Decision**: only when all hold: tasks are loaded without error; the person has zero tasks;
  no class join is pending (`pending_group_id` in localStorage); the endpoint answered
  `no-class`. Any other state shows today's view.
- **Rationale**: FR-004 to FR-006. A wrong "not in a class" is worse than a missing hint.
- **Alternatives considered**: deciding on tasks alone (breaks FR-004: a class whose teacher has
  not added tasks yet).

## 4. Where it renders

- **Decision**: in the empty state of `TaskSidebar.vue` (the block that shows `tasks.noTasks`),
  with the same layout, new texts `tasks.noClassTitle` and `tasks.noClassDescription`. Not while
  a search query is set.
- **Rationale**: that block is what the class-less person sees today; replacing its text keeps
  the change small and the layout familiar.
