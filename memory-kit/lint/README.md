# lint

`memory-lint.sh [path] [--gate|--report] [--shipped-rules]`

Reads `caps.yaml`; needs python3 + PyYAML and nothing else. Fails closed (exit 2) when PyYAML
is missing: a lint that skips checks is worse than no lint.

- `--gate` exits 1 on any failure. Default for a fresh home.
- `--report` always exits 0. For a home still clearing adoption debt.
- Neither: the mode comes from `memory-kit.conf` (`mode: gate | gauge`), default gate.

**A gate must pass on the tree it is introduced to.** A lint that fails on day one teaches
`--no-verify`.

## What is a failure and what is a note

Failures are shape: a cap exceeded, a ref outside the grammar, a missing or unknown key, a
bad date, an inline URL, a lesson indexed with no file or on disk with no index line.

Notes never fail a gate. They are the honest gaps the kit wants counted rather than hidden:

| note | why it is not a failure |
|------|------------------------|
| blank `ref` | failing blanks buys fabricated refs, and a fabricated ref survives a sweep |
| blank `refute` | some claims genuinely rest on trust; the count is the point |
| blank `check` on an obligation | some waiting has no observable signal |
| blank `revoke` on a grant | the tier's own alarm, not a schema error |
| an expired obligation | the tier working: run the check, then re-state or resolve |
| `enforcement: recognition` | counted so a corpus that fires nothing is visible |

`run-fixtures.sh` is the conformance test -- see `fixtures/README.md`.
