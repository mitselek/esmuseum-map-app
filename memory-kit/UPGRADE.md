# UPGRADE

**This file is a prompt.** An assistant reads it and executes it after pulling a new version of
the kit into an already-adopted home. Adoption happens once; this happens on every pull.

The contract: **a minor upgrade is a pull and nothing else.** If you find yourself about to
change the home's own data because a minor version arrived, stop -- either the kit broke its
own rule, or you are reading a major.

## Phase 0 -- know which two versions you are between

Read the pinned version in `memory-kit/VERSION` before the pull, and the new one after. Read
`CHANGELOG.md` for every entry between them.

If the major number changed, go to **Major** below. Otherwise continue.

## Minor or patch: pull, verify, report

1. Pull the subtree. Nothing in the home's own memory directory may change as a result; if
   the pull touched it, that is a kit bug -- stop and report it.
2. Run `lint/memory-lint.sh --report` over the home. Compare with the last run.
3. New findings are expected when a check was added. Handle them by the same rule adoption
   used: **gate what already passes, gauge the rest.** A check that a home fails today is
   debt, not a failure -- write it into the home's debt list with a line on what would fix it.
4. A tightened cap never rewrites existing rows. It applies to what the home writes next.
5. Write the new version into `memory-kit/VERSION`.
6. One commit: what moved, what the lint now says, what debt was added. State the way back
   (the previous pinned version).

> **GATE -- only if the upgrade wants something from the human.** A new tier the home must
> decide whether to use; a rule the kit now ships that would change how the assistant behaves;
> a deletion. Ask, with the CHANGELOG entry quoted. Never adopt a behaviour change silently
> because a version number moved.

## Major: a migration ran, so treat it like a small adoption

A major means data shape changed. The kit ships `migrations/<version>/` for exactly this.

1. Work on a branch. Keep the old tree until the end.
2. Read the migration's own notes first -- they say what changes and what cannot be automated.
3. Run the migration in dry-run. It must print: converted, needs-judgment, could-not. If the
   numbers do not add up, stop.
4. Work the needs-judgment list with the human, as in adoption Phase 3.
5. Gate what passes, gauge the rest.
6. Run a week of real use before deleting anything the migration replaced.
7. Report what the migration got wrong or could not do -- upstream, on the kit's tracker.

## Always

- The home's config for the kit lives outside the subtree; a pull must never clobber it.
- If an upgrade requires the assistant to re-read the home's whole memory to make sense of it,
  that is a finding worth reporting: the kit has leaked into the home's data.
