# Legacy Documentation Migration Plan

**Date**: October 7, 2025  
**Purpose**: Migrate `.copilot-workspace/` and `.copilot-docs/` to spec-kit `.specify/` structure

---

## Current State Analysis

### Existing Structure

**`.copilot-workspace/`** (42 markdown files):

- `features/` - F001-F026 feature specifications
- `model/` - Entu data model documentation and samples
- `progress.md` - Project progress tracking
- `project-context.md` - Core project information
- `README.md` - Workspace guide
- `SPEC-KIT-ANALYSIS.md` - Our spec-kit integration analysis

**`.copilot-docs/`** (14 files):

- `development.md` - Development guidelines
- `working-agreements.md` - Team collaboration process
- `technical-notes.md` - Implementation notes
- `api/` - API documentation
- `api-requests/` - HTTP test files
- `authentication/` - Auth guides
- `designs/` - UI/UX designs
- `diagrams/` - Architecture diagrams

### Spec-Kit `.specify/` Structure

**Current** (after Phases 1-5):

```text
.specify/
├── memory/
│   ├── constitution.md          # ✅ Our 7 principles
│   └── opportunities.md         # ✅ Technical debt tracking
├── scripts/
│   ├── bash/                    # ✅ 5 shell scripts
│   └── powershell/              # ✅ 5 PowerShell scripts
├── templates/
│   ├── commands/                # ✅ 7 command definitions
│   ├── plan-template.md         # ✅ Customized
│   ├── tasks-template.md        # ✅ Customized
│   └── (others...)
├── CUSTOMIZATIONS.md            # ✅ Tracking doc
├── SYNC.md                      # ✅ Sync workflow
└── README.md                    # ✅ Main guide
```

---

## Migration Strategy

### Phase 6A: Archive Legacy Structure

**Goal**: Preserve historical context without cluttering new structure

**Actions**:

1. Create `.specify/archive/` directory
2. Move entire `.copilot-workspace/` → `.specify/archive/copilot-workspace/`
3. Move entire `.copilot-docs/` → `.specify/archive/copilot-docs/`
4. Add `.specify/archive/README.md` explaining archival

**Rationale**:

- Preserves complete history
- Removes confusion about "active" documentation
- Maintains git history
- Allows future reference if needed

### Phase 6B: Migrate Active Content to Spec-Kit Structure

#### 1. Features → `.specify/features/`

**Current**: `.copilot-workspace/features/F001-F026*.md` (26+ feature specs)

**Action**: **MOVE** to `.specify/features/`

**Rationale**:

- Spec-kit has `features/` directory for feature specifications
- Our F001-F026 indexing aligns with spec-kit patterns
- These are active project history, should remain accessible

**Structure after migration**:

```text
.specify/features/
├── README.md              # Create: Feature organization guide
├── F001-*.md              # Historic features (move as-is)
├── F002-*.md
├── ...
└── F026-*.md
```

#### 2. Model Documentation → `docs/model/`

**Current**: `.copilot-workspace/model/` (Entu data model)

**Action**: **MERGE** to `docs/model/` (already exists!)

**Rationale**:

- Model documentation is project-level, not workflow-specific
- Already have `docs/model/model.md` in main repo
- Consolidate all model docs in one place

**Note**: We already have `docs/model/model.md` - check if `.copilot-workspace/model/model.md` is duplicate or complementary.

#### 3. Constitution & Principles → `.specify/memory/constitution.md`

**Current**:

- `.copilot-docs/development.md` (guidelines)
- `.copilot-docs/working-agreements.md` (collaboration)

**Action**: **MERGE** into `.specify/memory/constitution.md`

**Rationale**:

- Our constitution is already comprehensive (7 principles)
- These docs contain valuable guidelines to extract
- Single source of truth for project principles

**Migration**:

1. Extract key principles from `development.md`
2. Extract collaboration patterns from `working-agreements.md`
3. Integrate into constitution sections (without duplicating)
4. Archive originals

#### 4. Technical Documentation → `docs/`

**Current**:

- `.copilot-docs/api/` - API documentation
- `.copilot-docs/authentication/` - Auth guides
- `.copilot-docs/technical-notes.md`

**Action**: **MOVE** to `docs/`

**Rationale**:

- Project-level technical docs, not workflow-specific
- Standard practice: `docs/` for all documentation
- Better discoverability

**Structure after migration**:

```text
docs/
├── api/                   # From .copilot-docs/api/
├── api-requests/          # From .copilot-docs/api-requests/ (HTTP test files)
├── authentication/        # From .copilot-docs/authentication/
├── diagrams/              # From .copilot-docs/diagrams/
├── designs/               # From .copilot-docs/designs/
├── model/                 # Already exists + merge .copilot-workspace/model/
└── technical-notes.md     # From .copilot-docs/
```

#### 5. API Requests → `docs/api-requests/`

**Current**: `.copilot-docs/api-requests/*.http`

**Action**: **MOVE** to `docs/api-requests/`

**Rationale**:

- HTTP test files are actively useful for API development
- Valuable when introducing new APIs
- Some requests may be obsolete, but keep all for reference
- Standard location: project-level `docs/`

**Decided**: Move to `docs/api-requests/` - keep all files as-is

#### 6. Spec-Kit Analysis → `.specify/archive/`

**Current**: `.copilot-workspace/SPEC-KIT-ANALYSIS.md`

**Action**: **ARCHIVE** to `.specify/archive/SPEC-KIT-ANALYSIS.md`

**Rationale**:

- Was our planning document for spec-kit integration
- Integration is now complete (Phases 1-5 done)
- Valuable historical context, but not "active" anymore
- Keep for reference if questions arise

#### 7. Progress Tracking → `.specify/memory/`

**Current**: `.copilot-workspace/progress.md`

**Action**: **DECISION NEEDED**

**Options**:

- A) Archive (historical progress already in git commits)
- B) Create `.specify/memory/progress.md` for ongoing tracking
- C) Convert to CHANGELOG format

**Decided**: Archive to `.specify/archive/progress.md` - git history is our source of truth. Use `.specify/memory/opportunities.md` for future tracking.

#### 8. Project Context → Update Constitution & README

**Current**: `.copilot-workspace/project-context.md`

**Action**: **MERGE** into constitution + `.specify/README.md`

**Rationale**:

- Project context is scattered across our new docs
- Constitution covers principles
- .specify/README.md covers workflow
- Main README.md covers quick start

**Migration**:

1. Extract tech stack info → validate against main README.md
2. Extract guidelines → validate against constitution
3. Archive original

---

## Migration Execution Plan

### Step 1: Create Archive Structure

```bash
mkdir -p .specify/archive/copilot-workspace
mkdir -p .specify/archive/copilot-docs
```

### Step 2: Move Features (Keep Active)

```bash
# Features are active history - move to .specify/features/
mv .copilot-workspace/features .specify/
```

### Step 3: Consolidate Model Docs

```bash
# Check for differences
diff .copilot-workspace/model/model.md docs/model/model.md

# If different, merge manually
# If same, just copy samples
cp .copilot-workspace/model/*.json docs/model/
cp .copilot-workspace/model/README.md docs/model/
```

### Step 4: Archive Spec-Kit Analysis

```bash
# Historical value but integration complete
mv .copilot-workspace/SPEC-KIT-ANALYSIS.md .specify/archive/
```

### Step 5: Move Technical Docs to docs/

```bash
# Consolidate all technical documentation
mkdir -p docs/api docs/authentication docs/diagrams docs/designs

# Move from .copilot-docs
mv .copilot-docs/api/* docs/api/
mv .copilot-docs/authentication/* docs/authentication/
mv .copilot-docs/diagrams/* docs/diagrams/
mv .copilot-docs/designs/* docs/designs/
mv .copilot-docs/technical-notes.md docs/
```

### Step 6: Move API Requests to docs/

```bash
# API test files are actively useful - keep them accessible
mv .copilot-docs/api-requests docs/
```

### Step 7: Extract & Merge Constitution Content

```bash
# Manual process:
# 1. Read .copilot-docs/development.md
# 2. Read .copilot-docs/working-agreements.md
# 3. Identify principles not in .specify/memory/constitution.md
# 4. Integrate without duplication
# 5. Archive originals
```

### Step 8: Archive Remaining Legacy

```bash
# Move everything else to archive
mv .copilot-workspace/* .specify/archive/copilot-workspace/
mv .copilot-docs/* .specify/archive/copilot-docs/

# Create archive README
cat > .specify/archive/README.md << 'EOF'
# Archived Documentation

This directory contains archived documentation from the pre-spec-kit structure.

**Archived**: October 7, 2025
**Reason**: Migrated to spec-kit `.specify/` structure

## Contents

- `copilot-workspace/` - Legacy private workspace (features moved to `.specify/features/`)
- `copilot-docs/` - Legacy team documentation (moved to `docs/`)
- `SPEC-KIT-ANALYSIS.md` - Spec-kit integration planning (completed Phases 1-5)

## Migration Summary

- **Features**: Moved to `.specify/features/` (active history)
- **Model**: Consolidated in `docs/model/`
- **Technical Docs**: Moved to `docs/`
- **Constitution**: Merged into `.specify/memory/constitution.md`
- **Principles**: Integrated into spec-kit structure

## Future Reference

This archive is preserved for historical context. All active documentation now follows spec-kit structure in `.specify/` and project documentation in `docs/`.

See `.specify/README.md` for current workflow and documentation structure.
EOF
```

### Step 9: Update Main README.md

```markdown
## Documentation

- `.specify/` - Spec-kit workflow integration (slash commands, templates, constitution)
- `docs/` - Technical documentation (API, authentication, model, architecture)
- See `.specify/README.md` for development workflow
- See `docs/model/model.md` for Entu data model
```

### Step 10: Remove Empty Directories

```bash
# After moving everything
rmdir .copilot-workspace .copilot-docs 2>/dev/null || true
```

---

## Post-Migration Validation

### Checklist

- [ ] All F001-F026 features in `.specify/features/`
- [ ] Model docs consolidated in `docs/model/`
- [ ] Technical docs in `docs/` (api, auth, diagrams, designs)
- [ ] Constitution enriched (if needed) from development.md/working-agreements.md
- [ ] Archive created with clear README
- [ ] `.copilot-workspace/` and `.copilot-docs/` removed from root
- [ ] Main README.md updated with new doc structure
- [ ] All links in documentation updated (search for `.copilot-`)
- [ ] Test slash commands still work
- [ ] Git status clean (all changes committed)

### Testing

```bash
# 1. Verify slash commands
# Should open correct templates
ls .github/prompts/

# 2. Check features accessible
ls .specify/features/ | head

# 3. Validate docs structure
tree docs/ -L 2

# 4. Search for broken references
grep -r "\.copilot-" . --exclude-dir=.git --exclude-dir=.specify/archive
```

---

## Decision Points

### Required Decisions

1. ✅ **API Request Files**: **DECIDED** - Move to `docs/api-requests/`
   - HTTP test files are actively useful for API development
   - Keep all files (some may be obsolete but valuable as reference)

2. ✅ **Progress Tracking**: **DECIDED** - Archive to `.specify/archive/progress.md`
   - Git history provides progress tracking
   - Use `opportunities.md` going forward

3. **Project Context**: Merge extent?
   - Review what's NOT already in constitution/README
   - Add missing pieces, archive rest

### Optional Enhancements

1. **Create docs/README.md**

   - Index of all technical documentation
   - Quick navigation guide

2. **Update .specify/features/README.md**

   - Explain F001-F026 indexing
   - Status of each feature (completed/deprecated/active)

3. **Create docs/index.md**
   - Comprehensive documentation map
   - Links to all sections

---

## Timeline Estimate

- **Step 1-2**: 5 min (create structure, move features)
- **Step 3-4**: 10 min (consolidate model, archive analysis)
- **Step 5-6**: 10 min (move technical docs, decide on API requests)
- **Step 7**: 30 min (extract & merge constitution content - requires careful reading)
- **Step 8-10**: 10 min (archive remaining, update README, cleanup)
- **Validation**: 15 min (checklist, testing, link checking)

**Total**: ~1.5 hours

---

## Rollback Plan

If migration causes issues:

```bash
# Restore from git
git checkout HEAD -- .copilot-workspace/ .copilot-docs/

# Remove partial migration
rm -rf .specify/features/F* .specify/archive/
```

---

## Benefits After Migration

1. **Single Source of Truth**: `.specify/` for workflow, `docs/` for technical
2. **Spec-Kit Compliance**: Full alignment with upstream structure
3. **Clear Separation**: Workflow (`.specify/`) vs Documentation (`docs/`)
4. **Simplified Onboarding**: One README to rule them all (`.specify/README.md`)
5. **Easier Sync**: No confusion about which docs to sync
6. **Git History Preserved**: Everything moved, not deleted

---

## Next Steps After Migration

1. Update `.specify/CUSTOMIZATIONS.md` to note migration
2. Add migration event to version history
3. Commit with clear message: `refactor: migrate legacy docs to spec-kit structure`
4. Assess /.specify/templates/contracts/ for any needed updates
5. Optional: Test workflow with `/specify` on new feature to validate
6. Optional: Create PR and get team review before merging

---

**Migration Lead**: AI Assistant  
**Review Required**: Yes (especially Step 7 - constitution merge)  
**Risk Level**: Low (everything archived, git history preserved)
