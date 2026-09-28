# Obligations are not facts

**When:** writing down "waiting on X", "ball with Y", "owed to Z".

## Why

A fact rots when the world changes and nobody looked. An obligation rots when the
**counterparty acts** and nobody looked. The two failure modes need different instruments:
a fact wants an address that could prove it wrong; an obligation wants to know whether it is
already done.

Evidence, from two homes in the same month:

- A desk's index produced three wrong claims inside one hour: two ledger issues reported open
  after the human had closed them, one pull request "ball with X" five days after it merged.
- A household reported a draft as waiting hours after it had been sent, and a mail as sent
  when it had bounced.

Every one of those was **true when written**. None was a fact.

## What to do

Put it in `obligations.yaml` with an `actor`, a `check` and an `expires`. The `check` is the
field that earns the tier: a command, a page or a person that answers "has this been done?"

On expiry: run the check, then re-state, resolve, or hand it to a human.

## What not to do

- Do not make it a scratchpad row. `current` is regenerated every session and capped; an
  obligation waiting three weeks either vanishes at a regeneration or squats a row that
  judgment needed.
- Do not renew silently. Silent renewal is how a three-day wait becomes a quarter.
- Do not copy a real ledger into this tier. Hold the pointer and the check. A copy is a second
  source of truth that the people who own the first cannot correct.
