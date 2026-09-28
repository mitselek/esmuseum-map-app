#!/usr/bin/env python3
"""memory-kit lint. Reads caps.yaml; checks a home's memory tree against it.

Needs python3 + PyYAML and nothing else -- no node, no TypeScript toolchain, no JSON Schema
validator. Fails closed when PyYAML is missing rather than skipping checks.

Called through lint/memory-lint.sh; see that wrapper for usage.
"""
import argparse
import datetime as dt
import pathlib
import re
import sys

try:
    import yaml
except ImportError:
    sys.stderr.write(
        "memory-kit: PyYAML is required and was not found.\n"
        "  apt install python3-yaml   |   pip install pyyaml\n"
        "Refusing to run: a lint that skips checks is worse than no lint.\n")
    sys.exit(2)

KIT = pathlib.Path(__file__).resolve().parent.parent
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class Findings:
    """Every finding is (severity, path, message). 'note' never fails a gate."""

    def __init__(self):
        self.items = []
        self.counts = {}

    def add(self, sev, path, msg):
        self.items.append((sev, str(path), msg))

    def note(self, path, msg):
        self.add("note", path, msg)

    def fail(self, path, msg):
        self.add("fail", path, msg)

    def count(self, key, n=1):
        self.counts[key] = self.counts.get(key, 0) + n

    @property
    def failures(self):
        return [i for i in self.items if i[0] == "fail"]


def load(path, f):
    """Parse a YAML file. A parse error is always a failure: an unreadable tier is not a
    tier, and treating it as empty would hide everything in it."""
    try:
        data = yaml.safe_load(path.read_text())
    except yaml.YAMLError as e:
        f.fail(path, f"unparseable YAML: {str(e).splitlines()[0]}")
        return None
    if data is None:
        f.fail(path, "empty file; expected a mapping with the tier's key")
        return None
    if not isinstance(data, dict):
        f.fail(path, f"top level is {type(data).__name__}, expected a mapping")
        return None
    return data


def seq(data, key, path, f):
    v = data.get(key)
    if v is None:
        f.fail(path, f"missing key '{key}'")
        return None
    if not isinstance(v, list):
        f.fail(path, f"'{key}' is {type(v).__name__}, expected a list")
        return None
    return v


def check_ref(value, path, where, f, ref_re, *, field="ref"):
    s = "" if value is None else str(value)
    if s == "":
        # Blank is COUNTED, never failed: failing blanks buys fabricated refs, and a
        # fabricated ref survives a sweep while a missing one does not.
        f.count("blank refs")
        f.note(path, f"{where}: blank {field}")
        return
    if not ref_re.match(s):
        f.fail(path, f"{where}: {field} does not match the grammar: {s!r}")


def check_date(value, path, where, f, field):
    s = "" if value is None else str(value)
    if not DATE.match(s):
        f.fail(path, f"{where}: {field} is not YYYY-MM-DD: {s!r}")
        return None
    try:
        return dt.date.fromisoformat(s)
    except ValueError:
        f.fail(path, f"{where}: {field} is not a real date: {s!r}")
        return None


def required_str(item, key, path, where, f, *, cap=None, unit="chars"):
    v = item.get(key)
    if not isinstance(v, str) or not v.strip():
        f.fail(path, f"{where}: '{key}' missing or empty")
        return None
    if cap is not None:
        n = len(v.split()) if unit == "words" else len(v)
        if n > cap:
            f.fail(path, f"{where}: '{key}' is {n} {unit} (cap {cap})")
    return v


def unknown_keys(item, allowed, path, where, f):
    extra = sorted(set(item) - allowed)
    if extra:
        f.fail(path, f"{where}: unknown key(s) {', '.join(extra)}")


# ----------------------------------------------------------------- tier checks

def lint_scratchpad(path, caps, f, ref_re):
    data = load(path, f)
    if data is None:
        return
    cur = seq(data, "current", path, f)
    stg = seq(data, "staging", path, f)
    if cur is None or stg is None:
        return
    c = caps["scratchpad"]
    if len(cur) > c["current_rows"]:
        f.fail(path, f"current has {len(cur)} rows (cap {c['current_rows']})")
    if len(cur) + len(stg) > c["total_rows"]:
        f.fail(path, f"current+staging is {len(cur) + len(stg)} rows (cap {c['total_rows']})")
    labels = {"DECISION", "LEARNED", "WARNING", "WIP", "DEFERRED", "PATTERN", "GOTCHA"}
    for name, rows in (("current", cur), ("staging", stg)):
        for i, r in enumerate(rows):
            where = f"{name}[{i}]"
            if not isinstance(r, dict):
                f.fail(path, f"{where}: not a mapping")
                continue
            unknown_keys(r, {"label", "record", "ref"}, path, where, f)
            if r.get("label") not in labels:
                f.fail(path, f"{where}: label {r.get('label')!r} not one of {sorted(labels)}")
            rec = required_str(r, "record", path, where, f, cap=c["record_chars"])
            if rec and re.search(r"https?://", rec):
                f.fail(path, f"{where}: inline URL; cite urls/<name> instead")
            check_ref(r.get("ref"), path, where, f, ref_re)
            f.count("scratchpad rows")


def lint_facts(path, caps, f, ref_re, *, dormant=False):
    data = load(path, f)
    if data is None:
        return
    rows = seq(data, "facts", path, f)
    if rows is None:
        return
    cap_n = caps["dormant"]["per_file"] if dormant else caps["facts"]["per_file"]
    if len(rows) > cap_n:
        f.fail(path, f"{len(rows)} facts (cap {cap_n}); overflow mints a new subject file")
    allowed = {"fact", "ref", "refute", "verified"} | ({"parked", "reviewed"} if dormant else set())
    for i, r in enumerate(rows):
        where = f"facts[{i}]"
        if not isinstance(r, dict):
            f.fail(path, f"{where}: not a mapping")
            continue
        unknown_keys(r, allowed, path, where, f)
        required_str(r, "fact", path, where, f,
                     cap=caps["facts"]["fact_words"], unit="words")
        check_ref(r.get("ref"), path, where, f, ref_re)
        refute = r.get("refute")
        if refute is None or str(refute).strip() == "":
            f.count("facts with no test")
            f.note(path, f"{where}: blank refute -- the claim rests on trust")
        check_date(r.get("verified"), path, where, f, "verified")
        if dormant:
            required_str(r, "parked", path, where, f)
            required_str(r, "reviewed", path, where, f)
        f.count("dormant facts" if dormant else "facts")


def lint_rules(path, caps, f, ref_re, *, shipped=False):
    data = load(path, f)
    if data is None:
        return
    rows = seq(data, "rules", path, f)
    if rows is None:
        return
    cap_n = caps["core"]["rules"] if shipped else caps["rules"]["rows"]
    if len(rows) > cap_n:
        f.fail(path, f"{len(rows)} rules (cap {cap_n}); every row costs every session forever")
    allowed = {"rule", "ref"} | ({"core", "incident"} if shipped else set())
    for i, r in enumerate(rows):
        where = f"rules[{i}]"
        if not isinstance(r, dict):
            f.fail(path, f"{where}: not a mapping")
            continue
        unknown_keys(r, allowed, path, where, f)
        required_str(r, "rule", path, where, f, cap=caps["rules"]["rule_chars"])
        check_ref(r.get("ref"), path, where, f, ref_re)
        if shipped:
            if r.get("core") not in ("mandatory", "optional"):
                f.fail(path, f"{where}: core must be 'mandatory' or 'optional'")
            # The admission test, mechanised: no incident, no ship.
            required_str(r, "incident", path, where, f)
        f.count("shipped rules" if shipped else "rules")


def lint_obligations(path, caps, f, ref_re, today):
    data = load(path, f)
    if data is None:
        return
    rows = seq(data, "obligations", path, f)
    if rows is None:
        return
    for i, r in enumerate(rows):
        where = f"obligations[{i}]"
        if not isinstance(r, dict):
            f.fail(path, f"{where}: not a mapping")
            continue
        unknown_keys(r, {"obligation", "actor", "since", "check", "expires", "ref"},
                     path, where, f)
        required_str(r, "obligation", path, where, f,
                     cap=caps["obligations"]["obligation_chars"])
        required_str(r, "actor", path, where, f)
        check_date(r.get("since"), path, where, f, "since")
        exp = check_date(r.get("expires"), path, where, f, "expires")
        check_ref(r.get("ref"), path, where, f, ref_re)
        chk = r.get("check")
        if chk is None or str(chk).strip() == "":
            f.count("obligations with no check")
            f.note(path, f"{where}: blank check -- resolvable only by asking")
        if exp and exp < today:
            # Not a failure: an expired obligation is the tier working. It is a finding
            # precisely so somebody runs the check instead of believing the row.
            f.count("obligations expired")
            f.note(path, f"{where}: EXPIRED {exp} -- run the check, then re-state or resolve")
        f.count("obligations")


def lint_keys(path, caps, f, ref_re):
    data = load(path, f)
    if data is None:
        return
    rows = seq(data, "keys", path, f)
    if rows is None:
        return
    for i, r in enumerate(rows):
        where = f"keys[{i}]"
        if not isinstance(r, dict):
            f.fail(path, f"{where}: not a mapping")
            continue
        unknown_keys(r, {"subject", "holder", "scope", "granted", "revoke", "ref"},
                     path, where, f)
        for k in ("subject", "holder", "scope"):
            required_str(r, k, path, where, f)
        check_date(r.get("granted"), path, where, f, "granted")
        check_ref(r.get("ref"), path, where, f, ref_re)
        rev = r.get("revoke")
        if rev is None or str(rev).strip() == "":
            # The tier's own alarm: a grant nobody can withdraw is permanent by accident.
            f.count("grants with no revoke")
            f.note(path, f"{where}: blank revoke -- this grant has no known way back")
        f.count("grants")


def lint_lessons(mem, caps, f, ref_re):
    index = mem / "lessons" / "index.yaml"
    if not index.exists():
        return
    data = load(index, f)
    if data is None:
        return
    rows = seq(data, "lessons", index, f)
    if rows is None:
        return
    slugs = set()
    for i, r in enumerate(rows):
        where = f"lessons[{i}]"
        if not isinstance(r, dict):
            f.fail(index, f"{where}: not a mapping")
            continue
        unknown_keys(r, {"slug", "summary", "learned", "ref", "enforcement", "trigger"},
                     index, where, f)
        slug = required_str(r, "slug", index, where, f)
        required_str(r, "summary", index, where, f, cap=caps["lessons"]["index_line_chars"])
        check_date(r.get("learned"), index, where, f, "learned")
        check_ref(r.get("ref"), index, where, f, ref_re)
        enf = r.get("enforcement")
        if enf not in ("hooked", "linted", "recognition"):
            f.fail(index, f"{where}: enforcement must be hooked|linted|recognition")
        if enf == "hooked" and not str(r.get("trigger", "")).strip():
            f.fail(index, f"{where}: enforcement 'hooked' needs a trigger")
        if enf == "recognition":
            f.count("lessons nothing fires")
        if slug:
            slugs.add(slug)
            if not (mem / "lessons" / f"{slug}.md").exists():
                f.fail(index, f"{where}: no lessons/{slug}.md")
        f.count("lessons indexed")
    on_disk = {p.stem for p in (mem / "lessons").glob("*.md") if p.stem != "README"}
    for missing in sorted(on_disk - slugs):
        # The index is generated; an unindexed file means it was not regenerated.
        f.fail(index, f"lessons/{missing}.md is not in the index -- regenerate it")


def lint_urls(mem, f):
    d = mem / "urls"
    if not d.is_dir():
        return
    for p in sorted(d.iterdir()):
        if not p.is_file() or p.name in ("README.md", ".gitkeep"):
            continue
        if not re.match(r"^[a-z0-9-]+$", p.name):
            f.fail(p, "url short-name must be [a-z0-9-]+, cited as urls/<name>")
        lines = [l for l in p.read_text().splitlines() if l.strip()]
        if len(lines) != 1:
            f.fail(p, f"{len(lines)} non-empty lines; a url file holds exactly one URL")
        elif not re.match(r"^\S+://\S+$", lines[0].strip()):
            f.fail(p, f"line 1 is not a URL: {lines[0][:40]!r}")
        f.count("urls")


# ----------------------------------------------------------------------- main

def lint_tree(mem, caps, f, ref_re, today, *, shipped_rules=False):
    if not mem.is_dir():
        f.fail(mem, "no such memory directory")
        return
    for p in sorted(mem.glob("*.yaml")):
        name = p.stem
        if name == "rules":
            lint_rules(p, caps, f, ref_re, shipped=shipped_rules)
        elif name == "obligations":
            lint_obligations(p, caps, f, ref_re, today)
        elif name == "keys":
            lint_keys(p, caps, f, ref_re)
        else:
            lint_scratchpad(p, caps, f, ref_re)
    for p in sorted((mem / "facts").glob("*.yaml")):
        lint_facts(p, caps, f, ref_re)
    for p in sorted((mem / "dormant").glob("*.yaml")):
        lint_facts(p, caps, f, ref_re, dormant=True)
    lint_lessons(mem, caps, f, ref_re)
    lint_urls(mem, f)


def main(argv=None):
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument("target", nargs="?", default=".")
    ap.add_argument("--gate", action="store_true")
    ap.add_argument("--report", action="store_true")
    ap.add_argument("--shipped-rules", action="store_true",
                    help="the rules file is the kit's shipped set (core/incident required)")
    ap.add_argument("-h", "--help", action="store_true")
    a = ap.parse_args(argv)
    if a.help:
        print(__doc__)
        return 0

    caps_path = KIT / "caps.yaml"
    if not caps_path.exists():
        sys.stderr.write("memory-kit: caps.yaml missing; run tools/extract-caps.py\n")
        return 2
    caps = yaml.safe_load(caps_path.read_text())
    ref_re = re.compile(caps["ref_grammar"]["pattern"])
    today = dt.date.today()

    target = pathlib.Path(a.target).resolve()
    mem = target if target.name == "memory" else target / "memory"

    # Mode: flag beats config; config beats the default. A home adopting an existing tree
    # starts in gauge, because a gate must pass on the tree it is introduced to.
    mode = "gate" if a.gate else "report" if a.report else None
    conf_path = (mem.parent / "memory-kit.conf")
    conf = {}
    if conf_path.exists():
        conf = yaml.safe_load(conf_path.read_text()) or {}
    if mode is None:
        mode = "report" if conf.get("mode") == "gauge" else "gate"

    f = Findings()
    lint_tree(mem, caps, f, ref_re, today, shipped_rules=a.shipped_rules)

    print(f"memory-kit lint {caps['version']} -- {mode} -- {mem}")
    if f.counts:
        print("  " + " | ".join(f"{k}: {v}" for k, v in sorted(f.counts.items())))
    notes = [i for i in f.items if i[0] == "note"]
    for sev, path, msg in f.failures:
        print(f"  FAIL {pathlib.Path(path).name}: {msg}")
    for sev, path, msg in notes:
        print(f"  note {pathlib.Path(path).name}: {msg}")
    if not f.items:
        print("  clean")

    if mode == "gate" and f.failures:
        print(f"\n{len(f.failures)} failure(s). Gate closed.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
