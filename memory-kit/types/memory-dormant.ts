// Dormant: memory/dormant/<subject>.yaml. A fact parked, not deleted; exempt from the sweep.
// Parking moves one fact, not a subject file.

import type { Fact, FactsFile } from './memory-facts';

export interface DormantFile extends FactsFile {
  facts: DormantFact[];   // <= DORMANT_PER_FILE
}

export interface DormantFact extends Fact {
  /** Why it is parked. */
  parked: string;
  /** How and when to check whether it should return. */
  reviewed: string;
}

// A fact something live still cites is not dormant. A dead one is deleted.
