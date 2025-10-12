# Technical Documentation Writer (Universal)

**Purpose**: Generate clear, structured technical documentation for software projects, APIs, or systems

**Target AI Model**: Any (GPT-4, Claude, GitHub Copilot, Gemini, etc.)

**Use Case**: When you need to create or improve technical documentation that is accessible, accurate, and well-structured

---

## The Prompt

Create comprehensive technical documentation following these guidelines:

**Task**: Write technical documentation that is clear, accurate, and appropriate for the target audience.

**Required Sections**:

1. Overview or introduction (2-3 sentences explaining what this is)
2. Purpose or use case (why would someone use this?)
3. Prerequisites or requirements (what do they need before starting?)
4. Main content (detailed explanation, API reference, step-by-step instructions, etc.)
5. Examples with code snippets or sample inputs/outputs
6. Common issues or troubleshooting tips
7. Additional resources or related documentation links

**Documentation Quality Criteria**:

- Accuracy: All technical details, code examples, and commands must be correct
- Clarity: Use simple, direct language; avoid jargon unless necessary
- Completeness: Cover all essential information without overwhelming the reader
- Structure: Use headings, subheadings, lists, and code blocks for readability
- Examples: Include realistic, working examples that users can copy and adapt
- Audience-appropriate: Match the technical depth to the intended reader's expertise

**Format Requirements**:

- Use markdown formatting for structure
- Code blocks should specify the language (e.g., \`\`\`python, \`\`\`bash, \`\`\`json)
- Use bullet points for lists of features or requirements
- Use numbered lists for sequential steps or procedures
- Include inline code formatting for commands, file names, and technical terms

**Content Guidelines**:

- Start with the most important information (what and why before how)
- Break complex topics into smaller, digestible sections
- Define technical terms on first use
- Use active voice and imperative mood for instructions
- Include warnings or notes for critical information
- Provide context for code examples (what they do, when to use them)

**Tone**: Professional, helpful, and clear. Assume the reader is intelligent but may be unfamiliar with this specific topic.

---

## Usage Instructions

1. **Specify the topic**: Provide the subject you need documentation for (API endpoint, software feature, configuration file, architectural pattern, etc.)

2. **Define the audience**: Indicate reader expertise level (beginner, intermediate, advanced) and their role (developer, system administrator, end user)

3. **Choose documentation type**: Specify the format needed:
   - Tutorial (step-by-step guide)
   - Reference (API documentation, configuration options)
   - Explanation (architectural overview, concept explanation)
   - How-to guide (task-focused instructions)

4. **Provide context**: Share relevant technical details, code snippets, or existing documentation to build upon

5. **Review and refine**: Check generated documentation for accuracy, add domain-specific details, and adjust examples to match your project conventions

---

## Example Usage

**Input**:

```text
Write documentation for a REST API endpoint that creates a new user account.

Endpoint: POST /api/users
Request body: { "email": string, "password": string, "name": string }
Response: { "id": string, "email": string, "name": string, "created_at": timestamp }

Audience: Frontend developers integrating with our API
```

**Expected Output**:

```markdown
# Create User Account

## Overview

Creates a new user account in the system with the provided email, password, and name.

## Purpose

Use this endpoint when implementing user registration functionality in your application.

## Prerequisites

- Valid API key (include in `Authorization` header)
- User email must be unique (not already registered)
- Password must meet security requirements (min 8 characters)

## Endpoint Details

**URL**: `POST /api/users`

**Headers**:

- `Content-Type: application/json`
- `Authorization: Bearer YOUR_API_KEY`

**Request Body**:

| Field    | Type   | Required | Description                                 |
| -------- | ------ | -------- | ------------------------------------------- |
| email    | string | Yes      | User's email address (must be valid format) |
| password | string | Yes      | Account password (min 8 characters)         |
| name     | string | Yes      | User's display name                         |

**Success Response (201 Created)**:

```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2025-10-12T14:30:00Z"
}
```

## Example Request

```bash
curl -X POST https://api.example.com/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_key_here" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123",
    "name": "Jane Smith"
  }'
```

## Common Issues

**409 Conflict**: Email already exists in system

- Solution: Check if user is already registered, or use password reset flow

**400 Bad Request**: Validation errors

- Ensure email format is valid
- Password must be at least 8 characters
- All required fields must be present

## Related Documentation

- [Authentication Guide](./authentication.md)
- [User Management API](./user-management.md)

```markdown
End of example output
```

---

## Tips for Best Results

- **Be specific about technical details**: Include actual API signatures, file structures, or system requirements rather than generic descriptions
- **Provide examples from your codebase**: Share snippets of existing code or documentation to match your project's style and conventions
- **Iterate on structure**: If the initial output doesn't match your needs, ask for specific sections to be expanded, simplified, or reorganized
- **Combine with code review**: For API documentation, generate docs from actual code signatures to ensure accuracy
- **Maintain consistency**: Create a style guide prompt for your project and reference it when generating documentation to maintain consistent tone and structure across all docs

---

**Note**: This prompt is designed to work with most AI models (GPT-4, Claude, Copilot, Gemini, etc.) by using universal prompt engineering principles rather than model-specific features.
