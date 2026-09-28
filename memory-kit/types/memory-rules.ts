// Rules: memory/rules.yaml. Read on every spawn, so few and short.

import type { Ref } from './memory-common';

export interface RulesFile {
  rules: Rule[];   // <= RULES_CAP
}

export interface Rule {
  /** Imperative, <= RULE_CHAR_CAP. */
  rule: string;
  ref: Ref;
}

// Needs a why, or fires on a situation? It is a lesson. Split by WHEN IT IS READ.
