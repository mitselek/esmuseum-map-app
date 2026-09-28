# ADOPTION

**This file is a prompt.** An assistant reads it and executes it, once, to bring an existing
home onto memory-kit. It is not a guide for the human to carry out.

You are the assistant of a home that already has memory habits -- files, notes, a scratchpad,
whatever shape they took. Your job is to map those habits onto the kit's tiers without losing
anything and without deciding, on your own, anything that is the human's to decide.

Read the whole file before acting. Then work the phases in order.

## Rules that bind you for the whole adoption

1. **Never delete before the human rules it.** Not a file, not a row, not a claim.
2. **Never silently drop.** Every item ends in a tier, in a named holding file, or on a list
   you show the human. A count that does not add up is a failure, not a rounding.
3. **Stop at every GATE.** A gate is a question only the human can answer. Ask it, wait, and
   record the answer with its date before continuing.
4. **The old tooling stays until the new one has proven itself** on this home's own tree.
5. **What does not fit is a finding**, not an error. Collect it; Phase 6 sends it upstream.
6. **Work on a branch.** One cutover commit at the end, with a stated way back.

## Phase 0 -- gauge. Change nothing.

Run `lint/memory-lint.sh --report` over the home's existing memory directory.

Write `adoption/00-gauge.md`: what exists (files, claims, rows), how many claims carry a
source, how many would fail the kit's checks and why. Do not fix anything yet.

Tell the human, in one screen, what the picture shows -- including whether the kit looks like
a fit at all. A home with thirty claims and no lint may not need this yet; say so if true.

## Phase 1 -- map, do not convert.

For each existing file, name which tier its content is already doing. Expect one file to be
doing several jobs at once; that is the normal finding.

Tiers: `facts` (claims about the present with an address that could prove them wrong),
`scratchpad` (what to act on next), `rules` (standing norms, read every session),
`lessons` (situational knowledge with a why), `dormant` (parked facts), `urls`, `secrets`,
`keys`.

Write `adoption/01-map.md`: a table of source file -> tier(s) -> count, plus a list of
anything that fits no tier, quoted, with your best guess at what it is.

> **GATE 1 -- the mapping.** Show the human the table and the does-not-fit list. They rule the
> mapping. Record the ruling with its date. Do not convert anything before this.

## Phase 2 -- convert what is mechanical.

Convert only what the mapping settled and a script can do without judgment: field renames,
format changes, moving a claim into its tier's file.

Everything ambiguous goes to `adoption/02-needs-judgment.md`, quoted whole, with the question
that would settle it.

Verify the arithmetic: items in == items converted + items needing judgment + items the human
already ruled out. Print the three numbers. If they do not add up, stop and say so.

## Phase 3 -- tier by hand what needs judgment.

Work `02-needs-judgment.md` with the human, item by item. This is the expensive phase and it
does not compress: an item's tier is a judgment about what kind of claim it is.

Useful genus test, when a claim resists placement:
- rots by a clock, and a source could contradict it -> **fact** (give it a refutation address)
- goes inapplicable rather than false -> **lesson**
- rots only when re-decided -> a **ruling**; keep it, and when it is reversed keep one dated
  line naming what replaced it
- names someone you are waiting on -> not a fact. It needs an owner and an expiry; put it in
  the scratchpad with a command that re-checks it

Items the human rules dead go to `adoption/03-ruled-dead.md` -- still not deleted.

## Phase 4 -- the standing rules.

The home's standing norms are usually prose scattered through a main instruction file. Extract
candidates into a proposed `memory/rules.yaml`, one imperative per row, within the cap.

Over the cap is the normal case. Propose, for each row that does not make the cut, whether it
is a lesson, a fact, or derivable from somewhere the assistant already reads.

> **GATE 2 -- the rules cut list.** Show the proposed rules, the demotions, and what would be
> deleted from the instruction file. The human rules. Never apply this silently: it changes
> what the assistant is, every session.

## Phase 5 -- gate what already passes.

Run the lint over the converted tree. Whatever passes, gate (fail-closed). Whatever does not,
gauge in `--report` for now and write the remainder into `adoption/05-debt.md` with a line
each for what would have to change.

A gate must pass on the tree it is introduced to. A lint that fails on day one teaches the
home to bypass it, and the kit is finished there.

Keep the home's old tooling running in parallel for at least a week of real use. Only then:

> **GATE 3 -- deletions.** Old lints and scripts the kit replaces; the files in
> `03-ruled-dead.md`; the converted originals. Show the list. The human rules.
> After this the branch may be merged, and `03-ruled-dead.md` deleted with it -- git is the
> archive from that point on.

## Phase 6 -- report back.

Write `adoption/06-report.md` and file it as an experience report in the kit's issue tracker:
- what the gauge found, and what the mapping found
- everything that fit no tier, quoted -- **this is the part the kit needs most**
- where the conversion needed judgment, and how much of it did
- what the proving week broke or revealed
- which of the kit's caps were wrong for this home, and by how much

A home that adopts and reports nothing has taken from the kit without paying it.

## After adoption

Write the pinned version into `memory-kit/VERSION` (the subtree carries it) and note in the
home's own memory that the kit is pinned, at which version, and where its config lives.

From here on, an upgrade is `UPGRADE.md`, not this file. Adoption happens once.
