# fixtures

**The contract.** A schema can be reinterpreted; a fixture cannot. An implementation in any
language is conformant when `lint/run-fixtures.sh` passes against it.

- `valid/` -- trees the gate must accept. Includes the legal blanks (blank `ref`, blank
  `refute`, blank `check`) and every form of the ref grammar.
- `invalid/` -- trees the gate must reject, **one violation each**, named for that violation.
  A fixture that fails for the wrong reason is a test passing by accident; the names are
  checked against the messages, not only the exit codes.

Prefix a fixture `shipped-` when it needs the shipped-rules checks (`core`, `incident`).

Adding a check means adding a fixture for it in the same commit. A check with no fixture is
a claim about behaviour with no way to hold it.
