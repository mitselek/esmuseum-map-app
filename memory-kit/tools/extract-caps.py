#!/usr/bin/env python3
"""Extract types/caps.ts into caps.yaml.

The TypeScript interfaces are the canon: hand-written, comment-rich, shape and constants
together. This script produces the flat extract the lint reads, so linting needs python3
and nothing else -- no node, no TypeScript toolchain, in any home.

caps.yaml is generated and committed. Never hand-edit it.

Usage:  python3 tools/extract-caps.py           write caps.yaml
        python3 tools/extract-caps.py --check   exit 1 if caps.yaml is stale
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "types" / "caps.ts"
OUT = ROOT / "caps.yaml"

NUM = re.compile(r"^export const ([A-Z][A-Z0-9_]*) = (\d+);", re.M)
STR = re.compile(r"^export const ([A-Z][A-Z0-9_]*) =\s*'((?:[^'\\]|\\.)*)';", re.M | re.S)


def _read_version():
    """The root VERSION file is the ONE place the kit's version lives.

    It was in two places until 2026-09-23 -- here and KIT_VERSION in types/caps.ts --
    which is the hand-carried number the kit has a lesson against, found in the kit's
    own output while preparing the first tag. VERSION wins because D3 makes it the
    contract: a consumer reads VERSION to know what it runs.
    """
    v = (pathlib.Path(__file__).resolve().parent.parent / "VERSION").read_text().strip()
    if not v:
        sys.exit("memory-kit: VERSION is empty")
    return v


def extract():
    text = SRC.read_text()
    nums = {m.group(1): int(m.group(2)) for m in NUM.finditer(text)}
    strs = {m.group(1): m.group(2) for m in STR.finditer(text)}
    missing = [k for k in (
        "CURRENT_CAP", "TOTAL_CAP", "RECORD_CHAR_CAP", "FACTS_PER_FILE", "FACT_WORD_CAP",
        "DORMANT_PER_FILE", "RULES_CAP", "RULE_CHAR_CAP", "CORE_RULES_CAP", "CORE_FACTS_CAP",
        "OBLIGATION_CHAR_CAP", "LESSON_INDEX_LINE_CAP") if k not in nums]
    if missing:
        sys.exit(f"memory-kit: types/caps.ts is missing {', '.join(missing)}")
    if "REF_PATTERN" not in strs:
        sys.exit("memory-kit: types/caps.ts is missing REF_PATTERN")

    # TS string escapes -> plain regex source
    pattern = strs["REF_PATTERN"].replace("\\\\", "\\")

    lines = [
        "# GENERATED from types/caps.ts by tools/extract-caps.py. Do not hand-edit.",
        "# The TypeScript interfaces are the canon; this is the flat extract the lint reads,",
        "# so a home needs python3 and nothing else to lint its memory.",
        "",
        f"version: {_read_version()}",
        "",
        "scratchpad:",
        f"  current_rows: {nums['CURRENT_CAP']}",
        f"  total_rows: {nums['TOTAL_CAP']}",
        f"  record_chars: {nums['RECORD_CHAR_CAP']}",
        "",
        "facts:",
        f"  per_file: {nums['FACTS_PER_FILE']}",
        f"  fact_words: {nums['FACT_WORD_CAP']}",
        "",
        "dormant:",
        f"  per_file: {nums['DORMANT_PER_FILE']}",
        "",
        "rules:",
        f"  rows: {nums['RULES_CAP']}",
        f"  rule_chars: {nums['RULE_CHAR_CAP']}",
        "",
        "core:",
        f"  rules: {nums['CORE_RULES_CAP']}",
        f"  facts: {nums['CORE_FACTS_CAP']}",
        "",
        "obligations:",
        f"  obligation_chars: {nums['OBLIGATION_CHAR_CAP']}",
        "",
        "lessons:",
        f"  index_line_chars: {nums['LESSON_INDEX_LINE_CAP']}",
        "",
        "ref_grammar:",
        f"  pattern: '{pattern}'",
        f"  refute_same_as_ref: '{strs.get('REFUTE_SAME_AS_REF', '=ref')}'",
        "",
    ]
    return "\n".join(lines)


def main():
    text = extract()
    if "--check" in sys.argv:
        if not OUT.exists() or OUT.read_text() != text:
            print("caps.yaml is stale -- run tools/extract-caps.py")
            return 1
        print("caps.yaml current")
        return 0
    OUT.write_text(text)
    print(f"wrote {OUT.name} from {SRC.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
