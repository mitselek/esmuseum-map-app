// What the kit carries in its own memory/ and installs into an adopting home, so the home's
// assistant knows its convention, its origin, how to upgrade and how to report.

import type { Fact } from './memory-facts';
import type { Rule } from './memory-rules';

export interface ShippedRulesFile {
  rules: ShippedRule[];   // <= CORE_RULES_CAP
}

export interface ShippedRule extends Rule {
  /** mandatory = the kit's own operation, not opt-outable.
   *  optional = hygiene; a home may disable it with a recorded reason and the lint reports
   *  the divergence. */
  core: 'mandatory' | 'optional';
  /** The specific, repeated, recorded mistake a home makes without it. No incident, no ship. */
  incident: string;
}

export interface ShippedFactsFile {
  facts: Fact[];   // <= CORE_FACTS_CAP; about the kit itself only
}
