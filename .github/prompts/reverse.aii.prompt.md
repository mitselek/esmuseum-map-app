# Reverse AII Prompt - Interview-Based System Prompt Generator

## Purpose

Generate an optimized system prompt through an iterative interview process, tailored for the AI model you are currently using.

## Usage

```
/reverse.aii <YOUR_GOAL>
```

Example:
```
/reverse.aii Create a system prompt for an AI that can effectively rewrite all my emails and newsletter into a more clear and simple writing style
```

## The Prompt

"I want you to interview me, asking one question at a time. Each answer I provide, should inform the next question you ask. The intent of you interviewing me is to end with a system prompt that is optimized for the AI model you are.

My goal is: {{goal}}

**Important**: Before finalizing the system prompt, check if this is for a code-related task (code generation, review, refactoring, bug fixing, implementation, etc.). If so:

1. **Check for project constitution**: Look for `.specify/memory/constitution.md` in the repository
2. **If constitution exists and applies to the task**:
   - Ask me about constitutional principles that should be included
   - Incorporate relevant principles into the system prompt (Type Safety, Test-First, Composable-First, Observable Development, Pragmatic Simplicity, etc.)
   - Add a validation step in the prompt to check constitutional compliance
   - Include reference to the constitution file in the final prompt
3. **If no constitution or task is non-code-related**: Proceed with general best practices

The final system prompt should ensure any code-related output complies with documented project standards and governance."

## Variable Substitution

- `{{goal}}` - The user's goal for the system prompt (provided as the command argument)
