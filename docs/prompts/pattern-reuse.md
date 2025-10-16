# Pattern-Based Feature Addition

**Purpose**: Add a feature to a new location by reusing an existing implementation pattern from the codebase

**Target AI**: GitHub Copilot (model-agnostic, works with GPT-4 and Claude backends)

**Use Case**: When you need to add a feature that already exists elsewhere in the codebase (e.g., "add sponsors logo to onboarding page, we already have this on login page")

---

## The Prompt

You are an expert developer working on the ES Museum Map App, a Vue 3/Nuxt TypeScript project with strict constitutional principles.

Your task is to add a feature to a new location by reusing an existing implementation pattern from the codebase.

**User Request**:

[Describe what you want to add and where the existing pattern is located]

Example: "Add sponsors logo to onboarding page. We already have this on the login page."

---

## Workflow

### Phase 1: Locate Existing Pattern

1. **Identify source location** from user description
   - Search for relevant files (components, pages, composables)
   - Use file search or grep to find implementation

2. **Read the source implementation**
   - Read the entire component/page file
   - Identify related composables or utilities
   - Note any imported dependencies

3. **Document what you found**
   - List all files involved in the pattern
   - Describe the pattern briefly (e.g., "Logo component rendered in header with conditional styling")

### Phase 2: Analyze Pattern Structure

1. **Extract the pattern components**:
   - **UI Layer**: Which component(s) render the feature?
   - **Logic Layer**: Is there a composable handling state/behavior?
   - **Type Layer**: What TypeScript types/interfaces are used?
   - **Style Layer**: Are there custom styles or Tailwind classes?
   - **Test Layer**: Are there tests for this pattern?

2. **Identify dependencies**:
   - Imported components (e.g., `<SponsorsLogo />`)
   - Composables (e.g., `useSponsors()`)
   - Constants or configuration
   - External libraries (Naive UI, Leaflet, etc.)

3. **Check constitutional compliance** of source pattern:
   - **Type Safety**: Any `any` types? Proper TypeScript usage?
   - **Composable-First**: Is logic in a reusable composable?
   - **Test Coverage**: Does the pattern have tests?
   - **Observable**: Are there logs or error boundaries?

   **If source pattern violates constitution**: Note the violation and plan to fix during adaptation.

### Phase 3: Locate Target Location

1. **Find target file(s)**:
   - Identify the page/component where feature should be added
   - Read the target file to understand its structure
   - Note existing patterns in the target (layout, imports, structure)

2. **Determine integration point**:
   - Where in the target file should the feature be added?
   - What existing code will it sit near?
   - Will it need conditional rendering or special positioning?

3. **Check for conflicts**:
   - Is there already similar functionality?
   - Will naming conflict with existing imports?
   - Are there style conflicts to resolve?

### Phase 4: Adapt Pattern to Target

1. **Copy pattern structure** (don't reinvent):
   - Use the same component imports
   - Use the same composable calls
   - Use the same props/options structure
   - Maintain the same TypeScript types

2. **Make minimal adjustments**:
   - Adapt to target file's context (e.g., different layout structure)
   - Adjust positioning or styling if needed for target location
   - Update any location-specific logic (conditional rendering based on route, etc.)

3. **Ensure constitutional compliance**:
   - **Type Safety**: Maintain or improve type safety (no new `any` types)
   - **Composable-First**: If adding logic, use existing composables or create new ones
   - **Observable**: Add structured logging if user-facing behavior changes
   - **Pragmatic Simplicity**: Keep changes minimal, don't over-engineer

4. **Fix any source violations** you noted in Phase 2:
   - If source had `any` types, use proper types in adaptation
   - If source lacked composable, extract logic to composable
   - Document improvements made

### Phase 5: Verify Tests

1. **Check if source pattern has tests**:
   - Look in `tests/` directory for corresponding test files
   - Note test patterns (unit tests for composables, component tests, etc.)

2. **Add tests for adapted pattern** (if source has tests):
   - Copy test structure from source
   - Adapt to target location
   - Ensure tests cover new integration point

3. **Run tests**:
   - Run `npm test` or `npm run test:unit`
   - Verify all tests pass
   - If tests fail, debug and fix

### Phase 6: Constitutional Validation

Before presenting final changes, verify:

1. **Type Safety First** (`.specify/memory/constitution.md` Principle I):
   - No new `any` types without documented justification
   - All TypeScript types properly defined
   - Type guards used over type casts

2. **Composable-First** (Principle II):
   - Logic extracted to composables (if applicable)
   - Composables independently testable
   - Clear single responsibility

3. **Test-First** (Principle III):
   - Tests added for new integration (if source pattern has tests)
   - All tests passing
   - Coverage maintained or improved

4. **Observable Development** (Principle IV):
   - Structured logging added if user-facing behavior changes
   - Error boundaries in place for API calls or user input

5. **Pragmatic Simplicity** (Principle V):
   - Changes are minimal and focused
   - No unnecessary complexity added
   - Existing patterns reused rather than reimplemented

### Phase 7: Present Changes

1. **Summarize what was done**:
   - "Added [feature] to [target] by adapting pattern from [source]"
   - List all files modified
   - Note any improvements made to source pattern

2. **Show the changes**:
   - Use `replace_string_in_file` tool to make edits (don't show code blocks)
   - Include context (3-5 lines before/after) for clarity
   - Make one logical change at a time

3. **Verify and report**:
   - "Tests passing: [yes/no]"
   - "Constitutional compliance: [verified]"
   - "Files modified: [list]"

---

## Markdown Formatting Requirements

When generating any markdown output (documentation, reports, summaries):

- Add blank line before and after each heading
- Add blank line before and after each list (bullet or numbered)
- Add blank line before and after each code block
- Remove trailing spaces from all lines
- Avoid inline HTML unless necessary

Before presenting final output:

- Review for proper spacing around lists, headings, and code blocks
- Remove trailing whitespace
- Ensure consistent markdown syntax

**Emoji Usage**:

- **Avoid emojis** in commit messages, code comments, console logs, and formal documentation
- Use clear text prefixes instead: `[ERROR]`, `[INFO]`, `[WARNING]`, `[FIX]`, `[FEATURE]`
- Exception: Emojis acceptable in user-facing UI text or casual documentation

---

## Constitutional Compliance

**CRITICAL**: This project has a constitution file at `.specify/memory/constitution.md`.

All code changes MUST comply with:

- **Type Safety First** (Principle I): No `any` without justification, proper TypeScript usage
- **Composable-First Development** (Principle II): Logic in composables, single responsibility
- **Test-First Development** (Principle III): Tests before implementation, maintain coverage
- **Observable Development** (Principle IV): Structured logging, error boundaries
- **Pragmatic Simplicity** (Principle V): YAGNI, optimize after measuring

Before finalizing output:

- Read `.specify/memory/constitution.md` to understand principles
- Check if constitutional principles apply to this task (code changes = YES)
- Verify output aligns with documented standards
- Flag any deviations with justification
- Reference specific constitutional sections when relevant

**RECURSIVE REQUIREMENT**: If this prompt generates other prompts that affect code or architecture, those prompts MUST also include this constitutional compliance requirement, ensuring governance standards propagate through all levels.

---

## Example Usage

### Example 1: Add Sponsors Logo

**You provide**:

```text
Add sponsors logo to onboarding page. We already have this on the login page.
```

**AI workflow**:

1. **Locate**: Find login page (`pages/login.vue`)
2. **Analyze**:
   - Uses `<SponsorsLogo />` component
   - Imported from `~/components/SponsorsLogo.vue`
   - Rendered in header section with Tailwind classes
   - No composable logic needed (stateless component)
3. **Target**: Find onboarding page (`pages/onboarding.vue`)
4. **Adapt**:
   - Add same import to onboarding page
   - Add `<SponsorsLogo />` in similar header position
   - Use same Tailwind classes for consistency
5. **Verify**: No tests for logo component (visual component), constitutional check passes
6. **Present**: Use `replace_string_in_file` to add import and component

### Example 2: Add Form Validation

**You provide**:

```text
Add email validation to registration form. We have this on the contact form already.
```

**AI workflow**:

1. **Locate**: Find contact form (`components/ContactForm.vue`)
2. **Analyze**:
   - Uses `useFormValidation` composable
   - Calls `validateEmail()` utility
   - Shows error messages with Naive UI `n-form-item`
   - Has unit tests in `tests/composables/useFormValidation.test.ts`
3. **Target**: Find registration form (`components/RegistrationForm.vue`)
4. **Adapt**:
   - Import `useFormValidation` composable
   - Call `validateEmail()` on email field
   - Add error message display
   - Maintain TypeScript types from composable
5. **Verify**: Copy test pattern, adapt to registration context, run tests
6. **Present**: Edit form component, show test addition

---

## Tips for Best Results

- **Be specific about locations**: "We have this on the login page" → Search for `pages/login.vue`
- **Review the pattern first**: Don't blindly copy, understand what it does
- **Keep changes minimal**: If source pattern has extra features you don't need, leave them out
- **Trust existing patterns**: If the source works well, the structure is probably good
- **Fix violations during adaptation**: If source pattern violates constitution, improve it in the adaptation
- **Use file paths**: Refer to specific files (`pages/onboarding.vue`) rather than vague descriptions
- **Check tests**: If source has tests, adapted version should too
- **Constitutional gate at the end**: Always validate against `.specify/memory/constitution.md` before presenting

---

## Important Notes

- **This is for similar features only**: If the feature requires significant new logic or architecture, use `/speckit-specify` and `/speckit-implement` instead
- **Source pattern quality matters**: If the existing pattern is poorly implemented, note the issues and improve during adaptation
- **Don't over-engineer**: If the pattern is simple (e.g., just a component import), don't add unnecessary complexity
- **Recursive propagation**: If you generate another prompt as part of this workflow, ensure it includes constitutional compliance and markdown linting requirements

---

**Version**: 1.0.0 | **Created**: 2025-10-16 | **For**: ES Museum Map App
