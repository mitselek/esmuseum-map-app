#!/bin/sh
# The conformance test. Every valid fixture must pass the gate; every invalid fixture must
# fail it. This is the kit's contract: a schema can be reinterpreted, a fixture cannot.
#
# An implementation in any language is conformant when this passes against it.
# Invalid fixtures that need the shipped-rules checks are named shipped-*.
set -eu
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
KIT=$(dirname "$DIR")
pass=0; fail=0

for d in "$KIT"/fixtures/valid/*/; do
  name=$(basename "$d")
  if out=$("$DIR/memory-lint.sh" "$d" --gate 2>&1); then
    pass=$((pass+1))
  else
    fail=$((fail+1)); echo "UNEXPECTED FAIL  valid/$name"; echo "$out" | sed 's/^/    /'
  fi
done

for d in "$KIT"/fixtures/invalid/*/; do
  name=$(basename "$d")
  case "$name" in shipped-*) extra=--shipped-rules ;; *) extra= ;; esac
  if "$DIR/memory-lint.sh" "$d" --gate $extra >/dev/null 2>&1; then
    fail=$((fail+1)); echo "UNEXPECTED PASS  invalid/$name"
  else
    pass=$((pass+1))
  fi
done

echo "fixtures: $pass passed, $fail failed"
[ "$fail" -eq 0 ] || exit 1
