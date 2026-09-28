# memory-kit's own memory

The kit keeps its memory in exactly the tiers it defines, so the lint runs over it unmodified
and the kit is a conforming home by construction rather than by discipline.

Two jobs at once, and they are worth separating when reading:

- **Shipped into adopting homes:** `facts/memory-kit.yaml`, `rules.yaml`, `lessons/`, `urls/`.
  This is what a home installs so its assistant knows what its own convention is, where it
  came from, how to upgrade it and how to talk back.
- **The kit's own working state:** `scratchpad.yaml`, `obligations.yaml`, `keys.yaml`. Not shipped -- these are
  about building the kit, not about using it.

`dormant/` and `secrets/` are empty by design; see their READMEs.
