// Facts: memory/facts/<subject>.yaml. One file per subject; the filename names the subject,
// never the moment. `ls` is the index.

import type { IsoDate, Ref } from './memory-common';

export interface FactsFile {
  facts: Fact[];   // <= FACTS_PER_FILE; overflow mints a new subject, never blocks a write
}

export interface Fact {
  /** One present-tense sentence, <= FACT_WORD_CAP words. */
  fact: string;
  ref: Ref;
  /** Where to prove it WRONG: a command or a path. REFUTE_SAME_AS_REF when the origin is
   *  the test. Blank = no test known; counted. */
  refute: string;
  /** Last date it SURVIVED a refutation attempt. Not a birthday. */
  verified: IsoDate;
}

// Refuted facts are deleted; git is the archive. Age of `verified` is a queue for this tier.
// Which tier a claim belongs to, by how it rots: lessons/the-genus-of-a-claim.md
