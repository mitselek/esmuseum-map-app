<!--
Sync Impact Report - Constitution v1.0.0

Version Change: Initial → 1.0.0 (Initial creation)

Modified Principles:
- NEW: I. Code Quality (NON-NEGOTIABLE) - TypeScript strict mode, linting, type safety requirements
- NEW: II. Test-First Development (NON-NEGOTIABLE) - TDD mandatory with 80% coverage target
- NEW: III. User Experience Consistency - Design system, performance budgets, accessibility
- NEW: IV. Performance Standards - Core Web Vitals, bundle size limits, API response times
- NEW: V. Security & Data Protection - OAuth 2.0, validation, HTTPS, vulnerability auditing

Added Sections:
- Development Standards (Technology Stack Requirements, Performance Budgets)
- Quality Gates (Pre-Commit Requirements, Pull Request Gates, Release Criteria)

Removed Sections: None (initial creation)

Templates Requiring Updates:
- plan-template.md: Constitution Check section needs alignment with new principles (PENDING)
- spec-template.md: Requirements alignment check needed (PENDING)
- tasks-template.md: Task categorization may need updates for new quality gates (PENDING)

Follow-up TODOs: None - all placeholders resolved
-->

# ESMuseum Map App Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

TypeScript MUST be used with strict mode enabled; All code MUST pass linting (ESLint) and formatting (Prettier) checks before commit; Type safety is mandatory - no `any` types except in clearly documented edge cases; Component architecture MUST follow single responsibility principle with clear interfaces.

**Rationale**: Ensures maintainable, bug-resistant code that scales with team growth and reduces debugging time.

### II. Test-First Development (NON-NEGOTIABLE)

TDD mandatory: Tests written → Tests fail → Then implement → Tests pass; Unit tests required for all business logic and utilities; Integration tests required for API endpoints and user workflows; Component tests required for all Vue components with user interactions; E2E tests required for critical user journeys; Minimum 80% code coverage maintained.

**Rationale**: Prevents regressions, documents expected behavior, and enables confident refactoring.

### III. User Experience Consistency

UI components MUST follow established design system patterns; All user interactions MUST provide immediate feedback (loading states, success/error messages); Performance budgets MUST be respected (LCP < 2.5s, FID < 100ms, CLS < 0.1); Accessibility standards (WCAG 2.1 AA) MUST be met; Cross-browser compatibility required for modern browsers (Chrome, Firefox, Safari, Edge).

**Rationale**: Delivers professional, accessible experiences that meet user expectations and accessibility requirements.

### IV. Performance Standards

Core Web Vitals MUST meet "Good" thresholds on production; Bundle size increases require justification and performance impact analysis; API responses MUST complete within 500ms for 95th percentile; Images MUST be optimized (WebP format, lazy loading, proper sizing); Memory leaks MUST be prevented (proper component cleanup, event listener removal).

**Rationale**: Fast, responsive applications improve user satisfaction and search engine rankings.

### V. Security & Data Protection

Authentication MUST use secure OAuth 2.0 flows with proper token handling; All user data MUST be validated on both client and server sides; HTTPS MUST be enforced in all environments; XSS and CSRF protection MUST be implemented; Error messages MUST NOT expose sensitive system information; Third-party dependencies MUST be regularly audited for vulnerabilities.

**Rationale**: Protects user data and maintains trust in the Estonian Museum system.

## Development Standards

### Technology Stack Requirements

Frontend: Nuxt.js 3 with Vue 3 Composition API, TypeScript strict mode, Tailwind CSS for styling; Testing: Vitest for unit/integration tests, Playwright for E2E testing; Code Quality: ESLint with Vue and TypeScript rules, Prettier for formatting; Development: HTTPS in development environment, hot module replacement enabled.

### Performance Budgets

JavaScript bundle: Max 250KB gzipped for initial load; CSS bundle: Max 50KB gzipped; Images: Optimized for web (WebP preferred), lazy loaded below fold; Fonts: Maximum 2 font families, preloaded critical fonts; Third-party scripts: Justified and performance-audited before inclusion.

## Quality Gates

### Pre-Commit Requirements

All linting rules MUST pass without warnings; All tests MUST pass in affected modules; Type checking MUST pass without errors; No console.log statements in production code; Commit messages MUST follow conventional commit format.

### Pull Request Gates

Code review required from at least one team member; All automated tests MUST pass in CI/CD pipeline; Performance impact assessment for bundle size changes; Accessibility review for UI changes; Documentation updated for new features or API changes.

### Release Criteria

All tests passing across all test suites; Performance benchmarks within acceptable thresholds; Security audit passed for dependency updates; Browser compatibility verified; Staging environment validation completed.

## Governance

Constitution supersedes all other practices; Amendments require documentation, approval, and migration plan; All PRs/reviews MUST verify compliance with core principles; Constitution violations MUST be justified with compelling technical rationale; Performance deviations require benchmark evidence and mitigation plan; Use agent-specific guidance files for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2025-09-20 | **Last Amended**: 2025-09-20
