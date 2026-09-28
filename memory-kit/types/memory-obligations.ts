// Obligations: memory/obligations.yaml.
// What someone must do. A fact rots when the world changes; an obligation rots when the
// counterparty acts. So it carries a resolution check, not a refutation address.

import type { IsoDate, Ref } from './memory-common';

export interface ObligationsFile {
  obligations: Obligation[];
}

export interface Obligation {
  /** What is owed. <= OBLIGATION_CHAR_CAP. */
  obligation: string;
  /** Who must act. Never "us" without a name. */
  actor: string;
  /** When the waiting began, not when it was written down. */
  since: IsoDate;
  /** How to find out it is already done: a command, a page, a person. Blank is counted. */
  check: string;
  /** When it stops being believable regardless. On expiry: check, then re-state, resolve,
   *  or hand to a human. Never renew silently. */
  expires: IsoDate;
  ref: Ref;
}

// Resolved obligations are deleted. Never a copy of a real ledger -- hold the pointer.
// Why this is not a scratchpad row: lessons/obligations-are-not-facts.md
