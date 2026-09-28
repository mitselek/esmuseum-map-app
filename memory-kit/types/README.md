# types

The canon. Shape, constants and the rationale that goes with them.

Hand-written, and the only place a cap or a field may be changed. `caps.yaml` is generated
from `caps.ts`; regenerate with `tools/extract-caps.py`, which `--check` catches when stale.

Reading an interface needs no node -- only the extract does, and that is committed.

**Kept short on purpose.** These files are read every session, so their length is a tax every
context pays forever -- the same argument that caps the rules tier. An interface states the
shape and the one thing not obvious from it; the reasoning lives in `memory/lessons/`, which
is read at the moment of use. When a comment here grows past a few lines, it has become a
lesson.

The types state the convention, the fixtures are the contract.

| file | tier |
|------|------|
| `caps.ts` | every numeric cap, the ref grammar, the two-cap rationale |
| `memory-common.ts` | shapes shared by every tier: `IsoDate`, `Ref` |
| `memory-scratchpad.ts` | what to act on next; `current` + `staging` |
| `memory-facts.ts` | claims about the present, with a refutation address |
| `memory-dormant.ts` | facts parked, not deleted |
| `memory-obligations.ts` | what someone must do: actor, check, expiry |
| `memory-rules.ts` | standing norms, read on every spawn |
| `memory-lessons.ts` | situational knowledge, read at the moment of use |
| `memory-urls.ts` | one URL per file |
| `memory-secrets.ts` | encrypted values and the custody of the key |
| `memory-keys.ts` | access grants, and how each is revoked |
| `memory-shipped.ts` | what the kit carries in its own `memory/` and installs into homes |

The genus note -- which tier a claim belongs to, by how it rots -- lives at the foot of
`memory-facts.ts`, because that is where the question is usually asked.
