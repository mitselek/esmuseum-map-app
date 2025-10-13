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

My goal is: {{goal}}"

## Variable Substitution

- `{{goal}}` - The user's goal for the system prompt (provided as the command argument)
