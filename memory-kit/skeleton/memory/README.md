# memory

This home's memory. Shape: `memory-kit/types/*.ts`. Lint: `memory-kit/lint/memory-lint.sh`.

The kit owns `memory-kit/`; this directory is yours. They never interleave, so a kit upgrade
never touches anything here.

| path | tier | read when |
|------|------|-----------|
| `<name>.yaml` | scratchpad | every session start |
| `rules.yaml` | rules | every session start |
| `obligations.yaml` | obligations | when something is owed, and on its expiry |
| `facts/` | facts | when the subject comes up; swept on a cadence |
| `dormant/` | parked facts | only when a `reviewed` date says so |
| `lessons/` | lessons | at the moment of use |
| `urls/` | urls | when a ref points here |
| `secrets/` | secrets | when a consumer needs one |
| `keys.yaml` | keys | when granting or revoking access |

Two things this directory is not: a ledger (point at the real one and record how to re-check
it) and an archive (git is the archive -- refuted facts are deleted, not annotated).
