#!/bin/sh
# memory-kit lint -- check a home's memory tree against the kit's caps.
#
#   lint/memory-lint.sh [path] [--gate|--report]
#
#   path        the home (or its memory/ directory). Default: the current directory.
#   --gate      fail closed: exit 1 on any failure. Default for a fresh home.
#   --report    exit 0 always, print everything. For a home still clearing adoption debt.
#
# With neither flag, the mode comes from memory-kit.conf beside the memory directory
# (mode: gate | gauge), defaulting to gate.
#
# A gate must pass on the tree it is introduced to: a lint that fails on day one teaches
# --no-verify, and the kit is finished in that home.
#
# Needs python3 + PyYAML. Fails closed (exit 2) if either is missing -- a lint that skips
# checks is worse than no lint.
set -eu
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
command -v python3 >/dev/null 2>&1 || {
  echo "memory-kit: python3 not found. Refusing to run." >&2; exit 2; }
exec python3 "$DIR/memory_lint.py" "$@"
