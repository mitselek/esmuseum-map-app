# ESMuseum Map App

A Nuxt.js 3 application for the Estonian Museum interactive map, displaying museum information with KML import capabilities.

## Quick Start

```bash
npm install
npm run dev
```

## For AI-Assisted Development

**New to this project?** Start with:

```text
set up workspace
```

This will initialize the development environment and show you the current project state.

### Spec-Kit Workflow

For structured feature development, use our integrated spec-kit workflow:

```bash
# 1. Define feature
/specify "Add task priority badges"

# 2. Create implementation plan
/plan

# 3. Generate task breakdown
/tasks

# 4. Execute implementation
/implement "Execute safe tasks only"
```

**Available commands**: `/specify`, `/plan`, `/tasks`, `/implement`, `/clarify`, `/analyze`, `/constitution`

**Full documentation**: See [.specify/README.md](./.specify/README.md) for detailed workflow examples, troubleshooting, and customization details.

## Documentation

- **`.specify/`** - Spec-kit workflow integration (slash commands, templates, constitution, features)
- **`docs/`** - Technical documentation (API, authentication, model, architecture, diagrams)
- See `.specify/README.md` for development workflow and slash commands
- See `.specify/memory/constitution.md` for project principles
- See `docs/model/model.md` for Entu data model
- See `docs/api/` for API documentation and `docs/api-requests/` for HTTP test files

## Tech Stack

- **Framework**: Nuxt.js 3 (Vue.js 3)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Naive UI
- **Internationalization**: @nuxtjs/i18n (English & Estonian)
