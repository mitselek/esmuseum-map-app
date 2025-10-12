# Demo Feedback Formalizer

**Purpose**: Transform unstructured demo session feedback (notes, conversations, observations) into structured, actionable documentation

**Target AI Model**: Model-agnostic (works with GPT-4, Claude, Copilot, etc.)

**Recommended Location**: `docs/prompts/demo-feedback-formalizer.md`

---

## The Prompt

Transform unstructured demo session feedback into a structured, actionable document.

**Your task**: Analyze the provided demo feedback and create a well-organized markdown document that categorizes issues, prioritizes them, and makes them actionable for the development team.

### Input Format

You will receive:

- Raw notes from a demo session (may include timestamps, speaker names, observations)
- Potentially mixed content (bugs, feature requests, questions, praise)
- Informal language and incomplete thoughts
- Screenshots or references to specific features

### Output Structure

Create a markdown document with this exact structure:

```markdown
# Demo Feedback: [Session Name/Date]

**Date**: [Demo date]
**Participants**: [List of attendees/roles]
**Version/Environment**: [App version, branch, or environment tested]
**Session Duration**: [Approximate time]

## Executive Summary

[2-3 sentences summarizing the overall feedback, key themes, and critical items]

## Feedback by Category

### Bugs 🐛

Issues that indicate broken functionality or unexpected behavior.

#### Critical

- **[BUG-001] [Short descriptive title]**
  - **Description**: [Clear description of the bug]
  - **Steps to Reproduce**:
    1. [Step 1]
    2. [Step 2]
    3. [Step 3]
  - **Expected Behavior**: [What should happen]
  - **Actual Behavior**: [What actually happens]
  - **Impact**: [Who is affected and how]
  - **Notes**: [Additional context, quotes, or observations]

#### High

[Same structure as Critical]

#### Medium

[Same structure as Critical]

#### Low

[Same structure as Critical]

### Feature Requests ✨

New functionality or enhancements suggested during the demo.

#### High Priority

- **[FEAT-001] [Short descriptive title]**
  - **Description**: [What feature is being requested]
  - **User Need**: [Why this feature is needed, use case]
  - **Suggested Approach**: [If mentioned, how to implement]
  - **Benefit**: [Expected value or improvement]
  - **Quote**: [Relevant user quote if available]

#### Medium Priority

[Same structure as High Priority]

#### Low Priority

[Same structure as High Priority]

### UX/UI Improvements 🎨

Usability, design, or interaction improvements.

- **[UX-001] [Short descriptive title]**
  - **Current State**: [What exists now]
  - **Issue**: [What's confusing, unclear, or suboptimal]
  - **Suggestion**: [Proposed improvement]
  - **User Impact**: [How this affects user experience]

### Performance Issues ⚡

Speed, responsiveness, or efficiency concerns.

- **[PERF-001] [Short descriptive title]**
  - **Observation**: [What was slow or unresponsive]
  - **Context**: [When this occurs, under what conditions]
  - **Impact**: [How this affects usability]
  - **Measurement**: [If available, timing or metrics]

### Documentation Gaps 📚

Missing or unclear documentation, help text, or onboarding.

- **[DOC-001] [Short descriptive title]**
  - **Gap**: [What's missing or unclear]
  - **Audience**: [Who needs this information]
  - **Suggestion**: [What should be documented]

### Questions & Clarifications ❓

Items that need discussion or clarification before action.

- **[Q-001] [Question or topic]**
  - **Context**: [Background of the question]
  - **Needs Decision From**: [Who should address this]
  - **Options**: [If applicable, potential approaches]

### Positive Feedback 👍

What worked well (important for team morale and future direction).

- [Feature or aspect that received praise]
- [User quote if available]

## Action Items

Summary of next steps with assignments:

1. **[Priority]** [Action item description] - _Owner: [Name/Team]_ - _Estimated: [Time/Effort]_
2. **[Priority]** [Action item description] - _Owner: [Name/Team]_ - _Estimated: [Time/Effort]_

## Additional Notes

[Any context that doesn't fit above categories: technical constraints, follow-up meetings scheduled, related issues, etc.]

## Attachments

[Links to screenshots, recordings, related documents]
```

### Formatting Requirements

Apply these guidelines:

1. **Use blank lines**:
   - Before and after all headings
   - Before and after all lists
   - Before and after all code blocks

2. **Numbering**: Use consistent prefixes for traceability:
   - `BUG-001`, `BUG-002`, etc.
   - `FEAT-001`, `FEAT-002`, etc.
   - `UX-001`, `PERF-001`, `DOC-001`, `Q-001`, etc.

3. **Quotes**: When users said something particularly insightful or emphatic, quote it verbatim:
   - Format: `> "Original quote from user"` (blockquote)
   - Or inline: `**Quote**: "Original quote from user"`

4. **Code references**: When feedback relates to specific code or components:
   - Use backticks for component names: `MapComponent.vue`
   - Use code blocks for file paths or technical details

5. **Preserve context**: If the demo notes include who said what, preserve that:
   - "Teacher mentioned that..."
   - "Student was confused by..."
   - "Admin noted that..."

6. **Be actionable**: Each item should be clear enough that a developer could:
   - Reproduce the issue
   - Understand the user need
   - Estimate effort
   - Create a GitHub issue/task

### Markdown Formatting Requirements (CRITICAL)

To ensure clean, lint-compliant output:

- Add blank line before and after each heading
- Add blank line before and after each list (bullet or numbered)
- Add blank line before and after each code block
- Remove trailing spaces from all lines
- Avoid inline HTML unless necessary for tables

Before presenting final output:

- Review document for proper spacing around all lists
- Verify all headings have blank lines before and after
- Check that all code blocks have blank lines before and after
- Remove any trailing whitespace
- Ensure consistent markdown syntax throughout

**RECURSIVE REQUIREMENT**: If this prompt generates output that itself creates markdown content (such as documentation generators, report templates, or other prompts), those outputs MUST also include these same markdown formatting requirements to ensure linting standards propagate through all levels of generation.

### Prioritization Guidelines

Use these criteria for assigning priority:

**Critical**:

- Blocks core functionality
- Affects data integrity
- Security issues
- Prevents users from completing key tasks

**High**:

- Significant UX problems
- Affects many users
- Workaround exists but is painful
- Important feature gap

**Medium**:

- Minor UX issues
- Affects some users
- Easy workaround available
- Nice-to-have features

**Low**:

- Edge cases
- Cosmetic issues
- Future considerations
- Optional enhancements

### Analysis Process

Before creating the document:

1. **Read through all feedback** to identify themes
2. **Categorize each item** into the appropriate section
3. **Extract implicit context** (make assumptions explicit)
4. **Assign priorities** based on impact and frequency
5. **Identify action items** that emerge from multiple pieces of feedback
6. **Preserve user voice** by quoting impactful statements
7. **Review for completeness** - did you capture everything?

### Source File Preservation (IMPORTANT)

When formalizing feedback from an existing document:

- **DO NOT overwrite the original source file** - the raw notes are valuable historical records
- **Create a new file** or replace content only if explicitly asked
- **Recommend naming convention**:
  - Original: `demo-feedback-2025-10-08.md` (raw notes)
  - Formalized: `demo-feedback-2025-10-08-formalized.md` or update the original if that's the intent
- **Preserve original language**: If source notes are in a different language (e.g., Estonian), the formalized version should be in English for international teams, but preserve key terms and quotes in original language
- **Reference the source**: Include a link or note in the formalized document pointing back to the original raw notes

**Default behavior**: Present the formalized output without modifying any files, allowing the user to decide where to save it.

---

## Usage Instructions

1. **Gather your demo feedback**:
   - Meeting notes
   - Chat logs
   - Video transcription
   - Observer notes
   - Screenshots/recordings

2. **Provide the feedback to the AI**:

   ```text
   Here are my demo session notes from [date]:

   [Paste your unstructured notes here]
   ```

3. **Review and refine**:
   - Check that all items are captured
   - Adjust priorities if needed
   - Add missing context
   - Verify quotes are accurate

4. **Save the output**:
   - **Option A (Recommended)**: Save as new file `docs/demo-feedback-YYYY-MM-DD-formalized.md` to preserve original raw notes
   - **Option B**: Replace original file content if raw notes are no longer needed
   - Commit to version control
   - Share with team
   - Create GitHub issues from action items

## Example

### You provide

```text
Demo with teachers - Oct 8th

- Map loading is slow, especially on older iPads
- Teachers love the new scoring system!
- Confusion about how to add new students to a task
- "I wish I could see which students haven't submitted yet" - Teacher Maria
- Bug: When clicking submit twice fast, it creates duplicate entries
- Would be nice to export results as CSV
- The color coding is really helpful for quick assessment
- Students had trouble finding the file upload button
- App crashed when uploading 50MB image
- Can we get a dark mode? Not urgent but would be nice
- Documentation doesn't explain the webhook setup clearly
```

### AI generates

```markdown
# Demo Feedback: Teacher Workshop Session

**Date**: October 8, 2025
**Participants**: Teacher Maria, Teacher John, 5 other educators
**Version/Environment**: Production (main branch)
**Session Duration**: ~2 hours

## Executive Summary

Overall positive reception with high praise for the new scoring system and color coding features. Key concerns center around performance on older devices, student management UX, and file upload reliability. One critical bug identified (duplicate submissions). Documentation gaps noted for admin features.

## Feedback by Category

### Bugs 🐛

#### Critical

- **[BUG-001] Duplicate entries created on rapid submit clicks**
  - **Description**: Clicking the submit button twice in quick succession creates duplicate submission entries
  - **Steps to Reproduce**:
    1. Open a task form with filled data
    2. Click the submit button rapidly (2x within 1 second)
    3. Check submission records
  - **Expected Behavior**: Submit button should be disabled after first click to prevent duplicates
  - **Actual Behavior**: Multiple submission records are created
  - **Impact**: Data integrity issue, affects grading accuracy
  - **Notes**: Likely missing debounce or loading state on submit button

- **[BUG-002] App crashes when uploading large images**
  - **Description**: Application crashes when attempting to upload images larger than ~50MB
  - **Steps to Reproduce**:
    1. Open file upload interface
    2. Select an image file >50MB
    3. Attempt to upload
  - **Expected Behavior**: Either upload succeeds or shows error message with size limit
  - **Actual Behavior**: App crashes/freezes
  - **Impact**: Blocks users from submitting valid content
  - **Notes**: Need to implement file size validation and limits

### Feature Requests ✨

#### High Priority

- **[FEAT-001] Student submission status visibility**
  - **Description**: Teachers want to see which students haven't submitted their work yet
  - **User Need**: Allows teachers to follow up with specific students who need reminders
  - **Suggested Approach**: Add a dashboard view showing all students with submission status indicators (submitted, in progress, not started)
  - **Benefit**: Reduces teacher workload in tracking student progress
  - **Quote**: > "I wish I could see which students haven't submitted yet" - Teacher Maria

- **[FEAT-002] CSV export for results**
  - **Description**: Ability to export task results and scores as CSV files
  - **User Need**: Teachers need to import data into their grade books and reporting systems
  - **Suggested Approach**: Add export button on results page with CSV format option
  - **Benefit**: Streamlines grade reporting workflow

#### Low Priority

- **[FEAT-003] Dark mode support**
  - **Description**: Option to switch to dark color scheme
  - **User Need**: Accessibility and preference option for users
  - **Suggested Approach**: Implement theme toggle with dark/light options
  - **Benefit**: Improved accessibility, reduced eye strain in low-light conditions
  - **Quote**: "Can we get a dark mode? Not urgent but would be nice"

### UX/UI Improvements 🎨

- **[UX-001] Unclear student addition workflow**
  - **Current State**: Process to add new students to a task is not intuitive
  - **Issue**: Teachers couldn't figure out how to add students without guidance
  - **Suggestion**: Add prominent "Add Students" button with clear modal/workflow
  - **User Impact**: Teachers waste time searching for functionality, may miss adding students

- **[UX-002] File upload button hard to find**
  - **Current State**: File upload button may be visually unclear or poorly positioned
  - **Issue**: Students had difficulty locating the upload functionality
  - **Suggestion**: Make upload button more prominent (larger, better label, visual hierarchy)
  - **User Impact**: Students may not complete assignments, frustration with interface

### Performance Issues ⚡

- **[PERF-001] Slow map loading on older devices**
  - **Observation**: Map component takes significant time to load on older iPads
  - **Context**: Especially noticeable on older hardware (iPad Air 2, iPad 5th gen)
  - **Impact**: Delays user workflow, frustration, may appear broken to users
  - **Measurement**: No specific timing provided, but noticeably slow to demo participants

### Documentation Gaps 📚

- **[DOC-001] Webhook setup instructions unclear**
  - **Gap**: Current documentation doesn't adequately explain how to configure webhooks for automated student access
  - **Audience**: School administrators setting up the system
  - **Suggestion**: Add step-by-step guide with screenshots for webhook configuration

### Positive Feedback 👍

- New scoring system received high praise from all teachers
- Color coding feature is "really helpful for quick assessment"
- Overall usability improvements noted compared to previous version

## Action Items

1. **[Critical]** Fix duplicate submission bug (BUG-001) - _Owner: Dev Team_ - _Estimated: 2-4 hours_
2. **[Critical]** Implement file size validation (BUG-002) - _Owner: Dev Team_ - _Estimated: 4-6 hours_
3. **[High]** Add student submission status dashboard (FEAT-001) - _Owner: Dev Team_ - _Estimated: 1-2 days_
4. **[High]** Improve file upload button visibility (UX-002) - _Owner: Design + Dev_ - _Estimated: 2-4 hours_
5. **[Medium]** Investigate map loading performance on older devices (PERF-001) - _Owner: Dev Team_ - _Estimated: 1 day investigation_
6. **[Medium]** Improve student addition workflow (UX-001) - _Owner: Design + Dev_ - _Estimated: 1 day_
7. **[Medium]** Add CSV export functionality (FEAT-002) - _Owner: Dev Team_ - _Estimated: 1-2 days_
8. **[Low]** Update webhook setup documentation (DOC-001) - _Owner: Technical Writer/Dev_ - _Estimated: 2-3 hours_
9. **[Low]** Consider dark mode for future release (FEAT-003) - _Owner: Design Team_ - _Estimated: TBD_

## Additional Notes

- All participants were using iPads (school standard device)
- Demo was conducted in classroom environment with typical network conditions
- Teachers expressed high satisfaction with recent improvements
- Schedule follow-up session after critical bugs are resolved
- Consider creating video tutorials for common admin tasks

## Attachments

- [Link to demo recording]
- [Screenshots shared by participants]
- [Meeting notes document]
```

---

## Tips for Best Results

1. **Provide complete context**: Include timestamps, speaker names, and situational details in your raw notes

2. **Don't pre-filter**: Share all feedback, even if it seems minor - the AI will prioritize appropriately

3. **Include direct quotes**: If you have exact user statements, include them - they add valuable perspective

4. **Mention the audience**: Let the AI know who was at the demo (teachers, students, admins, stakeholders) for better context

5. **Iterate on priority**: Review the assigned priorities and adjust based on your product roadmap and business needs

6. **Create issues promptly**: Use the action items section to create GitHub issues or Jira tickets while context is fresh

7. **Share with stakeholders**: This format works well for communicating feedback to product managers, designers, and executives

8. **Archive chronologically**: Save feedback documents with date-based naming for historical reference

9. **Link related items**: If feedback relates to existing issues or specs, add those references in the Notes fields

10. **Follow up**: Schedule a feedback review meeting with the team to discuss priorities and assignments

11. **Preserve original notes**: Keep the raw, unformatted feedback notes as a historical record - they contain context and nuance that may be useful later

---

**Note**: This prompt is designed to work with most AI models (GPT-4, Claude, Copilot, etc.) and uses model-agnostic formatting. The output is optimized for software development workflows but can be adapted for other domains by modifying the category structure.
