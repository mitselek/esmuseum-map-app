# ESMuseum Constitutional Quick Reference

**F017 Phase 2: Enhanced Workflow** | Quick access to essential commands and patterns

---

## Essential Commands

### Workflow Commands

```bash
npm run specify "Feature Name"     # Create feature specification
npm run plan 18                   # Generate technical plan
npm run tasks 18                  # Break down into tasks
npm run workflow                  # Show all commands
```

### Validation Commands

```bash
npm run validate:all              # Full constitutional validation
npm run validate:constitutional   # Pattern compliance
npm run validate:typescript       # Type safety check
npm run validate:coverage         # Test coverage
```

### Quality Gates

```bash
npm run gate:specify 18           # Specification quality gate
npm run gate:plan 18              # Planning quality gate
npm run gate:tasks 18             # Task breakdown gate
```

### Setup Commands

```bash
npm run setup:hooks               # Install git hooks
npm run setup:constitutional      # Full setup
```

---

## Constitutional Articles Checklist

### Article I: Vue 3 Composition API

- [ ] Use `<script setup lang="ts">` syntax
- [ ] Use `defineProps<T>()` and `defineEmits<T>()`
- [ ] Avoid Options API patterns

### Article II: TypeScript-First

- [ ] Define interfaces for all entities
- [ ] No `any` types without justification
- [ ] Use `type` imports: `import type { T } from '...'`

### Article III: Test-Driven Development

- [ ] Contract tests first, then implementation
- [ ] Sequence: Contract → Integration → E2E → Unit → Code
- [ ] Maintain test coverage above thresholds

### Article IV: i18n-First UI

- [ ] Use `{{ $t('key') }}` for all user text
- [ ] No hardcoded strings in templates
- [ ] Support Estonian (et), English (en), Ukrainian (uk)

### Article V: Entu API Standards

- [ ] Use `useEntuApi()` composable
- [ ] Proper authentication with `callApi()`
- [ ] Handle errors gracefully

### Article VI: Performance-First

- [ ] Use lazy loading: `defineAsyncComponent()`
- [ ] Dynamic imports for heavy libraries
- [ ] Monitor bundle size impact

### Article VII: Component Modularity

- [ ] Keep components ≤200 lines
- [ ] Single responsibility principle
- [ ] Clear prop and emit interfaces

### Article VIII: Documentation-Driven

- [ ] JSDoc for all functions and composables
- [ ] Component usage examples
- [ ] Architecture decision records

### Article IX: Responsive Design

- [ ] Mobile-first approach with Tailwind
- [ ] ARIA labels and accessibility
- [ ] WCAG 2.1 AA compliance

---

## 📋 Code Patterns

### Constitutional Vue Component

```vue
<script setup lang="ts">
// CONSTITUTIONAL: Articles I, II, VII
interface Props {
  title: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  save: [data: string];
}>();
</script>

<template>
  <!-- CONSTITUTIONAL: Articles IV, IX -->
  <div class="w-full max-w-md mx-auto">
    <h1>{{ $t("component.title") }}</h1>
  </div>
</template>
```

### Constitutional Composable

```typescript
// CONSTITUTIONAL: Articles I, II, III
interface UseTasksReturn {
  tasks: Readonly<Ref<Task[]>>;
  addTask: (task: Task) => void;
}

export const useTasks = (): UseTasksReturn => {
  const tasks = ref<Task[]>([]);

  const addTask = (task: Task): void => {
    tasks.value.push(task);
  };

  return {
    tasks: readonly(tasks),
    addTask,
  };
};
```

### Constitutional API Integration

```typescript
// CONSTITUTIONAL: Article V
const { callApi } = useEntuApi();

const fetchData = async <T>(endpoint: string): Promise<T> => {
  return await callApi<T>({
    method: "GET",
    url: endpoint,
    requiresAuth: true,
  });
};
```

---

## VSCode Shortcuts

### Essential Tasks

- `Ctrl+Shift+P` → "Run Task" → "Specify: Create Feature Specification"
- `Ctrl+Shift+P` → "Run Task" → "Constitutional Compliance Check"
- `Ctrl+Shift+P` → "Run Task" → "Test: Coverage Report"

### Code Snippets

- Type `const-component` → Constitutional Vue component
- Type `const-composable` → Composable pattern
- Type `const-interface` → TypeScript interface
- Type `const-test-contract` → Contract test

---

## Common Violations & Fixes

### ❌ Options API Usage

```vue
<!-- Wrong -->
<script>
export default {
  data() {
    return { count: 0 };
  },
};
</script>

<!-- ✅ Constitutional -->
<script setup lang="ts">
const count = ref(0);
</script>
```

### ❌ Any Types

```typescript
// Wrong
const data: any = fetchData();

// ✅ Constitutional
interface ApiResponse {
  id: string;
  name: string;
}
const data: ApiResponse = await fetchData<ApiResponse>();
```

### ❌ Hardcoded Strings

```vue
<!-- Wrong -->
<template>
  <h1>Task List</h1>
</template>

<!-- ✅ Constitutional -->
<template>
  <h1>{{ $t("tasks.title") }}</h1>
</template>
```

### ❌ Large Components

```vue
<!-- Wrong: 250+ lines -->
<script setup>
// Massive component with multiple responsibilities
</script>

<!-- ✅ Constitutional: Split into focused components -->
<script setup>
// TaskHeader.vue - Single responsibility
// TaskList.vue - Single responsibility
// TaskActions.vue - Single responsibility
</script>
```

---

## Quality Gate Failures

### Specification Gate Failures

```bash
❌ Issue: "[NEEDS CLARIFICATION] markers found"
✅ Fix: Replace with specific decisions

❌ Issue: "Constitutional articles not addressed"
✅ Fix: Document compliance for all 9 articles

❌ Issue: "Business value unclear"
✅ Fix: Add specific user benefits and metrics
```

### Planning Gate Failures

```bash
❌ Issue: "Technical architecture missing"
✅ Fix: Document component structure and APIs

❌ Issue: "Risk assessment incomplete"
✅ Fix: Identify risks with mitigation strategies

❌ Issue: "Test strategy not defined"
✅ Fix: Plan contract-first test approach
```

### Task Gate Failures

```bash
❌ Issue: "Test-first sequence missing"
✅ Fix: Document Contract → Integration → E2E → Unit → Implementation

❌ Issue: "Constitutional coverage incomplete"
✅ Fix: Include tasks for all 9 articles

❌ Issue: "Parallelization not planned"
✅ Fix: Identify independent tasks and dependencies
```

---

## Quick Help

### Documentation

- **Constitutional Framework**: `memory/esmuseum-constitution.md`
- **Developer Guide**: `.copilot-workspace/DEVELOPER_GUIDE.md`
- **Workflow Guides**: `.copilot-workspace/workflows/`
- **Templates**: `.copilot-workspace/templates/`

### Commands

- `npm run workflow` - Show all workflow commands
- `npm run validate:all` - Run full validation
- `npm run --list` - List all npm scripts

### Git Hooks (Auto-installed)

- **Pre-commit**: Validates constitutional compliance
- **Commit-msg**: Enforces commit message format
- **Post-commit**: Provides compliance feedback

---

## Development Flow

```mermaid
graph TD
    A[npm run specify "Feature"] --> B[Complete Specification]
    B --> C[npm run gate:specify N]
    C --> D{Gate Passed?}
    D -->|No| B
    D -->|Yes| E[npm run plan N]
    E --> F[Complete Technical Plan]
    F --> G[npm run gate:plan N]
    G --> H{Gate Passed?}
    H -->|No| F
    H -->|Yes| I[npm run tasks N]
    I --> J[Complete Task Breakdown]
    J --> K[npm run gate:tasks N]
    K --> L{Gate Passed?}
    L -->|No| J
    L -->|Yes| M[Implement with Constitutional Compliance]
    M --> N[npm run validate:all]
    N --> O[Commit with Git Hooks]
```

---

**Remember**: Constitutional compliance isn't overhead—it's the foundation for maintainable, scalable, high-quality software!

**Ready to build?** Start with: `npm run specify "Your Amazing Feature"`
