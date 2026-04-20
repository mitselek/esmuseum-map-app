#!/usr/bin/env bash
set -euo pipefail

# spawn_member.sh — Spawn an esmuseum agent into an existing tmux pane.
# Adapted from the bioforge-dev / entu-research pattern.
#
# Usage:
#   spawn_member.sh [--target-pane %XX] <agent-name> [tmux-session]
#
# With --target-pane: spawn into that specific tmux pane ID.
# Without:            look up the pane whose title matches <agent-name>
#                     (pane titles are set by tmux-layout-engine from
#                     .tmux-layout.yaml `panes.<name>.label`).
#
# Default session: esmuseum
#
# Preconditions:
#   1. `TeamCreate(team_name="esmuseum")` has been run by the team-lead
#      (so ~/.claude/teams/esmuseum/config.json exists).
#   2. The tmux session from .tmux-layout.yaml is up (`tmux-esmuseum`).
#   3. The target pane is free (running a bare shell, not already claude).

TEAM_NAME="esmuseum"
TEAM_DIR_REL=".claude/teams/$TEAM_NAME"

TARGET_PANE=""
if [[ "${1:-}" == "--target-pane" ]]; then
  TARGET_PANE="${2:?--target-pane requires a pane ID (e.g. %5)}"
  shift 2
fi

AGENT_NAME="${1:?Usage: spawn_member.sh [--target-pane %XX] <agent-name> [tmux-session]}"
TMUX_SESSION="${2:-$TEAM_NAME}"

REPO="$(git rev-parse --show-toplevel)"
TEAM_DIR_ABS="$REPO/$TEAM_DIR_REL"
ROSTER="$TEAM_DIR_ABS/roster.json"
STATE_DIR="$HOME/.claude/teams/$TEAM_NAME"
CONFIG="$STATE_DIR/config.json"

[[ -f "$CONFIG" ]] || { echo "ERROR: $CONFIG not found. Run TeamCreate(team_name=\"$TEAM_NAME\") first." >&2; exit 1; }
[[ -f "$ROSTER" ]] || { echo "ERROR: $ROSTER not found." >&2; exit 1; }

# Duplicate gate — hard stop.
if jq -e ".members[]? | select(.name == \"$AGENT_NAME\")" "$CONFIG" >/dev/null 2>&1; then
  echo "ERROR: $AGENT_NAME already registered in config.json. Use SendMessage instead." >&2
  exit 1
fi

# Resolve target pane.
if [[ -z "$TARGET_PANE" ]]; then
  TARGET_PANE=$(tmux list-panes -t "$TMUX_SESSION" -F '#{pane_id} #{pane_title}' 2>/dev/null \
    | awk -v n="$AGENT_NAME" '$2==n {print $1; exit}')
  [[ -n "$TARGET_PANE" ]] || {
    echo "ERROR: no pane titled '$AGENT_NAME' in tmux session '$TMUX_SESSION'." >&2
    echo "       Either start the session (\`tmux-$TEAM_NAME\`) or pass --target-pane %X." >&2
    exit 1
  }
fi

if ! tmux list-panes -t "$TMUX_SESSION" -F '#{pane_id}' 2>/dev/null | grep -q "^${TARGET_PANE}$"; then
  echo "ERROR: Target pane $TARGET_PANE not found in session $TMUX_SESSION." >&2
  exit 1
fi

# Read roster entry.
ROSTER_ENTRY=$(jq -r ".members[] | select(.name == \"$AGENT_NAME\")" "$ROSTER")
[[ -n "$ROSTER_ENTRY" ]] || { echo "ERROR: $AGENT_NAME not found in roster." >&2; exit 1; }

MODEL=$(echo "$ROSTER_ENTRY" | jq -r '.model')
COLOR=$(echo "$ROSTER_ENTRY" | jq -r '.color // "gray"')
AGENT_TYPE=$(echo "$ROSTER_ENTRY" | jq -r '.agentType // "general-purpose"')
PROMPT_REL=$(echo "$ROSTER_ENTRY" | jq -r '.prompt // ""')

# Resolve prompt path relative to the team-config dir.
# Handles both "prompts/viiu.md" and "../prompts/tervis.md" (shared prompt).
PROMPT_FILE=""
if [[ -n "$PROMPT_REL" ]]; then
  CANDIDATE="$TEAM_DIR_ABS/$PROMPT_REL"
  if [[ -f "$CANDIDATE" ]]; then
    PROMPT_FILE="$(cd "$(dirname "$CANDIDATE")" && pwd)/$(basename "$CANDIDATE")"
  fi
fi

LEAD_SESSION_ID=$(jq -r '.leadSessionId' "$CONFIG")

# Build spawn script (avoids tmux send-keys quoting issues).
SPAWN_SCRIPT=$(mktemp /tmp/spawn-cmd-XXXXXX.sh)
{
  echo '#!/usr/bin/env bash'
  echo 'source ~/.bashrc 2>/dev/null || true'
  if [[ -n "$PROMPT_FILE" ]]; then
    # Substitute {TEAM_DIR} placeholder (used by shared prompts like tervis.md).
    printf 'PROMPT="$(sed '\''s|{TEAM_DIR}|%s|g'\'' %q)"\n' "$TEAM_DIR_REL" "$PROMPT_FILE"
  fi
  printf 'exec claude --agent-id "%s" \\\n' "${AGENT_NAME}@${TEAM_NAME}"
  printf '  --agent-name "%s" --team-name "%s" \\\n' "$AGENT_NAME" "$TEAM_NAME"
  printf '  --agent-color "%s" --parent-session-id "%s" \\\n' "$COLOR" "$LEAD_SESSION_ID"
  printf '  --agent-type general-purpose --model "%s"' "$MODEL"
  if [[ -n "$PROMPT_FILE" ]]; then
    printf ' \\\n  --append-system-prompt "$PROMPT"'
  fi
  printf ' \\\n  --dangerously-skip-permissions'
  printf ' \\\n  "Read your prompt and scratchpad. Send team-lead an intro and stand by."'
  echo
} > "$SPAWN_SCRIPT"
chmod +x "$SPAWN_SCRIPT"

tmux send-keys -t "$TARGET_PANE" "bash $SPAWN_SCRIPT" Enter

# Register the agent in config.json so SendMessage can route.
TIMESTAMP=$(date +%s)000
jq --arg name "$AGENT_NAME" \
   --arg agentId "${AGENT_NAME}@${TEAM_NAME}" \
   --arg agentType "$AGENT_TYPE" \
   --arg model "$MODEL" \
   --arg color "$COLOR" \
   --arg paneId "$TARGET_PANE" \
   --argjson joinedAt "$TIMESTAMP" \
   '.members += [{
     agentId: $agentId,
     name: $name,
     agentType: $agentType,
     model: $model,
     color: $color,
     joinedAt: $joinedAt,
     tmuxPaneId: $paneId,
     backendType: "tmux",
     cwd: "",
     subscriptions: []
   }]' "$CONFIG" > "${CONFIG}.tmp" && mv "${CONFIG}.tmp" "$CONFIG"

echo "Spawned $AGENT_NAME in pane $TARGET_PANE (session $TMUX_SESSION)"
