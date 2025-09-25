# Copilot Private Workspace

This folder is pre-created and tracked in git to ensure a consistent structure for all team members and AI assistants.

- All contents except this README, .keep, and template files are gitignored.
- Use this space for private working documents, planning, and progress tracking.
- See `.copilot-docs/` for public team documentation and onboarding protocol.

## Structure

- `project-context.md` - Core project information, tech stack, guidelines
- `progress.md` - Overall project progress log
- `features/` - Indexed feature specifications (drafts)
- `fixes/` - Indexed bug fix records
- `decisions-draft/` - ADRs in progress (move to `.copilot-docs/decisions/` when finalized)
- `planning/` - Current planning documents

## Shared Documentation

Team-accessible documentation is in `.copilot-docs/`:

- Development guidelines and standards
- Working agreements and collaboration process
- Finalized architectural decisions

## Index Format

- Features: `F001-feature-name.md`, `F002-...`
- Fixes: `BF001-bug-description.md`, `BF002-...`
- Decisions: `ADR-001-decision-topic.md`, `ADR-002-...`

## Maintenance

This workspace should be cleaned up at stable milestones, with completed items archived or moved to shared documentation.
