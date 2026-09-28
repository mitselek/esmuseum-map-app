#!/usr/bin/env python3
"""Weigh the kit's context cost, by when a home actually reads each part.

Tokens are approximated at 4 characters. The point is the SHAPE of the cost -- what is paid
every session versus what is paid when a question arises -- not a precise token count.

Never hand-carry these numbers into prose: run this and paste the output.
"""
import glob
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

GROUPS = [
    ("every session", "shipped rules", ["memory/rules.yaml"]),
    ("subject comes up", "shipped facts about the kit", ["memory/facts/*.yaml"]),
    ("a ref points there", "url files", ["memory/urls/*"]),
    ("a shape is in question", "types, the canon", ["types/*.ts"]),
    ("the moment of use", "lesson index and bodies",
     ["memory/lessons/index.yaml", "memory/lessons/*.md"]),
    ("once, at adoption", "ADOPTION, UPGRADE, README, GOVERNANCE",
     ["ADOPTION.md", "UPGRADE.md", "README.md", "GOVERNANCE.md"]),
]


def chars(patterns):
    total, n = 0, 0
    for pat in patterns:
        for p in sorted(ROOT.glob(pat)):
            if p.is_file() and p.name != "README.md" or pat.endswith("README.md"):
                total += len(p.read_text())
                n += 1
    return total, n


def main():
    print(f"{'read':<24} {'what':<38} {'chars':>7} {'~tokens':>8}  files")
    for when, what, pats in GROUPS:
        c, n = chars(pats)
        print(f"{when:<24} {what:<38} {c:>7} {round(c / 4):>8}  {n}")
    per_session, _ = chars(GROUPS[0][2])
    print(f"\nper-session cost, compounding: ~{round(per_session / 4)} tokens")
    return 0


if __name__ == "__main__":
    sys.exit(main())
