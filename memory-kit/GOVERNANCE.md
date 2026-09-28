# Governance

- **Proven first.** A change enters the kit only after it has run in at least one consumer.
  The consumer names itself in the CHANGELOG entry.
- **Semver.** Cap changes are minor. Field renames, tier additions or removals are major and
  ship with `migrations/<version>/`.
- **Consumers pin.** `memory-kit/VERSION` in a consumer is the version it runs. Upgrading is an
  explicit act by that consumer -- a convention change never silently fires in a home that
  did not pull it.
- **Change flow.** Proposal as an issue here; the PO rules; the proving consumer implements;
  the kit adopts on tag.
- **One principle for gates.** A gate must pass on the tree it is introduced to. New homes gate
  everything; existing homes gate what passes and gauge the rest until it does.
- **Refuted is deleted.** Dead facts, dead links, closed items: deleted, not annotated.
  Git is the archive.
