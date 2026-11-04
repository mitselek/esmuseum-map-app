# Data Model: "Not in a class yet" screen

No Entu schema change. Read only.

## Entu (existing)

- **person**: `_parent[]` entries carry `reference` and `entity_type`. Class membership is a
  parent with `entity_type: grupp` that is a class.
- **grupp**: a class when its `_parent` includes the classes root.
- **entity type `grupp`**: `default_parent` names the classes root ("Klassid").

## App state

- `ClassStatus = 'unknown' | 'in-class' | 'no-class'`, held per user id in `useClassStatus`
  (module-level ref). Starts `unknown`; set once per user from the endpoint; `unknown` on any
  error. Reset when the user id changes (logout/login).

## Decision inputs (`shouldShowNoClassNotice`)

| input | from | show only if |
|---|---|---|
| tasks initialized, not loading, no error | `useTaskWorkspace` | true |
| task count | `useTaskWorkspace` | 0 |
| search query | `TaskSidebar` | empty |
| join pending | `localStorage.pending_group_id` | absent |
| class status | `useClassStatus` | `no-class` |
