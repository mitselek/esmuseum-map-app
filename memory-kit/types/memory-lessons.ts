// Lessons: memory/lessons/<slug>.md, indexed by memory/lessons/index.yaml.
// Read at the moment of use, not on spawn -- which is why bodies are free and rules are not.

import type { IsoDate, Ref } from './memory-common';

export interface LessonIndexFile {
  /** GENERATED from the lesson files, never hand-carried. */
  lessons: LessonIndexLine[];
}

export interface LessonIndexLine {
  slug: string;
  /** <= LESSON_INDEX_LINE_CAP. What it is for, not what it says. */
  summary: string;
  learned: IsoDate;
  ref: Ref;
  /** Stated, never assumed. 'recognition' = nothing fires it; the reader must remember. */
  enforcement: 'hooked' | 'linted' | 'recognition';
  /** Present when 'hooked': what an adapter matches on. Tool-shaped only. */
  trigger?: string;
}

// Body: When -- Why -- What to do -- What not to do.
