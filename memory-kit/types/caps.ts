// Every numeric cap in the kit. This file is the SOURCE (the VERSION file carries the version); caps.yaml is generated from it
// by tools/extract-caps.py so the lint has something to read without node.
//
// Two caps per tier (rows AND chars) is deliberate: a row cap alone displaces growth into
// longer rows. Measured 10 of 10 scratchpads in framework-research Phase 0; observed as
// page-spanning rows in the Passepartout household, 2026-09-06.


// -- scratchpad
export const CURRENT_CAP = 15;        // acted on next session; regenerated, never appended
export const TOTAL_CAP = 100;         // current + staging
export const RECORD_CHAR_CAP = 100;   // the record field only

// -- facts and dormant
export const FACTS_PER_FILE = 30;     // overflow mints a new subject, never blocks a write
export const FACT_WORD_CAP = 42;      // norm is 30
export const DORMANT_PER_FILE = 30;

// -- rules
export const RULES_CAP = 20;          // a home's own; read on every spawn
export const RULE_CHAR_CAP = 100;

// -- core (ships with the kit, costs every adopting home a spawn row)
export const CORE_RULES_CAP = 8;
export const CORE_FACTS_CAP = 10;

// -- obligations
export const OBLIGATION_CHAR_CAP = 120;   // the obligation field; longer means it is a project

// -- lessons
export const LESSON_INDEX_LINE_CAP = 120;   // the index is GENERATED, never hand-carried

// Ref grammar, shared by every tier:
//   sha | repo path | #NN | urls/<name> | po:SNN | <person>:<date> | <date> | blank
// Blank is COUNTED, never failed: failing blanks buys fabricated refs.
// '=ref' in a refute field means the origin doubles as the test.
export const REF_PATTERN =
  '^$|^[0-9a-f]{7,40}$|^[A-Za-z0-9._\\/-]+$|^#[0-9]+$|^urls\\/[a-z0-9-]+$|^po:S[0-9]+$|^[a-z][a-z0-9_-]*:[0-9]{4}-[0-9]{2}-[0-9]{2}$|^[0-9]{4}-[0-9]{2}-[0-9]{2}$';
export const REFUTE_SAME_AS_REF = '=ref';
