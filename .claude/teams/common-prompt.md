# ESMuseum Map App — Common Standards

## Team

- **Team name:** `esmuseum`
- **Members:** lead, viiu (frontend), entu (backend/API), kaarel (map/geo), tess (testing), marcus (code review), finn (research)

## Communication Rule

Every message you send via SendMessage must be prepended with the current timestamp in `[YYYY-MM-DD HH:MM]` format. Get the current time by running: `date '+%Y-%m-%d %H:%M'` before sending any message.

## Standards

- Read `CLAUDE.md` for project architecture, Entu data model, and common patterns
- Follow conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Quality gates before reporting done: `npm run lint`, `npm test`
- **Branch from `main`** — this is a single-branch project
- Branch naming: `feat/<short-description>` or `fix/<short-description>`
- Use temp files for commit messages: `git commit -F /tmp/commit-msg.txt`

## Agent Spawning Rule

Agents must ALWAYS be spawned with `run_in_background: true`. Foreground agents block the team-lead from receiving messages.

## Research Support

When you need codebase context, existing patterns, or GitHub issue details — message **finn**. He will gather data and send you a markdown report. Use Finn before burning your own tokens on exploration.

## On Startup

1. Read `.claude/teams/memory/<your-name>.md` if it exists — your scratchpad from previous sessions
2. Read shared knowledge files relevant to your role
3. Send a brief intro message to `lead` saying you're ready

## Team Memory

### Personal Scratchpads

Each teammate maintains a file at `.claude/teams/memory/<your-name>.md`.
You own this file — only you write to it. Keep it under 100 lines; prune stale entries.

Use tags (date every entry):

| Tag            | Purpose                               |
| -------------- | ------------------------------------- |
| `[DECISION]`   | Settled choices and rationale         |
| `[PATTERN]`    | Discovered approaches that work       |
| `[WIP]`        | In-progress state (resume points)     |
| `[CHECKPOINT]` | Periodic progress snapshots           |
| `[GOTCHA]`     | Important pitfalls or surprises       |
| `[LEARNED]`    | Key discoveries worth remembering     |
| `[DEFERRED]`   | Items pending a decision, with reason |

### When to Save

- **Immediately on discovery** — don't defer to session end; context compaction kills deferred writes
- **During long tasks** — checkpoint progress periodically
- **Before shutdown** — see Shutdown Protocol below

### What to Save

Only persist knowledge that:

- Is non-obvious from reading the code
- Is stable (won't change next commit)
- Cost real tokens to discover
- Would save a fresh you >5 minutes of re-discovery

### What NOT to Save

- Search paths ("I grepped for X")
- Transient failures already fixed
- Anything already in CLAUDE.md or one grep away

## Shutdown Protocol

**Lead lõpetab alati viimasena.**

### Teammates — when you receive a shutdown request

1. Write in-progress state to your scratchpad (`[WIP]` or `[CHECKPOINT]`)
2. Send a closing message to lead with: `[LEARNED]`, `[DEFERRED]`, `[WARNING]` (1 bullet each, max)
3. Approve the shutdown

### Lead — after ALL teammates have shut down

1. Export task list to `.claude/teams/memory/task-list-snapshot.md`
2. Commit scratchpads: `git add .claude/teams/memory/ && git commit -F /tmp/commit-msg.txt`

## Shared Workspace Protocol

The team shares one git working directory. To prevent conflicts:

- **Only one agent owns git operations at a time** — the agent creating the commit handles all git
- **Lead is read-only during implementation** — delegates, doesn't touch files
- **Coordinate before switching branches** — message lead first
- **Never force-push or reset** without lead approval

## Code Review Protocol (Marcus)

Marcus reviews all changes before they are considered done:

- **RED** — blockers, cannot merge
- **YELLOW** — minor issues, approve with notes
- **GREEN** — clean, ready

Lead closes tasks only after GREEN review.
