# Spec-Kit Analysis & Living Integration Plan

**Date**: October 6, 2025  
**Purpose**: Adopt spec-kit's filesystem structure 100% while maintaining project-specific content sovereignty

**Strategy**: Living integration - sync with spec-kit evolution, adopt structure fully, customize content carefully

**Risk**: Installing spec-kit directly would immediately change Copilot's behavior. We need controlled integration with ongoing sync capability.

---

## 🎯 Core Integration Philosophy

### Golden Rules (Constitution Level)

1. **Structure Alignment**: Match spec-kit filesystem structure 100%

   - Same directory names (`.specify/` not `.copilot-workspace/`)
   - Same file locations
   - Same naming conventions
   - Enables easy diffing and syncing

2. **Content Sovereignty**: Our files are authoritative

   - Spec-kit provides templates and patterns
   - We customize for esmuseum-map-app context
   - Innovation from spec-kit adopted after careful consideration
   - Changes must preserve our workflow and behavior

3. **Living Sync**: Maintain connection to upstream

   - Keep /tmp/spec-kit-study/ for ongoing updates
   - Periodically sync: `cd /tmp/spec-kit-study && git pull`
   - Review changes, adopt valuable innovations
   - Stay current with evolving landscape

4. **Careful Adoption**: New spec-kit features require evaluation
   - Does it add value to our workflow?
   - Does it conflict with our customizations?
   - Can we integrate without breaking existing behavior?
   - Document decisions in this file

---

## 📦 Spec-Kit Structure (ADOPT 100%)

### Target Directory Structure (Exact Match)

```text
.specify/                        # Root directory (NOT .copilot-workspace/)
├── memory/
│   └── constitution.md          # OUR constitution (spec-kit provides template)
├── scripts/
│   ├── bash/                    # Shell scripts (5 files) - ADOPT structure, CUSTOMIZE content
│   │   ├── check-prerequisites.sh
│   │   ├── common.sh
│   │   ├── create-new-feature.sh
│   │   ├── setup-plan.sh
│   │   └── update-agent-context.sh
│   └── powershell/              # PS scripts (5 files) - Copy as-is initially
├── templates/
│   ├── commands/                # 7 command definitions - CRITICAL: Merge with .github/prompts/
│   │   ├── analyze.md
│   │   ├── clarify.md
│   │   ├── constitution.md
│   │   ├── implement.md
│   │   ├── plan.md
│   │   ├── specify.md
│   │   └── tasks.md
│   ├── spec-template.md         # Feature specification template
│   ├── plan-template.md         # Implementation plan template
│   ├── tasks-template.md        # Task breakdown template
│   └── agent-file-template.md   # Agent context template
└── features/                    # Where feature specs live (specs/###-name/)
    └── README.md                # Feature organization guide
```

### Sync Source

```bash
# /tmp/spec-kit-study/ - Our upstream reference
# Update periodically: cd /tmp/spec-kit-study && git pull
# Last synced: October 6, 2025 (initial clone)
```

### Key Scripts (bash/powershell)

1. **check-prerequisites.sh** - Validates workflow prerequisites
2. **common.sh** - Shared utility functions
3. **create-new-feature.sh** - Creates feature branch + spec
4. **setup-plan.sh** - Initializes implementation plan
5. **update-agent-context.sh** - Updates agent context files

### Template Commands

1. **specify.md** - Create feature specification
2. **clarify.md** - Ask clarification questions
3. **plan.md** - Generate implementation plan
4. **tasks.md** - Break down into tasks
5. **implement.md** - Execute task list
6. **analyze.md** - Cross-artifact consistency check
7. **constitution.md** - Update project constitution

---

## ✅ Integration Strategy: Full Structure Adoption

### Phase 1: Structure Clone (100% Match)

**Goal**: Mirror spec-kit filesystem exactly
**Action**: Copy entire structure from /tmp/spec-kit-study/
**Location**: `.specify/` (NOT `.copilot-workspace/`)
**Risk**: MEDIUM - Creates command files that Copilot reads
**Mitigation**: Merge `.specify/templates/commands/` with our `.github/prompts/`

### Phase 2: Content Customization (Project-Specific)

**Goal**: Replace generic content with esmuseum-map-app context
**Action**: Customize while preserving structure
**Priority Components**:

### 1. **Constitution** ⭐⭐⭐ (HIGH PRIORITY)

**What**: `.specify/memory/constitution.md`
**Action**: Populate with our principles (based on keywords.txt, golden rules)
**Customization**: Replace `[PROJECT_NAME]` with "ES Museum Map App", define our core principles
**Risk**: LOW - Our content, their structure
**Value**: HIGH - Governance foundation

### 2. **Command Templates** ⭐⭐⭐ (CRITICAL MERGE)

**What**: `.specify/templates/commands/*.md` (7 files)
**Action**: Merge with existing `.github/prompts/*.md`
**Strategy**:

- Keep our `.github/prompts/` as PRIMARY
- Reference `.specify/templates/commands/` as SECONDARY
- OR: Enhance `.specify/templates/commands/` with our customizations
  **Risk**: HIGH - Could change Copilot behavior
  **Mitigation**: Test each command individually, preserve our enhancements
  **Value**: HIGH - Standard spec-kit workflow

### 3. **Bash Scripts** ⭐⭐⭐ (ADOPT & CUSTOMIZE)

**What**: `.specify/scripts/bash/*.sh` (5 files)
**Action**: Copy all, customize paths and logic for our project
**Customizations Needed**:

- Update paths to match our structure
- Add esmuseum-map-app specific validation
- Preserve existing workflow patterns
  **Risk**: MEDIUM - Scripts might have assumptions
  **Value**: HIGH - Automation and validation

### 4. **Templates** ⭐⭐ (ADOPT STRUCTURE, CUSTOMIZE CONTENT)

**What**: `.specify/templates/*.md` (spec, plan, tasks, agent-file)
**Action**: Copy structure, customize prompts and sections for our context
**Customizations**: Add esmuseum-map-app specific sections, Vue/Nuxt patterns
**Risk**: LOW - Templates are guidance
**Value**: MEDIUM - Consistency

### 5. **PowerShell Scripts** ⭐ (COPY AS-IS)

**What**: `.specify/scripts/powershell/*.ps1` (5 files)
**Action**: Copy unchanged for cross-platform support
**Rationale**: Minimal maintenance, enables Windows contributors
**Risk**: VERY LOW - Won't be used on Linux
**Value**: LOW - Future-proofing

### 6. **Python CLI Tool** ❌ (SKIP FOR NOW)

**What**: `src/specify_cli/`
**Action**: Don't copy - we use Copilot Workspace native commands
**Rationale**: Adds dependency, we don't need programmatic access yet
**Future**: Could adopt if we want automation outside Copilot
**Risk**: N/A - Not installing
**Value**: N/A - Not needed yet

---

## 🎯 Execution Plan: Living Integration

### Phase 1: Full Structure Clone ✅ ADOPT 100%

```bash
# Create .specify structure (exact match to spec-kit)
mkdir -p .specify/{memory,scripts/{bash,powershell},templates/commands,features}

# Copy entire spec-kit structure
cp -r /tmp/spec-kit-study/memory/* .specify/memory/
cp -r /tmp/spec-kit-study/scripts/bash/* .specify/scripts/bash/
cp -r /tmp/spec-kit-study/scripts/powershell/* .specify/scripts/powershell/
cp -r /tmp/spec-kit-study/templates/* .specify/templates/

# Make scripts executable
chmod +x .specify/scripts/bash/*.sh
```

### Phase 2: Command Merge Strategy (CRITICAL) ⚠️

```bash
# Decision point: How to handle .github/prompts/ vs .specify/templates/commands/
#
# Option A: Keep Both, Make .github/prompts/ Reference .specify/
#   - Preserve our enhancements in .github/prompts/
#   - .github/prompts/ become "wrappers" that call .specify/templates/commands/
#   - Most compatible with spec-kit updates
#
# Option B: Merge Into .specify/templates/commands/
#   - Copy our enhancements into .specify/templates/commands/*.md
#   - Delete .github/prompts/ after migration
#   - Clean single source of truth
#   - Easier to sync with spec-kit
#
# RECOMMENDATION: Option B - Migrate enhancements to .specify/, delete .github/prompts/
```

### Phase 3: Content Customization (Project-Specific)

```bash
# 1. Constitution
# Edit .specify/memory/constitution.md:
# - Replace [PROJECT_NAME] with "ES Museum Map App"
# - Define principles from .github/keywords.txt
# - Add spec-kit sovereignty rule (Rule #1)
# - Version as 1.0.0

# 2. Scripts
# Edit .specify/scripts/bash/*.sh:
# - Update SPECS_DIR paths
# - Add esmuseum-map-app validation
# - Preserve our workflow patterns

# 3. Templates
# Edit .specify/templates/*.md:
# - Add Vue/Nuxt specific sections
# - Include our TypeScript patterns
# - Reference our tech stack
```

### Phase 4: Sync Mechanism Setup

```bash
# Create sync helper script
cat > .specify/scripts/sync-from-upstream.sh << 'EOF'
#!/bin/bash
# Sync spec-kit changes from /tmp/spec-kit-study/
cd /tmp/spec-kit-study && git pull
# Show what changed
git log -3 --oneline
# User manually reviews and selectively adopts changes
EOF
chmod +x .specify/scripts/sync-from-upstream.sh
```

### Phase 5: Documentation & Testing

```bash
# Create .specify/README.md explaining:
# - This follows spec-kit structure 100%
# - Content is customized for esmuseum-map-app
# - Upstream sync process
# - Our enhancements and deviations

# Test each command:
# - /specify (create new feature)
# - /plan (generate plan)
# - /tasks (break into tasks)
# - /implement (execute)
# - /constitution (update governance)
```

---

## 🔒 Safety Rules & Governance

### ✅ DO (Adoption Strategy)

1. **Adopt structure 100%** - Use `.specify/` exactly as spec-kit does
2. **Customize content carefully** - Make it esmuseum-map-app specific
3. **Test incrementally** - Each command before committing
4. **Document deviations** - Track what we changed and why
5. **Sync periodically** - Pull upstream, review, adopt innovations
6. **Preserve sovereignty** - Our decisions are final, spec-kit suggests

### ❌ DON'T (Risk Mitigation)

1. **Don't blindly copy** - Understand before integrating
2. **Don't skip testing** - Every command must work
3. **Don't ignore conflicts** - Resolve with our workflow as priority
4. **Don't lose enhancements** - Migrate our improvements forward
5. **Don't auto-sync** - Manual review required for all upstream changes

### 📜 Constitution Rule (Priority 1)

```markdown
## Spec-Kit Integration Sovereignty

**Rule**: This project follows spec-kit filesystem structure for compatibility,
but our content and customizations are authoritative.

**Rationale**: Spec-kit provides excellent patterns and tooling, but esmuseum-map-app
has unique requirements, workflows, and team preferences that must be preserved.

**Application**:

- Structure: Match spec-kit 100% (easy diffing, future compatibility)
- Content: Customize for our context (Vue/Nuxt, our validation, our workflow)
- Innovation: Adopt spec-kit updates after evaluation (benefit vs risk)
- Conflicts: Our requirements win (document rationale)

**Version**: 1.0.0
**Effective**: October 6, 2025
```

---

## 📋 Integration Checklist (Living Integration)

### Phase 1: Structure Clone ✅

- [ ] Create `.specify/` directory structure (exact match)
- [ ] Copy all bash scripts (5 files)
- [ ] Copy all PowerShell scripts (5 files)
- [ ] Copy all templates (commands + spec/plan/tasks)
- [ ] Copy memory/constitution.md as template
- [ ] Make bash scripts executable
- [ ] Verify structure matches: `diff -qr .specify/ /tmp/spec-kit-study/`

### Phase 2: Command Migration Strategy 🎯

- [ ] **Decision**: Choose Option A (keep both) or Option B (merge to .specify/)
- [ ] If Option A: Make .github/prompts/ reference .specify/templates/commands/
- [ ] If Option B: Migrate enhancements to .specify/templates/commands/
- [ ] If Option B: Delete .github/prompts/ after validation
- [ ] Test each command works with new structure
- [ ] Document command resolution order

### Phase 3: Content Customization 📝

- [ ] Customize constitution.md for esmuseum-map-app
- [ ] Add spec-kit sovereignty rule to constitution
- [ ] Update bash scripts for our paths
- [ ] Enhance templates with Vue/Nuxt sections
- [ ] Add TypeScript patterns to templates
- [ ] Update validation logic for our stack

### Phase 4: Sync Mechanism 🔄

- [ ] Create sync-from-upstream.sh script
- [ ] Document sync process in .specify/README.md
- [ ] Add last-synced date tracking
- [ ] Create changelog for our customizations
- [ ] Test sync workflow

### Phase 5: Testing & Documentation 🧪

- [ ] Test /specify command (create feature)
- [ ] Test /plan command
- [ ] Test /tasks command
- [ ] Test /implement command
- [ ] Test /constitution command
- [ ] Create .specify/README.md
- [ ] Update main README.md with spec-kit integration
- [ ] Add .gitignore patterns for generated files
- [ ] Document all deviations from upstream

### Phase 6: Commit & Validate ✅

- [ ] Commit .specify/ structure to feature branch
- [ ] Test on fresh clone
- [ ] Verify Copilot reads new commands
- [ ] Ensure no behavioral regressions
- [ ] Update this analysis with lessons learned

---

## 🎓 Key Insights from Strategy Revision

### What Changed

- ❌ OLD: Custom `.copilot-workspace/` namespace
- ✅ NEW: Exact `.specify/` structure match (100% alignment)

### Why It's Better

1. **Easy Syncing**: `diff` shows only our content changes, not structure drift
2. **Future Compatibility**: Upstream innovations can be adopted cleanly
3. **Standard Compliance**: Other AI agents can use our specs (if we want)
4. **Team Clarity**: "We use spec-kit" is simpler than "hybrid custom system"

### Critical Success Factor

**Sovereignty Rule in Constitution** - Makes it explicit that structure is spec-kit's, but decisions are ours.

---

## 📊 Sync Workflow (Ongoing Maintenance)

```bash
# 1. Update upstream reference
cd /tmp/spec-kit-study && git pull

# 2. See what changed
git log -5 --oneline
git diff HEAD~5..HEAD

# 3. Review changes in context
# Read: docs/changelog.md or release notes

# 4. Evaluate each change
# - Does it benefit us?
# - Does it conflict with our customizations?
# - Is it worth the integration effort?

# 5. Selectively adopt
# Copy valuable changes to .specify/
# Test thoroughly
# Update our changelog

# 6. Document decision
# Add entry to .specify/CUSTOMIZATIONS.md:
# "2025-10-15: Adopted X from spec-kit v2.1, skipped Y because Z"
```

---

## � Success Criteria

✅ **Structural Compatibility** (100% Match):

- Directory structure identical to spec-kit
- Same file locations and naming
- Easy to diff: `diff -r .specify/ /tmp/spec-kit-study/` shows only content changes
- Can sync upstream changes easily

✅ **Content Sovereignty** (Project-Specific):

- Constitution reflects esmuseum-map-app principles
- Scripts customized for our paths and validation
- Templates include Vue/Nuxt/TypeScript patterns
- Commands work with our workflow
- All deviations documented with rationale

✅ **Behavioral Preservation**:

- No regression in current Copilot behavior
- Our enhancements preserved (from .github/prompts/)
- Workflow improvements integrated smoothly
- Testing validates all commands work

✅ **Living Integration** (Future-Proof):

- Can sync spec-kit updates: `cd /tmp/spec-kit-study && git pull`
- Process documented for evaluating upstream changes
- Changelog tracks our customizations
- Constitution includes sovereignty rule

✅ **Value Delivered**:

- Full spec-kit workflow available
- Automation scripts reduce manual work
- Consistency across features
- Standard structure for team collaboration

---

**Status**: STRATEGY REFINED - Ready for Phase 1 execution with 100% structure alignment approach
