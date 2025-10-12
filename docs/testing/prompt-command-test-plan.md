# Test Plan: `/prompt` Slash-Command

**Version**: 1.0  
**Created**: October 12, 2025  
**Purpose**: Verify that the `/prompt` command successfully researches best practices, generates optimized prompts, and handles different model specifications.

---

## Pre-Test Setup

1. Open a **new** GitHub Copilot Chat session (to test default model detection)
2. Ensure you're in the `esmuseum-map-app` workspace
3. Have the following files accessible for reference:
   - `.github/prompts/prompt.prompt.md` (the command being tested)
   - `.github/prompts/specify.prompt.md` (for slash-command comparison)
4. Time allocation: 20-30 minutes for all test cases

---

## Test Case 1: Default Model Detection

**Objective**: Verify that `/prompt` defaults to the model executing the command when no model is specified.

**Test Environment**: GitHub Copilot Chat (fresh session)

**Input**:

```text
/prompt Create a prompt for code review focusing on security vulnerabilities
```

**Expected Behavior**:

1. ✅ Determines current date (should be actual current date)
2. ✅ Identifies that no model was specified → defaults to **GitHub Copilot**
3. ✅ Researches security code review best practices (as of current date)
4. ✅ Presents research findings with:
   - **Topic**: Security code review
   - **For**: GitHub Copilot
   - **Research Date**: [Current date]
   - **Knowledge Cutoff**: [AI's cutoff date]
   - **Key Findings**: 3+ findings about security review patterns
5. ✅ Generates prompt with:
   - Clear role definition
   - Specific security aspects (SQL injection, XSS, auth issues, OWASP references)
   - Severity levels (critical, high, medium, low)
   - Output format specification
   - GitHub Copilot-specific guidance (code context, comments, etc.)
6. ✅ Optimizes for clarity (no vague words like "good" or "better")
7. ✅ Suggests saving to `docs/prompts/security-code-review.md`
8. ✅ Provides usage instructions

**Success Criteria**:

- [ ] Research section appears **before** prompt draft
- [ ] Date is correctly identified (actual current date)
- [ ] Target model is **GitHub Copilot** (defaulted correctly, not asked)
- [ ] Prompt is actionable and specific
- [ ] Security-specific guidelines included
- [ ] No placeholder text like `[Guideline 1]` in final prompt

**Notes**:
_Record actual output and any deviations here_

---

## Test Case 2: Explicit Model Specification

**Objective**: Verify that explicitly specifying a different model overrides the default.

**Test Environment**: GitHub Copilot Chat (can reuse session from Test 1)

**Input**:

```text
/prompt Generate a prompt for Claude that helps with analyzing large codebases for architectural patterns
```

**Expected Behavior**:

1. ✅ Determines current date
2. ✅ Identifies target model: **Claude** (explicitly specified, not GitHub Copilot)
3. ✅ Researches:
   - Claude-specific capabilities (large context window, Constitutional AI)
   - Architectural pattern analysis best practices
4. ✅ Presents research findings emphasizing:
   - Claude's strengths (thinking step-by-step, 200k+ token context)
   - XML tags for structure
   - Constitutional AI principles (helpfulness, harmlessness, honesty)
5. ✅ Generates Claude-optimized prompt with:
   - Task decomposition approach
   - XML structure usage examples (`<analysis>`, `<findings>`, etc.)
   - Architectural pattern recognition guidelines
   - Step-by-step reasoning instructions
6. ✅ Provides Claude-specific usage instructions

**Success Criteria**:

- [ ] Model is **Claude** (not GitHub Copilot)
- [ ] Claude-specific features mentioned (XML tags, large context, Constitutional AI)
- [ ] Prompt leverages Claude's strengths
- [ ] No GitHub Copilot-specific guidance present

**Notes**:
_Record actual output and any deviations here_

---

## Test Case 3: "Most Appropriate" Model Selection

**Objective**: Verify that the command analyzes the task and recommends the most suitable model when asked.

**Test Environment**: GitHub Copilot Chat (can reuse session)

**Input**:

```text
/prompt Create a prompt for rewriting emails to be clearer and more concise. Use the most appropriate model.
```

**Expected Behavior**:

1. ✅ Determines current date
2. ✅ User said "most appropriate" → analyzes task type (email writing)
3. ✅ **Recommends a specific model** (likely GPT-4/ChatGPT) with reasoning:
   - Example: "For email rewriting, I recommend GPT-4 because: excellent at conversational tone, well-suited for natural language editing, strong at maintaining voice while improving clarity"
4. ✅ Researches email rewriting + recommended model's best practices
5. ✅ Presents research findings
6. ✅ Generates prompt optimized for the recommended model:
   - "You are..." role definition (if GPT-4)
   - Clear goals (clarity, conciseness, tone preservation)
   - Before/after examples
   - System message format
7. ✅ Explains why this model is suitable for the task

**Success Criteria**:

- [ ] Model recommendation provided with **reasoning**
- [ ] Recommendation makes sense for email writing task
- [ ] Prompt is optimized for the recommended model
- [ ] Reasoning explains model's strengths for this specific use case

**Notes**:
_Record which model was recommended and why_

---

## Test Case 4: Slash-Command Creation (Edge Case)

**Objective**: Verify that the command recognizes slash-command creation as a special case and follows different workflow.

**Test Environment**: GitHub Copilot Chat (can reuse session)

**Input**:

```text
/prompt Create a slash-command /review that analyzes code for violations of our project constitution
```

**Expected Behavior**:

1. ✅ **Recognizes this is a special case** (mentions "Scenario 4" or similar)
2. ✅ Studies existing patterns:
   - Reads `.github/prompts/specify.prompt.md`
   - May read `.github/prompts/implement.prompt.md`
3. ✅ Identifies workflow requirements:
   - Script path: `scripts/bash/check-constitution.sh --json` (or similar)
   - Context files: `constitution.md`, source files
   - Artifacts: violation reports
4. ✅ Generates slash-command with **proper structure**:

   ```markdown
   ---
   description: Brief description
   scripts:
     sh: scripts/bash/check-constitution.sh --json
     ps: scripts/powershell/check-constitution.ps1 -Json
   ---

   # Review

   User input:

   $ARGUMENTS

   Given [context], do this:

   1. Run `{SCRIPT}` from repo root...
   2. [Load constitution.md]...
   ```

5. ✅ Notes additional requirements:
   - Script creation needed
   - VS Code extension configuration needed
   - Should go in `.github/prompts/`
6. ✅ Different from regular prompt format (has frontmatter, $ARGUMENTS, {SCRIPT})

**Success Criteria**:

- [ ] Recognizes slash-command creation (not treated as regular prompt)
- [ ] Studies existing slash-command patterns from repo
- [ ] Follows established structure (YAML frontmatter, $ARGUMENTS, {SCRIPT})
- [ ] Warns about additional requirements (scripts, extension config)
- [ ] Output location is `.github/prompts/` (not `docs/prompts/`)

**Notes**:
_Record whether it correctly identified this as special case_

---

## Test Case 5: Knowledge Cutoff Awareness

**Objective**: Verify that the command acknowledges limitations when asked about models or features newer than its knowledge cutoff.

**Test Environment**: GitHub Copilot Chat (can reuse session)

**Input**:

```text
/prompt Create a prompt for GPT-5 that generates TypeScript code with the latest ES2027 features
```

**Expected Behavior**:

1. ✅ Determines current date
2. ✅ Identifies: GPT-5 (explicitly specified)
3. ✅ Research findings include **explicit caveats**:
   - **Knowledge Cutoff**: [States actual cutoff date, e.g., "April 2024"]
   - **Caveat about GPT-5**: "GPT-5 may be newer than my knowledge cutoff. I'll provide general GPT best practices, but specific GPT-5 features may differ from these recommendations."
   - **Caveat about ES2027**: "ES2027 features may not be in my training data. Recommend verifying against official ECMAScript specification."
4. ✅ Generates prompt with acknowledgment of limitations
5. ✅ Suggests user verify against latest documentation

**Success Criteria**:

- [ ] Knowledge cutoff date explicitly mentioned in research findings
- [ ] Acknowledges GPT-5 may be newer than training data
- [ ] Acknowledges ES2027 may not be covered
- [ ] Recommends verification with up-to-date sources
- [ ] Still provides best effort prompt despite limitations

**Notes**:
_Record how explicitly limitations were acknowledged_

---

## Test Case 6: Empty Arguments (Error Handling)

**Objective**: Verify that the command handles empty input gracefully.

**Test Environment**: GitHub Copilot Chat (can reuse session)

**Input**:

```text
/prompt
```

**Expected Behavior**:

- ✅ Recognizes empty `$ARGUMENTS`
- ✅ Does NOT proceed with prompt generation
- ✅ Prompts user with helpful guidance:
  - Example: "Please provide a description of the prompt you want to create."
  - Provides examples: "For example: 'Create a prompt for code review' or 'Generate a prompt that helps write documentation'"

**Success Criteria**:

- [ ] Doesn't attempt to generate prompt with no input
- [ ] Provides clear error/guidance message
- [ ] Includes helpful examples of valid inputs

**Notes**:
_Record actual error message_

---

## Test Case 7: "General" Model Request

**Objective**: Verify handling of "general" or "any" model specification.

**Test Environment**: GitHub Copilot Chat (can reuse session)

**Input**:

```text
/prompt Create a general prompt for technical documentation writing that works with any AI model
```

**Expected Behavior**:

1. ✅ Identifies "general" or "any" in request
2. ✅ Researches documentation writing best practices
3. ✅ Generates prompt that is **model-agnostic**:
   - No "You are..." (GPT-specific)
   - No XML tags (Claude-specific)
   - No code comments (Copilot-specific)
   - Uses universal principles: clarity, structure, examples
4. ✅ May mention: "This prompt is designed to work with most AI models (GPT-4, Claude, Copilot, etc.)"

**Success Criteria**:

- [ ] Recognizes request for general/model-agnostic prompt
- [ ] Generated prompt avoids model-specific features
- [ ] Focuses on universal prompt engineering principles
- [ ] Explicitly notes it works across models

**Notes**:
_Record whether prompt truly is model-agnostic_

---

## Post-Test Summary

**Date Tested**: ******\_\_\_******  
**Tester**: ******\_\_\_******  
**Test Environment**: GitHub Copilot Chat (version: **\_\_**)

### Results Summary

| Test Case           | Status            | Notes |
| ------------------- | ----------------- | ----- |
| 1. Default Model    | ⬜ Pass / ⬜ Fail |       |
| 2. Explicit Model   | ⬜ Pass / ⬜ Fail |       |
| 3. Most Appropriate | ⬜ Pass / ⬜ Fail |       |
| 4. Slash-Command    | ⬜ Pass / ⬜ Fail |       |
| 5. Knowledge Cutoff | ⬜ Pass / ⬜ Fail |       |
| 6. Empty Args       | ⬜ Pass / ⬜ Fail |       |
| 7. General Model    | ⬜ Pass / ⬜ Fail |       |

### Issues Found

1. _Issue description_
   - **Severity**: Critical / High / Medium / Low
   - **Expected**:
   - **Actual**:
   - **Steps to reproduce**:

### Recommendations

_Based on test results, what improvements should be made to the `/prompt` command?_

---

## Testing in Current Session?

**Question**: Can we test in the current session?

**Answer**:

- **Test Cases 2-7**: ✅ YES - Can be tested in current session
- **Test Case 1** (Default Model): ⚠️ **BEST IN NEW SESSION** - To verify true default behavior without prior context

**Compromise**:

- Run Test Cases 2-7 in current session to validate most functionality
- Run Test Case 1 in a fresh session later to verify default model detection works correctly

---

## Quick Test Execution

**For immediate testing in current session**, run these in order:

1. Test Case 6 (Empty Args) - Quick validation
2. Test Case 2 (Explicit Model: Claude) - Core functionality
3. Test Case 7 (General Model) - Model-agnostic handling
4. Test Case 3 (Most Appropriate) - Recommendation logic
5. Test Case 5 (Knowledge Cutoff) - Limitation awareness
6. Test Case 4 (Slash-Command) - Edge case handling

**Save Test Case 1 for a new session** to properly test default model detection.
