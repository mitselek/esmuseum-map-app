# ES Museum Map App Constitution

TODO: bring in golden rules from #SPEC-KIT-ANALYSIS.md
TODO: make sure we have well-thought-out flow for regularly checking spec-kit updates

## Core Principles

### I. Type Safety First

TypeScript must be leveraged fully to ensure code correctness and maintainability:

- Avoid `any` type - every usage must be documented
- When `any` is necessary:
  1. Add comment explaining why
  2. Document plan for removal or justification to keep
  3. Prefer type guards over type casts
- Document JavaScript boundaries clearly
- Use strict TypeScript configuration

Type safety is not just compilation - it's documentation and correctness.

### II. Composable-First Development

Features should be implemented as reusable composables:

- Self-contained with clear single responsibility
- Independently testable (unit tests required)
- Well-documented with TypeScript types
- Composable must have clear purpose - no "utility grab bags"

Structure:

- `app/composables/` for business logic
- Component-specific composables in component folders
- Server composables in `server/utils/`

Benefits: Reusability, testability, maintainability

### III. Test-First Development

Tests should be written before implementation where practical:

- New features: Write tests first, get approval, then implement
- Bug fixes: Write failing test reproducing issue, then fix
- Refactoring: Maintain test coverage throughout

Exceptions allowed for:

- Rapid prototyping (must add tests before PR)
- UI/UX experimentation (document decision to defer)
- Third-party integration exploration

Test coverage targets:

- Composables: >80%
- API endpoints: >90%
- Critical business logic: 100%

### IV. Observable Development

Code must be debuggable in production:

- Use structured logging (pino) over console.log
- Log levels: error (user-facing issues), warn (degraded), info (lifecycle), debug (development)
- Include context: userId, taskId, location, action
- Client-side: Capture errors with user-friendly messages
- Server-side: Detailed logs without exposing sensitive data

Error boundaries required for:

- API calls (network failures)
- User input processing (validation)
- Third-party integrations (Entu, Leaflet)

### V. Pragmatic Simplicity

Start simple, add complexity only when justified:

- YAGNI: Don't implement features "for the future"
- Optimize after measuring: Profile before optimizing
- Prefer boring technology: Established patterns over clever solutions
- Refactor continuously: Keep code simple as it evolves

Balance: Simple doesn't mean simplistic - invest in good architecture upfront.

When encountering optimization opportunities or suspicious patterns during development:

- Log the observation in `.specify/memory/opportunities.md` and continue with current task
- Don't lose focus by fixing everything immediately
- Review logged opportunities regularly and prioritize deliberately
- Implement optimizations only after measuring and justifying the need

### VI. Strategic Integration Testing

Focus integration tests on critical paths:

- API contract tests: Entu authentication, task fetching
- Data flow: User submission → Server → Entu
- Third-party boundaries: Entu API, map tile providers
- Critical user journeys: Login → Task selection → Submission

Not required for:

- Pure UI components (unit tests sufficient)
- Internal helper functions
- Simple CRUD operations

### VII. API-First Server Design

Server routes should be clean and testable:

- Clear input validation (Nuxt server utilities)
- Structured responses (JSON)
- Proper error codes (4xx client, 5xx server)
- Documented contracts (TypeScript types)

## Development Workflow

### Feature Specification Process

New features follow spec-kit driven workflow:

1. **Specify**: Create feature specification in `.specify/features/###-feature-name/`
2. **Plan**: Generate implementation plan with architecture and dependencies
3. **Tasks**: Break down into actionable tasks with clear acceptance criteria
4. **Implement**: Execute task-by-task with tests-first approach
5. **Review**: Code review ensuring compliance with all principles

### Code Review Requirements

All pull requests must:

- Include tests (unit and integration where applicable)
- Pass all existing tests
- Maintain or improve type safety (no new `any` without justification)
- Follow composable-first patterns
- Include structured logging for new features

### Git Branch Strategy

- `main` - Production-ready code
- `feature/*` - New features (from spec-kit specifications)
- `fix/*` - Bug fixes
- `refactor/*` - Code improvements without behavior change

### Deployment Process

- All deployments require passing CI/CD
- Production deployments reviewed by maintainer
- Monitor logs post-deployment for errors

## Tech Stack Governance

### Approved Core Dependencies

- **Framework**: Nuxt.js 3 (Vue.js 3)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: Naive UI
- **Internationalization**: @nuxtjs/i18n (English & Estonian)
- **Mapping**: Leaflet with @vue-leaflet/vue-leaflet
- **Testing**: Vitest with @nuxt/test-utils
- **Logging**: Pino (server-side)

### Adding New Dependencies

Evaluate before adding:

1. **Necessity**: Can we solve with existing tools?
2. **Maintenance**: Active development, stable release
3. **Size**: Bundle impact acceptable?
4. **Type Safety**: TypeScript support available?
5. **Community**: Well-documented, good examples

Document decision in `.specify/features/` if part of feature work.

### Upgrade Policy

- Stay current with Nuxt stable releases
- Review breaking changes before upgrading major versions
- Test thoroughly after dependency updates
- Document migration steps if API changes affect our code

### Entu Integration Patterns

- All Entu API calls go through `useEntuApi` composable
- Authentication handled by `useEntuAuth` and `useEntuOAuth`
- Server-side proxy for sensitive operations
- Error handling with user-friendly messages
- Respect rate limits and cache appropriately

## Governance

### Constitution Authority

This constitution supersedes all other development practices and guidelines. All code reviews, pull requests, and architectural decisions must verify compliance with these principles.

### Spec-Kit Integration Sovereignty

This project follows spec-kit filesystem structure for compatibility and future maintainability, but our content and customizations are authoritative:

- **Structure**: Match spec-kit 100% (`.specify/` directory layout)
- **Content**: Customize for ES Museum Map App context (Vue/Nuxt, our validation, our workflow)
- **Innovation**: Adopt spec-kit updates after evaluation (benefit vs risk analysis required)
- **Conflicts**: Our requirements win (document rationale in `.specify/memory/`)

### Amendment Process

Constitution changes require:

1. Proposed change documented in `.specify/memory/` with rationale
2. Review by project maintainer
3. Approval and version bump (semantic versioning)
4. Update all affected documentation
5. Migration plan if existing code affected

### Exception Handling

Exceptions to constitution principles allowed when:

- Technical constraints make compliance impossible (document in code)
- Third-party integration requires deviation (isolate in composable)
- Temporary rapid prototyping (must resolve before merge to main)

All exceptions must be:

- Documented with justification
- Tracked for future resolution
- Reviewed in code review process

### Complexity Justification

Any solution adding significant complexity must justify:

- Why simpler approach insufficient
- What problem it solves
- How it will be maintained
- Impact on team understanding

Prefer boring, well-understood solutions over clever optimizations.

**Version**: 0.0.0 | **Ratified**: 2025-xx-xx | **Last Amended**: 2025-xx-xx
