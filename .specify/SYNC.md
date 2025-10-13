# Upstream Sync Process

**Purpose**: Keep spec-kit scripts and command templates up-to-date while preserving esmuseum-map-app customizations.

**Last Sync**: Never (initial integration)  
**Upstream**: <https://github.com/github/spec-kit>

---

## Sync Strategy

### What Gets Synced ✅

**Scripts** (Direct copies from upstream):

- `.specify/scripts/bash/check-prerequisites.sh`
- `.specify/scripts/bash/create-new-feature.sh`
- `.specify/scripts/powershell/check-prerequisites.ps1`
- `.specify/scripts/powershell/create-new-feature.ps1`

**Generic Command Templates** (Direct copies):

- `.specify/templates/commands/specify.md`
- `.specify/templates/commands/clarify.md`
- `.specify/templates/commands/analyze.md`
- `.specify/templates/commands/constitution.md`

**Rationale**: These files are framework code with minimal project-specific content.

### What Gets Preserved 🔒

**Customized Templates** (Our Vue/Nuxt specializations):

- `.specify/templates/plan-template.md` ← Heavily customized for Vue 3 + Nuxt 3
- `.specify/templates/tasks-template.md` ← Phase 3A (Vue/Nuxt) + 3B (Backend)
- `.specify/templates/commands/implement.md` ← Safety guards + Vue patterns
- `.specify/templates/commands/tasks.md` ← References our tasks-template.md

**Project Memory** (Our living documentation):

- `.specify/memory/constitution.md` ← ES Museum Map App principles
- `.specify/memory/opportunities.md` ← Our technical debt tracking
- `.specify/memory/sync-history.log` ← Sync event log

**Documentation** (Our explanations):

- All `*.md` files in `.specify/` root
- All changelog files (`*_CHANGELOG.md`)

**Rationale**: These files contain extensive project-specific customizations and must be manually merged if upstream changes affect them.

---

## Sync Workflow

### Step 1: Check for Updates

```bash
# Dry run to see what changed upstream
.specify/scripts/sync-from-upstream.sh --dry-run
```

**Output**:

- Version comparison
- List of changed files
- Detailed diffs for review

### Step 2: Review Changes

**Questions to ask**:

- Do script changes affect our workflow?
- Do command template changes require updates to our customizations?
- Are there new features we want to adopt?

**Check `CUSTOMIZATIONS.md`** to see what we've changed from upstream baseline.

### Step 3: Apply Sync

```bash
# Interactive sync (prompts for confirmation)
.specify/scripts/sync-from-upstream.sh

# Automated sync (no prompts)
.specify/scripts/sync-from-upstream.sh --force
```

**The script will**:

1. Clone latest spec-kit to `/tmp/`
2. Compare versions
3. Show differences
4. Copy updated files (scripts + generic commands only)
5. Preserve customized templates
6. Log sync event

### Step 4: Test Changes

```bash
# Review git diff
git diff .specify/

# Test commands still work
# Try: /specify, /clarify, /analyze in VS Code Copilot Chat

# Test scripts
.specify/scripts/bash/check-prerequisites.sh --json
```

### Step 5: Update Customizations (if needed)

If upstream changes affect features we've customized:

```bash
# 1. Read upstream version of customized file
cat /tmp/spec-kit-sync-*/. specify/templates/plan-template.md

# 2. Identify improvements to adopt
# 3. Manually merge into our customized version
# 4. Update CUSTOMIZATIONS.md with new baseline reference
# 5. Test workflow: /specify → /plan → /tasks → /implement
```

### Step 6: Commit

```bash
git add .specify/
git commit -m "chore: sync spec-kit updates from upstream

- Updated scripts: check-prerequisites, create-new-feature
- Updated commands: specify, clarify, analyze
- Preserved customizations: plan-template, tasks-template, implement
- Tested: /specify, /clarify, /analyze commands working"
```

---

## Sync Schedule

**Recommended frequency**: Every 1-2 weeks

**Triggers for immediate sync**:

- Critical bug fix in spec-kit scripts
- New feature needed in workflow
- Issue encountered with current version
- Major spec-kit release announced

**Process**:

1. Set calendar reminder for next sync (weekly/biweekly)
2. Check spec-kit releases/commits
3. Run sync workflow
4. Document changes

**Review cycles**:

- **Weekly**: Quick check for critical updates (5 min dry-run)
- **Monthly**: Full sync review with testing
- **Quarterly**: Audit customizations, consider adopting new upstream patterns

---

## Conflict Resolution

### Scenario 1: Script Changed Upstream

**Example**: `check-prerequisites.sh` gets new validation

**Resolution**:

1. Sync automatically copies new version
2. Test script: `.specify/scripts/bash/check-prerequisites.sh --json`
3. If broken: Check if we have local patches (unlikely)
4. If working: Commit

**Risk**: LOW - We don't modify scripts

### Scenario 2: Generic Command Changed Upstream

**Example**: `specify.md` gets improved error handling

**Resolution**:

1. Sync automatically copies new version
2. Test command: `/specify "new feature"` in Copilot Chat
3. Verify new feature directory created
4. If working: Commit

**Risk**: LOW - We don't modify generic commands

### Scenario 3: Upstream Modifies Customized Template

**Example**: `plan-template.md` upstream adds new section

**Resolution**:

1. Sync skips file (preserved)
2. Manually review upstream version: `/tmp/spec-kit-sync-*/. specify/templates/plan-template.md`
3. Decide if new section valuable for Vue/Nuxt
4. If yes: Manually add to our version with Vue customizations
5. Update `PLAN_TEMPLATE_CHANGELOG.md` noting upstream influence
6. Update `CUSTOMIZATIONS.md` with new baseline

**Risk**: MEDIUM - Requires manual merge and testing

### Scenario 4: New Upstream File We Want

**Example**: Upstream adds `debug.md` command

**Resolution**:

1. Sync doesn't copy (not in sync list)
2. Manually copy: `cp /tmp/spec-kit-sync-*/.specify/templates/commands/debug.md .specify/templates/commands/`
3. Create symlink: `cd .github/prompts && ln -s ../../.specify/templates/commands/debug.md debug.prompt.md`
4. Test: `/debug` in Copilot Chat
5. If useful: Keep, document in `CUSTOMIZATIONS.md`
6. If not: Remove, note evaluation in `CUSTOMIZATIONS.md`

**Risk**: LOW - Optional adoption

### Scenario 5: Sync Breaks Our Workflow

**Example**: Script update breaks our feature creation

**Resolution**:

1. Rollback: `git checkout HEAD -- .specify/scripts/`
2. Investigate: Compare old vs new script
3. Options:
   - Wait for upstream fix
   - Create local patch (document in `CUSTOMIZATIONS.md`)
   - Report upstream bug
4. Document issue in `.specify/memory/sync-history.log`

**Risk**: MEDIUM - Requires investigation

---

## Rollback Procedure

If sync causes problems:

```bash
# 1. Rollback all synced files
git checkout HEAD~1 -- .specify/scripts/ .specify/templates/commands/

# 2. Test workflow
/speckit.specify "test feature"
/speckit.clarify
/speckit.plan

# 3. If working: Commit rollback
git commit -m "revert: rollback spec-kit sync - broke workflow

Issue: [describe problem]
Investigation: [what you tried]
Resolution: Rollback to previous version, await upstream fix"

# 4. Document in sync-history.log
echo "[$(date)] ROLLBACK: Synced version broke workflow - reverted" >> .specify/memory/sync-history.log
```

---

## Troubleshooting

### Sync Script Fails to Clone

**Problem**: Network error or GitHub unavailable

**Solution**:

```bash
# Try again later
# Or manually clone:
git clone --depth 1 https://github.com/github/spec-kit.git /tmp/spec-kit-manual
cd /tmp/spec-kit-manual
# Manually copy files from there
```

### Sync Shows No Differences but Should

**Problem**: Local VERSION file incorrect

**Solution**:

```bash
# Check versions
cat .specify/VERSION  # If exists
cat /tmp/spec-kit-sync-*/.specify/VERSION  # Upstream version

# Force sync anyway
.specify/scripts/sync-from-upstream.sh --force
```

### Synced File Has Wrong Permissions

**Problem**: Script not executable after sync

**Solution**:

```bash
# Re-apply execute permissions
chmod +x .specify/scripts/bash/*.sh
chmod +x .specify/scripts/*.sh

# Verify
ls -l .specify/scripts/bash/
```

### Can't Tell What Changed

**Problem**: Diff output unclear

**Solution**:

```bash
# Use visual diff tool
code --diff .specify/scripts/bash/check-prerequisites.sh \
     /tmp/spec-kit-sync-*/. specify/scripts/bash/check-prerequisites.sh

# Or use git diff after sync
git diff .specify/
```

---

## Sync History

Track all sync events in `.specify/memory/sync-history.log`:

```text
[YYYY-MM-DD HH:MM:SS] Event description
```

**Format**:

- **Successful sync**: `Synced N file(s) from spec-kit`
- **Rollback**: `ROLLBACK: [reason]`
- **Manual merge**: `MANUAL MERGE: [file] - [description]`
- **Conflict resolved**: `CONFLICT RESOLVED: [file] - [resolution]`

**Example**:

```text
[2025-10-06 14:30:00] Initial integration - imported spec-kit structure
[2025-10-06 15:00:00] Customized plan-template.md for Vue 3 + Nuxt 3
[2025-10-06 16:00:00] Customized tasks-template.md - dual-stack support
[2026-01-15 10:00:00] Synced 8 file(s) from spec-kit
[2026-01-15 10:30:00] MANUAL MERGE: plan-template.md - added new section from upstream
[2026-04-10 11:00:00] Synced 2 file(s) from spec-kit
```

---

## Maintenance

### Monthly: Quick Check

```bash
# See if upstream has new releases
curl -s https://api.github.com/repos/github/spec-kit/releases/latest | grep tag_name
```

### Quarterly: Full Sync

```bash
# Review and sync
.specify/scripts/sync-from-upstream.sh --dry-run
# If changes: apply and test
# Document in sync-history.log
```

### Annually: Audit Customizations

```bash
# Review CUSTOMIZATIONS.md
# Are all customizations still needed?
# Can any be simplified?
# Have upstream patterns changed?
# Update documentation if needed
```

---

## Best Practices

✅ **DO**:

- Sync quarterly to stay current
- Test thoroughly after sync
- Document manual merges in `CUSTOMIZATIONS.md`
- Keep sync-history.log up to date
- Review upstream changelog before sync

❌ **DON'T**:

- Sync without testing
- Modify scripts without documenting
- Skip dry-run on first sync after long break
- Forget to commit after successful sync
- Panic if sync fails - rollback is easy

---

## Related Documentation

- **CUSTOMIZATIONS.md**: What we've changed from upstream
- **COMMAND_REVIEW.md**: Our evaluation of all commands
- **constitution.md**: Our project principles (separate from upstream)
- **IMPLEMENT_ENHANCEMENT_CHANGELOG.md**: Our /implement customizations
- **TASKS_TEMPLATE_CHANGELOG.md**: Our /tasks customizations
- **PLAN_TEMPLATE_CHANGELOG.md**: Our /plan customizations

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-10-06  
**Next Review**: 2026-01-06 (3 months)
