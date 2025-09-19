# ESMuseum Constitutional Framework

_Immutable principles governing the development of the Estonian Museum Map Application_

**Established**: September 19, 2025  
**Version**: 1.1  
**Authority**: ESMuseum Development Team  
**Scope**: All development activities, feature implementations, and architectural decisions

---

## Preamble

This constitution establishes the foundational principles that govern all development activities within the ESMuseum Map Application project. These principles ensure architectural consistency, maintainability, and quality across all implementations while supporting the educational mission of Estonian museums.

The articles contained herein are **immutable** and must be upheld by all development activities, including AI-assisted code generation, feature specifications, and architectural decisions.

---

## Article I: Vue 3 Composition API Mandate

### Section 1.1: Component Architecture

Every component in the ESMuseum application **MUST** use the Vue 3 Composition API with the `<script setup>` syntax pattern.

### Section 1.2: Legacy Pattern Prohibition

The Options API pattern is **PROHIBITED** for new development. Existing Options API components must be migrated to Composition API during refactoring cycles.

### Section 1.3: Reactivity Standards

- Use `ref()` for primitive reactive values
- Use `reactive()` for object/array reactive state
- Use `computed()` for derived state
- Use `watch()` and `watchEffect()` for side effects

### Section 1.4: Composable Integration

Components should leverage Vue composables for shared logic, following the `use*` naming convention.

---

## Article II: TypeScript-First Development

### Section 2.1: Type Safety Mandate

All application code **MUST** be written in TypeScript with strict type checking enabled.

### Section 2.2: Type Annotation Requirements

- No use of `any` type except in extraordinary circumstances with documented justification
- All function parameters and return types must be explicitly typed
- All component props must have comprehensive TypeScript interfaces
- All API responses must have defined TypeScript interfaces

### Section 2.3: Interface Standards

```typescript
// Component Props Interface Example
interface TaskDetailProps {
  task: TaskEntity;
  readonly?: boolean;
  showActions?: boolean;
}

// API Response Interface Example
interface EntuTaskResponse {
  _id: string;
  reference: string;
  title: LocalizedString;
  location?: LocationReference;
}
```

### Section 2.4: Type Import Organization

TypeScript types and interfaces must be imported separately from runtime imports, using the `type` keyword.

---

## Article III: Test-Driven Feature Development

### Section 3.1: Implementation Sequence (NON-NEGOTIABLE)

All feature development **MUST** follow this exact sequence:

1. **Specification Creation**: Complete feature specification with acceptance criteria
2. **Contract Definition**: API contracts and component interfaces defined
3. **Test Writing**: Comprehensive test suite written and validated
4. **Test Validation**: Tests confirmed to FAIL (Red phase)
5. **Implementation**: Code written to satisfy tests (Green phase)
6. **Refactoring**: Code optimization while maintaining test coverage (Refactor phase)

### Section 3.2: Test Coverage Requirements

- Unit tests for all composables and utility functions
- Component tests for all Vue components
- Integration tests for API interactions
- End-to-end tests for critical user workflows

### Section 3.3: Contract-First API Development

All API integrations must begin with contract definitions and contract tests before implementation.

---

## Article IV: i18n-First User Interface

### Section 4.1: Internationalization Mandate

All user-facing text **MUST** be internationalized using the @nuxtjs/i18n framework.

### Section 4.2: Supported Locales

- **Primary**: Estonian (`et`)
- **Secondary**: English (`en`)
- **Tertiary**: Ukrainian (`uk`) - for accessibility

### Section 4.3: Text Placement Standards

- Component-specific translations in `<i18n>` blocks
- Shared translations in locale files under `.config/locales/`
- No hardcoded user-facing strings in templates or logic

### Section 4.4: Translation Key Conventions

```javascript
// Hierarchical key structure
t("components.taskSidebar.title");
t("pages.dashboard.welcomeMessage");
t("errors.api.networkFailure");
```

---

## Article V: Entu API Integration Standards

### Section 5.1: Authentication Framework

All Entu API interactions **MUST** use the established OAuth 2.0 authentication flow with proper token management.

### Section 5.2: API Composable Pattern

Entu API interactions must be encapsulated in dedicated composables:

- `useEntuAuth()` for authentication management
- `useEntuApi()` for general API operations
- `useTaskDetail()`, `useLocation()` etc. for entity-specific operations

### Section 5.3: Error Handling Standards

```typescript
// Standardized error response handling
interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### Section 5.4: Request/Response Patterns

- All API calls must include proper error boundaries
- Loading states must be managed consistently
- Network failures must be handled gracefully with user feedback

---

## Article VI: Performance-First SPA Architecture

### Section 6.1: Single Page Application Configuration

The application **MUST** maintain its SPA architecture with `ssr: false` configuration for optimal mobile performance.

### Section 6.2: Code Splitting Requirements

- Route-based code splitting for all pages
- Component-based lazy loading for heavy components
- Dynamic imports for optional features

### Section 6.3: Bundle Optimization

- Tree-shaking enabled for all dependencies
- Dead code elimination in production builds
- Asset optimization and compression

### Section 6.4: Performance Monitoring

- Core Web Vitals compliance
- Mobile-first performance optimization
- Regular performance auditing and optimization

---

## Article VII: Component Modularity Principle

### Section 7.1: Single Responsibility Principle

Each component **MUST** have a single, well-defined responsibility and clear boundaries.

### Section 7.2: Component Size Limits

- Maximum 200 lines per component file
- Components exceeding limits must be refactored into smaller, focused components
- Complex components must be decomposed using the Task*/Feature* pattern

### Section 7.3: Reusability Standards

Components should be designed for reusability with:

- Clear prop interfaces
- Minimal external dependencies
- Flexible styling through Tailwind CSS classes
- Proper event emission patterns

### Section 7.4: Component Organization

```text
app/components/
├── shared/          # Reusable UI components
├── task/           # Task-specific components
├── map/            # Map-related components
└── layout/         # Layout and navigation components
```

---

## Article VIII: Documentation-Driven Development

### Section 8.1: Specification Precedence

All features **MUST** begin with comprehensive specifications that precede any implementation work.

### Section 8.2: Living Documentation Standards

- Feature specifications must be updated with implementation changes
- API documentation must reflect current implementation
- Component documentation must include usage examples

### Section 8.3: Documentation Structure

```text
.copilot-workspace/
├── features/       # F001+ feature specifications
├── templates/      # Reusable specification templates
└── workflows/      # Development process documentation

.copilot-docs/
├── development.md  # Technical standards
├── working-agreements.md # Team processes
└── decisions/      # Architectural Decision Records
```

### Section 8.4: Specification Quality Gates

All specifications must pass constitutional compliance validation before implementation begins.

---

## Article IX: Responsive Design Requirements

### Section 9.1: Mobile-First Development

All user interfaces **MUST** be designed and implemented with mobile-first responsive design principles.

### Section 9.2: Responsive Breakpoints

```css
/* Tailwind CSS responsive design system */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

### Section 9.3: Accessibility Standards

- WCAG 2.1 AA compliance
- Semantic HTML structure
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

### Section 9.4: Cross-Platform Compatibility

- iOS Safari optimization
- Android Chrome optimization
- Progressive Web App capabilities
- Touch-friendly interaction patterns

---

## Article X: Professional Documentation Standards

### Section 10.1: Documentation Quality Mandate

All project documentation **MUST** maintain professional presentation standards, ensuring clarity, accessibility, and long-term maintainability.

### Section 10.2: Icon and Emoji Usage Standards

**CONSTITUTIONAL REQUIREMENT**: Minimize decorative icons and emoji in professional documentation.

**Permitted Usage**:

- Status indicators for success/failure states (✅/❌ only)
- Essential symbols for mathematical notation and technical diagrams
- UI documentation when documenting actual interface elements containing icons

**Prohibited Usage**:

- Decorative emoji in headings (🚀, 🎯, 🏛️, etc.)
- Excessive visual embellishments that don't convey semantic meaning
- Cultural-specific icons that may not translate globally

### Section 10.3: Document Structure Requirements

**CONSTITUTIONAL REQUIREMENT**: Consistent, hierarchical document organization.

```markdown
# Document Title

## Major Sections

### Subsections

#### Detail Sections (if needed)

**Bold** for emphasis, _italic_ for technical terms
`code` for inline code, `blocks` for code samples
```

### Section 10.4: Accessibility Compliance

**CONSTITUTIONAL REQUIREMENT**: WCAG 2.1 AA compliance for all documentation.

- Semantic heading structure (no skipped levels)
- Alt text for all images and diagrams
- High contrast color schemes
- Screen reader friendly formatting
- Clear, descriptive link text

### Section 10.5: Technical Writing Excellence

**CONSTITUTIONAL REQUIREMENT**: Clear, concise, actionable technical writing.

- Active voice preferred over passive
- Specific, actionable instructions
- Consistent terminology throughout project
- Step-by-step procedures with expected outcomes
- Clear error messages and troubleshooting guidance

### Section 10.6: Version Control Integration

**CONSTITUTIONAL REQUIREMENT**: Documentation versioning aligned with code changes.

- Documentation changes committed with related code changes
- Breaking changes require documentation updates
- API documentation generated from code comments
- Change logs maintained for documentation updates

---

## Constitutional Enforcement

### Compliance Validation

Every feature specification must include a constitutional compliance checklist validating adherence to all nine articles.

### Amendment Process

Modifications to this constitution require:

- Explicit documentation of rationale for change
- Review and approval by project maintainers
- Backwards compatibility assessment
- Migration strategy for affected code

### Violation Handling

Code that violates constitutional principles must be:

- Identified during code review
- Documented as technical debt if temporarily accepted
- Scheduled for remediation in the next refactoring cycle

---

## Implementation Guidelines

### Phase Gates

Before any implementation begins, the following gates must be satisfied:

#### Constitutional Compliance Gate

- [ ] All nine articles reviewed for applicability
- [ ] Specification includes constitutional compliance checklist
- [ ] No constitutional violations identified

#### Quality Assurance Gate

- [ ] TypeScript interfaces defined for all entities
- [ ] Test strategy documented and validated
- [ ] Performance impact assessed

#### Documentation Gate

- [ ] Feature specification complete and unambiguous
- [ ] API contracts defined where applicable
- [ ] User interface mockups reviewed

### Continuous Validation

Constitutional compliance is validated through:

- Automated linting rules where possible
- Code review constitutional compliance checklist
- Regular architectural review sessions

---

**Authority**: This constitution governs all development activities within the ESMuseum Map Application project.

**Effectiveness**: This document becomes effective immediately upon adoption and supersedes all previous architectural guidelines.

**Revision History**:

- **v1.0** (September 19, 2025): Initial constitutional framework established
- **v1.1** (September 19, 2025): Article X: Professional Documentation Standards added (CAP-001)

---

_"Through constitutional discipline, we achieve architectural excellence while serving the educational mission of Estonian museums."_
