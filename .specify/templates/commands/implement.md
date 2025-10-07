---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md (Vue 3 + Nuxt 3 aware)
scripts:
  sh: scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
  ps: scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
---

# Implement

⚠️ **SAFETY NOTICE**: This command generates code autonomously. Always review output before committing. See `.specify/IMPLEMENT_REVIEW.md` for safety guidelines.

The user input can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

**CRITICAL SAFETY CHECK**: Before execution, the user MUST acknowledge risks by confirming one of:

- "Execute all tasks" - Full automation (review required after)
- "Execute tasks T001-T005" - Partial automation (specify range)
- "Execute safe tasks only" - Skip tasks marked with ⚠️ in tasks.md

If no confirmation provided, output safety summary from IMPLEMENT_REVIEW.md and request explicit confirmation.

1. Run `{SCRIPT}` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute.

2. Load and analyze the implementation context:

   - **REQUIRED**: Read tasks.md for the complete task list and execution plan
   - **REQUIRED**: Read plan.md for tech stack, architecture, and file structure
   - **REQUIRED**: Read `.specify/memory/constitution.md` for project principles
   - **IF EXISTS**: Read data-model.md for component/composable structure
   - **IF EXISTS**: Read contracts/ for TypeScript interface specifications
   - **IF EXISTS**: Read research.md for technical decisions and Vue/Nuxt patterns
   - **IF EXISTS**: Read quickstart.md for integration test scenarios

3. **RISK ASSESSMENT** (Vue 3 + Nuxt 3 context):

   - Scan tasks.md for high-risk patterns and flag them:

     - ⚠️ Tasks modifying `useEntuAuth`, `useEntuOAuth`, `useServerAuth` (auth logic)
     - ⚠️ Tasks modifying `useLocation`, `useEntuApi`, `useTaskWorkspace` (shared composables)
     - ⚠️ Tasks modifying `InteractiveMap.vue`, `leaflet.client.js` (Leaflet memory management)
     - ⚠️ Tasks in `server/api/` or `middleware/auth.ts` (server-side security)
     - ⚠️ Tasks involving database/localStorage/IndexedDB operations (data integrity)

   - If high-risk tasks detected:
     - PAUSE and report flagged tasks with risk rationale
     - Request explicit user override: "Proceed with risky tasks" or "Skip risky tasks"
     - If user skips: Mark risky tasks as `[ ]⚠️ MANUAL` in tasks.md and continue with safe tasks only
     - If user proceeds: Add warning comments in generated code: `// ⚠️ AI-GENERATED - REVIEW CAREFULLY`

4. Parse tasks.md structure and extract:

   - **Task phases**: Setup, Tests, Core, Integration, Polish
   - **Task dependencies**: Sequential vs parallel execution rules
   - **Task details**: ID, description, file paths, parallel markers [P]
   - **Execution flow**: Order and dependency requirements
   - **Risk markers**: Flag tasks marked with ⚠️ or #MANUAL comments

5. Execute implementation following the task plan:

   - **Phase-by-phase execution**: Complete each phase before moving to the next
   - **Respect dependencies**: Run sequential tasks in order, parallel tasks [P] can run together
   - **Follow TDD approach**: Execute test tasks before their corresponding implementation tasks
   - **File-based coordination**: Tasks affecting the same files must run sequentially
   - **Validation checkpoints**: Verify each phase completion before proceeding
   - **Skip manual tasks**: Tasks marked `⚠️ MANUAL` or commented out in tasks.md

6. **Vue 3 + Nuxt 3 Implementation Standards**:

   **Component Creation** (\*.vue files):

   ```vue
   <template>
     <!-- Accessibility: Always include aria-labels for interactive elements -->
     <!-- Responsive: Use Tailwind breakpoints (sm:, md:, lg:) -->
     <!-- Naive UI: Use n-* components from design system -->
   </template>

   <script setup lang="ts">
   // ✅ TypeScript strict mode - explicit types for all props/emits
   // ✅ Composition API - use composables, no Options API
   // ✅ Auto-imports - rely on Nuxt auto-import (components, composables, utils)

   interface Props {
     // Explicit prop types
   }

   const props = defineProps<Props>();
   const emit = defineEmits<{
     eventName: [payload: Type];
   }>();

   // Reactivity: Prefer ref() for primitives, reactive() for objects
   const count = ref(0);
   const state = reactive({ data: [] });

   // Lifecycle: Cleanup in onUnmounted for memory management
   onMounted(() => {
     // Setup
   });

   onUnmounted(() => {
     // ⚠️ CRITICAL: Always cleanup (Leaflet maps, intervals, listeners)
   });
   </script>

   <style scoped>
   /* Prefer Tailwind utility classes over custom CSS */
   /* Scoped styles for component-specific overrides only */
   </style>
   ```

   **Composable Creation** (\*.ts files):

   ```typescript
   // ✅ Naming: use* prefix (useFeature, useTaskDetail)
   // ✅ Return object with reactive state + methods
   // ✅ Type all return values explicitly

   export function useFeature() {
     const state = ref<Type>(initialValue);

     const method = async () => {
       // Implementation
     };

     // Cleanup if needed
     onUnmounted(() => {
       // Cleanup logic
     });

     return {
       state,
       method,
     };
   }
   ```

   **Test Creation** (\*.spec.ts files):

   ```typescript
   import { mount } from "@vue/test-utils";
   import { describe, it, expect, beforeEach } from "vitest";

   describe("ComponentName", () => {
     it("should render with props", () => {
       const wrapper = mount(ComponentName, {
         props: {
           /* props */
         },
       });

       // ⚠️ AVOID SHALLOW TESTS - test behavior, not existence
       expect(wrapper.text()).toContain("expected text");
       expect(wrapper.find("button").exists()).toBe(true);
     });

     it("should emit events on interaction", async () => {
       const wrapper = mount(ComponentName);
       await wrapper.find("button").trigger("click");
       expect(wrapper.emitted()).toHaveProperty("eventName");
     });
   });
   ```

   **Type Definitions** (types/\*.ts):

   ```typescript
   // ✅ Explicit interfaces, no 'any' types
   // ✅ Use union types for state (type-safe enums)

   export interface Feature {
     id: string;
     status: "idle" | "loading" | "success" | "error";
     data?: DataType;
   }
   ```

7. Implementation execution rules:

   - **Setup first**: Install dependencies (npm install), update tsconfig if needed
   - **Tests before code**: Create failing tests (TDD), then implementation to pass
   - **Core development**:
     - Types first (types/\*.ts)
     - Composables next (app/composables/\*.ts)
     - Components after (app/components/\*.vue)
     - Pages last (app/pages/\*.vue)
   - **Integration work**: Server routes (server/api/), middleware, plugins
   - **Polish and validation**: Accessibility, responsive design, documentation

8. **Quality Checks** (Execute after EACH task):

   **TypeScript Validation**:

   - Verify no `any` types used (strict mode requirement)
   - Ensure all props/emits have explicit types
   - Check computed/ref return types are inferred correctly

   **Vue/Nuxt Patterns**:

   - Components use `<script setup lang="ts">` (not Options API)
   - Composables follow `use*` naming convention
   - No direct DOM manipulation (use template refs if needed)
   - Lifecycle hooks used correctly (setup, onMounted, onUnmounted)

   **Reactivity Validation**:

   - No `ref` inside `reactive` objects
   - Computed properties have no side effects
   - `watch` used appropriately (not overused)

   **Memory Management**:

   - Leaflet maps cleaned up in onUnmounted
   - Event listeners removed in cleanup
   - Intervals/timeouts cleared
   - No circular references in reactive state

   **Accessibility**:

   - Interactive elements have aria-labels
   - Keyboard navigation works (tab, enter, escape)
   - Color contrast meets WCAG AA standards (if applicable)

   **Constitution Compliance**:

   - Check against `.specify/memory/constitution.md` principles
   - Ensure test coverage (Principle 2: Test-Driven Discipline)
   - Validate documentation exists (Principle 3: Living Documentation)

9. **Optimization Opportunity Logging** (Constitution Principle V):

   During implementation, if you notice optimization opportunities or suspicious patterns:

   - **DON'T** stop to fix them immediately
   - **DO** log them in `.specify/memory/opportunities.md`:

     ```markdown
     ## [YYYY-MM-DD] Optimization Opportunity: Brief Title

     **Context**: Discovered during implementation of [Feature Name]

     **Observation**: Describe what you noticed (e.g., duplicate code, inefficient pattern, missing abstraction)

     **Potential Impact**: Performance, maintainability, code duplication, etc.

     **Suggested Action**: What could be done to improve

     **Priority**: Low/Medium/High (based on impact)
     ```

   - Continue with current task implementation
   - User will review opportunities regularly and prioritize deliberately

   Examples to log:

   - Duplicate composable logic across components
   - Inefficient data fetching patterns
   - Missing TypeScript types (spreading `any`)
   - Potential performance bottlenecks (unnecessary re-renders, large computed values)
   - Code that violates constitution principles (log for future refactor)

10. Progress tracking and error handling:

    - Report progress after each completed task (T001 ✅, T002 ✅, etc.)
    - Halt execution if any non-parallel task fails
    - For parallel tasks [P], continue with successful tasks, report failed ones
    - Provide clear error messages with context for debugging
    - Suggest next steps if implementation cannot proceed
    - **IMPORTANT**: Mark completed tasks with [X] in tasks.md: `- [X] T001: Task description`
    - **IMPORTANT**: Add warning marker for risky tasks: `- [ ]⚠️ T005: Update useEntuAuth (MANUAL REVIEW REQUIRED)`

11. **Completion validation and handoff**:

    **Automated Checks** (run if possible):

    - TypeScript: `npm run type-check` or verify no tsc errors
    - Linting: `npm run lint` or verify no ESLint errors
    - Tests: `npm run test` or verify Vitest passes

    **Manual Review Checklist** (output for user):

    ```markdown
    ## Implementation Complete - Review Required

    ### Tasks Executed:

    - [x] T001: Create types/feature.ts
    - [x] T002: Create tests/component/Feature.spec.ts
    - [x] T003: Create app/components/Feature.vue
    - [ ]⚠️ T004: Update useLocation.ts (MANUAL - shared composable)

    ### Files Created/Modified:

    - types/feature.ts (new, 45 lines)
    - tests/component/Feature.spec.ts (new, 78 lines)
    - app/components/Feature.vue (new, 120 lines)

    ### Quality Gates:

    - [ ] Code review (`git diff`)
    - [ ] TypeScript validation (`npm run type-check`)
    - [ ] Linting (`npm run lint`)
    - [ ] Tests pass (`npm run test`)
    - [ ] Manual browser testing
    - [ ] Accessibility audit (keyboard nav, aria-labels)
    - [ ] Responsive design check (mobile, tablet, desktop)
    - [ ] Constitution compliance (`/analyze`)

    ### High-Risk Areas (Extra Scrutiny):

    - None in this implementation ✅

    ### Next Steps:

    1. Review all generated code carefully
    2. Complete manual tasks (T004)
    3. Run quality gates
    4. Test in browser
    5. Run `/analyze` to validate consistency
    6. Commit if all checks pass
    ```

12. **Error Recovery Guidance**:

If implementation fails:

- Report exact task ID that failed (e.g., "T005 failed")
- Include error message and stack trace
- Suggest fixes:
  - TypeScript errors → Check types in contracts/
  - Test failures → Review test assertions
  - Import errors → Verify auto-import paths
  - Reactivity issues → Check ref/reactive usage
- Offer to:
  - Fix and retry failed task only
  - Skip failed task and continue
  - Abort and request manual intervention

Note: This command assumes a complete task breakdown exists in tasks.md. If tasks are incomplete or missing, suggest running `/tasks` first to regenerate the task list.

**FINAL REMINDER**: AI-generated code requires human review. Treat output as first draft, not production-ready code. See `.specify/IMPLEMENT_REVIEW.md` for detailed safety guidelines.
