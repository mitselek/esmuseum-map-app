# Changelog

## Unreleased

- Ruling 2026-09-23: **long-term knowledge is a deliberate gap the consumer fills.** The kit
  covers operational memory -- what is acted on this session. Articles, research and reference
  material stay outside, because their shape encodes a theory of knowledge management (wiki,
  Obsidian, Zettelkasten, unnamed folder) and the kit does not dictate one. Same treatment as
  harness auto-memory: the consumer names the boundary as a fact rather than leaving it to be
  inferred. Working line: *if it rots it is a fact; if it accumulates it is knowledge.* Parked,
  not refused -- D6 revisits at v0.3 with a `profile:` section if a second consumer wants the
  same shape. README section added; pilot question 6 added to the alpha notes.

## v0.1.0-alpha.1 -- 2026-09-23 -- pilot preview

Feature-incomplete by design. An input channel, not a blessing: proven-first (D5) stands, and
nothing reported against this tag enters the kit without passing through the household first.
Release notes: `RELEASE-0.1.0-alpha.1.md`.

**In:** twelve tier interfaces (`types/`, TypeScript as canon); `caps.yaml` generated from
`types/caps.ts`; the lint in both `memory-lint.sh` and `memory_lint.py` with `--gate` and
`--report`; 3 valid + 19 invalid fixtures and the conformance runner (D2 -- the fixtures are
the contract); the obligations tier; `ADOPTION.md` and `UPGRADE.md` as executable prompts;
`skeleton/`; `tools/weigh.py`.

**Out, and not pending:** `core/`; the shipped `lessons/` content; any migration off a
consumer's own legacy format. Kit migrations are for kit-version upgrades only -- converting a
home's bespoke shape is that home's work, and what generalises is the dry-run discipline in
`UPGRADE.md`.

**Superseded from the charter plan:** no `SPEC.md` and no `schemas/` -- the TypeScript
interfaces became the canon and the rationale moved into lessons, per the 21.09 ruling. D2's
wording still names both; it is stale and will be corrected before 0.1.0.

**Least settled, where pilot feedback is worth most:** the obligations tier; the caps; the
auto-memory boundary; refute-by-genus guidance.

**Finding carried in:** the incident field is 55% of per-session memory cost (`tools/weigh.py`).

**Fixed while cutting this tag:** the kit carried its own version in two places -- the root
`VERSION` file and `KIT_VERSION` in `types/caps.ts` -- which is the hand-carried number the kit
has a lesson against. Found in the kit's own lint banner. `VERSION` is now the single source
(D3 makes it the contract a consumer reads); `tools/extract-caps.py` reads it; `KIT_VERSION` is
deleted. Regeneration verified idempotent.

- Charter (Phase 0), 2026-09-21: rulings recorded, layout targeted, nothing implemented.
- ADOPTION.md and UPGRADE.md added 2026-09-21 as executable prompts. Minor upgrades are pull-only by contract.
- Ruling 2026-09-21: TypeScript interfaces are the canon (the notation FR and ai-locum already use); caps.yaml is generated from types/caps.ts; no JSON Schema in the repo.
- Ruling 2026-09-21: core/ ships universal rules + lessons; capped at 8 rules, each citing its incident, opt-out recorded. Types are generated from the schema, never hand-written.
- Ruling 2026-09-21: the household (Passepartout) drives the kit -- synthesizer and first adopter; FR contributes and reviews.
- Ruling 2026-09-21: tooling is python3 + PyYAML (parsing, schema generation) and awk (caps). No yq, no node.
- Ruling 2026-09-21: the kit is model- and harness-agnostic. Harness mechanisms live in adapters, never in the core.
