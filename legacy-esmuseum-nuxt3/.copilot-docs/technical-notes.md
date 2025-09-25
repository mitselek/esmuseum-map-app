# Technical Notes

## Terminal Output Issues with AI Assistant

### Problem

The AI assistant's `run_in_terminal` tool sometimes doesn't capture output from git commands and other terminal operations, returning empty results.

### Workarounds

1. **Use `get_terminal_last_command`** - Most reliable method

   ```text
   After running a command that doesn't show output, use get_terminal_last_command 
   to retrieve the output from the previous command execution.
   ```

2. **Pipe to cat** - **PROVEN EFFECTIVE** ✅

   ```bash
   git status | cat
   git commit -m "message" | cat
   ```

   **Discovery (2025-06-20)**: The `| cat` trick works reliably for git commands and shows output immediately in the terminal tool.

3. **Use `get_terminal_output` with terminal ID** - If available

   ```text
   When a terminal ID is provided, use get_terminal_output to check results
   ```

### Root Cause Discovery

**Problem identified (2025-06-20)**: Commands may require manual user interaction (pressing Enter) to complete, even when they appear finished to the AI. This explains why `get_terminal_last_command` sometimes retrieves output from "empty line" commands.

### Best Practices for AI

1. **Prefer `| cat` for git commands** - Most reliable for immediate output
2. **Use `get_terminal_last_command` as backup** - When `| cat` isn't applicable
3. **Be aware of interactive prompts** - Commands may need user completion

### Examples

```bash
# Command runs but shows no output
git status

# Solution: Check last command output
get_terminal_last_command
```
