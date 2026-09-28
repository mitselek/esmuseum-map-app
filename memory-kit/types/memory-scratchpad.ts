// Scratchpad: memory/<name>.yaml. Every key on every record; blanks left blank.

import type { Ref } from './memory-common';

export interface Scratchpad {
  /** Act on these next session. <= CURRENT_CAP. Regenerated at close, never appended. */
  current: ScratchpadRecord[];
  /** Do not re-derive. Waiting for promotion into a durable tier, not an archive. */
  staging: ScratchpadRecord[];
}

/** One idea. Does not fit? It is two records. */
export interface ScratchpadRecord {
  label: Label;
  /** <= RECORD_CHAR_CAP. No URLs -- cite urls/<name>. */
  record: string;
  ref: Ref;
}

export type Label =
  | 'DECISION' | 'LEARNED' | 'WARNING'
  | 'WIP' | 'DEFERRED'
  | 'PATTERN' | 'GOTCHA';

// No date field: a date is provenance and lives in `ref`.
// No session transcript. Two caps, not one: lessons/two-caps.md
