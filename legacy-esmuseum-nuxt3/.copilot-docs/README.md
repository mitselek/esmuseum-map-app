# Project Do**AI Setup Protocol - Execute this sequence:**

1. **Initialize Structure**: Create `.copilot-workspace/` with these exact folders:
   - `features/` (for F001-, F002- specifications)
   - `fixes/` (for BF001-, BF002- bug records)
   - `planning/` (for current planning documents)
   - `decisions-draft/` (for ADR-001- drafts)

2. **Create Required Files**:
   - `progress.md` (track project status using template from this documentation)
   - `project-context.md` (internal AI context - copy from existing if available)
   - `README.md` (workspace overview)

3. **Review Documentation**: Read all files in `.copilot-docs/` for team context

4. **Assess Current State**: Analyze project files, dependencies, and structure

5. **Show Overview**: Present project status, current features, and next steps

6. **Ready for Work**: Confirm understanding of guidelines and workflowtion

This folder contains shared documentation for the ESMuseum Map App project, accessible to all team members and GitHub Copilot.

## For New Team Members & AI Assistants

**First prompt when starting work:**

```text
set up workspace
```

**AI Setup Protocol - Execute this sequence:**

1. **Initialize Structure**: Create `.copilot-workspace/` with required folders
2. **Review Documentation**: Read all files in `.copilot-docs/` for team context
3. **Assess Current State**: Analyze project files, dependencies, and structure
4. **Show Overview**: Present project status, current features, and next steps
5. **Ready for Work**: Confirm understanding of guidelines and workflow

This command will:

- Initialize the private `.copilot-workspace/` structure
- Review project documentation and guidelines
- Show current project state and next steps
- Establish consistent AI-assisted development context

## Structure

- `development.md` - Development guidelines and technical standards
- `working-agreements.md` - Team collaboration and AI-assisted development process
- `decisions/` - Finalized Architectural Decision Records (ADRs)
- `api/` - API documentation and integration guides
- `api-requests/` - HTTP request files for API testing
- `authentication/` - Authentication implementation guides
- `designs/` - UI/UX designs and specifications
- `diagrams/` - Technical architecture diagrams
- `technical-notes.md` - Technical implementation notes

## Purpose

These documents establish consistency across the team and provide context for AI-assisted development. They represent our agreed-upon standards and processes.

## Index Format Reference

When creating specifications and records, use these naming conventions:

- **Features**: `F001-feature-name.md`, `F002-next-feature.md`
- **Bug Fixes**: `BF001-bug-description.md`, `BF002-another-fix.md`
- **Decisions**: `ADR-001-decision-topic.md`, `ADR-002-next-decision.md`
