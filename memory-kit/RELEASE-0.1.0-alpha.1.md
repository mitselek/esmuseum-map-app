# memory-kit v0.1.0-alpha.1 -- pilot preview

An alpha: feature-incomplete, small known audience, and the shape may still change under
you. Not a beta (that would mean feature-complete), not a release candidate (that would mean
we would ship it unless something blocked). `0.x` already means unstable by semver; the
`-alpha.1` says the 0.1 shape itself is not settled yet.

## What this release is for

**It is an input channel, not a blessing.** The kit's own D5 says proven-first, and the
21.09 ruling says conventions are adopted by the household first, then the seed, then the
team. The household has not adopted yet. So nothing here is settled by virtue of carrying a
tag, and **nothing you report enters the kit without going through the household first.**

That is not a formality we are inventing for you. The EVR desk filed an experience report
before we had adopted a line of it, and it changed the plan -- the reversal-line rule, the
generated lessons index, and the `--report`-as-gauge decision all came from outside. You are
that, at larger scale.

## What is in it

- **Twelve tier interfaces** in `types/`, TypeScript as the canon notation.
- **`caps.yaml`**, generated from `types/caps.ts` -- never hand-written. Four expressions of
  one truth is the drift this repo exists to remove.
- **The lint**, two modes: `--gate` fails closed, `--report` exits 0 and tells you what it
  found. One principle: *a gate must pass on the tree it is introduced to.* A fresh home
  gates everything; an existing home gates what already passes and gauges the rest.
- **Fixtures**: 3 valid, 19 invalid, with a conformance runner. **The fixtures are the
  contract** (D2) -- a schema can be reinterpreted, a fixture cannot. If you build your own
  implementation, this is what it must pass.
- **`ADOPTION.md` and `UPGRADE.md`** as executable prompts: hand them to your assistant
  rather than reading them yourself.
- **`skeleton/`** -- a memory tree to start a new home from.
- **`tools/weigh.py`** -- measures what your memory costs per session.

## What is deliberately absent

Do not wait for these; they are after the proving week.

- `core/` -- the universal rules and lessons set.
- The shipped `lessons/` content.
- Any migration off *your* legacy format. Kit migrations exist for kit-version upgrades
  (`migrations/<version>/`), not for converting a home's own bespoke shape. That conversion
  is yours to write; what generalises is the discipline in `UPGRADE.md` -- dry run first,
  print converted / needs-judgment / could-not, and **if the numbers do not add up, stop.**

## Where to push -- the parts we are least sure of

Feedback on these is worth more to us than feedback on the settled parts:

1. **The obligations tier.** Newest and least lived-in. Is `who / since / check / expires`
   the right shape, or is an obligation just a scratchpad row with a mandatory `check:`
   command? We could not decide it on paper. Two weeks of running one shape is the evidence.
2. **The caps.** Cap changes are minor by our own governance, so they are the cheapest thing
   to get wrong and the cheapest to fix. Tell us which cap you hit first and what it
   displaced -- a row cap alone pushes growth into longer rows, which is why there are two.
3. **The auto-memory boundary.** Harness-managed memory stays outside the kit and each
   consumer states that boundary as a fact. Does that hold on your harness, or does it leak?
4. **Refute-by-genus.** Ships as guidance, not enforcement. A fact rots by the clock; a
   pattern goes inapplicable; a decision rots only when re-decided. Does that three-way split
   survive contact with your material?
5. **Anything that made you re-read your whole memory to make sense of an upgrade.** That is
   a reportable defect: it means the kit has leaked into your data.
6. **Your long-term knowledge, wherever it lives.** The kit covers operational memory only --
   what gets acted on this session. Articles, research and reference material are a deliberate
   gap you fill yourself: a wiki, an Obsidian vault, a Zettelkasten, a folder nobody named.
   We want to know **what you run and where you draw the line** between it and `facts/`. Our
   working line is: *if it rots, it is a fact; if it accumulates, it is knowledge.* Tell us
   where that fails you.

## Steadier, but not frozen

Tier names, field names, and the two-mode lint. If one of these is wrong we would rather know
now than after 0.1.0, but we are not expecting it.

## How to pin

Subtree it at this tag into `memory-kit/` in your repo (never a submodule -- D3). `VERSION`
in your tree is the version you run; upgrading is an explicit act by you. A convention change
never silently fires in a home that did not pull it.

## How to report

Issues on the Codeberg repo. Name what you ran it against and for how long -- "six weeks on a
one-agent desk" is worth more than an opinion, and that is exactly the form the last useful
report took.
