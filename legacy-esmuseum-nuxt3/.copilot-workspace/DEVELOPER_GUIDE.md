# ESMuseum Enhanced Workflow Developer Guide

**F017 Phase 2: Enhanced Workflow Implementation**  
**Constitutional Authority**: ESMuseum Development Team  
**Last Updated**: 2025-09-19

---

## Overview

Welcome to the ESMuseum Enhanced Spec-Driven Development workflow! This guide will help you master our constitutional development practices and leverage the enhanced automation tools to build high-quality, compliant features.

### What You'll Learn

- **Constitutional Framework**: Understanding all 9 architectural principles
- **Workflow Automation**: Using `/specify`, `/plan`, `/tasks` commands
- **Quality Gates**: Ensuring compliance at every development phase
- **Development Tools**: VSCode configuration and automation
- **Continuous Integration**: Git hooks and CI/CD compliance

---

## Quick Start

### 1. Initial Setup

```bash
# Clone and setup the project
git clone <repository-url>
cd esmuseum-map-app
npm install

# Setup constitutional compliance
npm run setup:constitutional
```

### 2. Create Your First Feature

```bash
# Start with a feature specification
npm run specify "Enhanced User Dashboard"

# Plan the technical implementation
npm run plan 18

# Break down into actionable tasks
npm run tasks 18

# Begin implementation with constitutional compliance
npm run dev
```

### 3. Validate Compliance

```bash
# Run full constitutional validation
npm run validate:all

# Check specific compliance areas
npm run validate:constitutional
npm run validate:typescript
npm run validate:coverage
```

---

## Constitutional Framework

ESMuseum development is governed by **9 Constitutional Articles** that ensure code quality, maintainability, and user experience excellence.

### Article I: Vue 3 Composition API Mandate

**Principle**: All Vue components must use the Composition API with `<script setup>` syntax.

**Implementation**:

```vue
<script setup lang="ts">
// ✅ Constitutional compliance
import { ref, computed } from "vue";

interface Props {
  title: string;
}

const props = defineProps<Props>();
const count = ref(0);
const doubleCount = computed(() => count.value * 2);
</script>
```

**Validation**: ESLint rules enforce Composition API patterns

### Article II: TypeScript-First Development

**Principle**: All code must be TypeScript with explicit type definitions, no `any` types without justification.

**Implementation**:

```typescript
// ✅ Constitutional compliance
interface TaskData {
  id: string;
  title: string;
  status: "pending" | "completed";
  score?: number;
}

const useTaskManagement = (): TaskManagementReturn => {
  const tasks = ref<TaskData[]>([]);

  const addTask = (task: TaskData): void => {
    tasks.value.push(task);
  };

  return { tasks: readonly(tasks), addTask };
};
```

**Validation**: TypeScript compiler strict mode, ESLint type rules

### Article III: Test-Driven Feature Development

**Principle**: Contract → Integration → E2E → Unit → Implementation sequence.

**Implementation**:

```typescript
// 1. Contract Test (first)
describe("TaskManager Contract", () => {
  it("should satisfy TaskManager interface", () => {
    const manager: TaskManager = createTaskManager();
    expect(typeof manager.addTask).toBe("function");
    expect(typeof manager.getTasks).toBe("function");
  });
});

// 2. Implementation (after tests)
export const createTaskManager = (): TaskManager => {
  // Implementation to satisfy contract
};
```

**Validation**: Test coverage requirements, test-first sequence verification

### Article IV: i18n-First User Interface

**Principle**: All user-facing text must be internationalized for Estonian, English, and Ukrainian.

**Implementation**:

```vue
<template>
  <!-- ✅ Constitutional compliance -->
  <h1>{{ $t("tasks.title") }}</h1>
  <button>{{ $t("common.save") }}</button>

  <!-- ❌ Constitutional violation -->
  <!-- <h1>Task List</h1> -->
</template>
```

**Validation**: ESLint rules detect hardcoded strings, i18n pattern checking

### Article V: Entu API Integration Standards

**Principle**: All API interactions must use standardized Entu API patterns with proper authentication.

**Implementation**:

```typescript
// ✅ Constitutional compliance
const { callApi } = useEntuApi();

const fetchTasks = async (): Promise<Task[]> => {
  return await callApi<Task[]>({
    method: "GET",
    url: "/tasks",
    requiresAuth: true,
  });
};
```

**Validation**: API pattern compliance, authentication validation

### Article VI: Performance-First SPA Architecture

**Principle**: Maintain excellent Core Web Vitals, optimize bundle size, use lazy loading.

**Implementation**:

```typescript
// ✅ Constitutional compliance - lazy loading
const TaskDetail = defineAsyncComponent(() => import("./TaskDetail.vue"));

// ✅ Bundle optimization
const heavyLibrary = await import("heavy-library");

// ✅ Computed optimization
const expensiveComputation = computed(() => {
  return heavyCalculation(props.data);
});
```

**Validation**: Bundle size monitoring, performance budgets, lazy loading patterns

### Article VII: Component Modularity Principle

**Principle**: Components ≤200 lines, single responsibility, clear interfaces.

**Implementation**:

```vue
<!-- ✅ Constitutional compliance - focused component -->
<script setup lang="ts">
// TaskHeader.vue - Single responsibility: task header display
interface Props {
  task: Task;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  edit: [task: Task];
  delete: [taskId: string];
}>();
</script>
```

**Validation**: ESLint line count rules, component size monitoring

### Article VIII: Documentation-Driven Development

**Principle**: Comprehensive documentation for all components, APIs, and architectural decisions.

**Implementation**:

````typescript
/**
 * Task management composable following constitutional compliance
 *
 * @description Provides reactive task state management with CRUD operations
 * @constitutional Article I (Composition API), Article II (TypeScript)
 * @param initialTasks - Optional initial task list
 * @returns Task management interface with reactive state
 *
 * @example
 * ```typescript
 * const { tasks, addTask } = useTaskManagement()
 * addTask({ id: '1', title: 'Learn Vue 3', status: 'pending' })
 * ```
 */
export const useTaskManagement = (initialTasks?: Task[]) => {
  // Implementation
};
````

**Validation**: JSDoc presence, documentation completeness checks

### Article IX: Responsive Design Requirements

**Principle**: Mobile-first, WCAG 2.1 AA accessibility, cross-platform compatibility.

**Implementation**:

```vue
<template>
  <!-- ✅ Constitutional compliance -->
  <div class="w-full max-w-md mx-auto sm:max-w-lg lg:max-w-2xl">
    <button
      :aria-label="$t('tasks.add.ariaLabel')"
      class="px-4 py-2 text-sm md:text-base lg:text-lg"
      @click="addTask"
    >
      {{ $t("tasks.add.button") }}
    </button>
  </div>
</template>
```

**Validation**: Responsive pattern detection, accessibility audit, cross-platform testing

---

## Enhanced Workflow Commands

### Specification Phase (`/specify`)

**Command**: `npm run specify "Feature Name"`

**Purpose**: Create comprehensive feature specifications with constitutional compliance.

**Process**:

1. **Initialize**: Creates `F###-feature-name.md` specification
2. **Template**: Pre-filled with constitutional compliance sections
3. **Validation**: Quality gates ensure completeness

**Example**:

```bash
npm run specify "Enhanced Task Scoring"
# Creates: .copilot-workspace/features/F018-enhanced-task-scoring.md

# Complete the specification, then validate:
npm run gate:specify 18
```

**Quality Gates**:

- No `[NEEDS CLARIFICATION]` markers
- All constitutional articles addressed
- Business value clearly documented
- Acceptance criteria defined

### Planning Phase (`/plan`)

**Command**: `npm run plan <feature-number>`

**Purpose**: Generate detailed technical implementation plans with architecture review.

**Process**:

1. **Validation**: Confirms specification quality gates passed
2. **Architecture**: Component structure and API design
3. **Compliance**: Constitutional article alignment review
4. **Strategy**: Implementation roadmap and risk assessment

**Example**:

```bash
npm run plan 18
# Validates F018 specification and guides planning

# Complete planning, then validate:
npm run gate:plan 18
```

**Quality Gates**:

- Technical architecture documented
- Constitutional compliance reviewed
- Implementation roadmap created
- Risk mitigation planned

### Task Breakdown Phase (`/tasks`)

**Command**: `npm run tasks <feature-number>`

**Purpose**: Transform technical plans into actionable development tasks.

**Process**:

1. **Validation**: Confirms planning quality gates passed
2. **Sequence**: Contract → Integration → E2E → Unit → Implementation
3. **Parallelization**: Independent task identification
4. **Coverage**: Constitutional compliance task inclusion

**Example**:

```bash
npm run tasks 18
# Validates F018 planning and guides task breakdown

# Complete task breakdown, then validate:
npm run gate:tasks 18
```

**Quality Gates**:

- Test-first sequence planned
- Constitutional coverage complete
- Parallelization opportunities identified
- Quality assurance tasks included

---

## Quality Gate System

Our quality gate system ensures constitutional compliance at every phase of development.

### Gate Validation Commands

```bash
# Individual phase gates
npm run gate:specify 18    # Specification completeness
npm run gate:plan 18       # Technical planning validation
npm run gate:tasks 18      # Task breakdown verification

# Constitutional compliance validation
npm run validate:constitutional  # Pattern compliance
npm run validate:typescript     # Type safety
npm run validate:coverage       # Test coverage
npm run validate:eslint        # Code quality
npm run validate:all           # Comprehensive validation
```

### Continuous Validation

**Git Hooks** (automatically installed):

- **Pre-commit**: Constitutional compliance before commit
- **Commit-msg**: Message format and constitutional references
- **Post-commit**: Compliance feedback and recommendations

**CI/CD Pipeline**:

- Full constitutional article validation
- Performance and accessibility compliance
- Feature specification quality gates
- Production readiness verification

---

## Development Environment

### VSCode Configuration

Our enhanced VSCode setup provides optimal constitutional development support:

**Extensions** (automatically recommended):

- Vue 3 and TypeScript support
- Test-driven development tools
- i18n and accessibility validation
- Performance monitoring
- Constitutional pattern highlighting

**Settings** (automatically configured):

- Constitutional compliance linting
- TypeScript strict mode
- Test coverage visualization
- Bundle size monitoring
- Accessibility checking

**Tasks** (readily available):

- `Ctrl+Shift+P` → "Run Task" → "Specify: Create Feature Specification"
- `Ctrl+Shift+P` → "Run Task" → "Constitutional Compliance Check"
- `Ctrl+Shift+P` → "Run Task" → "Test: Coverage Report"

### Code Snippets

Use constitutional compliance snippets for rapid development:

- `const-component` → Constitutional Vue component template
- `const-composable` → Composition API composable pattern
- `const-interface` → TypeScript interface with documentation
- `const-test-contract` → Contract test template
- `const-api` → Entu API integration pattern

---

## Training Exercises

### Exercise 1: Your First Constitutional Feature

**Objective**: Create a complete feature following all constitutional articles.

**Task**: Implement "Task Priority Indicators"

**Steps**:

1. **Specify**: `npm run specify "Task Priority Indicators"`
2. **Plan**: Complete technical architecture
3. **Tasks**: Break down implementation
4. **Implement**: Follow test-first development
5. **Validate**: Ensure full constitutional compliance

**Expected Learning**:

- Constitutional article application
- Quality gate validation
- Test-driven development flow
- Component modularity principles

### Exercise 2: Constitutional Refactoring

**Objective**: Refactor existing code to meet constitutional standards.

**Task**: Take any existing component and make it constitutional.

**Focus Areas**:

- Convert to Composition API (Article I)
- Add TypeScript interfaces (Article II)
- Implement contract tests (Article III)
- Internationalize user text (Article IV)
- Optimize performance (Article VI)
- Ensure modularity (Article VII)
- Add documentation (Article VIII)
- Improve accessibility (Article IX)

### Exercise 3: Quality Gate Debugging

**Objective**: Understand and resolve quality gate failures.

**Task**: Intentionally create violations and fix them.

**Practice Scenarios**:

- Specification with `[NEEDS CLARIFICATION]` markers
- Components exceeding 200 lines
- Missing TypeScript interfaces
- Hardcoded user-facing strings
- Test coverage below thresholds

---

## Troubleshooting

### Common Issues

**"Quality gates not satisfied"**

- Run the specific gate: `npm run gate:specify 18`
- Review the failing checks in the output
- Address each violation systematically
- Re-run validation to confirm fixes

**"Constitutional compliance violations"**

- Run full validation: `npm run validate:all`
- Focus on specific articles: `npm run validate:constitutional`
- Use ESLint to fix code issues: `npm run lint`
- Review constitutional framework: `memory/esmuseum-constitution.md`

**"TypeScript compilation errors"**

- Run type checking: `npm run validate:typescript`
- Add missing interfaces and type definitions
- Remove or justify any `any` types
- Ensure strict TypeScript compliance

**"Test failures blocking development"**

- Run test suite: `npm run test`
- Follow test-driven development sequence
- Implement contract tests before code
- Maintain test coverage requirements

### Getting Help

**Documentation Resources**:

- Constitutional Framework: `memory/esmuseum-constitution.md`
- Workflow Guides: `.copilot-workspace/workflows/`
- Template Examples: `.copilot-workspace/templates/`
- Quality Gates: `.copilot-workspace/templates/constitutional-compliance-checklist.md`

**Command Reference**:

- `npm run workflow` - Show all available commands
- `npm run validate:all` - Comprehensive validation
- `npm run --list` - All npm scripts

**VSCode Integration**:

- Use Command Palette (`Ctrl+Shift+P`) for workflow tasks
- Check Problems panel for constitutional violations
- Use integrated terminal for command execution

---

## Advanced Topics

### Custom Quality Gates

You can extend quality gates for project-specific requirements:

```javascript
// scripts/custom-quality-gates.js
const customValidation = (content) => {
  // Your custom validation logic
  return {
    passed: true,
    score: 100,
    details: "Custom validation passed",
    violations: [],
  };
};
```

### Constitutional Pattern Extensions

Add new constitutional patterns for emerging requirements:

```javascript
// .config/constitutional-patterns.js
export const customPatterns = {
  newArticle: {
    name: "Custom Compliance Rule",
    patterns: [
      { pattern: /customPattern/, description: "Uses custom pattern" },
    ],
  },
};
```

### Workflow Automation Integration

Integrate with external tools and workflows:

```bash
# Jenkins pipeline
npm run validate:all && npm run build

# GitHub Actions
- name: Constitutional Compliance
  run: npm run validate:constitutional

# Docker builds
RUN npm run validate:all
```

---

## Success Metrics

Track your constitutional compliance success:

### Individual Metrics

- Features completed with full constitutional compliance
- Quality gate success rate improvement
- Development velocity with constitutional practices
- Test coverage maintenance above thresholds

### Team Metrics

- Overall constitutional compliance score
- Feature specification quality improvements
- Workflow adoption and automation usage
- Development environment standardization

### Project Metrics

- Code quality and maintainability scores
- Performance benchmarks and optimization
- Accessibility compliance achievements
- Internationalization coverage completion

---

## Conclusion

Congratulations! You're now equipped with ESMuseum's Enhanced Spec-Driven Development workflow. This constitutional framework ensures:

- **High-Quality Code**: Through systematic validation and quality gates
- **Consistent Architecture**: Following proven constitutional principles
- **Efficient Development**: With automated workflow and tooling
- **Team Collaboration**: Through standardized processes and documentation
- **Future Maintainability**: With modular, well-tested, documented code

### Next Steps

1. **Practice**: Complete the training exercises
2. **Apply**: Use the workflow for your next feature
3. **Improve**: Contribute to workflow enhancements
4. **Share**: Help onboard new team members

### Remember

> "Constitutional compliance isn't a burden—it's the foundation for sustainable, high-quality software development that scales with your team and project."

---

**Constitutional Authority**: F017 Phase 2 Implementation  
**Status**: ✅ OPERATIONAL - Ready for Constitutional Development  
**Contact**: ESMuseum Development Team

Happy constitutional coding!
