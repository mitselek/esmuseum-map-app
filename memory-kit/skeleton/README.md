# skeleton

The empty home a fresh consumer starts from. Copy `memory/` and `memory-kit.conf` into the
workdir root, run `git init` if the home is not already under version control, and commit
before the first session writes anything -- the first commit is what makes "what did this home
know last Tuesday" a checkout rather than a reconstruction.

```
<workdir>/
  memory/           this home's data -- yours
  memory-kit/       the kit, vendored; never edited locally
  memory-kit.conf   this home's config for the kit; a pull never touches it
```

A home that already has memory habits does not start here: it runs `ADOPTION.md` instead.
