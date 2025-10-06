# Archived Documentation

This directory contains archived documentation from the pre-spec-kit structure.

**Archived**: October 7, 2025  
**Reason**: Migrated to spec-kit `.specify/` structure

## Contents

- `copilot-workspace/` - Legacy private workspace
  - Features: **Moved** to `.specify/features/` (F001-F026 active history)
  - Model: **Merged** into `docs/model/` (samples + README)
  - Progress/context: **Archived** here (git history is source of truth)
  - SPEC-KIT-ANALYSIS.md: **Archived** here (integration planning complete)

- `copilot-docs/` - Legacy team documentation
  - API docs: **Moved** to `docs/api/`
  - API requests: **Moved** to `docs/api-requests/` (HTTP test files)
  - Authentication: **Moved** to `docs/authentication/`
  - Diagrams: **Moved** to `docs/diagrams/`
  - Designs: **Moved** to `docs/designs/`
  - Technical notes: **Moved** to `docs/technical-notes.md`
  - Guidelines: Core principles **integrated** into `.specify/memory/constitution.md`

## Migration Summary

### What Got Moved (Active Content)

- **Features** → `.specify/features/` - F001-F026 feature history
- **Model** → `docs/model/` - Entu data model + samples
- **Technical Docs** → `docs/` - API, auth, diagrams, designs
- **API Requests** → `docs/api-requests/` - HTTP test files (.http)

### What Got Archived (Historical Context)

- `progress.md` - Historical progress tracking (git history is current source)
- `project-context.md` - Context now in constitution + README
- `development.md` - Guidelines integrated into constitution
- `working-agreements.md` - Workflow integrated into constitution
- `SPEC-KIT-ANALYSIS.md` - Spec-kit integration planning (Phases 1-5 complete)

### What Got Integrated

Key principles from legacy docs were reviewed and integrated where appropriate:

- **Constitution**: Core development principles already comprehensive
- **README.md**: Tech stack and quick start already documented
- **Commit format**: Conventional Commits (implicit in our workflow)

## Why Archive Instead of Delete?

- **Git history**: Preserves complete project evolution
- **Reference**: Available if questions arise about past decisions
- **Context**: Understanding how we got here
- **Safety**: Easy rollback if needed

## Future Reference

This archive is preserved for historical context only. All active documentation now follows spec-kit structure:

- **Workflow & Commands**: `.specify/` (README.md, templates, scripts)
- **Project Principles**: `.specify/memory/constitution.md`
- **Technical Docs**: `docs/` (API, auth, model, diagrams)
- **Feature History**: `.specify/features/` (F001-F026)

See `.specify/README.md` for current workflow and documentation structure.

---

**Archive Version**: 1.0.0  
**Migration Date**: October 7, 2025  
**Migration Phase**: Phase 6 - Legacy Documentation Migration
