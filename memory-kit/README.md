# memory-kit

One memory convention for AI agents that live somewhere -- a household, a team, a seed
that others clone. One repo; consumers pin a version and upgrade deliberately.

Consumers at charter (2026-09-21):

- **ai-locum** -- the seed a human clones to grow a household assistant (Codeberg, beside this repo)
- **framework-research** -- a ten-seat research team (github.com/mitselek/ai-teams)
- **Passepartout** -- the household reference implementation the seed was cut from

Why: the convention lived as code in two places and diverged in four of seven tiers within
five sessions. Three implementations of one idea is the failure mode this repo removes.

## Rulings (PO, 2026-09-21)

| # | Ruling |
|---|--------|
| D1 | Strict YAML for every structured tier (scratchpad, facts, dormant, rules, lessons index, keys). Markdown only for prose bodies. `urls/` stay one-line files; secrets stay `.age`. |
| D2 | **Fixtures are the contract.** Every implementation passes the same `fixtures/{valid,invalid}/`. JSON Schema is the machine-readable statement; `SPEC.md` the readable one. A schema can be reinterpreted; a fixture cannot. |
| D3 | Distributed by `git subtree` into `memory-kit/` in each consumer, with `VERSION` and `sync.sh`. Never a submodule. |
| D4 | Codeberg is primary; GitHub carries a mirror. |
| D5 | Proven-first: nothing enters the kit unproven in at least one consumer. Semver; a migration script per major. See `GOVERNANCE.md`. |
| D6 | Core tiers only in v0.x: scratchpad, facts, dormant, rules, lessons, urls, secrets, keys. Refute-by-genus ships as guidance. Team-only artefacts stay with their team until a second consumer wants them. |
| D7 | One lint, two modes: `--gate` (fail-closed) and `--report` (exit 0). One principle: **a gate must pass on the tree it is introduced to.** A fresh home gates everything from day one; an existing home gates what already passes and gauges the rest. |

Resolved questions:

- No date field on records. A date is provenance and lives in `ref`: `<person>:<date>`, or a bare
  `<date>` for "noted, no source". **Provisional** -- judged on the household migration in practice.
- Session transcripts are dropped on conversion; rows convert into a tier or die. **Provisional**, same test.
- Harness-managed auto-memory stays outside the kit; each consumer states that boundary as a fact.
- **The household drives the kit** (PO ruling, 21.09 -- supersedes the earlier Q6): Passepartout
  synthesizes and authors; framework-research (Aen) contributes the shapes it has run and reviews;
  every convention is adopted by the household FIRST, then the seed, then the team. Proven-first
  starts at home.

## Model- and harness-agnostic (ruled 2026-09-21)

The kit is memory conventions, not an agent framework. It must hold for any model on any
harness: plain files, plain formats, no vendor mechanism anywhere in the core.

Binding consequences:

- **No harness mechanism in the kit.** Tool-call hooks, skill manifests, agent-spawn shapes and
  session lifecycles belong to a harness, not here. A lesson may *declare* a trigger; firing it
  is an adapter's job, supplied by the consumer.
- **No vendor paths in normative text.** "The harness's own memory directory", never a literal
  `~/.<vendor>/...`. Examples are marked as examples.
- **Adapters, where a harness must be named.** One file per harness, outside the core
  (`adapters/<harness>.md`), carrying that harness's hard facts. Pattern proven in ai-locum.
- **Tooling stays language-level**, not model-level: python3 + PyYAML, awk, git. Nothing that
  assumes a particular assistant is reading.

Test for anything proposed: *would this still make sense for a different model, on a different
harness, in a different language?* If not, it is an adapter or a consumer's business.

**Worked example -- playbooks vs skills.** A home's domain procedures (how to triage mail, how
to tend the box) are plain markdown files, read when a procedure calls for them. Some harnesses
offer a native "skill" mechanism that would surface the same files automatically by description.
The kit does not adopt it: a skill manifest is a harness feature, and a home whose competence
is expressed as skills cannot be read by a harness that has none. Procedures stay plain files.
A harness with skills may wrap them in its adapter -- the file remains the source.

## What the kit does NOT cover -- and why that is deliberate (ruled 2026-09-23)

The kit is **operational memory**: what an assistant must hold to act correctly in the session
it is in. Facts it checks, rules it obeys, obligations it is waiting on, the scratchpad it
rewrites. All of it is short, capped, and lives to be *acted on*.

**Long-term knowledge is a deliberate gap. You fill it.**

Articles, research, meeting notes, reference material, the accumulated reading of a household
or a team -- the things you write to be *read later* rather than acted on now -- are outside
this kit by design, and that is not an omission waiting to be fixed.

The reason is that its shape is genuinely yours. A wiki of cards. An Obsidian vault. A
Zettelkasten. A docs site. A folder of Markdown nobody has named. Each of those encodes a
different theory of how knowledge should be found again, and standardising one would put the
kit in the business of dictating a knowledge-management philosophy. That is not memory
conventions, which is the only thing this repo claims to be.

So the kit takes the same position it takes on harness-managed auto-memory:

> **Name your boundary, do not guess at it.** Record where your long-term knowledge lives, and
> what belongs there rather than in `facts/`, as a fact in your own tree. An assistant that
> knows the boundary can respect it. One that has to infer it will put a research note in
> `facts/` and blow the cap, or lose a fact in an article nothing ever re-reads.

The line worth holding: **if it rots, it is a fact; if it accumulates, it is knowledge.** A
fact has a refutation address and a date it last survived one. An article does not -- it is
read, cited, superseded, and that is a different life cycle with different tooling.

**This is parked, not refused.** D6 keeps team-only artefacts (FR's wiki cards, `wikiq`,
spawn manifest, sole-writer protocol) with their team, revisited at v0.3. What the kit
standardises, and when, is the PO's call on the evidence -- not a threshold a consumer can
aim at.

If you run something long-form, we want to hear what it is and where the line falls for you.
Run it however suits you; we would rather see what you actually do than what you think we
are looking for.

## Tooling (ruled 2026-09-21)

Parsing and schema generation: **python3 + PyYAML**. Line-shaped checks (row and char caps):
**awk**. Nothing else -- no `yq` (not present by default, and two different programs share the
name), no node (nvm installs sit outside the systemd/cron PATH, and the lint must run from cron).

The lint fails closed with a one-line install hint when PyYAML is missing; it never silently
skips a check.

## One canon: the types

`types/*.ts` are the source of truth -- hand-written, carrying shape, constants and the
rationale in their comments. That is the notation framework-research and ai-locum already use;
the kit does not invent a second one. Reading an interface needs no node.

`caps.yaml` is **generated** from `types/caps.ts` and committed, so the lint can read the
numbers with python3 alone -- no node, no TypeScript toolchain, in any home.
`tools/extract-caps.py --check` exits non-zero when it is stale, and that check belongs in the
commit gate.

There is no JSON Schema in this repo. It would be a third expression of one truth, and drift
between expressions is precisely what the kit exists to prevent. The **fixtures are the
contract**; the types state it; `caps.yaml` is the machine-readable extract.

## Ref grammar

`sha | path | #NN | urls/<name> | po:SNN | <person>:<date> | <date> | blank`

Blank is counted, never failed -- failing it buys fabricated refs. `refute: "=ref"` means the
origin doubles as the test.

## What the kit costs a home, in context

Memory conventions are paid for in context, every session, forever. The kit measures its own
weight rather than assuming it is small. Figures are characters from this repo at the current
commit, tokens approximated at 4 chars each -- regenerate with `tools/weigh.py`.

| read | what | ~tokens |
|------|------|--------|
| **every session** | shipped rules (8 rows) | **680** |
| when the subject comes up | shipped facts about the kit (7) | 450 |
| when a ref points there | url files (5) | 100 |
| when a shape is in question | types, the canon (12 files) | 2 370 |
| at the moment of use | lesson index + bodies (4) | 1 520 |
| once, at adoption | ADOPTION, UPGRADE, README, GOVERNANCE | 4 930 |

**The per-session figure is the only one paid unconditionally.** Everything else is read when
a question actually arises, which is the entire reason the tiers are split by read-time rather
than by importance.

### Is 680 tokens a lot?

No. On a 1M-token context that is 0.07%, and it is paid once per session rather than
accumulating. The figure is published because a convention that cannot state its own cost is
asking for trust it has not earned -- not because the cost is alarming.

It would start to matter in two cases, and the kit watches for both: a home on a small context
window, and a `core` that has grown by a rule per release. The second is why shipped rules are
capped at 8 and additions are subtractive by default.

## How a home uses this

- **Adopting**: clone or subtree the kit, then have the assistant execute `ADOPTION.md`. It is a
  prompt, not a guide -- the assistant does the work and stops at three gates that are the
  human's to rule: the tier mapping, the rules cut list, and any deletion. Adoption runs once.
- **Upgrading**: pull, then have the assistant execute `UPGRADE.md`. **A minor upgrade is a pull
  and nothing else** -- no minor may change the shape of data already on disk. Anything that
  would is a major, and ships `migrations/<version>/`.
- **Boundary**: the kit owns `memory-kit/`; the home owns its memory directory. They never
  interleave, and the home's config for the kit lives outside the subtree, where a pull cannot
  clobber it. If an upgrade needs to reach into the home's data, the kit has leaked.

## `memory/` -- the kit's own memory tree, shipped to every home

The kit keeps its own memory in exactly the tiers it defines, at `memory-kit/memory/`. The
lint runs over it unmodified, so the kit is a conforming home by construction rather than by
discipline -- and an adopting home merges like into like.

The content is installed into every adopting home, so that the home's own
assistant knows what its memory convention is, where it came from, how to upgrade it and how to
talk back -- without needing anything external.

Two kinds, marked per row:

- **mandatory** -- the kit's self-description and operating rules: the repo address, the pinned
  version, how to upgrade, how to report, never edit inside the subtree, never write a
  credential in the clear. A home cannot opt out of knowing where its own kit comes from.
- **optional** -- memory-hygiene universals. A home may disable one by naming it with a reason
  in its config; the lint reports the divergence, never forbids it.

Facts about a home are never universal -- a fact is a claim about a particular present -- so
`memory/facts/` holds facts about the kit itself and nothing else.

Core content costs a home its spawn budget forever, so it is capped harder than the home's own:

| | cap | why |
|---|---|---|
| `memory/rules.yaml` | 8 rows | every row is read on every spawn in every home that adopts it |
| `memory/lessons/` | uncapped | read at the moment of use, not on spawn |
| `memory/facts/` | 10 | facts about the kit itself only: repo, version, upgrade, feedback, lint |

**Admission test for a core rule:** would a home that lacks it make a specific, repeated,
recorded mistake? Each core rule cites the incident that created it. No incident, no core --
it is a lesson. Additions are subtractive by default: a proposal must argue why it is not a
lesson, and what it displaces if core is full.

**Opt-out is legitimate.** A home may disable a core rule by naming it with a reason in its
own config; the lint reports the divergence, never forbids it. The kit does not legislate
homes it has not seen.

## Layout (target for v0.1)

```
ADOPTION.md        prompt: bring an existing home onto the kit, once
UPGRADE.md         prompt: after every pull
SPEC.md            the convention, readable
types/             TypeScript interfaces -- the canon: shape, constants and rationale
caps.yaml          GENERATED from types/caps.ts; the flat extract the lint reads
tools/             extract-caps.py (--check fails when caps.yaml is stale)
core/              content that ships WITH the kit: kit facts, 8 rules, lessons, urls
schemas/           one JSON Schema per tier
caps.yaml          every numeric cap, in one place
fixtures/          valid/ and invalid/ samples per tier -- the contract
lint/              reference lint: POSIX sh + awk + yq, --gate | --report
migrations/        one directory per breaking version
skeleton/          the empty home a fresh consumer starts from
lessons/           convention-level lessons that travel with the kit
templates/         secrets README, keys file
VERSION            pinned by consumers
CHANGELOG.md
```

## Status

Phase 0 -- charter. Nothing but this README, `GOVERNANCE.md`, `VERSION`, `CHANGELOG.md`.
First adopter and synthesizer: Passepartout (the household). Phase 1 begins with its own migration.
Plan of record: `ai-teams/designs/new/memory-kit/plan.md`. Discussion: ai-teams #122.
